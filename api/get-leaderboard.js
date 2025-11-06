import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get top 100 players from the sorted set (highest scores first)
    const leaderboardData = await redis.zrange('leaderboard', 0, 99, {
      rev: true,
      withScores: true
    });

    if (!leaderboardData || leaderboardData.length === 0) {
      return res.status(200).json({ leaderboard: [] });
    }

    const leaderboard = [];
    const seenPlayers = new Map(); // Track unique players by name+phone
    
    // Process the data (it comes as [member, score, member, score, ...])
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const memberData = leaderboardData[i];
      const totalWins = leaderboardData[i + 1];
      
      try {
        let player;
        
        // Check if it's a player key (new format) or JSON (old format)
        if (typeof memberData === 'string' && memberData.startsWith('player:')) {
          // New format: fetch from Redis
          const playerData = await redis.get(memberData);
          if (!playerData) continue;
          player = typeof playerData === 'string' ? JSON.parse(playerData) : playerData;
        } else {
          // Old format: parse JSON directly
          player = typeof memberData === 'string' ? JSON.parse(memberData) : memberData;
        }
        
        // Create unique key for player
        const playerKey = `${player.name.toLowerCase()}:${player.phone || ''}`;
        
        // Only add if we haven't seen this player yet (keeps highest score)
        if (!seenPlayers.has(playerKey)) {
          seenPlayers.set(playerKey, true);
          
          leaderboard.push({
            rank: leaderboard.length + 1,
            name: player.name,
            phone: player.phone || '',
            totalWins: totalWins,
            gamesPlayed: player.gamesPlayed || 0,
            winRate: player.winRate || 0,
            lastPlayed: player.lastPlayed || Date.now()
          });
        }
      } catch (parseError) {
        continue;
      }
    }

    // Re-rank after removing duplicates
    leaderboard.forEach((player, index) => {
      player.rank = index + 1;
    });

    res.status(200).json({ leaderboard });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      leaderboard: []
    });
  }
}
