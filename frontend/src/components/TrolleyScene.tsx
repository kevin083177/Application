import React, { useEffect } from 'react';

interface TrolleySceneProps {
  start: boolean;
  onFinish: () => void;
}

export const TrolleyScene = ({ start, onFinish }: TrolleySceneProps) => {
  const TROLLEY_URL = "https://neal.fun/absurd-trolley-problems/trolley.svg";
  const TRACK_URL = "https://neal.fun/absurd-trolley-problems/track.svg";

  // 調整起點與終點
  const startPosition = { left: '3%', top: '2%' };
  const endPosition = { left: '105%', top: '70%' };

  useEffect(() => {
    if (start) {
      const timer = setTimeout(() => {
        onFinish();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [start, onFinish]);

  return (
    <div style={styles.sceneWrapper}>
      {/* 背景 */}
      <div style={{
        ...styles.trackBackground,
        backgroundImage: `url(${TRACK_URL})`,
      }} />

      {/* 電車 */}
      <div style={{
        ...styles.trolley,
        top: start ? endPosition.top : startPosition.top,
        left: start ? endPosition.left : startPosition.left,
        
        // 恢復原始縮放比例，因為容器變小了，不需要額外放大
        transform: start ? 'scale(1.2)' : 'scale(1)',
        
        transition: 'top 4s linear, left 4s linear, transform 3s linear' 
      }}>
        <img 
          src={TROLLEY_URL} 
          alt="Trolley" 
          style={styles.trolleyImg} 
        />
      </div>
      
      <style>{`
        @keyframes rumble {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  sceneWrapper: {
    width: '100%', 
    height: '100%', 
    position: 'relative', // 改為 relative，讓它填滿父容器
    overflow: 'hidden',
    // 不需要背景色或邊框，這些由 Game.css 控制或保持透明
  },
  trackBackground: {
    width: '100%',
    height: '100%',
    backgroundSize: 'contain', // 使用 contain 確保圖片完整顯示，不被裁切
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  trolley: {
    position: 'absolute',
    width: '20%', 
    willChange: 'transform, top, left',
    zIndex: 2,
  },
  trolleyImg: {
    width: '100%',
    animation: 'rumble 0.2s infinite linear',
  }
};