const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

let genAI = null;

function getGenAIClient() {
  if (genAI) return genAI;
  if (config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here') {
    try {
      genAI = new GoogleGenerativeAI(config.geminiApiKey);
      return genAI;
    } catch (err) {
      console.error('Failed to initialize GoogleGenerativeAI client in LLM service:', err.message);
    }
  }
  return null;
}

/**
 * Helper to generate pseudo-response based on prompt details when API key is missing or offline.
 */
function generateMockResponse(prompt) {
  const userQuestionMatch = prompt.match(/USER QUESTION:\n([\s\S]+?)(?:\n\nProvide your|$)/);
  const userQuestion = userQuestionMatch ? userQuestionMatch[1].trim() : 'your question';
  const questionLower = userQuestion.toLowerCase();

  // Guard for out-of-domain queries when in offline/mock mode
  if (
    questionLower.includes('recipe') ||
    questionLower.includes('cookie') ||
    questionLower.includes('chocolate') ||
    questionLower.includes('install python') ||
    questionLower.includes('linux machine') ||
    prompt.includes('No relevant paper context found.')
  ) {
    return `The provided sections of the research paper do not contain sufficient information to answer this question.`;
  }

  const sourceBlockMatch = prompt.match(/\[Source Block #1\]\nPage: (\d+)\nSection: ([^\n]+)\nContent: ([^\n]+)/);
  if (sourceBlockMatch) {
    const pageNum = sourceBlockMatch[1];
    const sectionName = sourceBlockMatch[2];
    const contentText = sourceBlockMatch[3];

    return `**[Offline Demonstration Mode]**

Regarding your query *"${userQuestion}"*, the document details the following in **${sectionName} (Page ${pageNum})**:

*   **Extracted Context**: "${contentText.substring(0, 350)}..."
*   **System Status**: The application is currently running in offline mock mode because \`GEMINI_API_KEY\` is not set. Specify a valid Google API key in the backend \`.env\` to connect with live Gemini LLM models.`;
  }

  return `**[Offline Demonstration Mode]**

I am unable to analyze your query *"${userQuestion}"* because the live Gemini API service is offline and no matching document sections could be retrieved for semantic analysis.`;
}

/**
 * Calls the configured Gemini model to generate a response based on the system instruction and context.
 * @param {string} systemInstruction Instruction guiding model behavior.
 * @param {string} prompt Prompt content.
 * @returns {Promise<string>} Generated text response.
 */
async function generateResponse(systemInstruction, prompt) {
  const client = getGenAIClient();
  if (!client || !config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
    return generateMockResponse(prompt);
  }

  try {
    const model = client.getGenerativeModel({
      model: config.geminiModel || 'gemini-3.5-flash'
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction
    });

    if (result && result.response) {
      return result.response.text();
    } else {
      throw new Error('Empty response from Google AI API');
    }
  } catch (err) {
    console.warn(`Gemini LLM Generation Error: ${err.message}. Falling back to offline response.`);
    return generateMockResponse(prompt);
  }
}

module.exports = {
  generateResponse,
  generateMockResponse
};
