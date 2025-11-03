import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple password protection
  const { adminKey } = req.query;
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid admin key' });
  }

  try {
    // Get ALL players (top 1000)
    const leaderboardData = await redis.zrange('leaderboard', 0, 999, {
      rev: true,
      withScores: true
    });

    // Get global scores
    const humanWins = await redis.get('global:humans') || 0;
    const aiWins = await redis.get('global:ai') || 0;

    const players = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      try {
        const playerData = JSON.parse(leaderboardData[i]);
        const score = leaderboardData[i + 1];
        
        players.push({
          rank: (i / 2) + 1,
          name: playerData.name,
          phone: playerData.phone || 'N/A',
          totalWins: score,
          gamesPlayed: playerData.gamesPlayed || 0,
          winRate: playerData.winRate || 0,
          lastPlayed: new Date(playerData.timestamp).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
          })
        });
      } catch (parseError) {
        console.error('Error parsing player data:', parseError);
        continue;
      }
    }

    res.status(200).json({ 
      success: true,
      totalPlayers: players.length,
      globalStats: {
        humanWins: Number(humanWins),
        aiWins: Number(aiWins),
        totalGames: Number(humanWins) + Number(aiWins),
        humanWinRate: Number(humanWins) + Number(aiWins) > 0 
          ? ((Number(humanWins) / (Number(humanWins) + Number(aiWins))) * 100).toFixed(1) + '%'
          : '0%'
      },
      topPlayers: players.slice(0, 50), // Show top 50
      allPlayers: players // Full list
    });
  } catch (error) {
    console.error('Admin leaderboard error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch admin leaderboard',
      message: error.message 
    });
  }
}
