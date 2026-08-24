const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/api');

dotenv.config();

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'PaperMind AI Express Server', timestamp: new Date() });
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
