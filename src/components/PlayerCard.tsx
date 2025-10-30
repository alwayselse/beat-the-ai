interface PlayerCardProps {
  rank: number;
  name: string;
  score: number;
  date: string;
  isCurrentPlayer?: boolean;
}

export default function PlayerCard({ rank, name, score, date, isCurrentPlayer }: PlayerCardProps) {
  const getRankDisplay = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getCardColor = () => {
    if (isCurrentPlayer) return 'bg-blue-100 border-blue-600 border-l-8';
    if (rank <= 3) return 'bg-yellow-50';
    return 'bg-white';
  };

  return (
    <div className={`${getCardColor()} border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] p-4 hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#000]">
            {rank <= 3 ? (
              <span className="text-3xl">{getRankDisplay()}</span>
            ) : (
              <span className="text-gray-600">{getRankDisplay()}</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-lg text-black truncate">
              {name}
              {isCurrentPlayer && (
                <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-md">YOU</span>
              )}
            </h3>
            <p className="text-sm text-gray-500 font-semibold">
              {new Date(date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black text-green-600">
            {score.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 font-bold">POINTS</div>
        </div>
      </div>
    </div>
  );
}
