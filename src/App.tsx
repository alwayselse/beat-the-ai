import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import Navigation from './components/Navigation';
import EnterName from './pages/EnterName';
import Menu from './pages/Menu';
import Leaderboard from './pages/Leaderboard';
import About from './pages/About';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
