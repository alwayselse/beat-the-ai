import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function Leaderboard() {
  const globalScore = useGameStore((state) => state.globalScore);
  const fetchGlobalScores = useGameStore((state) => state.fetchGlobalScores);
  const leaderboard = useGameStore((state) => state.leaderboard);
  const leaderboardLoading = useGameStore((state) => state.leaderboardLoading);
  const fetchLeaderboard = useGameStore((state) => state.fetchLeaderboard);
  const playerName = useGameStore((state) => state.playerName);

  useEffect(() => {
    fetchGlobalScores();
    fetchLeaderboard();
  }, [fetchGlobalScores, fetchLeaderboard]);

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
            onClick={() => {
              fetchGlobalScores();
              fetchLeaderboard();
            }}
            className="w-full bg-black text-white font-black py-4 px-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            🔄 Refresh Stats
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6 text-center mb-8">
          <p className="font-black text-lg mb-2">
            {globalScore.humans > globalScore.ai ? '🎉 Humans are winning!' : 
             globalScore.ai > globalScore.humans ? '🤖 AI is dominating!' : 
             '⚖️ It\'s a tie!'}
          </p>
          <p className="text-gray-600 font-semibold text-sm">
            Play games to help humanity beat the machines!
          </p>
        </div>

        {/* Player Leaderboard Section */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000] p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-black text-black">
              🏆 TOP PLAYERS
            </h2>
            {leaderboardLoading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
            )}
          </div>

          {leaderboard.length === 0 && !leaderboardLoading ? (
            <div className="text-center py-12">
              <p className="text-2xl font-black text-gray-400 mb-2">📊 No Rankings Yet</p>
              <p className="text-gray-600 font-semibold">Be the first to set a record!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((player, index) => {
                const isCurrentPlayer = player.name === playerName;
                const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                
                return (
                  <div
                    key={`${player.name}-${player.lastPlayed}`}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-4 border-black transition-all ${
                      isCurrentPlayer 
                        ? 'bg-gradient-to-r from-yellow-200 to-orange-200 shadow-[6px_6px_0px_#000]' 
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 shadow-[4px_4px_0px_#000]'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                      <span className="text-2xl sm:text-3xl font-black text-purple-600 min-w-[50px] sm:min-w-[60px]">
                        {medalEmoji} #{player.rank}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-base sm:text-lg text-black">
                            {player.name}
                          </p>
                          {isCurrentPlayer && (
                            <span className="bg-purple-500 text-white text-xs font-black px-2 py-1 rounded border-2 border-black">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                          {player.gamesPlayed} games • {player.winRate}% win rate
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-2xl sm:text-3xl font-black text-green-600">
                          {player.totalWins}
                        </p>
                        <p className="text-xs text-gray-500 font-bold">wins</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show More Message */}
          {leaderboard.length > 10 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 font-semibold text-sm">
                Showing top 10 of {leaderboard.length} players
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
