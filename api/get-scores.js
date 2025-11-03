import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Fetching global scores...');
    console.log('Redis URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Missing');
    
    // Get scores from Redis
    const humans = await redis.get('global:humans');
    const ai = await redis.get('global:ai');
    
    console.log('Raw values from Redis:', { humans, ai });
    
    // Convert to numbers, default to 0 if null/undefined
    const humanScore = humans !== null && humans !== undefined ? Number(humans) : 0;
    const aiScore = ai !== null && ai !== undefined ? Number(ai) : 0;

    console.log('Returning scores:', { humans: humanScore, ai: aiScore });

    res.status(200).json({ 
      humans: humanScore,
      ai: aiScore
    });
  } catch (error) {
    console.error('Score fetch error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: process.env.UPSTASH_REDIS_REST_URL
    });
    
    // Return default values instead of error
    res.status(200).json({ 
      humans: 0,
      ai: 0,
      error: error.message
    });
  }
}