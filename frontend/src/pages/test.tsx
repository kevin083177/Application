import React, { useState } from 'react';

const startPosition = { left: '3%', top: '2%' };
const endPosition = { left: '105%', top: '70%' };

const RESET_ENTRY_POS = { left: '-9%', top: '-6%' };

const TrolleyMoveDemo = () => {
  const [route, setRoute] = useState<'up' | 'down' | null>(null);
  
  const [resetPhase, setResetPhase] = useState<'idle' | 'prepare' | 'moving'>('idle');

  const TROLLEY_URL = "https://neal.fun/absurd-trolley-problems/trolley.svg";
  const TRACK_URL = "https://neal.fun/absurd-trolley-problems/track.svg";
  const PERSON_URL = "https://neal.fun/absurd-trolley-problems/you.svg";
  const PERSON_PUll_URL = "https://neal.fun/absurd-trolley-problems/you-pull.svg";

  const handleReset = () => {
    setRoute(null);
    
    setResetPhase('prepare');

    setTimeout(() => {
        setResetPhase('moving');
    }, 50);

    setTimeout(() => {
        setResetPhase('idle');
    }, 2200);
  };

  const isUp = route === 'up';
  const isDown = route === 'down';

  const isResetPrepare = resetPhase === 'prepare';
  const isResetMoving = resetPhase === 'moving';

  return (
    <div style={styles.container}>
      <style>{`
        .trolley-option2 {
            animation: up_route 4s linear forwards;
        }

        @keyframes up_route {
          19% {
              transform: translateX(124%) translateY(56%) scale(1) rotate(0);
          }
          25% {
              transform: translateX(158%) translateY(52%) scale(1) rotate(-15deg);
          }
          31% {
              transform: translateX(192%) translateY(40%) scale(1) rotate(-32deg);
          }
          36% {
              transform: translateX(218%) translateY(20%) scale(1) rotate(-49deg);
          }
          39% {
              transform: translateX(237%) translateY(10%) scale(1.02) rotate(-38deg);
          }
          48% {
              transform: translateX(298%) translateY(0%) scale(1.05) rotate(-15deg);
          }
          67% {
              transform: translateX(400%) translateY(22%) scale(1.05) rotate(-5deg);
              opacity: 1;
          }
          to { 
              transform: translateX(600%) translateY(52%) scale(1.05) rotate(-5deg);
          }
        }

        @keyframes rumble {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
            100% { transform: translateY(0px); }
        }
      `}</style>

      <div style={styles.uiLayer}>
        <button 
          onClick={() => !route && setRoute('up')}
          style={{...styles.button, opacity: route ? 0.5 : 1, cursor: route ? 'not-allowed' : 'pointer'}}
          disabled={!!route}
        >
          上路
        </button>
        
        <button 
          onClick={() => !route && setRoute('down')}
          style={{...styles.button, opacity: route ? 0.5 : 1, cursor: route ? 'not-allowed' : 'pointer'}}
          disabled={!!route}
        >
          下路
        </button>

        <button 
          onClick={handleReset}
          style={{...styles.button, backgroundColor: '#ff6b6b', boxShadow: '0 4px 0 #c92a2a'}}
        >
          重置
        </button>
      </div>

      <div style={styles.sceneFrame}>
        
        <div style={{
          ...styles.trackBackground,
          backgroundImage: `url(${TRACK_URL})`,
        }} />

        <img 
            src={isUp ? PERSON_PUll_URL : PERSON_URL} 
            alt="Person at lever"
            style={styles.person}
        />

        <div 
          className={isUp ? 'trolley-option2' : ''}
          style={{
            ...styles.trolley,
            
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
            style={styles.trolleyImg} 
          />
        </div>

      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100vw',
    height: '100vh',
    background: '#333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uiLayer: {
    position: 'absolute',
    top: '20px',
    zIndex: 100,
    display: 'flex',
    gap: '10px'
  },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    background: '#FFD700',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 0 #b8860b',
    transition: 'all 0.2s'
  },
  sceneFrame: {
    width: '80vw',
    aspectRatio: '2 / 1',
    maxWidth: '1200px',
    position: 'relative',
    background: 'white',
    overflow: 'hidden',
    border: '5px solid #000',
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

export default TrolleyMoveDemo;