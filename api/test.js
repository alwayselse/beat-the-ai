export default async function handler(req, res) {
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
  const hasRedisUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasRedisToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;

  res.status(200).json({
    status: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: {
      geminiKey: hasGeminiKey ? 'Set ✓' : 'Missing ✗',
      upstashUrl: hasRedisUrl ? 'Set ✓' : 'Missing ✗',
      upstashToken: hasRedisToken ? 'Set ✓' : 'Missing ✗',
    },
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
  });
}