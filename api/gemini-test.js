// Simple test endpoint to verify Gemini API works
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);

    if (!apiKey) {
      return res.status(500).json({ error: 'No API key' });
    }

    const prompt = "Say hello in one word";
    
    console.log('Making request to Gemini...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    console.log('Gemini response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini error:', errorText);
      return res.status(500).json({ 
        error: 'Gemini API failed', 
        status: response.status,
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({ 
      success: true, 
      response: text,
      fullData: data 
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Exception caught', 
      message: error.message,
      stack: error.stack
    });
  }
}
