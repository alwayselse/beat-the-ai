import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const redis = new Redis({
      url: process.env.beatai_KV_REST_API_URL,
      token: process.env.beatai_KV_REST_API_TOKEN,
    });

    const humans = await redis.get('global:humans') || 0;
    const ai = await redis.get('global:ai') || 0;

    res.status(200).json({ humans: Number(humans), ai: Number(ai) });
  } catch (error) {
    console.error('Redis Error:', error);
    res.status(500).json({ error: 'Failed to fetch scores', details: error.message });
  }
}