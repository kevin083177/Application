import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
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

  // 過濾出除了房主以外的玩家
  const otherPlayers = room.players.filter(pid => pid !== room.hostId);

  return (
    <div className="lobby-container">
      <button className="leave-btn" onClick={leaveRoom}>
        離開
      </button>

      <div className="lobby-header">
        <span className="room-code-label">Room Code</span>
        <div className="room-code-display">{room.code}</div>
      </div>

      <div className="players-grid">
        {/* 顯示玩家 */}
        {otherPlayers.map((pid, index) => (
            <div key={pid} className="player-card">
                <div className="player-avatar">👤</div>
                <div className="player-info">
                    <span className="player-name">Player {index + 1}</span>
                    <span className="player-id">{pid.slice(0, 4)}</span>
                </div>
            </div>
        ))}
      </div>

      {otherPlayers.length === 0 && (
        <div className="waiting-state">
            等待其他玩家加入...
        </div>
      )}

      {/* 底部開始按鈕區 */}
      <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
          {isHost && (
              <button 
                  className="start-btn"
                  onClick={startGame}
                  disabled={otherPlayers.length === 0}
              >
                  開始遊戲
              </button>
          )}
      </div>
    </div>
  );
};