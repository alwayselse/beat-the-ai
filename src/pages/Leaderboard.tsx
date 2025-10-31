import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import PlayerCard from '../components/PlayerCard';

export default function Leaderboard() {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const playerName = useGameStore((state) => state.playerName);
  const playerStats = useGameStore((state) => state.playerStats);
  const personalBestScores = useGameStore((state) => state.personalBestScores);
  const fetchLeaderboard = useGameStore((state) => state.fetchLeaderboard);
  const fetchPlayerStats = useGameStore((state) => state.fetchPlayerStats);

  // Fetch data on mount
  useEffect(() => {
    fetchLeaderboard();
    if (playerName) {
      fetchPlayerStats();
    }
  }, [fetchLeaderboard, fetchPlayerStats, playerName]);

  const totalPlayers = leaderboard.length;
  const averageScore = leaderboard.length > 0 
    ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length)
    : 0;
  const topScore = leaderboard.length > 0 ? leaderboard[0].score : 0;

  const playerRank = leaderboard.findIndex(entry => entry.playerName === playerName) + 1;

  const gameNameMap: { [key: string]: string } = {
    'truths': 'Two Truths',
    'commonlink': 'Common Link',
    '20q': '20 Questions',
    'genie': 'Literal Genie'
  };

  return (
    <div className="min-h-screen bg-yellow-400 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000] p-6 mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-center text-black mb-2">
            🏆 LEADERBOARD
          </h1>
          <p className="text-center text-gray-600 font-semibold">
            Top Players Who Beat The AI
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-5 text-center">
            <div className="text-3xl font-black text-purple-600 mb-2">{totalPlayers}</div>
            <div className="text-sm font-bold text-gray-600 uppercase">Total Players</div>
          </div>
          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-5 text-center">
            <div className="text-3xl font-black text-green-600 mb-2">{topScore.toLocaleString()}</div>
            <div className="text-sm font-bold text-gray-600 uppercase">Highest Score</div>
          </div>
          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-5 text-center">
            <div className="text-3xl font-black text-blue-600 mb-2">{averageScore.toLocaleString()}</div>
            <div className="text-sm font-bold text-gray-600 uppercase">Average Score</div>
          </div>
        </div>

        {/* Current Player Info */}
        {playerName && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-5 mb-6">
            <div className="text-white">
              <p className="text-sm font-bold mb-2">YOUR STATS</p>
              <div className="flex items-center justify-between mb-4">
                <p className="text-2xl font-black">{playerName}</p>
                {playerRank > 0 && (
                  <p className="text-2xl font-black">Rank #{playerRank}</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-white/20 rounded-lg p-2">
                  <p className="text-2xl font-black">{playerStats.totalGamesPlayed}</p>
                  <p className="text-xs font-semibold">Games</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <p className="text-2xl font-black">{playerStats.gamesWon}</p>
                  <p className="text-xs font-semibold">Wins</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <p className="text-2xl font-black">{playerStats.currentStreak}</p>
                  <p className="text-xs font-semibold">Streak</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <p className="text-2xl font-black">{playerStats.bestStreak}</p>
                  <p className="text-xs font-semibold">Best</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Best Scores */}
        {playerName && personalBestScores.length > 0 && (
          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6 mb-6">
            <h3 className="text-xl font-black mb-4">🎯 Your Best Scores</h3>
            <div className="space-y-2">
              {personalBestScores.slice(0, 5).map((score, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border-2 border-black">
                  <div>
                    <span className="font-black text-purple-600">{gameNameMap[score.game] || score.game}</span>
                    <span className="ml-3 text-sm font-semibold text-gray-600">
                      {new Date(score.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-2xl font-black">{score.score}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              fetchLeaderboard();
              if (playerName) fetchPlayerStats();
            }}
            className="w-full bg-black text-white font-black py-3 px-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            🔄 Refresh Leaderboard
          </button>
        </div>

        {/* Global Leaderboard List */}
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <PlayerCard
              key={index}
              rank={index + 1}
              name={entry.playerName}
              score={entry.score}
              date={entry.date}
              isCurrentPlayer={entry.playerName === playerName}
            />
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-12 text-center">
            <p className="text-2xl font-black text-gray-400 mb-2">No players yet!</p>
            <p className="text-gray-600 font-semibold">Be the first to join the leaderboard.</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-black font-semibold text-sm">
            💡 Complete games to earn points and climb the leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
}
