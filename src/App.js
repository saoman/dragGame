import React, { useState } from 'react';
import './App.css';
import DragGame from './components/DragGame.js';

function App() {
  const [currentScene, setCurrentScene] = useState(1);

  const scenes = [
    { id: 1, type: 'singleChoice', title: '选择正确的鞋子' },
    { id: 2, type: 'singleChoice', title: '根据题目选择正确答案' },
    { id: 3, type: 'puzzle', title: '完成拼图' },
    { id: 4, type: 'multiChoice', title: '选择对应的摆放物品' },
  ];

  return (
    <div className="App">
      <h1>拖动游戏</h1>
      <DragGame scene={scenes[currentScene - 1]} />
      <div>
        {scenes.map(scene => (
          <button key={scene.id} onClick={() => setCurrentScene(scene.id)}>
            场景 {scene.id}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
