export default async function handler(req, res) {
  // Set CORS headers FIRST
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or lock this down to your Vercel domain
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

    // --- OPTIMIZATION 1: Create a separate System Prompt ---
    // This is the AI's "Job Description." It's sent separately from the chat history.
    const systemPrompt = `You are a game bot playing 20 Questions. You have 10 questions to guess a secret.

CRITICAL RULES FOR API COST:
1.  **BE BRUTALLY CONCISE.** Your *entire* response must be **only** the question.
2.  Do NOT use any filler words, greetings, or conversational text.
3.  **WRONG:** "Okay, my next question is: is it alive?"
4.  **RIGHT:** "Is it alive?"
5.  Ask ONLY smart, strategic yes/no/maybe questions.

GUESSING FORMAT:
* You can make a guess AT ANY TIME when you feel confident.
* Your guess MUST be in this exact format: \`FINAL GUESS: [Your Guess]\`
* Do not say "My final guess is..." or anything else.

The user's secret object is: "${secret}"
You are on question ${questionCount}/10.`;

    
    // --- OPTIMIZATION 2: Format the chat history for the API ---
    // The `contents` array should *only* contain the chat history.
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'player' ? 'user' : 'model', // Convert 'player' to 'user'
      parts: [{ text: msg.content }]
    }));

    // If the history is empty, this is the first turn.
    if (geminiHistory.length === 0) {
      geminiHistory.push({
        role: 'user',
        parts: [{ text: 'I have my secret. Ask your first question.' }]
      });
    }

    // --- 
    // --- THIS IS THE FIX ---
    // --- The model name is corrected from 'gemini-1.5-flash-latest'
    // ---
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    // --- OPTIMIZATION 3: Send the new, structured request body ---
    const requestBody = {
      contents: geminiHistory,
      systemInstruction: {
        role: 'model', // System instructions are a special type of 'model' role
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
      body: JSON.stringify(requestBody) // Send the new structured body
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Try to parse the error for a cleaner message
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorJson.error.message}`);
      } catch (e) {
        // Fallback if the error text isn't JSON
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

