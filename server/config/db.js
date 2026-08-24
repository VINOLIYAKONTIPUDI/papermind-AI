const mongoose = require('mongoose');

// In-memory fallback data storage when MongoDB server is offline
const memoryStore = {
  users: [],
  papers: [],
  chunks: [],
  flashcards: [],
  quizzes: [],
  conversations: [],
  messages: [],
  history: []
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/papermind';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.log('MongoDB daemon not running locally. Operating in High-Performance In-Memory Store Mode.');
  }
};

module.exports = { connectDB, memoryStore };
