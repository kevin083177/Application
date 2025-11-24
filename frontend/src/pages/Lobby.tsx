import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { BsFillDoorOpenFill } from "react-icons/bs";
import './styles/Lobby.css';

export default function Lobby() {
  const { room, leaveRoom, startGame, isHost } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!room) {
      navigate('/');
    }
  }, [room, navigate]);

  if (!room) return null;

  const players = room.players;

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

      <div className="players-grid">
        {/* 顯示玩家 */}
        {players.map((player) => (
            <div key={player.id} className="player-card">
                <div className="player-avatar">{player.avatar}</div>
                <div className="player-info">
                    <span className="player-name">{player.name}</span>
                    <span className="player-id">{player.id}</span>
                </div>
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