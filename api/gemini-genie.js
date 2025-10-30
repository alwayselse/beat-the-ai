import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
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
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
