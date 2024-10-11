import React from 'react';
import SingleChoiceDrag from './SingleChoiceDrag';
import PuzzleDrag from './PuzzleDrag';
import MultiChoiceDrag from './MultiChoiceDrag';

function DragGame({ scene }) {
  const renderGame = () => {
    switch (scene.type) {
      case 'singleChoice':
        return <SingleChoiceDrag title={scene.title} />;
      case 'puzzle':
        return <PuzzleDrag title={scene.title} />;
      case 'multiChoice':
        return <MultiChoiceDrag title={scene.title} />;
      default:
        return <div>未知游戏类型</div>;
    }
  };

  return (
    <div className="drag-game">
      <h2>{scene.title}</h2>
      {renderGame()}
    </div>
  );
}

export default DragGame;
