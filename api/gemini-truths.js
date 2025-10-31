export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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

    const systemPrompt = `Generate a "Two Truths and a Hallucination" puzzle.

OUTPUT FORMAT (JSON ONLY):
{
  "topic": "one word topic",
  "facts": [
    {"text": "fact 1", "isTrue": true},
    {"text": "fact 2", "isTrue": false},
    {"text": "fact 3", "isTrue": true}
  ],
  "explanation": "brief why the false one is false"
}

RULES:
- Exactly 2 true, 1 false
- False fact should be convincing
- Keep facts under 20 words
- Make it educational and fun
- Random topic each time`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: 'Generate a puzzle.' }]
      }],
      systemInstruction: {
        role: 'model',
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 1.0,
        response_mime_type: "application/json"
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('Invalid response from Gemini API');
    }

    const puzzle = JSON.parse(aiResponse);
    res.status(200).json(puzzle);

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate puzzle', 
      details: error.message 
    });
  }
}