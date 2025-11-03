import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // Enable CORS
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

    // Validate input
    if (!playerName || totalWins === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['playerName', 'totalWins']
      });
    }

    console.log('Received leaderboard update:', { playerName, totalWins, gamesPlayed, winRate });

    // Create unique member key to prevent exact duplicates
    // Using timestamp + random string ensures each game session is tracked
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const playerData = JSON.stringify({
      name: playerName,
      phone: playerPhone || '',
      gamesPlayed: gamesPlayed || 0,
      winRate: winRate || 0,
      lastPlayed: lastPlayed || Date.now(),
      id: uniqueId
    });

    // Add to sorted set (score = totalWins, higher is better)
    await redis.zadd('leaderboard', {
      score: totalWins,
      member: playerData
    });

    console.log('Leaderboard updated for:', playerName);

    // Optional: Clean up old entries to prevent unlimited growth
    // Keep only top 1000 players
    const count = await redis.zcard('leaderboard');
    if (count > 1000) {
      // Remove lowest scores (keep highest 1000)
      await redis.zremrangebyrank('leaderboard', 0, count - 1001);
    }

    // Get player's current rank
    const rank = await redis.zrevrank('leaderboard', playerData);

    res.status(200).json({ 
      success: true,
      message: 'Leaderboard updated',
      playerName,
      playerRank: rank !== null ? rank + 1 : null,
      totalWins
    });
  } catch (error) {
    console.error('Leaderboard update error:', error);
    res.status(500).json({ 
      error: 'Failed to update leaderboard',
      message: error.message 
    });
  }
}
