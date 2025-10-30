import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import Navigation from './components/Navigation';
import EnterName from './pages/EnterName';
import Menu from './pages/Menu';
import Leaderboard from './pages/Leaderboard';
import About from './pages/About';
import TwoTruths from './pages/games/TwoTruths';
import CommonLink from './pages/games/CommonLink';
import TwentyQuestions from './pages/games/TwentyQuestions';
import LiteralGenie from './pages/games/LiteralGenie';

function App() {
  const playerName = useGameStore((state) => state.playerName);

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<EnterName />} />
        <Route 
          path="/menu" 
          element={playerName ? <Menu /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/leaderboard" 
          element={playerName ? <Leaderboard /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/about" 
          element={playerName ? <About /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/game/truths" 
          element={playerName ? <TwoTruths /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/game/commonlink" 
          element={playerName ? <CommonLink /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/game/20q" 
          element={playerName ? <TwentyQuestions /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/game/genie" 
          element={playerName ? <LiteralGenie /> : <Navigate to="/" replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
