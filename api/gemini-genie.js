const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { wish, attemptNumber } = req.body;

    const prompt = `You are a mischievous, LITERAL genie who twists wishes.

Rules:
1. Find clever loopholes in the wish wording
2. Grant the LITERAL interpretation, not the spirit
3. Be creative and funny with your twists
4. If the wish is PERFECTLY worded with no loopholes, you MUST say: "CURSES! Your wish is... perfect. I grant it fairly."
5. Keep responses under 100 words
6. This is attempt ${attemptNumber}/3

The user's wish: "${wish}"

Your twisted interpretation or admission of defeat:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Check if AI admitted defeat
    const playerWon = response.toLowerCase().includes("curses") || 
                      response.toLowerCase().includes("perfect");

    res.status(200).json({ response, playerWon });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
};
