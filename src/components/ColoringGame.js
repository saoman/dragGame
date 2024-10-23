import React, { useState, useEffect } from 'react';

const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']; // 红、绿、蓝、黄

const ColoringGame = () => {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [svgColors, setSvgColors] = useState({
    circle: 'gray',
    square: 'gray',
    triangle: 'gray',
  });
  const [isGameComplete, setIsGameComplete] = useState(false);

  useEffect(() => {
    if (Object.values(svgColors).every(color => color !== 'white')) {
      setIsGameComplete(true);
    }
  }, [svgColors]);

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleSvgClick = (svgName) => {
    setSvgColors(prevColors => ({
      ...prevColors,
      [svgName]: selectedColor
    }));
  };

  return (
    <div>
      <h2>涂色游戏</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {colors.map(color => (
          <button
            key={color}
            style={{
              backgroundColor: color,
              width: '30px',
              height: '30px',
              margin: '5px',
              border: selectedColor === color ? '2px solid black' : 'none'
            }}
            onClick={() => handleColorClick(color)}
          />
        ))}
      </div>
      <svg width="300" height="300">
        <circle cx="50" cy="50" r="40" fill={svgColors.circle} onClick={() => handleSvgClick('circle')} />
        <rect x="110" y="10" width="80" height="80" fill={svgColors.square} onClick={() => handleSvgClick('square')} />
        <polygon points="200,10 250,90 150,90" fill={svgColors.triangle} onClick={() => handleSvgClick('triangle')} />
      </svg>
      {isGameComplete && <p>恭喜你完成了涂色游戏！</p>}
    </div>
  );
};

export default ColoringGame;
