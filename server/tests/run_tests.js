const assert = require('assert');
const path = require('path');
const fs = require('fs');

const config = require('../config/config');
const chunker = require('../rag/chunking/chunker');
const embeddingService = require('../rag/embeddings/embeddingService');
const vectorStore = require('../rag/retrieval/vectorStore');
const { queryPaper } = require('../rag/pipeline/ragPipeline');
const { memoryStore } = require('../config/db');
require('../controllers/paperController'); // Seeds the memoryStore with default papers and chunks

async function runTests() {
  console.log("====================================================");
  console.log("🧪 RUNNING PAPERMIND AI INTEGRATION TEST SUITE");
  console.log("====================================================");

  let successCount = 0;
  let failCount = 0;

  function test(name, fn) {
    console.log(`\nRunning test: "${name}"`);
    try {
      fn();
      console.log(`   ✅ Passed: "${name}"`);
      successCount++;
    } catch (err) {
      console.error(`   ❌ Failed: "${name}"`);
      console.error(err);
      failCount++;
    }
  }

  async function testAsync(name, fn) {
    console.log(`\nRunning async test: "${name}"`);
    try {
      await fn();
      console.log(`   ✅ Passed: "${name}"`);
      successCount++;
    } catch (err) {
      console.error(`   ❌ Failed: "${name}"`);
      console.error(err);
      failCount++;
    }
  }

  // 1. Test Configuration Loading
  test("Configuration Loader", () => {
    assert.ok(config.port, "Port should be defined");
    assert.ok(config.chunkSize > 0, "Chunk size must be positive");
    assert.ok(config.chunkOverlap >= 0, "Overlap must be non-negative");
  });

  // 2. Test Chunker text split sliding window
  test("Chunker Text Splitting", () => {
    const text = "This is a long sentence that we will chunk. It has multiple words and structures.";
    const chunks = chunker.splitText(text, 25, 5);
    assert.ok(chunks.length > 0, "Should generate chunks");
    chunks.forEach(c => {
      assert.ok(c.length <= 25, "Chunk size should not exceed limit");
    });
  });

  test("Document Page Chunking", () => {
    const pageData = [
      { page: 1, text: "Abstract of the document. Here is some introductory text." },
      { page: 2, text: "Methodology section. We propose a transformer architecture." }
    ];
    const chunks = chunker.chunkDocument(pageData, { chunkSize: 30, chunkOverlap: 5 });
    assert.ok(chunks.length >= 2, "Should generate multiple chunks");
    assert.strictEqual(chunks[0].page_number, 1, "Should preserve page number");
    assert.strictEqual(chunks[0].section_name, "Abstract", "Should classify Abstract section");
    assert.strictEqual(chunks[chunks.length - 1].section_name, "Methodology / Architecture", "Should classify Methodology section");
  });

  // 3. Test Embedding Generation
  await testAsync("Embedding Vector Generation", async () => {
    const text = "attention model";
    const vector = await embeddingService.generateEmbedding(text);
    assert.ok(Array.isArray(vector), "Embedding must be an array");
    assert.strictEqual(vector.length, 768, "Embedding vector must have 768 dimensions");
    assert.ok(vector.every(v => typeof v === 'number'), "All vector values must be numbers");
  });

  // 4. Test Local/Vector Similarity Fallback
  await testAsync("Retrieval and Grounded RAG Response", async () => {
    const response = await queryPaper("What is attention?", "paper-attention-2017", "strict");
    assert.ok(response.content, "Response should contain answer content");
    assert.ok(Array.isArray(response.citations), "Citations should be an array");
    assert.ok(response.citations.length > 0, "Should return matching page citations");
    assert.ok(response.citations[0].page_number, "Citation should have page_number");
  });

  // 5. Test Unsupported Out of Domain query
  await testAsync("Out of Domain Unsupported Queries", async () => {
    const response = await queryPaper("How do you install Python on Windows?", "paper-attention-2017", "strict");
    assert.ok(response.content, "Response should be returned");
    const contentLower = response.content.toLowerCase();
    assert.ok(
      contentLower.includes("sufficient") || contentLower.includes("insufficient") || contentLower.includes("offline") || contentLower.includes("not contain"),
      "Response should state that the document does not contain sufficient details"
    );
  });

  // 6. Test Acronym and Keyword Boosting in RAG pipeline
  await testAsync("Acronym and Keyword Boosting", async () => {
    // Add test chunks to memoryStore for checking VATEM matching and neighboring chunk expansion
    const testChunks = [
      {
        id: 'chunk-5-vatem',
        paper_id: 'paper-attention-2017',
        page_number: 6,
        chunk_index: 4,
        section_name: 'Methodology / VATEM',
        content: 'We present the rolling-horizon methodology VATEM for energy management.'
      },
      {
        id: 'chunk-6-vatem-neighbor',
        paper_id: 'paper-attention-2017',
        page_number: 6,
        chunk_index: 5,
        section_name: 'Methodology / VATEM',
        content: 'This neighboring chunk on page 6 provides extra details about the VATEM strategy.'
      }
    ];

    memoryStore.chunks.push(...testChunks);

    const response = await queryPaper("What is VATEM?", "paper-attention-2017", "strict");
    
    // Verify that the chunk containing VATEM was retrieved
    const citedIds = response.citations.map(c => c.chunk_id);
    assert.ok(citedIds.includes('chunk-5-vatem'), "Should retrieve the exact acronym matching chunk");
    assert.ok(citedIds.includes('chunk-6-vatem-neighbor'), "Should retrieve neighbor chunk on the same page via context expansion");

    // Clean up test chunks from memoryStore
    memoryStore.chunks = memoryStore.chunks.filter(c => c.id !== 'chunk-5-vatem' && c.id !== 'chunk-6-vatem-neighbor');
  });

  // 7. Test Strict PDF Mode Filter
  await testAsync("Strict PDF Mode Filtering", async () => {
    const response = await queryPaper("What is attention?", "paper-resnet-2015", "strict");
    const citedPaperIds = response.citations.map(c => c.paper_id);
    citedPaperIds.forEach(pid => {
      assert.strictEqual(pid, "paper-resnet-2015", "Strict mode must only return chunks for the requested paper");
    });
  });

  console.log("\n====================================================");
  console.log("📊 TEST EXECUTION SUMMARY");
  console.log("====================================================");
  console.log(`Passed tests: ${successCount}`);
  console.log(`Failed tests: ${failCount}`);
  console.log("====================================================\n");

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log("🎉 All integration tests passed successfully!");
    process.exit(0);
  }
}

if (require.main === module) {
  runTests();
}

