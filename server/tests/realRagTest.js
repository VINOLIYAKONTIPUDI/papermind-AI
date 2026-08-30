const fs = require('fs');
const path = require('path');
const assert = require('assert');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const config = require('../config/config');
const chunker = require('../rag/chunking/chunker');
const vectorStore = require('../rag/retrieval/vectorStore');
const promptTemplates = require('../prompts/promptTemplates');

async function runRealIntegrationTest() {
  console.log("====================================================");
  console.log("🧬 RUNNING REAL GEMINI + QDRANT INTEGRATION TEST");
  console.log("====================================================");

  // 1. Verify Gemini API Key
  console.log("Checking Gemini API configuration...");
  if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
    console.error("❌ Gemini API Key is missing or using placeholder.");
    throw new Error("Missing GEMINI_API_KEY. Real Gemini integration test requires a valid Google API key.");
  }
  console.log("✅ Gemini API Key is configured.");

  // 2. Verify Qdrant Health
  console.log("Checking Qdrant service health...");
  const isQdrantHealthy = await vectorStore.checkHealth();
  if (!isQdrantHealthy) {
    console.error("❌ Qdrant service is offline.");
    throw new Error("Qdrant service is unavailable. Real vector search cannot be verified.");
  }
  console.log("✅ Qdrant service is online and healthy.");

  // 3. Real PDF Text Extraction
  const pdfPath = path.join(__dirname, '../uploads/1786115663850-LEM_Methodology.pdf');
  console.log(`Reading test PDF from: ${pdfPath}`);
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Test PDF not found at path: ${pdfPath}`);
  }
  const dataBuffer = fs.readFileSync(pdfPath);
  
  console.log("Extracting PDF text using pdf-parse...");
  const pageData = [];
  const renderPage = (pageDataObj) => {
    return pageDataObj.getTextContent().then(textContent => {
      const pageText = textContent.items.map(item => item.str).join(' ');
      pageData.push({
        page: pageDataObj.pageIndex + 1,
        text: pageText
      });
      return pageText;
    });
  };

  const parsed = await pdfParse(dataBuffer, { pagerender: renderPage });
  assert.ok(parsed.text && parsed.text.trim().length > 0, "PDF text extraction returned empty content.");
  console.log(`✅ Text successfully extracted. Total characters: ${parsed.text.length}, pages: ${parsed.numpages}`);

  // 4. Chunking
  console.log("Chunking extracted text using sliding window...");
  pageData.sort((a, b) => a.page - b.page);
  const chunks = chunker.chunkDocument(pageData, { chunkSize: 800, chunkOverlap: 150 });
  assert.ok(chunks.length > 0, "No chunks were generated.");
  console.log(`✅ Chunking complete. Generated ${chunks.length} chunks.`);

  // 5. Initialize Live Gemini Client
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const embedModel = genAI.getGenerativeModel({ model: config.embeddingModel || 'gemini-embedding-001' });
  const genModel = genAI.getGenerativeModel({ model: config.geminiModel || 'gemini-3.5-flash' });

  // 6. Real Gemini Embedding
  console.log("Generating real embedding vectors from Gemini API...");
  const sampleChunkText = chunks[0].content;
  
  const embedRequest = {
    content: {
      parts: [{ text: sampleChunkText }]
    }
  };
  if (config.embeddingDim) {
    embedRequest.outputDimensionality = config.embeddingDim;
  }
  
  const embedResult = await embedModel.embedContent(embedRequest);
  assert.ok(embedResult?.embedding?.values, "Gemini API failed to return embedding values.");
  const vector = embedResult.embedding.values;
  console.log(`✅ Real embedding received. Dimension size: ${vector.length}`);
  if (config.embeddingDim) {
    assert.strictEqual(vector.length, config.embeddingDim, `Vector size mismatch. Expected ${config.embeddingDim}, got ${vector.length}`);
  }

  // 7. Qdrant Insertion
  console.log("Initializing/Recreating Qdrant collection...");
  await vectorStore.initializeCollection();
  
  console.log("Generating embeddings for all chunks...");
  const embeddings = [];
  // Process sequentially to respect rate limits during tests
  for (let i = 0; i < Math.min(chunks.length, 5); i++) {
    const req = {
      content: {
        parts: [{ text: chunks[i].content }]
      }
    };
    if (config.embeddingDim) req.outputDimensionality = config.embeddingDim;
    const res = await embedModel.embedContent(req);
    embeddings.push(res.embedding.values);
  }
  
  const testPaperId = 'test-paper-integration-e2e';
  const testChunks = chunks.slice(0, embeddings.length);
  
  console.log(`Inserting ${testChunks.length} vectors into Qdrant collection...`);
  const upsertSuccess = await vectorStore.upsertChunks(testPaperId, testChunks, embeddings);
  assert.ok(upsertSuccess, "Upserting vectors to Qdrant failed.");
  console.log("✅ Chunks successfully inserted into Qdrant index.");

  // 8. Query Embedding & Qdrant Similarity Retrieval
  const testQuery = "What methodology is described in the paper?";
  console.log(`Embedding query: "${testQuery}"`);
  
  const queryEmbedReq = {
    content: {
      parts: [{ text: testQuery }]
    }
  };
  if (config.embeddingDim) queryEmbedReq.outputDimensionality = config.embeddingDim;
  const queryEmbedRes = await embedModel.embedContent(queryEmbedReq);
  const queryEmbedding = queryEmbedRes.embedding.values;

  console.log("Querying Qdrant index for similar segments...");
  const searchResults = await vectorStore.searchSimilar(queryEmbedding, 3, testPaperId);
  assert.ok(Array.isArray(searchResults), "Search search results is not an array.");
  assert.ok(searchResults.length > 0, "No matching segments were retrieved from Qdrant.");
  console.log(`✅ Similarity retrieval successful. Found ${searchResults.length} matches.`);
  console.log(`   Top Match Score: ${searchResults[0].relevance_score}`);
  assert.ok(searchResults[0].content, "Retrieved segment is missing content body.");

  // 9. Context Construction
  console.log("Constructing prompt context...");
  const formattedPrompt = promptTemplates.buildRagPrompt(testQuery, searchResults);
  assert.ok(formattedPrompt.contents.includes(searchResults[0].content.substring(0, 50)), "Prompt contents missing retrieved context.");
  console.log("✅ Grounded context constructed.");

  // 10. Gemini Generation & Grounded Answer
  console.log("Calling Gemini generative model for grounded answer...");
  const genResult = await genModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: formattedPrompt.contents }] }],
    systemInstruction: formattedPrompt.systemInstruction
  });
  
  const answer = genResult.response.text();
  assert.ok(answer && answer.trim().length > 0, "Gemini generated answer is empty.");
  console.log("✅ Answer successfully generated:");
  console.log(`----------------------------------------------------\n${answer}\n----------------------------------------------------`);

  // 11. Source/Page References
  console.log("Verifying citations and page references...");
  searchResults.forEach((r, idx) => {
    console.log(`Source #${idx + 1}: Paper "${testPaperId}", Page ${r.page_number}, Section "${r.section_name}", Score ${r.relevance_score}`);
    assert.ok(r.page_number > 0, "Citation page number must be positive.");
    assert.ok(r.chunk_id, "Citation is missing chunk ID.");
  });
  console.log("✅ Grounded citations verified successfully.");

  console.log("\n🎉 REAL RAG INTEGRATION TEST PASSED SUCCESSFULLY!\n");
}

if (require.main === module) {
  runRealIntegrationTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\n❌ REAL RAG INTEGRATION TEST FAILED:");
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runRealIntegrationTest };
