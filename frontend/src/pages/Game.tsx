import { useGame } from '../contexts/GameContext';
import './styles/Game.css';

export default function Game() {
    const { room } = useGame();

    return (
        <div className="game-container">
            <div className="game-title">遊戲進行中</div>
            <div className="scenario-box">
                Room Code: {room?.code}
            </div>
        </div>
    );
}