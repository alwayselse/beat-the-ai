export default async function handler(req, res) {
  // Set CORS headers FIRST
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      received: req.method,
      expected: 'POST'
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { history, secret, questionCount } = req.body;

    if (!secret) {
      throw new Error('Secret is required');
    }

    // System prompt for AI behavior
    const systemPrompt = `You are a game bot playing 20 Questions. You have 10 questions to guess a secret.

CRITICAL RULES FOR API COST:
1. BE BRUTALLY CONCISE. Your entire response must be ONLY the question.
2. Do NOT use any filler words, greetings, or conversational text.
3. WRONG: "Okay, my next question is: is it alive?"
4. RIGHT: "Is it alive?"
5. Ask ONLY smart, strategic yes/no/maybe questions.

GUESSING FORMAT:
* You can make a guess AT ANY TIME when you feel confident.
* Your guess MUST be in this exact format: FINAL GUESS: [Your Guess]
* Do not say "My final guess is..." or anything else.

The user's secret object is: "${secret}"
You are on question ${questionCount}/10.`;

    // Format the chat history for the API
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // If the history is empty, this is the first turn
    if (geminiHistory.length === 0) {
      geminiHistory.push({
        role: 'user',
        parts: [{ text: 'I have my secret. Ask your first question.' }]
      });
    }

    // Use the correct model name
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: geminiHistory,
      systemInstruction: {
        role: 'model',
        parts: [{
          text: systemPrompt
        }]
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorJson.error.message}`);
      } catch (e) {
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('Invalid response from Gemini API');
    }

    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process question', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}