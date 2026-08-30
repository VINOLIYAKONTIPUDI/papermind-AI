const chunker = require('../chunking/chunker');
const embeddingService = require('../embeddings/embeddingService');
const vectorStore = require('../retrieval/vectorStore');
const promptTemplates = require('../../prompts/promptTemplates');
const llmService = require('../../llm/llmService');
const config = require('../../config/config');
const { memoryStore } = require('../../config/db');
const { PaperChunk, Paper } = require('../../models/Schemas');
const mongoose = require('mongoose');

/**
 * Runs local word overlap search on chunks as a backup when Qdrant is unavailable.
 */
function localFallbackSearch(query, chunks, topK = 5) {
  const queryTerms = query.toLowerCase().replace(/[?:,.;!'"()]/g, '').split(/\s+/).filter(t => t.length > 2);
  if (queryTerms.length === 0) {
    return chunks.slice(0, topK).map(c => ({
      chunk_id: c.id || c.chunk_id,
      paper_id: c.paper_id,
      page_number: c.page_number,
      section_name: c.section_name,
      content: c.content,
      relevance_score: 0.5
    }));
  }

  const scored = chunks.map(chunk => {
    let matchCount = 0;
    const contentLower = chunk.content.toLowerCase();
    queryTerms.forEach(term => {
      if (contentLower.includes(term)) matchCount++;
    });
    // Jaccard-like simple score
    const score = matchCount / (queryTerms.length + 0.1);
    return {
      chunk_id: chunk.id || chunk.chunk_id,
      paper_id: chunk.paper_id,
      page_number: chunk.page_number,
      section_name: chunk.section_name,
      content: chunk.content,
      relevance_score: score
    };
  });

  return scored
    .filter(item => item.relevance_score > 0)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, topK);
}

/**
 * Extracts acronyms, quoted terms, equations, and keywords from the user query.
 */
function preprocessQuery(query) {
  const acronyms = [];
  const acronymMatches = query.match(/\b[A-Z]{2,}(?:-[A-Z0-9]+)*\b/g) || [];
  acronyms.push(...acronymMatches);

  const quotedPhrases = [];
  const quotedMatches = query.match(/"([^"]+)"|'([^']+)'/g) || [];
  quotedMatches.forEach(m => {
    quotedPhrases.push(m.slice(1, -1));
  });

  const equations = [];
  const eqMatches = query.match(/(?:equation|eq\.?|figure|fig\.?|table)\s*\d+/gi) || [];
  equations.push(...eqMatches);

  const stopWords = new Set([
    'what', 'is', 'the', 'of', 'in', 'and', 'to', 'a', 'an', 'for', 'on', 'with', 'as', 'by', 'at', 
    'this', 'that', 'from', 'does', 'mean', 'explain', 'how', 'why', 'can', 'you', 'describe', 'about',
    'please', 'tell', 'me', 'some', 'any', 'are', 'were', 'was', 'been', 'have', 'has', 'had', 'do', 'did'
  ]);
  const words = query.toLowerCase().replace(/[?:,.;!'"()]/g, ' ').split(/\s+/);
  const keywords = words.filter(w => w.length >= 3 && !stopWords.has(w));

  return {
    acronyms,
    quotedPhrases,
    equations,
    keywords
  };
}

/**
 * Fetches matching chunks from database or memory fallback for keyword search.
 */
async function getTargetChunks(paperId, mode) {
  let localChunks = [];
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      localChunks = await PaperChunk.find(mode === 'strict' ? { paper_id: paperId } : {});
    } else {
      localChunks = memoryStore.chunks;
      if (mode === 'strict') {
        localChunks = localChunks.filter(c => c.paper_id === paperId);
      }
    }
  } catch (err) {
    console.error('Error fetching chunks for keyword match:', err.message);
    localChunks = memoryStore.chunks;
    if (mode === 'strict') {
      localChunks = localChunks.filter(c => c.paper_id === paperId);
    }
  }
  return localChunks;
}

