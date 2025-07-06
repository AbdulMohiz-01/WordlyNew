import { GameProvider } from './context/GameContext';
import Game from './components/Game';
import AdminDashboard from './components/AdminDashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/BorderPulse.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <GameProvider>
              <Game />
            </GameProvider>
          } 
        />
        <Route 
          path="/admin/:password" 
          element={<AdminDashboard />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
