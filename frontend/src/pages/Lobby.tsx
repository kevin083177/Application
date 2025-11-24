import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { BsFillDoorOpenFill, BsX } from "react-icons/bs";
import './styles/Lobby.css';
import { useSocket } from '../contexts/SocketContext';

export default function Lobby() {
  const { room, leaveRoom, startGame, isHost } = useGame();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!room) {
      navigate('/');
    }
  }, [room, navigate]);

  if (!room) return null;

  const players = room.players;

  const handleKickPlayer = (targetId: string) => {
    if (!socket) return;
    socket.emit('player:kick', { targetPlayerId: targetId });
  };

  return (
    <div className="lobby-container">
      <button className="leave-btn" onClick={leaveRoom}>
        <BsFillDoorOpenFill size={18} /> 
        離開
      </button>

      <div className="lobby-header">
        <span className="room-code-label">Room Code</span>
        <div className="room-code-display">{room.code}</div>
      </div>

      <div className="player-grid">
        {room.players.map((p) => (
          <div key={p.id} className="player-card">
            
            {socket && room.hostId === socket.id && p.id !== socket.id && (
              <button 
                className="kick-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleKickPlayer(p.id);
                }}
              >
                <BsX size={24} />
              </button>
            )}

            <div className="player-avatar">{p.avatar}</div>
            <div className="player-name">{p.name}</div>
            <span className="player-id">{p.id}</span>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="waiting-state">
            <div className="loading-spinner"></div>
            <span>等待其他玩家加入</span>
        </div>
      )}

      {/* 開始按鈕 */}
      <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
          {isHost && (
              <button 
                  className="start-btn"
                  onClick={startGame}
                  disabled={players.length === 0}
              >
                  開始遊戲
              </button>
          )}
      </div>
    </div>
  );
};