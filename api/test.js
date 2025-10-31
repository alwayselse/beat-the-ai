export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check all possible environment variable names
  const geminiKey = process.env.GEMINI_API_KEY;
  
  // Check all Upstash variable variations
  const upstashUrl = process.env.beatai_KV_REST_API_URL || 
                     process.env.beatai_REDIS_URL || 
                     process.env.beatai_KV_URL ||
                     process.env.UPSTASH_REDIS_REST_URL;
                     
  const upstashToken = process.env.beatai_KV_REST_API_TOKEN || 
                       process.env.UPSTASH_REDIS_REST_TOKEN;

  res.status(200).json({
    status: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: {
      geminiKey: geminiKey ? 'Set ✓' : 'Missing ✗',
      upstashUrl: upstashUrl ? 'Set ✓' : 'Missing ✗',
      upstashToken: upstashToken ? 'Set ✓' : 'Missing ✗',
    },
    detectedVars: {
      beatai_KV_REST_API_URL: !!process.env.beatai_KV_REST_API_URL,
      beatai_REDIS_URL: !!process.env.beatai_REDIS_URL,
      beatai_KV_URL: !!process.env.beatai_KV_URL,
      beatai_KV_REST_API_TOKEN: !!process.env.beatai_KV_REST_API_TOKEN,
      UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    geminiKeyLength: geminiKey?.length || 0,
  });
}