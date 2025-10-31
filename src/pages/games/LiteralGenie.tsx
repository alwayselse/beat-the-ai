import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface WishResult {
  wish: string;
  response: string;
  success: boolean;
}

export default function LiteralGenie() {
  const navigate = useNavigate();
  const { incrementGlobalScore } = useGameStore();
  
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [currentWish, setCurrentWish] = useState('');
  const [attempts, setAttempts] = useState<WishResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);

  const handleSubmitWish = async () => {
    if (!currentWish.trim() || loading || attempts.length >= 3) return;
    
    setLoading(true);
    const attemptNumber = attempts.length + 1;

    try {
      const response = await fetch('/api/gemini-genie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wish: currentWish, attemptNumber }),
      });
      const data = await response.json();
      
      const newAttempt: WishResult = {
        wish: currentWish,
        response: data.response,
        success: data.playerWon,
      };
      
      const newAttempts = [...attempts, newAttempt];
      setAttempts(newAttempts);
      setCurrentWish('');
      
      // Check if player won or if it's the last attempt
      if (data.playerWon) {
        setPlayerWon(true);
        setGameState('finished');
        incrementGlobalScore('human');
      } else if (attemptNumber >= 3) {
        setPlayerWon(false);
        setGameState('finished');
        incrementGlobalScore('ai');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to get genie response:', error);
      setLoading(false);
    }
  };

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-pink-300 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8">
          <h1 className="text-5xl font-black mb-6 text-center">
            {playerWon ? '🎉 YOU WIN! 🎉' : '🧞 GENIE WINS! 🧞'}
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-2xl font-bold mb-4">
              {playerWon 
                ? 'You crafted a perfect wish with no loopholes!'
                : 'The genie twisted all your wishes!'}
            </p>
          </div>

          <div className="bg-yellow-100 border-4 border-black p-6 mb-8">
            <h3 className="text-xl font-black mb-4">Your Attempts:</h3>
            <div className="space-y-4">
              {attempts.map((attempt, index) => (
                <div key={index} className="border-2 border-black p-4 bg-white">
                  <div className="font-black mb-2">Wish {index + 1}:</div>
                  <div className="mb-2 text-blue-600 font-bold">"{attempt.wish}"</div>
                  <div className={`font-bold ${attempt.success ? 'text-green-600' : 'text-red-600'}`}>
                    {attempt.success ? '✅ Perfect!' : '❌ Twisted!'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 px-8 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl"
            >
              Back to Menu
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 px-8 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-300 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-6 mb-6">
          <h1 className="text-4xl font-black mb-2">The Literal Genie</h1>
          <div className="text-xl font-bold">
            Attempts: {attempts.length}/3
          </div>
        </div>

        <div className="bg-yellow-100 border-4 border-black shadow-[8px_8px_0px_#000] p-6 mb-6">
          <h3 className="text-2xl font-black mb-3">How to Play:</h3>
          <ul className="space-y-2 text-lg font-bold">
            <li>• Make a wish, but be VERY careful how you word it</li>
            <li>• The AI genie will grant it LITERALLY, finding loopholes</li>
            <li>• If you word it perfectly with no loopholes, you win!</li>
            <li>• You have 3 attempts to outsmart the genie</li>
          </ul>
        </div>

        {/* Previous Attempts */}
        {attempts.length > 0 && (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-6 mb-6">
            <h3 className="text-2xl font-black mb-4">Previous Attempts:</h3>
            <div className="space-y-4">
              {attempts.map((attempt, index) => (
                <div 
                  key={index}
                  className={`border-4 border-black p-4 ${
                    attempt.success ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <div className="font-black mb-2">
                    Attempt {index + 1}: {attempt.success ? '✅ SUCCESS' : '❌ TWISTED'}
                  </div>
                  <div className="mb-3">
                    <span className="font-black">Your wish: </span>
                    <span className="font-bold text-blue-600">"{attempt.wish}"</span>
                  </div>
                  <div className="bg-white border-2 border-black p-3">
                    <span className="font-black">Genie says: </span>
                    <span className="font-bold">{attempt.response}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wish Input */}
        {attempts.length < 3 && (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-6">
            <label className="block text-2xl font-black mb-4">
              Make your wish (Attempt {attempts.length + 1}/3):
            </label>
            <textarea
              value={currentWish}
              onChange={(e) => setCurrentWish(e.target.value)}
              placeholder="I wish for..."
              className="w-full p-4 border-4 border-black text-lg font-bold mb-4 min-h-32"
              disabled={loading}
            />
            
            <button
              onClick={handleSubmitWish}
              disabled={!currentWish.trim() || loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black py-4 px-8 border-4 border-black shadow-[6px_6px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Genie is thinking...' : 'Make Wish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
