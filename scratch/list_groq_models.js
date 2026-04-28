const Groq = require('groq-sdk');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY not found in .env');
    return;
  }

  const groq = new Groq({ apiKey });
  try {
    const models = await groq.models.list();
    console.log(JSON.stringify(models, null, 2));
  } catch (error) {
    console.error('Error fetching models:', error.message);
  }
}

listModels();
