import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { GameProvider } from './contexts/GameContext';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import GameOver from './pages/Gameover';
import TrolleyMoveDemo from './pages/test';
import './App.css';
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <SocketProvider>
          <GameProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lobby/:roomCode" element={<Lobby />} />
              <Route path="/game/:roomCode" element={<Game />} />
              <Route path='/gameover' element={<GameOver />} />
              <Route path="/test" element={<TrolleyMoveDemo />} />
            </Routes>
          </GameProvider>
        </SocketProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}