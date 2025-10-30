import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.beatai_REDIS_URL || process.env.beatai_KV_URL,
  token: process.env.beatai_KV_REST_API_TOKEN,
});

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { winner } = req.body; // 'human' or 'ai'

    if (winner === 'human') {
      await redis.incr('global:humans');
    } else if (winner === 'ai') {
      await redis.incr('global:ai');
    } else {
      return res.status(400).json({ error: 'Invalid winner. Use "human" or "ai"' });
    }

    const humans = await redis.get('global:humans') || 0;
    const ai = await redis.get('global:ai') || 0;

    res.status(200).json({ humans, ai });
  } catch (error) {
    console.error('Redis Error:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
}
