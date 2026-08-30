const path = require('path');
const dotenv = require('dotenv');

// Load env variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = require('./config/config');
const llmService = require('./llm/llmService');
const embeddingService = require('./rag/embeddings/embeddingService');

async function testConnection() {
  console.log('--- DIAGNOSTIC GEMINI CONNECTION TEST ---');
  console.log('GEMINI_API_KEY configured (env):', !!process.env.GEMINI_API_KEY);
  console.log('GEMINI_API_KEY configured (config):', !!config.geminiApiKey);
  console.log('GEMINI_MODEL in use:', config.geminiModel);
  console.log('-----------------------------------------');

  try {
    console.log('1. Testing live embedding generation...');
    const vector = await embeddingService.generateEmbedding('DERMS');
    console.log('   Embedding vector dimension size:', vector.length);
    console.log('   Embedding values preview:', vector.slice(0, 5));

    console.log('2. Testing live LLM response...');
    const context = `CONTEXT FROM THE PAPER:
[Source Block #1]
Page: 1
Section: Abstract
Content: Physical-Layer-Aware Blockchain Settlement for Local Energy Markets: From Circuit Physics to Market Clearing, DERMS Dispatch, and Hyperledger Fabric Settlement, with a Scalable Rolling-Horizon Methodology VATEM / Local Energy Market Research Track Blockchain-Enabled Transactive Energy Abstract Most blockchain-based Local Energy Market (LEM) frameworks describe the market layer bidding, clearing, and settlement in isolation from the physical distribution network, implicitly assuming that a cleared trade between a buyer and a seller is realized as a direct physical delivery. In an AC distribution system this is not correct: power flow is governed by Kirchhoff's laws and network impedances, not by commercial pairing. This paper develops the LEM problem end-to-end through numeric examples: physical power flow at a Point of Common Coupling (PCC), a network-constrained social-welfare market-clearing formulation, IEEE 2030.5 DERMS dispatch that converts the schedule.`;

    const query = 'What is DERMS?';
    
    // Construct exactly as the pipeline does
    const systemInstruction = 'You are PaperMind AI, an expert academic tutor and research assistant. Base your answer solely on the context.';
    const prompt = `${context}\n\nUSER QUESTION:\n${query}\n\nProvide your response based on the guidelines.`;

    const answer = await llmService.generateResponse(systemInstruction, prompt);
    console.log('\n--- LIVE GEMINI RESPONSE ---');
    console.log(answer);
    console.log('----------------------------');
    
  } catch (err) {
    console.error('Diagnostic run failed with error:', err.message);
  }
}

testConnection();
