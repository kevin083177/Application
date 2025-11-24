import { useEffect, useState, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { Timer } from '../components/Timer';
import './styles/Game.css';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const startPosition = { left: '3%', top: '2%' };
const endPosition = { left: '105%', top: '70%' };
const RESET_ENTRY_POS = { left: '-9%', top: '-6%' };

const TROLLEY_URL = "https://neal.fun/absurd-trolley-problems/trolley.svg";
const TRACK_URL = "https://neal.fun/absurd-trolley-problems/track.svg";
const PERSON_URL = "https://neal.fun/absurd-trolley-problems/you.svg";
const PERSON_PUll_URL = "https://neal.fun/absurd-trolley-problems/you-pull.svg";

export default function Game() {
  const { currentScenario, isHost, endVoting, fetchNextScenario, voteResult } = useGame();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  
  const [route, setRoute] = useState<'up' | 'down' | null>(null);
  const [resetPhase, setResetPhase] = useState<'idle' | 'prepare' | 'moving'>('idle');
  
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isUp = route === 'up';
  const isDown = route === 'down';
  const isResetPrepare = resetPhase === 'prepare';
  const isResetMoving = resetPhase === 'moving';

  useEffect(() => {
    if (voteResult && currentScenario) {
      const winningIndex = currentScenario.options.findIndex(opt => opt.optionId === voteResult.winningOptionId);
      const direction = winningIndex === 0 ? 'up' : 'down';
      
      setRoute(direction);

      const animationTimer = setTimeout(() => {
         handleAnimationComplete();
      }, 4000);

      if (!voteResult.nextScenarioId) {
        setTimeout(() => {
          navigate('/gameover');
        }, 5000);
      }

      return () => clearTimeout(animationTimer);
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
          setIsTransitioning(false);
          
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
      <style>{`
        .trolley-animate-up {
            animation: up_route 4s linear forwards;
        }

        @keyframes up_route {
          19% { transform: translateX(124%) translateY(56%) scale(1) rotate(0); }
          25% { transform: translateX(158%) translateY(52%) scale(1) rotate(-15deg); }
          31% { transform: translateX(192%) translateY(40%) scale(1) rotate(-32deg); }
          36% { transform: translateX(218%) translateY(20%) scale(1) rotate(-49deg); }
          39% { transform: translateX(237%) translateY(10%) scale(1.02) rotate(-38deg); }
          48% { transform: translateX(298%) translateY(0%) scale(1.05) rotate(-15deg); }
          67% { transform: translateX(400%) translateY(22%) scale(1.05) rotate(-5deg); opacity: 1; }
          to { transform: translateX(600%) translateY(52%) scale(1.05) rotate(-5deg); }
        }

        @keyframes rumble {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
            100% { transform: translateY(0px); }
        }
      `}</style>

      {!voteResult && (
        <div className="timer-absolute">
          <Timer duration={currentScenario.duration} onTimeUp={handleTimeUp} />
        </div>
      )}

      <h1 className="game-title">{currentScenario.title}</h1>

      <div className="scene-container">
         <div style={inlineStyles.sceneFrame}>
            <div style={{
              ...inlineStyles.trackBackground,
              backgroundImage: `url(${TRACK_URL})`,
            }} />

            <img 
                src={isUp ? PERSON_PUll_URL : PERSON_URL} 
                alt="Person at lever"
                style={inlineStyles.person}
            />

            <div 
              className={isUp ? 'trolley-animate-up' : ''}
              style={{
                ...inlineStyles.trolley,
                
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
                style={inlineStyles.trolleyImg} 
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
        <div className="options-container" style={{justifyContent: 'center', color: '#666', fontWeight: 'bold'}}>
           <div style={{fontSize: '1.5rem'}}>
               結果： {voteResult.consequence} 
           </div>
        </div>
      )}

      <div className={`transition-overlay ${isTransitioning ? 'active' : ''}`} />
    </div>
  );
};

const inlineStyles: { [key: string]: React.CSSProperties } = {
  sceneFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
    background: 'white',
    overflow: 'hidden',
    borderRadius: '10px',
  },
  trackBackground: {
    width: '100%',
    height: '100%',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  person: {
    position: 'absolute',
    bottom: '5%',
    left: '15%',
    width: '15%',
    zIndex: 2,
    transition: 'opacity 0.2s ease',
  },
  trolley: {
    position: 'absolute',
    width: '20%', 
    zIndex: 10,
    transformOrigin: 'bottom center',
  },
  trolleyImg: {
    width: '100%',
    animation: 'rumble 0.2s infinite linear',
  }
};