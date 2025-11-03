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

  try {
    console.log('Fetching leaderboard...');
    
    // Get top 100 players from the sorted set (highest scores first)
    const leaderboardData = await redis.zrange('leaderboard', 0, 99, {
      rev: true,
      withScores: true
    });

    console.log('Raw leaderboard data length:', leaderboardData?.length || 0);

    if (!leaderboardData || leaderboardData.length === 0) {
      console.log('No leaderboard data found');
      return res.status(200).json({ leaderboard: [] });
    }

    const leaderboard = [];
    
    // Process the data (it comes as [member, score, member, score, ...])
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const playerKey = leaderboardData[i]; // This is now "player:name:phone"
      const totalWins = leaderboardData[i + 1];
      
      try {
        // Fetch the actual player data using the key
        const playerData = await redis.get(playerKey);
        
        if (!playerData) {
          console.log('No data found for key:', playerKey);
          continue;
        }

        const player = typeof playerData === 'string' 
          ? JSON.parse(playerData) 
          : playerData;
        
        leaderboard.push({
          rank: (i / 2) + 1,
          name: player.name,
          phone: player.phone || '',
          totalWins: totalWins,
          gamesPlayed: player.gamesPlayed || 0,
          winRate: player.winRate || 0,
          lastPlayed: player.lastPlayed || Date.now()
        });
      } catch (parseError) {
        console.error('Failed to parse player data for key:', playerKey, parseError);
        continue;
      }
    }

    console.log('Processed leaderboard players:', leaderboard.length);

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      details: error.message,
      leaderboard: []
    });
  }
}
