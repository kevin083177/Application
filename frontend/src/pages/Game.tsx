import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Timer } from '../components/Timer';
import { TrolleyScene } from '../components/TrolleyScene';
import './styles/Game.css';

export default function Game() {
  const { currentScenario, voteResult, isHost, endVoting, fetchNextScenario } = useGame();
  
  const [isMoving, setIsMoving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (voteResult) {
      setIsMoving(true);
    }
  }, [voteResult]);

  const handleAnimationComplete = () => {
    if (isHost) {
      setIsTransitioning(true);
      setTimeout(() => {
        if (voteResult?.nextScenarioId) {
          fetchNextScenario(voteResult.nextScenarioId);
          setTimeout(() => {
            setIsMoving(false);
            setIsTransitioning(false);
          }, 500);
        } else {
          alert("遊戲結束！");
        }
      }, 1000); 
    }
  };

  const handleTimeUp = () => {
    if (isHost && !voteResult) {
      endVoting();
    }
  };

  if (!currentScenario) {
    return <div className="game-page">Loading Scenario...</div>;
  }

  return (
    <div className="game-page">
      {!voteResult && (
        <div className="timer-absolute">
          <Timer duration={currentScenario.duration} onTimeUp={handleTimeUp} />
        </div>
      )}

      <h1 className="game-title">{currentScenario.title}</h1>

      <div className="scene-container">
        <TrolleyScene 
          start={isMoving} 
          onFinish={handleAnimationComplete} 
        />
      </div>

      {/* 描述文字 */}
      <div className="scenario-description">
        {currentScenario.description}
      </div>

      {/* 選項 */}
      {!voteResult ? (
        <div className="options-container">
          {currentScenario.options.map((option) => (
             <button 
                key={option.optionId} 
                className="option-button"
                disabled={true}
             >
                 {option.text}
             </button>
          ))}
        </div>
      ) : (
        <div className="options-container" style={{justifyContent: 'center', color: '#666', fontWeight: 'bold'}}>
           <div style={{fontSize: '1.5rem'}}>
               決策結果：選項 {voteResult.winningOptionId} 勝出
           </div>
        </div>
      )}

      {/* 過場黑幕 */}
      <div className={`transition-overlay ${isTransitioning ? 'active' : ''}`} />
    </div>
  );
};