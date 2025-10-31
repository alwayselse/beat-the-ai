import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function Leaderboard() {
  const globalScore = useGameStore((state) => state.globalScore);
  const fetchGlobalScores = useGameStore((state) => state.fetchGlobalScores);

  useEffect(() => {
    fetchGlobalScores();
  }, [fetchGlobalScores]);

  const totalGames = globalScore.humans + globalScore.ai;
  const humanWinRate = totalGames > 0 ? ((globalScore.humans / totalGames) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-yellow-400 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000] p-6 mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-center text-black mb-2">
            ⚔️ BATTLE STATS
          </h1>
          <p className="text-center text-gray-600 font-semibold">
            Humans vs AI - The Ultimate Showdown
          </p>
        </div>

        {/* Main Battle Board */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000] p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Humans Score */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-8 text-center">
              <div className="text-white">
                <p className="text-xl font-black mb-3">👥 HUMANS</p>
                <p className="text-7xl font-black mb-2">{globalScore.humans}</p>
                <p className="text-sm font-bold opacity-90">VICTORIES</p>
              </div>
            </div>

            {/* AI Score */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-8 text-center">
              <div className="text-white">
                <p className="text-xl font-black mb-3">🤖 AI</p>
                <p className="text-7xl font-black mb-2">{globalScore.ai}</p>
                <p className="text-sm font-bold opacity-90">VICTORIES</p>
              </div>
            </div>
          </div>

          {/* Win Rate Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-sm">Human Win Rate</span>
              <span className="font-black text-xl text-blue-600">{humanWinRate}%</span>
            </div>
            <div className="h-8 bg-gray-200 border-4 border-black rounded-lg overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${humanWinRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <button
            onClick={fetchGlobalScores}
            className="w-full bg-black text-white font-black py-4 px-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            🔄 Refresh Stats
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6 text-center">
          <p className="font-black text-lg mb-2">
            {globalScore.humans > globalScore.ai ? '🎉 Humans are winning!' : 
             globalScore.ai > globalScore.humans ? '🤖 AI is dominating!' : 
             '⚖️ It\'s a tie!'}
          </p>
          <p className="text-gray-600 font-semibold text-sm">
            Play games to help humanity beat the machines!
          </p>
        </div>
      </div>
    </div>
  );
}
