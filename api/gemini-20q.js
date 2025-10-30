import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { history, secret, questionCount } = req.body;

    const prompt = `You are playing 20 Questions. The player's secret object is: "${secret}".
Your goal is to guess it in exactly 10 questions (you're currently on question ${questionCount}/10).

Chat history so far:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Rules:
1. Ask ONLY yes/no questions
2. Be strategic - narrow down categories before guessing specifics
3. If you're on question 10, you MUST make a final guess in this format: "FINAL GUESS: [your answer]"
4. If before question 10, ask a smart yes/no question

Your response:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.status(200).json({ response });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
