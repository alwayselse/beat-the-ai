import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.beatai_REDIS_URL || process.env.beatai_KV_URL,
  token: process.env.beatai_KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  try {
    const humans = await redis.get('global:humans') || 0;
    const ai = await redis.get('global:ai') || 0;

    res.status(200).json({ humans, ai });
  } catch (error) {
    console.error('Redis Error:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
}
