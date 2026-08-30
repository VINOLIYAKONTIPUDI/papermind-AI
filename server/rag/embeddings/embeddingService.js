const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/config');

// Initialize Gemini client only if API key is provided
let genAI = null;

function getGenAIClient() {
  if (genAI) return genAI;
  if (config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here') {
    try {
      genAI = new GoogleGenerativeAI(config.geminiApiKey);
      return genAI;
    } catch (err) {
      console.error('Failed to initialize GoogleGenerativeAI client:', err.message);
    }
  }
  return null;
}

/**
 * Helper to generate pseudo-random deterministic embeddings of config.embeddingDim dimensions.
 * Ensures the system works offline or without API keys.
 */
function generateMockEmbedding(text) {
  const embedding = [];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const dimension = config.embeddingDim || 768;
  for (let i = 0; i < dimension; i++) {
    // Generate deterministic values between -1.0 and 1.0
    const val = Math.sin(hash + i) * 0.1;
    embedding.push(val);
  }
  return embedding;
}

/**
 * Generates an embedding for a text snippet.
 * @param {string} text Text to generate embedding for.
 * @returns {Promise<Array<number>>} The vector embedding.
 */
async function generateEmbedding(text) {
  const dimension = config.embeddingDim || 768;
  if (!text) return new Array(dimension).fill(0);

  const client = getGenAIClient();
  if (!client || !config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
    return generateMockEmbedding(text);
  }

  try {
    const embeddingModelName = config.embeddingModel || 'gemini-embedding-001';
    const model = client.getGenerativeModel({ model: embeddingModelName });
    
    // Set outputDimensionality to match the configured dimension size
    const request = {
      content: {
        parts: [{ text: text }]
      }
    };
    if (config.embeddingDim) {
      request.outputDimensionality = config.embeddingDim;
    }
    
    const result = await model.embedContent(request);
    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    } else {
      throw new Error('Invalid embedding response format from Google AI API');
    }
  } catch (err) {
    console.warn(`Gemini API Embedding Error: ${err.message}. Falling back to mock embeddings.`);
    return generateMockEmbedding(text);
  }
}

/**
 * Generates embeddings for an array of texts.
 * @param {Array<string>} texts Array of texts to embed.
 * @returns {Promise<Array<Array<number>>>} Array of embeddings.
 */
async function generateEmbeddingsBatch(texts) {
  if (!texts || texts.length === 0) return [];
  
  // Call API in parallel chunks or batches. For simplicity and since we split page-by-page,
  // we do Promise.all. If there is concern for rate-limiting, we can execute them sequentially.
  // Given we are doing a standard intern project, parallel promises works great.
  const promises = texts.map(t => generateEmbedding(t));
  return Promise.all(promises);
}

/**
 * Resolves the actual embedding dimension by calling the API model with a dummy text.
 * Falls back to config.embeddingDim if offline or if the API call fails.
 */
async function getEmbeddingDimension() {
  const client = getGenAIClient();
  if (!client || !config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
    return config.embeddingDim || 768;
  }
  try {
    const embeddingModelName = config.embeddingModel || 'gemini-embedding-001';
    const model = client.getGenerativeModel({ model: embeddingModelName });
    const request = {
      content: {
        parts: [{ text: 'test' }]
      }
    };
    if (config.embeddingDim) {
      request.outputDimensionality = config.embeddingDim;
    }
    const result = await model.embedContent(request);
    if (result && result.embedding && result.embedding.values) {
      const dim = result.embedding.values.length;
      console.log(`Verified live Gemini embedding model dimension: ${dim}`);
      return dim;
    }
  } catch (err) {
    console.warn(`Could not verify live embedding dimension: ${err.message}. Falling back to configured: ${config.embeddingDim || 768}`);
  }
  return config.embeddingDim || 768;
}

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch,
  generateMockEmbedding,
  getEmbeddingDimension
};
