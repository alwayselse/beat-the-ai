module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check environment variables (without exposing the full keys)
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const hasRedisUrl = !!process.env.beatai_REDIS_URL;
  const hasRedisToken = !!process.env.beatai_KV_REST_API_TOKEN;

  res.status(200).json({
    status: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: {
      geminiKey: hasGeminiKey ? 'Set ✓' : 'Missing ✗',
      redisUrl: hasRedisUrl ? 'Set ✓' : 'Missing ✗',
      redisToken: hasRedisToken ? 'Set ✓' : 'Missing ✗',
    },
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
  });
};
