import { useGameStore } from '../store/gameStore';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function Menu() {
  const playerName = useGameStore((state) => state.playerName);
  const globalScore = useGameStore((state) => state.globalScore);
  const fetchGlobalScores = useGameStore((state) => state.fetchGlobalScores);

  // Fetch global scores when component mounts
  useEffect(() => {
    fetchGlobalScores();
  }, [fetchGlobalScores]);

  const games = [
    {
      id: 1,
      type: "AI GAME",
      title: "20Q — The AI Guesser",
      subtitle: "Think of an object. Can the AI guess it in 10 questions?",
      typeColor: "text-red-600",
      path: "/game/20q",
      available: true
    },
    {
      id: 2,
      type: "AI GAME",
      title: "Two Truths & a Hallucination",
      subtitle: 'The AI gives 3 "facts." Can you spot the one it made up?',
      typeColor: "text-blue-600",
      path: "/game/truths",
      available: true
    },
    {
      id: 3,
      type: "AI GAME",
      title: "The Literal Genie",
      subtitle: "Make a wish. Can you phrase it so the AI can't twist it?",
      typeColor: "text-purple-600",
      path: "/game/genie",
      available: true
    },
    {
      id: 4,
      type: "AI GAME",
      title: "The Common Link",
      subtitle: "Find the true logical link between 3 items. Avoid the AI's trap!",
      typeColor: "text-green-600",
      path: "/game/commonlink",
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-yellow-400 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Title and Player Info */}
        <div className="bg-gray-200 border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] p-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-black text-black">
              BEAT THE AI
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-600">Player:</div>
                <div className="text-lg font-bold text-blue-600">{playerName}</div>
              </div>
              <div className="w-12 h-12 bg-yellow-400 border-2 border-black rounded-lg flex items-center justify-center shadow-[4px_4px_0px_#000]">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Dashboard - Removed */}

        {/* Scoreboard Section */}
        <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6 mb-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-green-600 mb-2">{globalScore.humans}</div>
              <div className="text-sm md:text-base font-bold text-black">HUMAN WINS</div>
            </div>
            <div className="text-4xl md:text-5xl font-black text-black">VS</div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-red-600 mb-2">{globalScore.ai}</div>
              <div className="text-sm md:text-base font-bold text-black">AI WINS</div>
            </div>
          </div>
        </div>

        {/* Game Cards */}
        <div className="space-y-4">
          {games.map((game) => {
            if (game.available) {
              return (
                <Link
                  key={game.id}
                  to={game.path}
                  className="block bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] p-5 hover:shadow-[12px_12px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`text-xs md:text-sm font-bold mb-2 ${game.typeColor}`}>
                        {game.type}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black mb-2 text-black">{game.title}</h3>
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed">{game.subtitle}</p>
                    </div>
                  </div>
                </Link>
              );
            }
            
            return (
              <div
                key={game.id}
                className="block bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] p-5 opacity-60 cursor-not-allowed"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`text-xs md:text-sm font-bold mb-2 ${game.typeColor}`}>
                      {game.type}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black mb-2 text-black">{game.title}</h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">{game.subtitle}</p>
                  </div>
                  <span className="ml-4 px-3 py-1 bg-gray-300 border-2 border-black text-xs font-bold">
                    COMING SOON
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
