import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
    const { winner } = req.body;

    if (!winner || (winner !== 'human' && winner !== 'ai')) {
      return res.status(400).json({ error: 'Invalid winner specified' });
    }

    const key = winner === 'human' ? 'global:humans' : 'global:ai';
    
    // Increment the score
    const newScore = await redis.incr(key);

    // Get both scores to return
    const humans = await redis.get('global:humans');
    const ai = await redis.get('global:ai');

    const result = {
      humans: humans !== null ? Number(humans) : 0,
      ai: ai !== null ? Number(ai) : 0,
      updated: winner
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Score update error:', error);
    res.status(500).json({ 
      error: 'Failed to update score',
      details: error.message 
    });
  }
}