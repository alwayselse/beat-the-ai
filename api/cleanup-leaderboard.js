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

  // Admin key protection
  const { adminKey } = req.body;
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Cleaning up leaderboard...');
    
    // Get all entries
    const allData = await redis.zrange('leaderboard', 0, -1, {
      rev: true,
      withScores: true
    });

    console.log('Total entries before cleanup:', allData.length / 2);

    // Group by player (name + phone)
    const playerGroups = new Map();
    
    for (let i = 0; i < allData.length; i += 2) {
      const memberData = allData[i];
      const score = allData[i + 1];
      
      try {
        let player;
        if (typeof memberData === 'string' && memberData.startsWith('player:')) {
          const playerData = await redis.get(memberData);
          if (!playerData) continue;
          player = typeof playerData === 'string' ? JSON.parse(playerData) : playerData;
        } else {
          player = typeof memberData === 'string' ? JSON.parse(memberData) : memberData;
        }
        
        const key = `${player.name.toLowerCase()}:${player.phone || ''}`;
        
        // Keep the entry with highest score for each player
        if (!playerGroups.has(key) || playerGroups.get(key).score < score) {
          playerGroups.set(key, { memberData, score, player });
        }
      } catch (e) {
        console.error('Error parsing entry:', e);
      }
    }

    // Clear the leaderboard
    await redis.del('leaderboard');
    
    // Re-add only the best entry for each player
    for (const [key, data] of playerGroups) {
      const playerKey = `player:${key}`;
      
      // Store player data
      await redis.set(playerKey, JSON.stringify(data.player));
      
      // Add to sorted set
      await redis.zadd('leaderboard', {
        score: data.score,
        member: playerKey
      });
    }

    console.log('Unique players after cleanup:', playerGroups.size);

    res.status(200).json({ 
      success: true,
      before: allData.length / 2,
      after: playerGroups.size,
      message: 'Leaderboard cleaned up successfully'
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      error: 'Failed to cleanup leaderboard',
      details: error.message 
    });
  }
}
