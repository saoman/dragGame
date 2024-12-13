import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop, useDragLayer } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import styles from './DragGame.module.css';
import { playAudio } from '../utils';
import { RESOURCE_TYPES, EVENT_TYPES } from '../constants/gameTypes';

// 可拖动的元素组件
const DraggableItem = ({ element, children, style }) => {
  const [isActive, setIsActive] = useState(false);
  const [isDragComplete, setIsDragComplete] = useState(false);
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'ELEMENT',
    item: () => {
      return element;
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.dropped) {
        if (dropResult.success) {
          setIsDragComplete(true);
          // console.log('拖放成功');
        }
      }
    },
    canDrag: () => !isDragComplete,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // console.log('DraggableItem 渲染', element.group, isDragging, isActive);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const handleTouch = (active) => () => setIsActive(active);

  const scale = (isActive || isDragging) ? 1.05 : 1;

  return (
    <div
      ref={drag}
      style={{
        ...style,
        id: "drag" + style.id,
        opacity: isDragging ? 0 : 1,
        transform: `scale(${scale})`,
        transition: 'transform 0.2s',
        pointerEvents: isDragComplete ? 'none' : 'auto',
      }}
      onTouchStart={handleTouch(true)}
      onTouchEnd={handleTouch(false)}
      onTouchCancel={handleTouch(false)}
      onMouseDown={handleTouch(true)}
      onMouseUp={handleTouch(false)}
    >
      {children}
    </div>
  );
};

