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
    const { name, phone, won, gameType } = req.body;

    if (!name || phone === undefined || won === undefined) {
      console.error('Missing required fields:', { name, phone, won });
      return res.status(400).json({ error: 'Missing required fields: name, phone, won' });
    }

    console.log('Updating leaderboard for:', name, { won, gameType });

    // Create a unique key for the player
    const playerKey = `player:${name}:${phone}`;

    // Get existing player data
    let playerData = await redis.get(playerKey);
    
    let updatedPlayerData;
    
    if (playerData) {
      // Player exists - update their stats
      const existing = typeof playerData === 'string' ? JSON.parse(playerData) : playerData;
      
      const newGamesPlayed = existing.gamesPlayed + 1;
      const newWins = existing.wins + (won ? 1 : 0);
      const newWinRate = Math.round((newWins / newGamesPlayed) * 100);
      
      updatedPlayerData = {
        name,
        phone,
        gamesPlayed: newGamesPlayed,
        wins: newWins,
        winRate: newWinRate,
        lastPlayed: Date.now()
      };
      
      console.log('Updated existing player:', name, updatedPlayerData);
    } else {
      // New player
      updatedPlayerData = {
        name,
        phone,
        gamesPlayed: 1,
        wins: won ? 1 : 0,
        winRate: won ? 100 : 0,
        lastPlayed: Date.now()
      };
      
      console.log('Created new player:', name, updatedPlayerData);
    }

    // Store player data
    await redis.set(playerKey, JSON.stringify(updatedPlayerData));

    // Update sorted set with total wins as score
    await redis.zadd('leaderboard', {
      score: updatedPlayerData.wins,
      member: playerKey
    });

    console.log('Leaderboard updated successfully for:', name, 'with', updatedPlayerData.wins, 'total wins');

    // Get player's rank
    const rank = await redis.zrevrank('leaderboard', playerKey);

    res.status(200).json({ 
      success: true,
      playerName: name,
      rank: rank !== null ? rank + 1 : null,
      playerStats: updatedPlayerData
    });
  } catch (error) {
    console.error('Leaderboard update error:', error);
    res.status(500).json({ 
      error: 'Failed to update leaderboard',
      details: error.message 
    });
  }
}
