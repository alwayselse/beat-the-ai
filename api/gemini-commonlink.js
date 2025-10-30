import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate ONE "Common Link" puzzle.

Rules:
1. Pick 3 items that share a specific, clever connection
2. Create a CORRECT link (the real connection)
3. Create a TRAP link (plausible but wrong connection)
4. Make the trap convincing enough to fool players
5. Keep explanations under 40 words

Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
{
  "items": ["Item 1", "Item 2", "Item 3"],
  "question": "What is the common link?",
  "correctLink": {
    "text": "The real connection",
    "explanation": "Why this is correct"
  },
  "trapLink": {
    "text": "The fake connection",
    "explanation": "Why this seems correct but isn't"
  }
}`;

    const result = await model.generateContent(prompt);
    let response = result.response.text();
    
    // Clean up response - remove markdown code blocks if present
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse and validate JSON
    const puzzle = JSON.parse(response);
    
    // Validate structure
    if (!puzzle.items || puzzle.items.length !== 3 || !puzzle.correctLink || !puzzle.trapLink) {
      throw new Error('Invalid puzzle structure');
    }

    res.status(200).json(puzzle);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate puzzle' });
  }
}
