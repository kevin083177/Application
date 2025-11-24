import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Timer } from '../components/Timer';
import './styles/Game.css';
import { useNavigate } from 'react-router-dom';

const startPosition = { left: '3%', top: '2%' };
const endPosition = { left: '105%', top: '70%' };
const RESET_ENTRY_POS = { left: '-9%', top: '-6%' };

const TROLLEY_URL = "https://neal.fun/absurd-trolley-problems/trolley.svg";
const TRACK_URL = "https://neal.fun/absurd-trolley-problems/track.svg";
const PERSON_URL = "https://neal.fun/absurd-trolley-problems/you.svg";
const PERSON_PUll_URL = "https://neal.fun/absurd-trolley-problems/you-pull.svg";
const SPLAT_URL = "https://neal.fun/absurd-trolley-problems/splat.svg"; 

export default function Game() {
  const { currentScenario, isHost, endVoting, fetchNextScenario, voteResult } = useGame();
  const navigate = useNavigate();
  
  const [route, setRoute] = useState<'up' | 'down' | null>(null);
  const [resetPhase, setResetPhase] = useState<'idle' | 'prepare' | 'moving'>('idle');
  const [splattedOptionId, setSplattedOptionId] = useState<string | null>(null);
  
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isUp = route === 'up';
  const isDown = route === 'down';
  const isResetPrepare = resetPhase === 'prepare';
  const isResetMoving = resetPhase === 'moving';

  useEffect(() => {
    if (currentScenario) {
      setSplattedOptionId(null);
      setRoute(null);
      setResetPhase('idle');
      setIsTransitioning(false);
    }
  }, [currentScenario]);

  useEffect(() => {
    if (voteResult && currentScenario) {
      const winningIndex = currentScenario.options.findIndex(opt => opt.optionId === voteResult.winningOptionId);
      const direction = winningIndex === 0 ? 'up' : 'down';
      
      setRoute(direction);

      const splatTimer = setTimeout(() => {
        setSplattedOptionId(voteResult.winningOptionId);
      }, 2200);

      const animationTimer = setTimeout(() => {
         handleAnimationComplete();
      }, 4000);

      if (!voteResult.nextScenarioId) {
        setTimeout(() => {
          navigate('/gameover');
        }, 5000);
      }

      return () => {
        clearTimeout(animationTimer);
        clearTimeout(splatTimer);
      };
    }
  }, [voteResult, currentScenario, navigate]);

  const handleAnimationComplete = () => {
    if (isHost && voteResult?.nextScenarioId) {
      setIsTransitioning(true);

      setTimeout(() => {
        fetchNextScenario(voteResult.nextScenarioId!);
        setRoute(null);
        setResetPhase('prepare');

        setTimeout(() => {
          setResetPhase('moving');

          setTimeout(() => {
              setResetPhase('idle');
          }, 2200);

        }, 800); 
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
         <div className="scene-frame">
            <div 
              className="track-background"
              style={{
                backgroundImage: `url(${TRACK_URL})`,
              }} 
            />

            {currentScenario.options.map((option, index) => {
                const posStyle = index === 0 
                    ? { top: '23%', left: '80%' } 
                    : { top: '63%', left: '75%' };
                
                const isSplatted = splattedOptionId === option.optionId;

                return (
                    <div 
                        key={option.optionId}
                        className="scenario-asset"
                        style={posStyle}
                    >
                        <img 
                            src={isSplatted ? SPLAT_URL : (option.sceneAssetUrl || PERSON_URL)}
                            className={`scenario-asset-img ${isSplatted ? 'pop' : ''}`}
                        />
                    </div>
                );
            })}

            <img 
                src={isUp ? PERSON_PUll_URL : PERSON_URL} 
                alt="Person at lever"
                className="lever-person"
            />

            <div 
              className={`trolley-wrapper ${isUp ? 'trolley-animate-up' : ''}`}
              style={{
                top: isResetPrepare ? RESET_ENTRY_POS.top : (isDown ? endPosition.top : startPosition.top),
                left: isResetPrepare ? RESET_ENTRY_POS.left : (isDown ? endPosition.left : startPosition.left),
                
                transform: isDown ? 'scale(1.2)' : (isUp ? undefined : 'scale(1)'),
                  
                transition: isResetMoving 
                    ? 'top 2.2s cubic-bezier(0.22, 1, 0.36, 1), left 2.2s cubic-bezier(0.22, 1, 0.36, 1)' 
                    : ((isDown && resetPhase === 'idle') 
                        ? 'top 4s linear, left 4s linear, transform 3s linear' 
                        : 'none')
            }}>
              <img 
                src={TROLLEY_URL} 
                alt="Trolley" 
                className="trolley-img"
              />
            </div>
         </div>
      </div>

      <div className="scenario-description">
        {currentScenario.description}
      </div>

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
        <div className="options-container result-mode">
           <div className="vote-result-text">
               {voteResult.consequence} 
           </div>
        </div>
      )}

      <div className={`transition-overlay ${isTransitioning ? 'active' : ''}`} />
    </div>
  );
};