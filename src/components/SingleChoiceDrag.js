import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend, getEmptyImage } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import './SingleChoiceDrag.css';

// 检测是否为触摸设备
const isTouchDevice = 'ontouchstart' in window;

// 可拖动项组件
function DraggableItem({ item, type, isDropped }) {
  // 使用useDrag钩子设置拖动逻辑
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: type,
    item: { id: item.id, type: type, imageUrl: item.imageUrl },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // 使用空白图像作为拖动预览,以便自定义预览
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // 渲染可拖动项
  return (
    <div
      ref={drag}
      className={`draggable-item ${isDragging ? 'dragging' : ''} ${isDropped ? 'dropped' : ''}`}
    >
      <img src={item.imageUrl} alt={item.content} />
    </div>
  );
}

// 拖动预览组件
function DragPreview() {
  // 使用useDragLayer钩子获取拖动状态
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  // 计算拖动预览的样式
  const getItemStyles = useCallback((currentOffset) => {
    if (!currentOffset) {
      return { display: 'none' };
    }

    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    return {
      transform,
      WebkitTransform: transform,
    };
  }, []);

  // 渲染拖动预览
  if (!isDragging) {
    return null;
  }

  return (
    <div className="drag-layer">
      <div className="drag-preview" style={getItemStyles(currentOffset)}>
        <img src={item.imageUrl} alt="拖动预览" />
      </div>
    </div>
  );
}

// 放置目标组件
function DropTarget({ onDrop, children, droppedItem }) {
  // 使用useDrop钩子设置放置逻辑
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'item', // 指定接受的拖动类型
    drop: (item) => onDrop(item.id), // 处理放置事件
    collect: (monitor) => ({
      isOver: !!monitor.isOver(), // 检测是否有项目悬停在放置区域上
    }),
  }));

  // 渲染放置区域
  return (
    <div ref={drop} className={`drop-area ${isOver ? 'is-over' : ''}`}>
      {children}
      {droppedItem && (
        <div className="dropped-item">
          <img src={droppedItem.imageUrl} alt={droppedItem.content} />
        </div>
      )}
    </div>
  );
}

// 主组件
function SingleChoiceDrag({ title }) {
  // 设置状态
  const [items] = useState([
    { id: 1, content: '选项1', imageUrl: require('../images/option1-image.jpg') },
    { id: 2, content: '选项2', imageUrl: require('../images/option2-image.jpg') },
    { id: 3, content: '选项3', imageUrl: require('../images/option3-image.jpg') },
  ]);
  const [result, setResult] = useState(null);
  const [droppedItem, setDroppedItem] = useState(null);

  // 处理放置事件
  const handleDrop = (itemId) => {
    const item = items.find(i => i.id === itemId);
    setDroppedItem(item);
    setResult(itemId === 1 ? '成功！' : '失败，请重试。');
  };

  // 渲染主组件
  return (
    <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>
      <div className="single-choice-drag">
        <DropTarget onDrop={handleDrop} droppedItem={droppedItem}>
          <div className="drop-area-content">
            <img src={require('../images/drop-area-image.jpg')} alt="拖放到这里" />
          </div>
        </DropTarget>
        <div className="items-container">
          {items.map((item) => (
            <DraggableItem 
              key={item.id} 
              item={item} 
              type="item" 
              isDropped={droppedItem && droppedItem.id === item.id}
            />
          ))}
        </div>
        {result && <div className="result">{result}</div>}
      </div>
      <DragPreview />
    </DndProvider>
  );
}

export default SingleChoiceDrag;