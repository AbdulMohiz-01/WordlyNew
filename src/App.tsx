import { GameProvider } from './context/GameContext';
import AdminDashboard from './components/AdminDashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/BorderPulse.css';
import AppLayout from './components/AppLayout';
import RoomCreationPage from './components/RoomCreationPage';
import GameLobby from './components/GameLobby';
import MultiplayerPage from './components/MultiplayerPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />} />
        <Route 
          path="/create-room" 
          element={
            <GameProvider>
              <RoomCreationPage />
            </GameProvider>
          } 
        />
        <Route 
          path="/lobby/:roomCode" 
          element={
            <GameProvider>
              <GameLobby />
            </GameProvider>
          } 
        />
        <Route 
          path="/multiplayer/:roomId/play" 
          element={
            <GameProvider>
              <MultiplayerPage />
            </GameProvider>
          } 
        />
        <Route 
          path="/multiplayer" 
          element={<MultiplayerPage />} 
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