/**
 * Calculates a match score for a chunk against processed query terms.
 */
function scoreChunkKeywords(chunk, queryTerms) {
  const content = chunk.content;
  const contentLower = content.toLowerCase();
  let score = 0;

  // 1. Acronym matches (case-sensitive exact word matches)
  queryTerms.acronyms.forEach(acronym => {
    const regex = new RegExp(`\\b${acronym}\\b`, 'g');
    const matches = content.match(regex);
    if (matches) {
      score += matches.length * 10;
    }
  });

  // 2. Equation/Figure/Table matches (case-insensitive substring)
  queryTerms.equations.forEach(eq => {
    if (contentLower.includes(eq.toLowerCase())) {
      score += 10;
    } else {
      const normEq = eq.toLowerCase().replace(/\./g, '').replace(/\s+/g, '');
      const normContent = contentLower.replace(/\./g, '').replace(/\s+/g, '');
      if (normContent.includes(normEq)) {
        score += 8;
      }
    }
  });

  // 3. Quoted phrase matches (case-insensitive exact substring)
  queryTerms.quotedPhrases.forEach(phrase => {
    if (contentLower.includes(phrase.toLowerCase())) {
      score += 8;
    }
  });

  // 4. General keyword matches (case-insensitive substring)
  queryTerms.keywords.forEach(keyword => {
    if (contentLower.includes(keyword)) {
      score += 1.5;
    }
  });

  return score;
}

/**
 * Executes local exact keyword search and scores matches.
 */
async function exactKeywordSearch(queryTerms, paperId, mode, topK = 10) {
  const chunks = await getTargetChunks(paperId, mode);
  const scored = chunks.map(chunk => {
    const score = scoreChunkKeywords(chunk, queryTerms);
    return {
      chunk_id: chunk.id || chunk.chunk_id,
      paper_id: chunk.paper_id,
      page_number: chunk.page_number,
      chunk_index: chunk.chunk_index,
      section_name: chunk.section_name,
      content: chunk.content,
      keyword_score: score
    };
  });

  const filtered = scored.filter(item => item.keyword_score > 0);
  filtered.sort((a, b) => b.keyword_score - a.keyword_score);
  return filtered.slice(0, topK);
}

/**
 * Resolves full chunk metadata (including chunk_index) from the database or memory.
 */
async function resolveChunksMetadata(chunkIds, paperId) {
  let dbChunks = [];
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      dbChunks = await PaperChunk.find({
        $or: [
          { id: { $in: chunkIds } },
          { paper_id: paperId }
        ]
      });
    } else {
      dbChunks = memoryStore.chunks;
    }
  } catch (err) {
    console.warn(`Failed to resolve chunk metadata from DB: ${err.message}`);
    dbChunks = memoryStore.chunks;
  }

  const chunkMap = new Map();
  dbChunks.forEach(c => {
    chunkMap.set(c.id, c);
    chunkMap.set(c.chunk_id, c);
  });
  return chunkMap;
}

/**
 * Retrieves neighboring chunks for selected seed chunks.
 */
async function getNeighboringChunks(seeds, paperId) {
  const neighborKeys = [];
  seeds.forEach(s => {
    if (s.chunk_index !== undefined && s.chunk_index !== null) {
      neighborKeys.push({ paper_id: s.paper_id || paperId, chunk_index: s.chunk_index - 1 });
      neighborKeys.push({ paper_id: s.paper_id || paperId, chunk_index: s.chunk_index + 1 });
    }
  });

  if (neighborKeys.length === 0) return [];

  let neighbors = [];
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      neighbors = await PaperChunk.find({
        $or: neighborKeys.map(k => ({ paper_id: k.paper_id, chunk_index: k.chunk_index }))
      });
    } else {
      neighbors = memoryStore.chunks.filter(c => 
        neighborKeys.some(k => c.paper_id === k.paper_id && c.chunk_index === k.chunk_index)
      );
    }
  } catch (err) {
    console.warn(`Failed to retrieve neighboring chunks: ${err.message}`);
    neighbors = memoryStore.chunks.filter(c => 
      neighborKeys.some(k => c.paper_id === k.paper_id && c.chunk_index === k.chunk_index)
    );
  }
  return neighbors;
}

