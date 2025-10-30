import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import PlayerCard from '../components/PlayerCard';

export default function Leaderboard() {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const playerName = useGameStore((state) => state.playerName);
  const refreshScores = useGameStore((state) => state.refreshScores);
  const addToLeaderboard = useGameStore((state) => state.addToLeaderboard);
  const globalScore = useGameStore((state) => state.globalScore);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const totalPlayers = leaderboard.length;
  const averageScore = leaderboard.length > 0 
    ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length)
    : 0;
  const topScore = leaderboard.length > 0 ? leaderboard[0].score : 0;

  const currentPlayerScore = globalScore.humans * 100 - globalScore.ai * 50;
  const playerRank = leaderboard.findIndex(entry => entry.name === playerName) + 1;

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      const randomScore = Math.floor(Math.random() * 2000) + 500;
      addToLeaderboard({
        name: newPlayerName.trim(),
        score: randomScore,
        date: new Date().toISOString(),
      });
      setNewPlayerName('');
      setShowAddForm(false);
    }
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
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-bold mb-1">YOUR STATS</p>
                <p className="text-2xl font-black">{playerName}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">{currentPlayerScore.toLocaleString()}</p>
                <p className="text-sm font-bold">Current Points</p>
                {playerRank > 0 && (
                  <p className="text-xs font-semibold mt-1">Rank: #{playerRank}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={refreshScores}
            className="flex-1 bg-black text-white font-black py-3 px-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            🔄 Refresh Scores
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 bg-green-500 text-white font-black py-3 px-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            ➕ Add Player
          </button>
        </div>

        {/* Add Player Form */}
        {showAddForm && (
          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6 mb-6">
            <h3 className="text-xl font-black mb-4">Add New Player</h3>
            <form onSubmit={handleAddPlayer} className="flex gap-3">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Player name..."
                className="flex-1 px-4 py-3 border-2 border-black rounded-lg font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-300"
              />
              <button
                type="submit"
                className="bg-green-500 text-white font-black py-3 px-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all"
              >
                Add
              </button>
            </form>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <PlayerCard
              key={index}
              rank={index + 1}
              name={entry.name}
              score={entry.score}
              date={entry.date}
              isCurrentPlayer={entry.name === playerName}
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
