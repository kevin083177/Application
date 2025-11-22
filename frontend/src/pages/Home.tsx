import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import './styles/Home.css';

export default function Home() {
  const { isConnected } = useSocket();
  const { createRoom } = useGame();

  return (
    <div className="home-container">
      <h1 style={{ marginBottom: '60px', fontSize: '2.5rem', letterSpacing: '2px' }}>
        Trolley Problems
      </h1>

      <button 
        className="create-btn"
        onClick={createRoom} 
        disabled={!isConnected}
      >
        建立房間
      </button>

      <div className="status-badge">
        <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
        <span className="status-text">
          {isConnected ? '已連接至伺服器' : '未連接至伺服器'}
        </span>
      </div>
    </div>
  );
};