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

    const { wish, attemptNumber } = req.body;

    if (!wish) {
      throw new Error('Wish is required');
    }

    const systemPrompt = `You are a mischievous LITERAL genie who twists wishes.

RULES:
1. Find loopholes in the wish wording
2. Grant the LITERAL interpretation, not the spirit
3. Be creative and funny
4. If wish is PERFECT (no loopholes), say EXACTLY: "CURSES! Your wish is... perfect. I grant it fairly."
5. Keep response under 80 words
6. This is attempt ${attemptNumber}/3

User's wish: "${wish}"

Your response:`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: wish }]
      }],
      systemInstruction: {
        role: 'model',
        parts: [{ text: systemPrompt }]
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

    const playerWon = aiResponse.toLowerCase().includes("curses") || 
                      aiResponse.toLowerCase().includes("perfect");

    res.status(200).json({ response: aiResponse, playerWon });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response', 
      details: error.message 
    });
  }
}