/**
 * High-level orchestration for document ingestion.
 */
async function ingestPaper(paperId, pageData) {
  console.log(`Ingesting paper: ${paperId} with ${pageData.length} pages...`);
  
  const chunks = chunker.chunkDocument(pageData);
  console.log(`Generated ${chunks.length} chunks.`);

  if (chunks.length === 0) {
    return [];
  }

  const chunkTexts = chunks.map(c => c.content);
  console.log(`Generating embeddings for chunks...`);
  const embeddings = await embeddingService.generateEmbeddingsBatch(chunkTexts);

  console.log(`Uploading vectors to Qdrant...`);
  const storedInQdrant = await vectorStore.upsertChunks(paperId, chunks, embeddings);
  if (!storedInQdrant) {
    console.warn(`Could not sync vectors to Qdrant. Operating in DB fallback mode.`);
  }

  return chunks;
}

/**
 * High-level query pipeline coordination.
 * Retrieves top chunks (Semantic + Keyword hybrid), reranks, expands, and asks the LLM to write a cited response.
 */
async function queryPaper(query, paperId, mode = 'strict', disableFallback = false) {
  console.log(`Processing RAG Query: "${query}" | Mode: ${mode} | Paper: ${paperId} | DisableFallback: ${disableFallback}`);

  // 1. Preprocess Query to extract keywords, acronyms, and quotes
  const queryTerms = preprocessQuery(query);

  // 2. Semantic retrieval via Qdrant
  const semanticResults = [];
  const qdrantHealthy = await vectorStore.checkHealth();
  if (qdrantHealthy) {
    try {
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      const filterId = (mode === 'strict') ? paperId : null;
      // Retrieve top 10 candidates semantically
      const qdrantResults = await vectorStore.searchSimilar(queryEmbedding, 10, filterId);
      if (qdrantResults) {
        semanticResults.push(...qdrantResults);
      }
    } catch (err) {
      console.warn(`Semantic search failed: ${err.message}`);
    }
  }

  // 3. Exact term/acronym retrieval against paper chunks (up to 10 candidates)
  const keywordResults = await exactKeywordSearch(queryTerms, paperId, mode, 10);

  // 4. Merge & Deduplicate candidates
  const candidateMap = new Map();

  // Add semantic candidates
  semanticResults.forEach(c => {
    const id = c.chunk_id || c.id;
    candidateMap.set(id, {
      chunk_id: id,
      paper_id: c.paper_id,
      page_number: c.page_number,
      chunk_index: c.chunk_index,
      section_name: c.section_name,
      content: c.content,
      semantic_score: c.relevance_score || 0.0,
      keyword_score: 0.0
    });
  });

  // Merge exact keyword candidates
  keywordResults.forEach(c => {
    const id = c.chunk_id || c.id;
    if (candidateMap.has(id)) {
      const existing = candidateMap.get(id);
      existing.keyword_score = c.keyword_score;
      if (existing.chunk_index === undefined && c.chunk_index !== undefined) {
        existing.chunk_index = c.chunk_index;
      }
    } else {
      candidateMap.set(id, {
        chunk_id: id,
        paper_id: c.paper_id,
        page_number: c.page_number,
        chunk_index: c.chunk_index,
        section_name: c.section_name,
        content: c.content,
        semantic_score: 0.0,
        keyword_score: c.keyword_score
      });
    }
  });

  let mergedCandidates = Array.from(candidateMap.values());

  // Resolve chunk_index for candidates where it is missing
  const missingIndexIds = mergedCandidates
    .filter(c => c.chunk_index === undefined || c.chunk_index === null)
    .map(c => c.chunk_id);

  if (missingIndexIds.length > 0) {
    const chunkMetadataMap = await resolveChunksMetadata(missingIndexIds, paperId);
    mergedCandidates.forEach(c => {
      if (c.chunk_index === undefined || c.chunk_index === null) {
        const resolved = chunkMetadataMap.get(c.chunk_id);
        if (resolved) {
          c.chunk_index = resolved.chunk_index;
        }
      }
    });
  }

  // If no candidates found, fallback to local search
  if (mergedCandidates.length === 0) {
    if (disableFallback) {
      console.log(`No hybrid candidates found, and fallback is disabled.`);
    } else {
      console.log(`No hybrid candidates found. Falling back to simple local fallback search...`);
      const chunks = await getTargetChunks(paperId, mode);
      const fallbackResults = localFallbackSearch(query, chunks, config.topK);
      fallbackResults.forEach(c => {
        candidateMap.set(c.chunk_id, {
          chunk_id: c.chunk_id,
          paper_id: c.paper_id,
          page_number: c.page_number,
          section_name: c.section_name,
          content: c.content,
          semantic_score: c.relevance_score,
          keyword_score: 0.0
        });
      });
      mergedCandidates = Array.from(candidateMap.values());
    }
  }

  // 5. Rerank candidates using semantic score + technical term boosts
  const rerankedCandidates = mergedCandidates.map(c => {
    let finalScore = c.semantic_score;

    // Apply boosts
    // 1. Acronym match boost
    queryTerms.acronyms.forEach(acronym => {
      const regex = new RegExp(`\\b${acronym}\\b`, 'g');
      const matches = c.content.match(regex);
      if (matches) {
        finalScore += 0.5 * matches.length;
      }
    });

    // 2. Equation match boost
    queryTerms.equations.forEach(eq => {
      if (c.content.toLowerCase().includes(eq.toLowerCase())) {
        finalScore += 0.5;
      } else {
        const normEq = eq.toLowerCase().replace(/\./g, '').replace(/\s+/g, '');
        const normContent = c.content.toLowerCase().replace(/\./g, '').replace(/\s+/g, '');
        if (normContent.includes(normEq)) {
          finalScore += 0.4;
        }
      }
    });

    // 3. Quoted phrase match boost
    queryTerms.quotedPhrases.forEach(phrase => {
      if (c.content.toLowerCase().includes(phrase.toLowerCase())) {
        finalScore += 0.3;
      }
    });

    // 4. General keyword match boost
    let keywordHits = 0;
    queryTerms.keywords.forEach(keyword => {
      if (c.content.toLowerCase().includes(keyword)) {
        keywordHits++;
      }
    });
    finalScore += Math.min(0.2, keywordHits * 0.05);

    return {
      ...c,
      final_score: finalScore
    };
  });

  // Sort descending by final score
  rerankedCandidates.sort((a, b) => b.final_score - a.final_score);

  // 6. Context Expansion (retrieve neighbor chunks of top 3 seed chunks)
  const seeds = rerankedCandidates.slice(0, 3);
  const expandedChunks = [...seeds];

  const neighborsList = await getNeighboringChunks(seeds, paperId);
  const neighborMap = new Map();
  neighborsList.forEach(n => {
    neighborMap.set(`${n.paper_id}_${n.chunk_index}`, n);
  });

  seeds.forEach(s => {
    if (s.chunk_index !== undefined && s.chunk_index !== null) {
      const leftKey = `${s.paper_id}_${s.chunk_index - 1}`;
      const rightKey = `${s.paper_id}_${s.chunk_index + 1}`;

      const leftNeighbor = neighborMap.get(leftKey);
      if (leftNeighbor && leftNeighbor.page_number === s.page_number) {
        if (!expandedChunks.some(x => x.chunk_id === (leftNeighbor.id || leftNeighbor.chunk_id))) {
          expandedChunks.push({
            chunk_id: leftNeighbor.id || leftNeighbor.chunk_id,
            paper_id: leftNeighbor.paper_id,
            page_number: leftNeighbor.page_number,
            chunk_index: leftNeighbor.chunk_index,
            section_name: leftNeighbor.section_name,
            content: leftNeighbor.content,
            semantic_score: 0.0,
            keyword_score: 0.0,
            final_score: s.final_score * 0.9
          });
        }
      }

      const rightNeighbor = neighborMap.get(rightKey);
      if (rightNeighbor && rightNeighbor.page_number === s.page_number) {
        if (!expandedChunks.some(x => x.chunk_id === (rightNeighbor.id || rightNeighbor.chunk_id))) {
          expandedChunks.push({
            chunk_id: rightNeighbor.id || rightNeighbor.chunk_id,
            paper_id: rightNeighbor.paper_id,
            page_number: rightNeighbor.page_number,
            chunk_index: rightNeighbor.chunk_index,
            section_name: rightNeighbor.section_name,
            content: rightNeighbor.content,
            semantic_score: 0.0,
            keyword_score: 0.0,
            final_score: s.final_score * 0.9
          });
        }
      }
    }
  });

  // 7. Natural Reading Order Sort (page_number ascending, chunk_index ascending)
  expandedChunks.sort((a, b) => {
    if (a.page_number !== b.page_number) {
      return a.page_number - b.page_number;
    }
    return (a.chunk_index || 0) - (b.chunk_index || 0);
  });

  // Cap at 8 chunks to remain within a reasonable token limit
  const finalSelectedChunks = expandedChunks.slice(0, 8);

  // 8. Debug Server-Side Logging
  console.log("====================================================");
  console.log(`DEBUG RAG RETRIEVAL: "${query}"`);
  console.log(`Preprocessed Query Terms:`, queryTerms);
  console.log(`Semantic candidates count: ${semanticResults.length}`);
  console.log(`Keyword candidates count: ${keywordResults.length}`);
  console.log(`Merged candidates count: ${mergedCandidates.length}`);
  console.log(`Reranked Top 5:`, rerankedCandidates.slice(0, 5).map(c => ({ id: c.chunk_id, page: c.page_number, section: c.section_name, final_score: c.final_score })));
  console.log(`Final Selected (Reading Order, capped at 8):`, finalSelectedChunks.map(c => ({ id: c.chunk_id, page: c.page_number, section: c.section_name })));
  console.log("====================================================");

  // Resolve paper titles for document_name citation field
  const paperTitlesMap = {};
  const uniquePaperIds = [...new Set(finalSelectedChunks.map(c => c.paper_id))];
  
  for (const pid of uniquePaperIds) {
    if (!pid) continue;
    let title = 'Research Paper';
    try {
      const isDbConnected = mongoose.connection.readyState === 1;
      if (isDbConnected) {
        const paper = await Paper.findOne({ id: pid });
        if (paper) title = paper.title;
      } else {
        const paper = memoryStore.papers.find(p => p.id === pid);
        if (paper) title = paper.title;
      }
    } catch (err) {
      console.warn(`Could not resolve paper title for ${pid}: ${err.message}`);
    }
    paperTitlesMap[pid] = title;
  }

  // 9. Construct LLM prompt
  const formattedPrompt = promptTemplates.buildRagPrompt(query, finalSelectedChunks);

  // 10. Generate grounded LLM response
  const answer = await llmService.generateResponse(
    formattedPrompt.systemInstruction,
    formattedPrompt.contents
  );

  // 11. Structure citations for the UI
  const citations = finalSelectedChunks.map(chunk => ({
    chunk_id: chunk.chunk_id || chunk.id,
    page_number: chunk.page_number,
    section_name: chunk.section_name,
    document_name: paperTitlesMap[chunk.paper_id] || 'Research Paper',
    similarity_score: typeof chunk.final_score === 'number' ? chunk.final_score : null,
    snippet: chunk.content ? chunk.content.substring(0, 150) + '...' : 'Cited content segment.'
  }));

  return {
    content: answer,
    citations: citations
  };
}

module.exports = {
  ingestPaper,
  queryPaper
};

