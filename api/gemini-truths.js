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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

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

    // Use fetch API directly to avoid SDK CommonJS issues
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    let textResponse = data.candidates[0].content.parts[0].text;
    
    // Clean up response - remove markdown code blocks if present
    textResponse = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse and validate JSON
    const puzzle = JSON.parse(textResponse);
    
    // Validate structure
    if (!puzzle.topic || !puzzle.facts || puzzle.facts.length !== 3) {
      throw new Error('Invalid puzzle structure');
    }

    res.status(200).json(puzzle);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate puzzle', 
      details: error.message,
      stack: error.stack 
    });
  }
}