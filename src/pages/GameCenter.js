import React, { useState, useEffect, useRef, history } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import DragGame from '../components/DragGame';
import LineGame from "../components/LineGame"
import ChoiceGame from '../components/ChoiceGame';
import ClickToSelectGame from '../components/ClickToSelectGame';
import ColorGame from '../components/ColorGame';
import { prefetchConfigResources } from '../utils';
import { getGameList } from '../services/GameCenter';
import { GAME_TYPES } from '../constants/gameTypes';
import backBtn from '../images/back.png';
import VConsole from 'vconsole';
const vConsole = new VConsole();
const GameCenter = () => {
  const [allGameList, setAllGameList] = useState([]); // 所有游戏列表
  const [configIndex, setConfigIndex] = useState(0); // 当前配置索引
  const [config, setConfig] = useState(null); // 当前配置
  const [loading, setLoading] = useState(true);
  const gameCenterRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // 获取 URL 参数中的 pageid，默认为 '5'
        const searchParams = new URLSearchParams(location.search);
        const pageid = searchParams.get('pageid') || null; // || '201';
        const resourceid = searchParams.get('resourceid')  || '1';

        // 根据当前路径选择不同的 API 端点
        const pathname = location.pathname;
        let url = '/miniapp/wx/cartoon/game';

        switch (pathname) {
          case '/draggame':
            url = '/miniapp/wx/cartoon/game';
            break;
          case '/linegame':
            url = '/miniapp/wx/cartoon/game';
            break;
          case '/chiocegame':
            url = '/miniapp/wx/cartoon/game';
            break;
          default:
            // 保持默认值
            break;
        }

        // 获取游戏列表
        const gameList = await getGameList({
          resourceid,
          pageid
        });
        console.log('gameList===>', gameList);
        if (!gameList) {
          return;
        }
        setAllGameList(gameList);
        // 发送 GET 请求获取配置
        // const response = await get(url, { pageid });
        const response = gameList[configIndex];
        // const response = data;
        console.log('response', response);
        setConfig(response);

        // 预加载资源
        if (gameList.length > 0) {
          prefetchConfigResources(gameList.flat());
        }
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

  // 切换游戏
  const switchGame = (index) => {
    console.log('switchGame当前题号===>', index, ' allGameList.length===>', allGameList.length);
    if (index < 0 || index >= allGameList.length) {
      return;
    }
    setTimeout(() => {
      setConfigIndex(index);
      setConfig(allGameList[index]);
      console.log('switchGame===>跳转');
    }, 1000); // 延迟切换，避免切换动画卡顿
  }

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

  // 渲染组件
  const GameComponent = () => {
    switch (config.gametype) {
      case GAME_TYPES.SINGLECHOICE:
        return <ClickToSelectGame key={config.pagenum} config={config} configIndex={configIndex} switchGame={switchGame} />;    
      case GAME_TYPES.MULTIPLECHOICE:
        return <ChoiceGame key={config.pagenum} config={config} configIndex={configIndex} switchGame={switchGame} />;
      case GAME_TYPES.DRAG:
        return <DragGame key={config.pagenum} config={config} configIndex={configIndex} switchGame={switchGame} />;
      case GAME_TYPES.LINE:
        return <LineGame key={config.pagenum} config={config} configIndex={configIndex} switchGame={switchGame} />;
      case GAME_TYPES.COLOURING:
        return <ColorGame key={config.pagenum} config={config} configIndex={configIndex} switchGame={switchGame} />;
      default:
        return <div>暂不支持该游戏类型</div>;
    }
  };

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
          <>
            {/* 返回按钮 */}
            <img 
              src={backBtn} 
              alt="返回按钮" 
              style={{position: 'absolute', top: '10px', left: '19px', zIndex: 9999}}
              onTouchEnd={() => {
                history.back();
              }}
            />
            <Routes>
              <Route path="/" element={GameComponent()} />
              {/* <Route path="/" element={<LineGame config={config} />} />
              <Route path="/draggame" element={<DragGame config={config} />} />
              <Route path="/linegame" element={<LineGame config={config} />} />
              <Route path="/choicegame" element={<ChoiceGame config={config} />} />
              <Route path="/clicktoselectgame" element={<ClickToSelectGame config={config} />} />
              <Route path="/colorgame" element={<ColorGame config={config} />} /> */}
            </Routes>
          </>
        ) : (
          <div>加载中...</div> // 备用加载状态
        )}
      </div>
    </>
  );
};

export default GameCenter;
