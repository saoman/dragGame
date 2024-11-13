import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import GameCenter from './pages/GameCenter.js';

function App() {
  useEffect(() => {
    // 禁用长按弹出菜单
    document.addEventListener('touchstart', e => e.preventDefault(), { passive: false });

    // 检测是否为 iOS 设备
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // 创建全局音频元素
      const globalAudio = document.createElement('audio');
      globalAudio.id = 'globalAudio';
      globalAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV';
      document.body.appendChild(globalAudio);

      // 添加一次性点击事件监听器
      const handleClick = () => {
        if (globalAudio) {
          console.log('Global audio play');
          globalAudio.muted = true;
          globalAudio.currentTime = 0;
          globalAudio.play().catch(err => {
            console.log('Global audio play failed:', err);
          });
        }
      };

      document.addEventListener('touchstart', handleClick, { once: true });

      // 清理函数
      return () => {
        document.body.removeChild(globalAudio);
      };
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <GameCenter />
      </Router>
    </div>
  );
}

export default App;
