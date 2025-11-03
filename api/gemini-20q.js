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

  const { stream } = req.body;

  // Enable streaming response if requested
  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
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

    // System prompt - DON'T reveal the secret to AI!
    const systemPrompt = `You are playing 20 Questions. You must guess the player's secret in 10 questions.

CRITICAL RULES:
1. Ask ONLY yes/no questions
2. Be strategic - narrow down categories before specific guessing
3. Your response must be ONLY the question (no extra words)
4. WRONG: "Okay, is it alive?"
5. RIGHT: "Is it alive?"

GUESSING:
- When confident, make a guess using EXACTLY this format: FINAL GUESS: [your answer]
- You can guess at ANY time, but you have ${10 - questionCount + 1} questions left
- On question 10, you MUST make a final guess

Question ${questionCount}/10`;

    // Format chat history - frontend sends 'ai' and 'user' roles
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // First turn - add initial user message
    if (geminiHistory.length === 0) {
      geminiHistory.push({
        role: 'user',
        parts: [{ text: 'I have a secret. Start asking questions to guess it!' }]
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${apiKey}${stream ? '&alt=sse' : ''}`;
    
    const requestBody = {
      contents: geminiHistory,
      systemInstruction: {
        role: 'model',
        parts: [{
          text: systemPrompt
        }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 50, // Short questions only
        topP: 0.9,
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

    // Handle streaming response
    if (stream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

          for (const line of lines) {
            const data = line.replace('data:', '').trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
      return;
    }

    // Handle non-streaming response (fallback)
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

