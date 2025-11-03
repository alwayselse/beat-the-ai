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
    const { playerName, playerPhone, totalWins, gamesPlayed, winRate, lastPlayed } = req.body;

    if (!playerName) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    console.log('Updating leaderboard for:', playerName, { totalWins, gamesPlayed, winRate });

    // Create a unique key for the player (name + phone combination)
    const playerKey = `player:${playerName.toLowerCase()}:${playerPhone || ''}`;

    // Check if player already exists
    const existingData = await redis.get(playerKey);
    
    let updatedPlayerData;
    
    if (existingData) {
      // Player exists - update their stats
      console.log('Existing player found:', existingData);
      const existing = typeof existingData === 'string' ? JSON.parse(existingData) : existingData;
      
      updatedPlayerData = {
        name: playerName,
        phone: playerPhone || existing.phone || '',
        gamesPlayed: gamesPlayed,
        winRate: winRate,
        lastPlayed: lastPlayed || Date.now()
      };
    } else {
      // New player
      console.log('New player, creating entry');
      updatedPlayerData = {
        name: playerName,
        phone: playerPhone || '',
        gamesPlayed: gamesPlayed,
        winRate: winRate,
        lastPlayed: lastPlayed || Date.now()
      };
    }

    // Store player data
    await redis.set(playerKey, JSON.stringify(updatedPlayerData));

    // Update sorted set with total wins as score
    // Use playerKey as the member so we can update the same player
    await redis.zadd('leaderboard', {
      score: totalWins,
      member: playerKey
    });

    console.log('Leaderboard updated successfully for:', playerName, 'with', totalWins, 'wins');

    // Get player's rank
    const rank = await redis.zrevrank('leaderboard', playerKey);

    // Clean up old entries (keep only top 1000)
    const count = await redis.zcard('leaderboard');
    if (count > 1000) {
      await redis.zremrangebyrank('leaderboard', 0, count - 1001);
    }

    res.status(200).json({ 
      success: true,
      playerName,
      rank: rank !== null ? rank + 1 : null,
      totalWins,
      updated: existingData ? true : false
    });
  } catch (error) {
    console.error('Leaderboard update error:', error);
    res.status(500).json({ 
      error: 'Failed to update leaderboard',
      details: error.message 
    });
  }
}
