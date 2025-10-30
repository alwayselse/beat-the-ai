interface StatBoxProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'green' | 'red' | 'blue' | 'purple' | 'yellow';
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatBox({ title, value, icon, color = 'blue', trend }: StatBoxProps) {
  const colorClasses = {
    green: 'bg-green-500 border-green-700',
    red: 'bg-red-500 border-red-700',
    blue: 'bg-blue-500 border-blue-700',
    purple: 'bg-purple-500 border-purple-700',
    yellow: 'bg-yellow-500 border-yellow-700',
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    neutral: '➡️',
  };

  return (
    <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6 hover:shadow-[12px_12px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 ${colorClasses[color]} border-2 border-black rounded-lg flex items-center justify-center text-2xl shadow-[4px_4px_0px_#000]`}>
          {icon}
        </div>
        {trend && <span className="text-2xl">{trendIcons[trend]}</span>}
      </div>
      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-4xl font-black text-black">
        {value}
      </p>
    </div>
  );
}