// 可放置的目标组件
const DropTarget = ({ element, children, style, onDrop, onInvalidDrop }) => {
  const elementRef = useRef(element);
  useEffect(() => {
    elementRef.current = element;
  }, [element]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['ELEMENT'],  // 接受所有类型的拖动项
    // canDrop: () => true,  // 允许所有项目尝试放置
    drop: (draggedItem) => {
      console.log('DropTarget 被调用', draggedItem, element);
      const currentElement = elementRef.current;
      if (currentElement.isDropped) return;
      if (draggedItem.group === element.group) {
        // 组别匹配，执行正常的放置操作
        onDrop(draggedItem, element);
        return { dropped: true, success: true };  // 返回自定义的结果对象
      } else {
        // 组别不匹配，执行无效放置的处理
        onInvalidDrop(draggedItem, element);
        return { dropped: true, success: false };  // 返回自定义的结果对象
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  return (
    <div ref={drop} style={{ ...style, id: "drop" + style.id }}>
      {children}
    </div>
  );
};


// 拖动预览组件
const DragPreview = () => {
  const { isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const getItemStyles = (initialOffset, currentOffset) => {
    if (!initialOffset || !currentOffset) {
      return { display: 'none' };
    }

    const { x: initialX, y: initialY } = initialOffset;
    const { x, y } = currentOffset;
    const dx = x - initialX;
    const dy = y - initialY;
    const transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
    return {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 100,
      left: `${item.lefts}px`,
      top: `${item.tops}px`,
      transform,
      WebkitTransform: transform,
      width: `${item.resource.withs}px`,
      height: `${item.resource.highs}px`,
    };
  };

  if (!isDragging) {
    return null;
  }

  return (
    <div className={styles.dragLayer}>
      <div className={styles.dragPreview} style={getItemStyles(initialOffset, currentOffset)}>
        <img
          src={item.resource.paths}
          alt={item.resource.names}
        />
      </div>
    </div>
  );
};

// 游戏元素组件
const GameElement = React.memo(({ element, onDrop, onInvalidDrop, triggerElementActions }) => {
  console.log('渲染游戏元素:', element);
  // console.log('GameElement 渲染', element, element.id);
  const [isActive, setIsActive] = useState(false);
  const { resource, lefts, tops, levels, event, clicks } = element;
  const style = {
    position: 'absolute',
    left: `${lefts}px`,
    top: `${tops}px`,
    zIndex: levels,
    width: `${resource.withs}px`,
    height: `${resource.highs}px`,
    id: element.id,
    transform: isActive ? 'scale(1.05)' : 'scale(1)',
    transition: 'transform 0.2s',
  };

  const handleTouchStart = () => {
    setIsActive(true);
  }
  const handleTouchEnd = () => {
    if (event === EVENT_TYPES.CLICKABLE && clicks) {
      triggerElementActions(clicks);
    }
    setIsActive(false);
  }

  const renderContent = () => {
    const handleClickIfNeeded = event === EVENT_TYPES.CLICKABLE ? {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleTouchStart,
      onMouseUp: handleTouchEnd,
    } : {};

    const newStyle = (event === EVENT_TYPES.DRAGGABLE || event === EVENT_TYPES.DROPPABLE) ? {
      ...style,
      width: '100%',
      height: '100%',
      left: '0',
      top: '0',
      position: 'static'
    } : style;

    switch (resource.rtype) {
      case RESOURCE_TYPES.IMAGE:
      case RESOURCE_TYPES.GIF:
      case RESOURCE_TYPES.BACKGROUND:
        return <img src={resource.paths} alt={resource.names} style={newStyle} {...handleClickIfNeeded} />;
      case RESOURCE_TYPES.AUDIO:
        return <audio src={resource.paths} style={newStyle} controls />;
      case RESOURCE_TYPES.TEXT:
        const textStyle = {
          ...newStyle,
          backgroundColor: `${resource.backgroundcolor}`,
          color: `${resource.fontcolor}`,
          borderRadius: `0 0 ${resource.borderradius}px ${resource.borderradius}px`,
          fontSize: `${resource.fontsize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '10px',
          border: `${resource.framewide}px solid ${resource.framecolor}`,
          boxSizing: 'border-box',
          fontWeight: '600',
        };
        return <div style={textStyle} {...handleClickIfNeeded}>{resource.names}</div>;
      default:
        return null;
    }
  };

  const content = renderContent();

  if (element.event === EVENT_TYPES.DRAGGABLE) {
    return (
      <DraggableItem element={element} style={style}>
        {content}
      </DraggableItem>
    );
  } else if (element.event === EVENT_TYPES.DROPPABLE) {
    return (
      <DropTarget element={element} style={style} onDrop={onDrop} onInvalidDrop={onInvalidDrop}>
        {content}
      </DropTarget>
    );
  } else {
    return content;
  }
});

// 主游戏组件
const DragGame = React.memo(({ config, configIndex, switchGame }) => {
  console.log('DragGame 组件渲染:', { config, configIndex });

  const nextConfigIndex = configIndex + 1; // 下一页游戏配置索引
  const [isSuccessAnimationPlayed, setIsSuccessAnimationPlayed] = useState(false);

  // 初始化游戏元素状态
  const [elements, setElements] = useState(() => {
    console.log('初始化 elements 状态');
    const addGroup = (element) => {
      if (!element.group) {
        console.log('警告: 元素缺少 group 属性:', element);
      }
      return {
        ...element,
        group: String(element.group || element.id)
      };
    };

    const triggersWithGroup = (config.triggers || []).map(addGroup);
    const releasesWithGroup = (config.releases || []).map(addGroup);
    
    console.log('合并元素:', {
      initelements: config.initelements || [],
      triggers: triggersWithGroup,
      releases: releasesWithGroup
    });

    const combinedElements = [
      ...(config.initelements || []),
      ...triggersWithGroup,
      ...releasesWithGroup
    ];

    return combinedElements;
  });

  // 监听 elements 变化
  useEffect(() => {
    console.log('elements 状态更新:', elements);
  }, [elements]);

  // 处理添加新元素
  const handleAddElement = (newElement) => {
    // console.log('尝试添加新元素:', newElement);
    setElements(prevElements => {
      const updatedElements = [...prevElements, newElement];
      // console.log('更新后的元素列表:', updatedElements);
      return updatedElements;
    });
  };

  // 处理更新元素
  const handleUpdateElement = (updatedElement) => {
    // console.log('尝试更新元素:', updatedElement);
    setElements(prevElements => prevElements.map(el =>
      el.id === updatedElement.id ? updatedElement : el
    ));
  };

  // 处理移除元素
  const handleRemoveElement = (elementId) => {
    // console.log('尝试移除元素:', elementId);
    setElements(prevElements => prevElements.filter(el => el.id !== elementId));
  };

  // 触发元素动作
  const triggerElementActions = useCallback((clicks) => {
    clicks.forEach(element => {
      switch (element.rtype) {
        case RESOURCE_TYPES.GIF:
          const gifElement = {
            ...element,
          };
          handleAddElement(gifElement);
          setTimeout(() => {
            handleRemoveElement(gifElement.id);
          }, element.resource.duration);
          break;
        case RESOURCE_TYPES.AUDIO:
          playAudio(element.resource.paths);
          break;
        case RESOURCE_TYPES.IMAGE:
          const existingElement = document.getElementById(element.id);
          if (existingElement) {
            handleUpdateElement(element);
          } else {
            handleAddElement(element);
          }
          break;
        default:
          break;
      }
    });
  }, []);

  // 处理元素放置
  const handleDrop = (draggedItem, droppedElement) => {
    console.log('拖放事件触发:', { draggedItem, droppedElement });
    triggerElementActions(droppedElement.oks);
    // 更新元素位置
    setElements(prevElements => {
      const updatedElements = prevElements.map(element => {
        if (element.id === draggedItem.id) {
          return { ...element, lefts: droppedElement.lefts, tops: droppedElement.tops };
        }
        if (element.id === droppedElement.id) {
          console.log('元素被放置', element);
          return { ...element, isDropped: true };
        }
        return element;
      });

      return updatedElements;
    });
  };

  // 处理无效放置
  const handleInvalidDrop = (draggedItem, targetElement) => {
    console.log('无效拖放:', { draggedItem, targetElement });
    triggerElementActions(targetElement.erros);
  };

  // 监听elements变化，检查游戏是否完成
  useEffect(() => {
    // console.log('elements更新了', elements);
    if (elements.length === 0) return;
    const allTargetsDropped = elements
      .filter(element => element.event === EVENT_TYPES.DROPPABLE)
      .every(target => target.isDropped);

    if (allTargetsDropped && !isSuccessAnimationPlayed) {
      // 所有目标都已放置，且动画尚未播放，调用播放通过动画的函数
      setTimeout(() => {
        triggerElementActions(config.sucess);
        setIsSuccessAnimationPlayed(true); // 标记动画已播放
      }, 0);
      switchGame(nextConfigIndex); // 切换游戏
    }
  }, [elements, triggerElementActions, config.sucess, isSuccessAnimationPlayed]);

  return (
    <DndProvider backend={TouchBackend}>
      <div className={styles.gameContainer}>
        {elements.length === 0 ? (
          <div>没有元素被渲染</div>
        ) : (
          elements.map(element => (
            <GameElement
              key={element.id}
              element={element}
              onDrop={handleDrop}
              onInvalidDrop={handleInvalidDrop}
              triggerElementActions={triggerElementActions}
            />
          ))
        )}
      </div>
      <DragPreview />
    </DndProvider>
  );
});

export default DragGame;
