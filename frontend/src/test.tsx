import React, { useState } from 'react';

const TrolleyMoveDemo = () => {
  const [started, setStarted] = useState(false);

  // 圖片資源
  const TROLLEY_URL = "https://neal.fun/absurd-trolley-problems/trolley.svg";
  const TRACK_URL = "https://neal.fun/absurd-trolley-problems/track.svg";

  // 定義基於百分比的起點和終點
  const startPosition = { left: '3%', top: '2%' };
  const endPosition = { left: '105%', top: '70%' };

  return (
    <div style={styles.container}>
      
      {/* --- UI 按鈕 --- */}
      <div style={styles.uiLayer}>
        <button 
          onClick={() => setStarted(!started)}
          style={styles.button}
        >
          {started ? '🔄 重置' : '🚃 發車'}
        </button>
      </div>

      {/* --- 遊戲場景 (使用 vw 和 aspect-ratio 實現響應式) --- */}
      <div style={styles.sceneFrame}>
        
        {/* 1. 靜態背景：鐵軌 */}
        <div style={{
          ...styles.trackBackground,
          backgroundImage: `url(${TRACK_URL})`,
        }} />

        {/* 2. 動態物件：電車 */}
        <div style={{
          ...styles.trolley,
          // ✅ 步驟 2: 根據狀態切換 top 和 left，而不是 transform
          top: started ? endPosition.top : startPosition.top,
          left: started ? endPosition.left : startPosition.left,
          
          // transform 現在只用於縮放，模擬遠近感
          transform: started ? 'scale(1.2)' : 'scale(1)',
            
          // ✅ 步驟 3: 讓 top, left, transform 的變化都產生動畫
          transition: 'top 4s linear, left 4s linear, transform 3s linear' 
        }}>
          {/* 車體震動動畫 */}
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

// --- 樣式表 ---
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
  },
  button: {
    padding: '12px 24px',
    fontSize: '1.2rem',
    background: '#FFD700',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 0 #b8860b',
  },
  // ✅ 步驟 4: 讓場景框變成響應式
  sceneFrame: {
    width: '80vw', // 寬度為視窗的 80%
    aspectRatio: '2 / 1', // 強制維持 2:1 的寬高比
    maxWidth: '1200px', // 限制最大寬度，避免過度拉伸
    position: 'relative',
    background: 'white',
    overflow: 'hidden',
    border: '5px solid #000',
    borderRadius: '10px',
  },
  trackBackground: {
    width: '100%',
    height: '100%',
    backgroundSize: '100% 100%', // 確保背景圖完整顯示，不被裁切
    backgroundPosition: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  trolley: {
    position: 'absolute',
    width: '20%', 
    zIndex: 10,
    willChange: 'transform, top, left', // 效能優化
  },
  trolleyImg: {
    width: '100%',
    animation: 'rumble 0.2s infinite linear',
  }
};

// 注入震動動畫 keyframes (保持不變)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes rumble {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-2px); }
    100% { transform: translateY(0px); }
  }
`;
document.head.appendChild(styleSheet);

export default TrolleyMoveDemo;