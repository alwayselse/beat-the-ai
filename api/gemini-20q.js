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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { history, secret, questionCount } = req.body;

    const prompt = `You are playing 20 Questions. The player's secret object is: "${secret}".
Your goal is to guess it in exactly 10 questions (you're currently on question ${questionCount}/10).

Chat history so far:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Rules:
1. Ask ONLY yes/no questions
2. Be strategic - narrow down categories before guessing specifics
3. If you're on question 10, you MUST make a final guess in this format: "FINAL GUESS: [your answer]"
4. If before question 10, ask a smart yes/no question

Your response:`;

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
    const aiResponse = data.candidates[0].content.parts[0].text;

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to process question', details: error.message });
  }
}