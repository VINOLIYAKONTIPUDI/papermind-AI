const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables with explicit resolved path
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log(`=========================================`);
console.log(`GEMINI_API_KEY configured: ${!!process.env.GEMINI_API_KEY}`);
console.log(`=========================================`);

const { connectDB } = require('./config/db');
const mongoose = require('mongoose');
const vectorStore = require('./rag/retrieval/vectorStore');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(uploadDir));

// Root Endpoint Welcome Handler
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'PaperMind AI Express API Backend',
    version: '1.0.0',
    frontend_ui_url: 'http://localhost:5173',
    health_check: 'http://localhost:5000/health',
    api_endpoints: 'http://localhost:5000/api/v1/papers',
    message: 'Backend API is running. To access the user interface, launch the frontend server in client directory and visit http://localhost:5173'
  });
});

// Mount REST API
app.use('/api/v1', apiRoutes);

// Health check endpoint with dependency status
app.get('/health', async (req, res) => {
  const isQdrantHealthy = await vectorStore.checkHealth();
  const dbState = mongoose.connection.readyState;
  let databaseStatus = 'offline';
  if (dbState === 1) databaseStatus = 'connected';
  else if (dbState === 2) databaseStatus = 'connecting';
  else databaseStatus = 'offline (operating in-memory mode)';

  res.json({
    status: 'ok',
    server: 'PaperMind AI Express Server',
    timestamp: new Date(),
    dependencies: {
      api: 'healthy',
      database: databaseStatus,
      qdrant: isQdrantHealthy ? 'connected' : 'offline (operating in fallback mode)',
      gemini_configuration: (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') ? 'configured' : 'missing (offline demonstration fallback active)'
    }
  });
});

// Connect DB & Start Server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 PaperMind AI Express Server running on http://localhost:${PORT}`);
    console.log(`👉 Access Frontend Web App on http://localhost:5173`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n⚠️  Port ${PORT} is already in use by another process.`);
      console.error(`Please stop the existing process or run: fuser -k ${PORT}/tcp\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });
});
