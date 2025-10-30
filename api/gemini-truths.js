import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate ONE "Two Truths and a Hallucination" puzzle.

Rules:
1. Pick a random interesting topic (movie, animal, science, history, pop culture, etc.)
2. Create 2 TRUE facts and 1 FALSE fact (the hallucination)
3. Make the false fact PLAUSIBLE but wrong
4. Mix them in random order
5. Keep facts concise (under 25 words each)

Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
{
  "topic": "Topic Name",
  "facts": [
    {"text": "Fact 1", "isTrue": true},
    {"text": "Fact 2", "isTrue": false},
    {"text": "Fact 3", "isTrue": true}
  ],
  "explanation": "Brief explanation of why the false fact is wrong"
}`;

    const result = await model.generateContent(prompt);
    let response = result.response.text();
    
    // Clean up response - remove markdown code blocks if present
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse and validate JSON
    const puzzle = JSON.parse(response);
    
    // Validate structure
    if (!puzzle.topic || !puzzle.facts || puzzle.facts.length !== 3) {
      throw new Error('Invalid puzzle structure');
    }

    res.status(200).json(puzzle);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate puzzle' });
  }
}
