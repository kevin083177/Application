import { useGame } from '../contexts/GameContext';
import './styles/Gameover.css';

export default function GameOver() {
  const { isHost, restartGame, leaveRoom } = useGame();

  return (
    <div className="result-container">
      <h1>遊戲結束</h1>

      <div className="button-group">
        {isHost && (
          <>
            <button 
              className="game-btn btn-restart"
              onClick={restartGame}
            >
              重新開始
            </button>
            <button 
              className="game-btn btn-leave"
              onClick={leaveRoom}
            >
              解散房間
            </button>
          </>
        )}
      </div>
    </div>
  );
}