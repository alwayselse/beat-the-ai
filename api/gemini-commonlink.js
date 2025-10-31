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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
    if (!puzzle.items || puzzle.items.length !== 3 || !puzzle.correctLink || !puzzle.trapLink) {
      throw new Error('Invalid puzzle structure');
    }

    res.status(200).json(puzzle);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate puzzle', details: error.message });
  }
}