import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const redis = new Redis({
      url: process.env.beatai_KV_REST_API_URL,
      token: process.env.beatai_KV_REST_API_TOKEN,
    });

    const leaderboard = await redis.get('global:leaderboard') || [];

    res.status(200).json({ leaderboard });

  } catch (error) {
    console.error('Redis Error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard', details: error.message });
  }
}
