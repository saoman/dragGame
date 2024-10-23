import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './Home';
import DragGame from '../components/DragGame';
import LineGame from "../components/LineGame"
import { get } from '../utils/request';
import { prefetchConfigResources } from '../utils';

const GameCenter = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const gameCenterRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // 获取 URL 参数中的 pageid，默认为 '5'
        const searchParams = new URLSearchParams(location.search);
        const pageid = searchParams.get('pageid') || '200';

        // 根据当前路径选择不同的 API 端点
        const pathname = location.pathname;
        let url = '/miniapp/wx/cartoon/game';

        switch (pathname) {
          case '/draggame':
            url = '/miniapp/wx/cartoon/game';
            break;
          case '/line':
            url = '/miniapp/wx/cartoon/gamedemo';
            break;
          default:
            // 保持默认值
            break;
        }

        // 发送 GET 请求获取配置
        const response = await get(url, { pageid });
        console.log('response', response);
        setConfig(response);

        // 预加载资源
        setTimeout(() => {  
          prefetchConfigResources(response);
        }, 1000);
      } catch (error) {
        console.error('获取配置失败:', error);
      } finally {
        setTimeout(() => {  
          setLoading(false);
        }, 1000);
      }
    };

    fetchConfig();
  }, [location]);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    // 处理窗口大小变化，调整游戏容器的缩放比例
    const handleResize = () => {
      if (gameCenterRef.current && config && config.withs && config.highs) {
        const { clientHeight } = document.documentElement;
        const scaleY = clientHeight / config.highs;
        setScale(scaleY);
      }
    };

    if (config) {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [config]);

  // 加载动画的 JSX
  const loadingOverlay = loading ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 1)', // 可选：添加背景色
      zIndex: 9999, // 确保加载动画在最上层
    }}>
      <img src={require('../images/loading.gif')} alt="加载中..." style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain', // 填满屏幕
      }} />
    </div>
  ) : null;

  return (
    <>
      {loadingOverlay} {/* 显示加载动画 */}
      <div
        ref={gameCenterRef}
        style={{
          width: `${config?.withs}px`,
          height: `${config?.highs}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          position: 'absolute',
          top: '50%',
          left: '50%',
        }}
      >
        {config ? (
          <Routes>
            <Route path="/" element={<Home config={config} />} />
            <Route path="/draggame" element={<DragGame config={config} />} />
            <Route path="/linegame" element={<LineGame config={config} />} />
          </Routes>
        ) : (
          <div>加载中...</div> // 备用加载状态
        )}
      </div>
    </>
  );
};

export default GameCenter;
