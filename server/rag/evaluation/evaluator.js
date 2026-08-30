const path = require('path');
const fs = require('fs');
const { queryPaper } = require('../pipeline/ragPipeline');
const config = require('../../config/config');
const mongoose = require('mongoose');

// Seed the memoryStore with default papers and chunks to ensure tests can run offline too
const { memoryStore } = require('../../config/db');
require('../../controllers/paperController'); 

// Seed specific evaluation chunks for acronym and keyword matching
memoryStore.chunks.push({
  id: 'eval-chunk-vatem',
  paper_id: 'paper-attention-2017',
  page_number: 10,
  chunk_index: 100,
  section_name: 'Abstract',
  content: 'The platform integrates the Scalable Rolling-Horizon Methodology VATEM / Local Energy Market Research Track with DERMS (Distributed Energy Resource Management System).'
});

const EVAL_DATASET = [
  {
    question: "What is VATEM?",
    paperId: "paper-attention-2017",
    expectedPages: [10],
    requiredKeywords: ["VATEM", "rolling-horizon", "Local Energy Market"]
  },
  {
    question: "What does DERMS mean?",
    paperId: "paper-attention-2017",
    expectedPages: [10],
    requiredKeywords: ["DERMS", "Distributed Energy Resource Management System"]
  },
  {
    question: "What is the formula for Scaled Dot-Product Attention?",
    paperId: "paper-attention-2017",
    expectedPages: [3, 4],
    requiredKeywords: ["softmax", "Q", "K", "V", "d_k"]
  },
  {
    question: "What is the computational complexity of self-attention per layer?",
    paperId: "paper-attention-2017",
    expectedPages: [4, 5, 6],
    requiredKeywords: ["complexity", "O(n", "O(N", "quadratic"]
  },
  {
    question: "How are positional encodings constructed in this model?",
    paperId: "paper-attention-2017",
    expectedPages: [5, 6],
    requiredKeywords: ["sine", "cosine", "sinusoidal", "positional encoding"]
  },
  {
    question: "What translation benchmark datasets were used in the evaluation?",
    paperId: "paper-attention-2017",
    expectedPages: [7, 8],
    requiredKeywords: ["WMT 2014", "BLEU", "translation"]
  },
  {
    question: "What optimizer was used to train the model?",
    paperId: "paper-attention-2017",
    expectedPages: [7, 8],
    requiredKeywords: ["Adam", "beta", "learning rate"]
  },
  {
    question: "What dropout rate was used during training?",
    paperId: "paper-attention-2017",
    expectedPages: [7, 8],
    requiredKeywords: ["0.1", "dropout", "regularization"]
  },
  {
    question: "How many encoder and decoder layers were in the model?",
    paperId: "paper-attention-2017",
    expectedPages: [3, 5],
    requiredKeywords: ["6", "layers", "encoder", "decoder"]
  },
  {
    question: "What was the size of the attention vector d_model?",
    paperId: "paper-attention-2017",
    expectedPages: [3, 4, 5],
    requiredKeywords: ["512", "d_model"]
  },
  {
    question: "How many heads were used in the Multi-Head Attention?",
    paperId: "paper-attention-2017",
    expectedPages: [3, 4, 5],
    requiredKeywords: ["8", "heads"]
  },
  {
    question: "What is the recipe for baking chocolate chip cookies?",
    paperId: "paper-attention-2017",
    expectedPages: [],
    requiredKeywords: ["not contain", "sufficient info", "insufficient", "not support", "do not know"]
  },
  {
    question: "How do you install Python on a Linux machine?",
    paperId: "paper-attention-2017",
    expectedPages: [],
    requiredKeywords: ["not contain", "sufficient info", "insufficient", "not support", "do not know"]
  }
];

