const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is not defined in .env');
  process.exit(1);
}

// Dynamically fetch model list securely without logging the API key
async function fetchModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(m => {
        console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.log('Failed to fetch models, response:', data);
    }
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

fetchModels();
