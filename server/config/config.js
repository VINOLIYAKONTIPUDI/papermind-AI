const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/papermind',
  qdrantUrl: process.env.QDRANT_URL || 'http://127.0.0.1:6333',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  embeddingModel: process.env.EMBEDDING_MODEL || 'gemini-embedding-001',
  embeddingDim: parseInt(process.env.EMBEDDING_DIM, 10) || 768,
  chunkSize: parseInt(process.env.CHUNK_SIZE, 10) || 1000,
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP, 10) || 200,
  topK: parseInt(process.env.TOP_K, 10) || 5,
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.3
};