async function runEvaluation() {
  console.log("====================================================");
  console.log("🚀 STARTING PAPERMIND AI RAG EVALUATION SYSTEM v2.0");
  console.log("====================================================");

  let passedTests = 0;
  
  // Retrieval Accumulators
  let totalHit1 = 0;
  let totalHit3 = 0;
  let totalHit5 = 0;
  let totalRecall = 0;
  let evaluatedInDomainCount = 0;

  const resultsReport = [];

  for (let i = 0; i < EVAL_DATASET.length; i++) {
    const item = EVAL_DATASET[i];
    console.log(`\n----------------------------------------------------`);
    console.log(`Test Case #${i + 1}: "${item.question}"`);
    console.log(`Target Paper ID: ${item.paperId} | Expected Pages: [${item.expectedPages.join(', ') || 'None (Out of Domain)'}]`);
    
    try {
      // Execute query using queryPaper (disableFallback is false here to check production/fallback flow)
      const response = await queryPaper(item.question, item.paperId, 'strict');
      
      const retrievedPages = response.citations.map(c => c.page_number);
      const retrievedChunkIds = response.citations.map(c => c.chunk_id);
      const similarityScores = response.citations.map(c => c.similarity_score || 'N/A');

      // 1. Calculate Retrieval Metrics (only applicable for in-domain queries with expected pages)
      let hit1 = 0;
      let hit3 = 0;
      let hit5 = 0;
      let recall = 0;

      if (item.expectedPages.length > 0) {
        evaluatedInDomainCount++;

        // Hit@1
        if (retrievedPages.length > 0 && item.expectedPages.includes(retrievedPages[0])) {
          hit1 = 1;
        }
        // Hit@3
        if (retrievedPages.slice(0, 3).some(p => item.expectedPages.includes(p))) {
          hit3 = 1;
        }
        // Hit@5
        if (retrievedPages.slice(0, 5).some(p => item.expectedPages.includes(p))) {
          hit5 = 1;
        }
        
        // Recall: fraction of expected pages retrieved
        const uniqueHits = item.expectedPages.filter(p => retrievedPages.includes(p));
        recall = uniqueHits.length / item.expectedPages.length;

        totalHit1 += hit1;
        totalHit3 += hit3;
        totalHit5 += hit5;
        totalRecall += recall;

        console.log(`   [Retrieval Metrics]`);
        console.log(`   - Hit@1: ${hit1 ? '✅ YES' : '❌ NO'}`);
        console.log(`   - Hit@3: ${hit3 ? '✅ YES' : '❌ NO'}`);
        console.log(`   - Hit@5: ${hit5 ? '✅ YES' : '❌ NO'}`);
        console.log(`   - Recall: ${(recall * 100).toFixed(1)}%`);
      } else {
        console.log(`   - Out-of-Domain: Skipping retrieval metric accumulators.`);
      }

      console.log(`   - Retrieved Chunk IDs: [${retrievedChunkIds.join(', ') || 'None'}]`);
      console.log(`   - Retrieved Pages: [${retrievedPages.join(', ') || 'None'}]`);
      console.log(`   - Similarity Scores: [${similarityScores.join(', ') || 'None'}]`);

      // 2. Evaluate LLM Response Groundedness
      const answerLower = response.content.toLowerCase();
      let keywordMatches = 0;
      item.requiredKeywords.forEach(kw => {
        if (answerLower.includes(kw.toLowerCase())) {
          keywordMatches++;
        }
      });

      let groundednessPassed = false;
      let groundednessReason = "";

      if (item.expectedPages.length === 0) {
        // Out of domain: must refuse to invent information
        const refused = answerLower.includes("not contain") || 
                        answerLower.includes("insufficient") || 
                        answerLower.includes("not mention") || 
                        answerLower.includes("unable") || 
                        answerLower.includes("do not know") ||
                        answerLower.includes("not support");
        
        groundednessPassed = refused;
        groundednessReason = refused ? "Refused out-of-domain query correctly." : "Failed to refuse out-of-domain query.";
      } else {
        // In domain: check if we have at least one keyword match or citation coverage
        groundednessPassed = keywordMatches > 0;
        groundednessReason = `Matched ${keywordMatches}/${item.requiredKeywords.length} key terms.`;
      }

      console.log(`   - Groundedness / Correctness: ${groundednessPassed ? '✅ PASS' : '❌ FAIL'} (${groundednessReason})`);
      
      const overallCasePassed = (item.expectedPages.length === 0) ? groundednessPassed : (hit5 > 0 && groundednessPassed);
      if (overallCasePassed) {
        passedTests++;
        console.log("   👉 TEST CASE STATUS: PASSED");
      } else {
        console.log("   👉 TEST CASE STATUS: FAILED");
      }
      
      console.log(`   - Answer Snippet: "${response.content.substring(0, 140).replace(/\n/g, ' ')}..."`);

      resultsReport.push({
        question: item.question,
        expectedPages: item.expectedPages,
        retrievedPages,
        retrievedChunkIds,
        similarityScores,
        generatedAnswer: response.content,
        keywordsMatched: keywordMatches,
        groundednessPassed,
        overallCasePassed
      });

    } catch (error) {
      console.error(`   💥 Test Case Failed with error: ${error.message}`);
    }
  }

  // Calculate final aggregated statistics
  const avgHit1 = evaluatedInDomainCount > 0 ? (totalHit1 / evaluatedInDomainCount) * 100 : 0;
  const avgHit3 = evaluatedInDomainCount > 0 ? (totalHit3 / evaluatedInDomainCount) * 100 : 0;
  const avgHit5 = evaluatedInDomainCount > 0 ? (totalHit5 / evaluatedInDomainCount) * 100 : 0;
  const avgRecall = evaluatedInDomainCount > 0 ? (totalRecall / evaluatedInDomainCount) * 100 : 0;
  const successRate = (passedTests / EVAL_DATASET.length) * 100;

  console.log("\n====================================================");
  console.log("📊 PIPELINE EVALUATION REPORT SUMMARY");
  console.log("====================================================");
  console.log(`Total Test Cases evaluated: ${EVAL_DATASET.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${EVAL_DATASET.length - passedTests}`);
  console.log(`Overall Test Accuracy Score: ${successRate.toFixed(2)}%`);
  console.log(`\n--- Semantic Retrieval Performance (In-Domain Only) ---`);
  console.log(`Average Hit@1: ${avgHit1.toFixed(1)}%`);
  console.log(`Average Hit@3: ${avgHit3.toFixed(1)}%`);
  console.log(`Average Hit@5: ${avgHit5.toFixed(1)}%`);
  console.log(`Average Retrieval Recall: ${avgRecall.toFixed(1)}%`);
  console.log("====================================================\n");

  // Save report artifact to scratch directory
  const reportPath = path.join(__dirname, '../../../artifacts/evaluation_results.json');
  try {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date(),
      metrics: {
        totalEvaluated: EVAL_DATASET.length,
        passedCount: passedTests,
        failedCount: EVAL_DATASET.length - passedTests,
        accuracyScore: successRate,
        hit1: avgHit1,
        hit3: avgHit3,
        hit5: avgHit5,
        recall: avgRecall
      },
      results: resultsReport
    }, null, 2));
    console.log(`Report JSON saved to artifacts directory.`);
  } catch (err) {
    console.warn(`Could not save report file: ${err.message}`);
  }

  if (successRate >= 60) {
    console.log("✅ RAG Evaluation meets acceptance criteria.");
    return true;
  } else {
    console.warn("⚠️ RAG Evaluation results are below the 60% threshold.");
    return false;
  }
}

if (require.main === module) {
  runEvaluation().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runEvaluation, EVAL_DATASET };
