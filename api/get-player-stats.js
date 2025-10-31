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

    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Player name required' });
    }

    const playerKey = `player:${name}:stats`;
    const scoresKey = `player:${name}:scores`;

    const stats = await redis.get(playerKey) || {
      totalGamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      bestStreak: 0,
      currentStreak: 0,
    };

    const personalBest = await redis.get(scoresKey) || [];

    res.status(200).json({ stats, personalBest });

  } catch (error) {
    console.error('Redis Error:', error);
    res.status(500).json({ error: 'Failed to fetch player stats', details: error.message });
  }
}
