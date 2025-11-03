import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get top 100 players from sorted set (highest scores first)
    const leaderboardData = await redis.zrange('leaderboard', 0, 99, {
      rev: true,
      withScores: true
    });

    // Format the response
    // Redis returns: [member, score, member, score, ...]
    const players = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      try {
        const playerData = JSON.parse(leaderboardData[i]);
        const score = leaderboardData[i + 1];
        
        players.push({
          rank: (i / 2) + 1,
          name: playerData.name,
          phone: playerData.phone || '',
          totalWins: score,
          gamesPlayed: playerData.gamesPlayed || 0,
          winRate: playerData.winRate || 0,
          lastPlayed: playerData.timestamp || Date.now()
        });
      } catch (parseError) {
        console.error('Error parsing player data:', parseError);
        // Skip corrupted entries
        continue;
      }
    }

    res.status(200).json({ 
      leaderboard: players,
      totalPlayers: players.length,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      message: error.message 
    });
  }
}
