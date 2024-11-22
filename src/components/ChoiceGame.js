import React, { useState, useEffect, useCallback } from 'react';
import styles from './ChoiceGame.module.css';
import { playAudio } from '../utils';
import { RESOURCE_TYPES, EVENT_TYPES } from '../constants/gameTypes';

const GameElement = React.memo(({ element, onElementClick, isSelected, triggerElementActions }) => {
  const { resource, lefts, tops, levels, event, group } = element;
  const style = {
    position: 'absolute',
    left: `${lefts}px`,
    top: `${tops}px`,
    zIndex: levels,
    width: `${resource.withs}px`,
    height: `${resource.highs}px`,
  };

  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = (e) => {
    if (event === EVENT_TYPES.CLICKABLE) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = (e) => {
    if (event === EVENT_TYPES.CLICKABLE) {
      setIsPressed(false);
    }
    onElementClick(element);
  };

  const handleClickIfNeeded = (event === EVENT_TYPES.CLICKABLE || event === EVENT_TYPES.CHOICEABLE) ? {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  } : {};

  const renderContent = () => {
    const newStyle = {
      ...style,
      transform: isPressed ? 'scale(1.05)' : 'scale(1)',
      transition: 'transform 0.1s ease',
      transformOrigin: 'center center',
    };

    switch (resource.rtype) {
      case RESOURCE_TYPES.IMAGE:
      case RESOURCE_TYPES.GIF:
      case RESOURCE_TYPES.BACKGROUND:
        if (event === EVENT_TYPES.CHOICEABLE) {
          return (
            <div
              style={newStyle}
              {...handleClickIfNeeded}
              data-group={group}
            >
              <img src={resource.paths} alt={resource.names} style={{ width: '100%', height: '100%' }} />
              {isSelected && <div className={styles.selectedOverlay}></div>}
            </div>
          );
        } else {
          return <img src={resource.paths} alt={resource.names} style={newStyle} {...handleClickIfNeeded} />;
        }
      case RESOURCE_TYPES.AUDIO:
        return <audio src={resource.paths} style={newStyle} controls />;
      case RESOURCE_TYPES.TEXT:
        const textStyle = {
          ...newStyle,
          backgroundColor: resource.backgroundcolor,
          color: resource.fontcolor,
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
        return <div style={textStyle}>{resource.names}</div>;
      default:
        return null;
    }
  };

  return renderContent();
});

const ChoiceGame = React.memo(({ config, configIndex, switchGame }) => {
  const nextConfigIndex = configIndex + 1;
  const [elements, setElements] = useState([...config.initelements, ...config.groups] || []);
  const [selectedElements, setSelectedElements] = useState([]);

  const handleAddElement = useCallback((newElement) => {
    setElements(prevElements => [...prevElements, newElement]);
  }, []);

  const handleRemoveElement = useCallback((elementId) => {
    setElements(prevElements => prevElements.filter(el => el.id !== elementId));
  }, []);

  const triggerElementActions = useCallback((actions) => {
    if (!Array.isArray(actions)) return;

    actions.forEach(element => {
      switch (element.rtype) {
        case RESOURCE_TYPES.GIF:
          handleAddElement(element);
          setTimeout(() => handleRemoveElement(element.id), element.resource.duration);
          break;
        case RESOURCE_TYPES.AUDIO:
          playAudio(element.resource.paths);
          break;
        case RESOURCE_TYPES.IMAGE:
          handleAddElement(element);
          break;
      }
    });
  }, [handleAddElement, handleRemoveElement]);

  const checkIfCorrect = useCallback((selectedElements) => {
    return selectedElements.every((element, index, array) =>
      index === 0 || element.group === array[index - 1].group
    );
  }, []);

  const handleElementClick = useCallback((element) => {
    if (element.event === EVENT_TYPES.CHOICEABLE) {
      setSelectedElements(prev => {
        const newSelected = prev.includes(element)
          ? prev.filter(e => e !== element)
          : [...prev, element];

        if (newSelected.length >= 2) {
          const isCorrect = checkIfCorrect(newSelected);

          setTimeout(() => {
            if (isCorrect) {
              triggerElementActions(element.oks);
              triggerElementActions(config.sucess);
              setTimeout(() => switchGame(nextConfigIndex), 1000);
            } else {
              triggerElementActions(element.erros);
            }
            setSelectedElements([]);
          }, 1000);
        }
        return newSelected;
      });
    } else if (element.event === EVENT_TYPES.CLICKABLE) {
      triggerElementActions(element.clicks);
    }
  }, [checkIfCorrect, triggerElementActions, config.sucess, nextConfigIndex, switchGame]);

  return (
    <div className={styles.gameContainer}>
      {elements.map(element => (
        <GameElement
          key={element.id}
          element={element}
          onElementClick={handleElementClick}
          isSelected={selectedElements.includes(element)}
          triggerElementActions={triggerElementActions}
        />
      ))}
    </div>
  );
});

export default ChoiceGame;
