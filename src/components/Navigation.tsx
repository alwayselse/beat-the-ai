import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function Navigation() {
  const location = useLocation();
  const playerName = useGameStore((state) => state.playerName);

  // Don't show navigation on the enter name page
  if (location.pathname === '/' || !playerName) {
    return null;
  }

  const navLinks = [
    { path: '/menu', label: '🎮 Games', icon: '🎮' },
    { path: '/leaderboard', label: '⚔️ Battle Stats', icon: '⚔️' },
    { path: '/about', label: 'ℹ️ About', icon: 'ℹ️' },
  ];

  return (
    <nav className="bg-black border-b-4 border-black sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between py-2 sm:py-3">
          {/* Logo/Brand */}
          <Link 
            to="/menu" 
            className="text-lg sm:text-xl md:text-2xl font-black text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            BEAT AI
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-1 sm:gap-2 md:gap-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    px-2 sm:px-3 md:px-6 py-2 rounded-lg font-black text-xs sm:text-sm md:text-base
                    border-2 border-white transition-all
                    ${isActive 
                      ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_#fff] sm:shadow-[4px_4px_0px_#fff]' 
                      : 'bg-black text-white hover:bg-gray-800 hover:shadow-[2px_2px_0px_#fff]'
                    }
                  `}
                >
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden text-base">{link.icon}</span>
                </Link>
              );
            })}
          </div>

          {/* Player Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-yellow-400 border-2 border-white rounded-lg px-3 py-2 shadow-[4px_4px_0px_#fff]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-black text-black text-sm">{playerName}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
