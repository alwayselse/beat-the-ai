import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const redis = new Redis({
      url: process.env.beatai_KV_REST_API_URL,
      token: process.env.beatai_KV_REST_API_TOKEN,
    });

    const { playerName, game, score, won } = req.body;

    if (!playerName || !game || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const playerKey = `player:${playerName}:stats`;
    const scoresKey = `player:${playerName}:scores`;

    // Get current stats or initialize
    let stats = await redis.get(playerKey);
    if (!stats) {
      stats = {
        totalGamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        bestStreak: 0,
        currentStreak: 0,
      };
    }

    // Update stats
    stats.totalGamesPlayed += 1;
    if (won) {
      stats.gamesWon += 1;
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else {
      stats.gamesLost += 1;
      stats.currentStreak = 0;
    }

    // Save updated stats
    await redis.set(playerKey, stats);

    // Save score record
    const scoreRecord = {
      playerName,
      game,
      score,
      won,
      date: new Date().toISOString(),
    };

    // Get existing scores and add new one
    let scores = await redis.get(scoresKey) || [];
    scores.push(scoreRecord);
    
    // Keep only top 10 scores per player
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
    
    await redis.set(scoresKey, scores);

    // Also add to global leaderboard
    const leaderboardKey = 'global:leaderboard';
    let leaderboard = await redis.get(leaderboardKey) || [];
    leaderboard.push(scoreRecord);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 50); // Top 50 globally
    await redis.set(leaderboardKey, leaderboard);

    res.status(200).json({ 
      stats,
      personalBest: scores 
    });

  } catch (error) {
    console.error('Redis Error:', error);
    res.status(500).json({ error: 'Failed to save game result', details: error.message });
  }
}
