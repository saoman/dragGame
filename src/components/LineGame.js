import React, { useState, useEffect, useRef } from "react";
import "./LineGame.css";
import { playAudio } from "../utils";

// 资源类型常量
// 用于标识游戏中不同类型的资源元素
const RESOURCE_TYPES = {
  IMAGE: 1, // 图片资源
  GIF: 2, // GIF动画资源
  AUDIO: 3, // 音频资源
  TEXT: 4, // 文本资源
  BACKGROUND: 5, // 背景图片资源
  SVG: 101,
};

// 事件类型常量
// 用于定义游戏元素可以触发的不同交互事件
const EVENT_TYPES = {
  NONE: 0, // 无事件
  CLICKABLE: 1, // 可点击事件
  DRAGGABLE: 5, // 可拖动事件
  DROPPABLE: 7, // 可接收拖放的事件
  LINE: 6,
  LINEMOVE: -6,
};

const LINE_SAVE = {
  SAVE: 1,
  REMOVE: 0,
};
const StaticNode = ({
  element,
  onTouchStart,
  touchMove,
  onTouchEnd,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  clickAudio,
}) => {
  {
    const { resource, lefts, tops, levels, event, clicks } = element;
    const style = {
      position: "absolute",
      left: `${lefts}px`,
      top: `${tops}px`,
      zIndex: levels,
      width: `${resource?.withs}px`,
      height: `${resource?.highs}px`,
      id: element.id,
    };
    const inputRef = useRef(null);

    const handleClick = (content) => {
      let clicksarr = clicks ? clicks : [{ rtype: 1 }];
      if (
        (event === EVENT_TYPES.CLICKABLE ||
          event === EVENT_TYPES.LINE ||
          event === EVENT_TYPES.LINEMOVE) &&
        clicksarr
      ) {
        triggerelementActions(clicksarr, content);
      }
    };

    const imgClick = ($event) => {
      onTouchStart($event, element);
    };

    const upClick = (content) => {
      if (onTouchEnd) {
        onTouchEnd(event, element);
      }
      if (onMouseUp) {
        onMouseUp(event, element);
      }
    };

    const triggerelementActions = (list, $event) => {
      list.forEach((elementRtype) => {
        switch (elementRtype.rtype) {
          case RESOURCE_TYPES.GIF:
            const gifElement = {
              ...elementRtype,
              id: `temp-gif-${Date.now()}`,
              event: EVENT_TYPES.NONE,
            };
          case RESOURCE_TYPES.AUDIO:
            clickAudio($event, element);
            playAudio(elementRtype.resource.paths);
            break;
          case RESOURCE_TYPES.IMAGE:
            if (onMouseDown) {
              onMouseDown($event, element);
            }
            if (onMouseMove) {
              onMouseMove($event, element);
            }

            if (onTouchStart) {
              onTouchStart($event, element);
            }
            if (touchMove) {
              touchMove($event, element);
            }

            break;
          default:
            break;
        }
      });
    };

    const getEvent = (event) => {
      switch (event) {
        case EVENT_TYPES.CLICKABLE:
          return { onTouchEnd: handleClick };
        case EVENT_TYPES.LINE:
          return { onTouchStart: imgClick, onMouseDown: imgClick };
        case EVENT_TYPES.LINEMOVE:
          return { onTouchMove: handleClick, onTouchEnd: upClick };
      }
    };

    const renderContent = () => {
      const handleClickIfNeeded = getEvent(event);
      const newStyle =
        event === EVENT_TYPES.DRAGGABLE || event === EVENT_TYPES.DROPPABLE
          ? {
              ...style,
              width: "100%",
              height: "100%",
              left: "0",
              top: "0",
              position: "static",
            }
          : style;
      switch (resource.rtype) {
        case RESOURCE_TYPES.IMAGE:
        case RESOURCE_TYPES.GIF:
        case RESOURCE_TYPES.BACKGROUND:
          return (
            <img
              src={resource.paths}
              alt={resource.names}
              style={newStyle}
              id={element.id} // 要拖追的id
              {...handleClickIfNeeded}
            />
          );
        case RESOURCE_TYPES.AUDIO:
          return (
            <audio
              src={resource.paths}
              id={element?.id}
              ref={inputRef}
              style={{ width: 0, height: 0 }}
              controls
            />
          );
        case RESOURCE_TYPES.TEXT:
          const textStyle = {
            ...newStyle,
            backgroundColor: `${resource.backgroundcolor}`,
            color: `${resource.fontcolor}`,
            borderRadius: `0 0 ${resource.borderradius}px ${resource.borderradius}px`,
            fontSize: `${resource.fontsize}px`,
            display: "flex",
            alignItems: "center",
            // justifyContent: "flex-start",
            // paddingLeft: "10px",
            justifyContent: 'center',
            fontWeight: 600,
            border: `${resource.framewide}px solid ${resource.framecolor}`,
            boxSizing: "border-box",
          };
          return (
            <div style={textStyle} {...handleClickIfNeeded}>
              {resource.names}
            </div>
          );
        case RESOURCE_TYPES.SVG:
          return <line {...element}></line>;
        default:
          return null;
      }
    };
    const content = renderContent();
    return content;
  }
};

const LineGame = React.memo(({ config, configIndex, switchGame  }) => {
  {
    let sourceIdArr = []; //  源的id数组
    let targetIdArr = [];
    let otherelementsClone = [];
    let playTime; //成功计时器
    let topArr = [];
    const [mintop, setMintop] = useState([]);
    const nextConfigIndex = configIndex + 1; // 下一个游戏配置索引
    const setArrContent = (getLength, sourceobj) => {
      let arr = [];
      if (getLength?.length === sourceobj.connections.length) {
        arr = [sourceobj?.tops];
      } else {
        const otherSourceobj = config.initelements.find(
          (item) =>
            item?.event === EVENT_TYPES.LINE && item.tops !== sourceobj?.tops
        );
        arr = [sourceobj?.tops, otherSourceobj?.tops];
      }
      topArr = arr.sort((a, b) => a - b);
      setMintop(topArr);
    };
    const [sourceelements, setSourceelements] = useState(() => {
      // 源数组
      const sourceobj = config.initelements.find(
        (item) => item?.event === EVENT_TYPES.LINE
      );
      const getLength = config.initelements.filter(
        (item) => item?.event === EVENT_TYPES.LINE
      );
      setArrContent(getLength, sourceobj);
      sourceIdArr =
        topArr.length > 1
          ? config.initelements.reduce((current, next) => {
              if (next.tops === topArr[0]) {
                current.push(next.id);
              }
              return current;
            }, [])
          : sourceobj.connections.map((item) => item.id);
      const allSource = config.initelements
        .filter((item) => sourceIdArr.includes(item?.id))
        .map((item) => {
          return {
            ...item,
            clicks: [{ rtype: 1 }],
            hasline: false,
            event: item?.event ? item?.event : EVENT_TYPES.LINEMOVE,
          };
        });
      return allSource;
    });

    const [targetelements, setTargetelements] = useState(() => {
      // 目标数组
      const targetArr =
        topArr.length > 1
          ? config.initelements.filter((item) => item?.tops === topArr[1])
          : config.initelements.filter(
              (item) => item?.event === EVENT_TYPES.LINE
            );
      const targetobj = targetArr.map((item) => {
        return {
          ...item,
          event: EVENT_TYPES.LINE,
          hasline: false,
        };
      });
      targetIdArr = targetobj.map((item) => item.id);
      return targetobj;
    });

    const [otherelements, setOtherelements] = useState(() => {
      // 静态
      const allId = [...sourceIdArr, ...targetIdArr];
      const othertargetArr = config.initelements.filter(
        (item) => !allId.includes(item?.id)
      );
      const targetAutoArr = config?.initelements.find(
        (item) => item?.event === EVENT_TYPES.LINE
      )?.connections;
      const audo = targetAutoArr.find((item) => !item?.ifline);
      const audoSuccess = targetAutoArr.find((item) => item?.ifline);

      otherelementsClone = [
        ...othertargetArr,
        { ...audo?.releases?.[0], id: "palyaudo" },
        { ...audoSuccess?.releases?.[0], id: "successAudo" },
      ];
      return otherelementsClone;
    });

    const [svgstyle, setSvgstyle] = useState(() => {
      const topSource = sourceelements[0]?.tops;
      const topTarget = targetelements[0]?.tops;
      return {
        height: config.highs + "px",
        top: `0px`,
      };
    });

    const [lineArr, setLineArr] = useState([]);
    let dragTimeoff1 = false;
    let ismove = false,
      isMoveArea = "";
    const [drag, setDrag] = useState(false); //是否拖动
    const [svgSave, setSvgSave] = useState(false);
    const [targetSave, setTargetSave] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isIOS = () => {
      let ua = navigator.userAgent;
      let isAndroid = /android/i.test(ua);
      return /(iPhone|iPad|iPod|IOS)/i.test(ua);
    };
    const [sourceOff,setSourceOff] = useState(true)
    const mouseDown = (event, element) => {
      const findElement = [...targetelements, ...sourceelements].find(
        (item) => item.id === element?.id
      );
      if (
        dragTimeoff1 ||
        drag ||
        ismove ||
        findElement?.event !== EVENT_TYPES.LINE
      ) {
        return;
      }
      if (isIOS()&&sourceOff) {
        setSourceOff(false)
        const playNode = document.getElementById("palyaudo");
        playNode.autoplay = true;
        playNode.muted = true;
        playNode.play();

        const successAudo = document.getElementById("successAudo");
        successAudo.autoplay = true;
        playNode.muted = true;
        playNode.play();
      }

      setDrag(true);
      const svg1 = document.getElementById(element?.id);
      setSvgSave(svg1);
      dragTimeoff1 = true;
      setTargetSave(element?.id); // 记录底部当前id
      const dragTime = setTimeout(() => {
        dragTimeoff1 = false;
        svg1.classList.toggle("scaleImg");
        clearTimeout(dragTime);
      }, 1000);
      svg1.classList.add("scaleImg");
      const navtive = event.changedTouches;
      setPosition({ x: navtive[0].clientX, y: navtive[0].clientY });
    };

    const getTarget = (event) => {
      return event.touches?.length ? event.touches : event?.changedTouches;
    };

    const updateLineArr = (x2, y2) => {
      setLineArr((pre) => {
        const filterCurrent = pre.filter(
          (item) => item.id !== `draw${targetSave}`
        );
        const startNode = [...targetelements, ...sourceelements].find(
          (item) => item.id === targetSave
        );
        const { lefts, tops, linecolor, linesize } = startNode;
        const { x, y } = position;
        const domInfo = document
          .getElementById(targetSave)
          .getBoundingClientRect();
        const { width } = domInfo;
        const differenceX = Math.floor(x2 - x);
        const differenceY = Math.floor(y2 - y);
        const multipleX = startNode?.resource?.withs / width;
        const multipleY = tops / y;
        const x1Pos = lefts + startNode?.resource?.withs / 2;
        const y1Pos =
          tops === mintop[0] && mintop?.length == 2
            ? tops + startNode?.resource?.highs
            : tops;
        const y2Pos =
          tops === mintop[0] && mintop?.length == 2
            ? y * multipleX + differenceY * multipleX
            : differenceY * multipleX + y * multipleX;
        const currentLine = {
          id: `draw${targetSave}`,
          x1: x1Pos,
          y1: y1Pos,
          stroke: linecolor,
          strokeWidth: linesize,
          x2: lefts + startNode?.resource?.withs / 2 + differenceX * multipleX,
          y2: y2Pos,
          resource: { rtype: 101 },
        };
        return [...filterCurrent, currentLine];
      });
    };

    const drawEnd = (id, svgSave) => {
      setLineArr((pre) => {
        const filterCurrent = pre.filter(
          (item) => item.id !== `draw${targetSave}`
        );
        const startNode = [...targetelements, ...sourceelements].find(
          (item) => item.id === targetSave
        );
        const { lefts, tops, linecolor, linesize } = startNode;

        const sourceClone = [...targetelements, ...sourceelements].find(
          (item) => item.id === id
        );
        const y1Pos =
          tops === mintop[0] && mintop?.length == 2
            ? tops + startNode?.resource?.highs
            : tops;
        const y2Pos =
          tops === mintop[0] && mintop?.length == 2
            ? sourceClone?.tops
            : sourceClone?.tops + sourceClone?.resource?.highs;
        const currentLine = {
          id: `draw${targetSave}`,
          x1: lefts + startNode?.resource?.withs / 2,
          y1: y1Pos,
          stroke: linecolor,
          strokeWidth: linesize,
          x2: sourceClone?.lefts + sourceClone?.resource?.withs / 2,
          y2: y2Pos,
          resource: { rtype: 101 },
        };
        return [...filterCurrent, currentLine];
      });
    };

    const mouseMove = (event, end) => {
      if (drag) {
        const target = getTarget(event);
        const findDown = [...targetelements, ...sourceelements].find(
          (item) => item.id === targetSave
        );
        const { hasline, tops } = findDown;
        if (hasline) return;
        updateLineArr(target[0].clientX, target[0].clientY);
        if (end) {
          const findElement = getElement(target[0].clientX, target[0].clientY);
          if (!findElement) {
            removeLine();
          } else {
            const { hasline, id } = findElement; // 找到顶部按钮
            
            if (hasline || id === targetSave) {
              removeLine();
            } else {
              endUp(id, svgSave);
            }
          }
        }
      }
    };

    const removeLine = (id) => {
      setLineArr((pre) => {
        const newLineArr = pre.filter((item) => !item.id.includes(targetSave));
        return newLineArr;
      });
    };

    const setTarget = (id) => {
      const findObj = sourceelements.find((item) => item?.id === id);
      if (findObj) {
        setSourceelements((pre) => {
          const filterTarget = pre.filter((item) => item?.id !== id);
          const serachTarget = pre.find((item) => item?.id === id);
          const newTargetArr = [
            ...filterTarget,
            { ...serachTarget, hasline: true },
          ];
          return newTargetArr;
        });
      } else {
        setTargetelements((pre) => {
          const filterTarget = pre.filter((item) => item?.id !== id);
          const serachTarget = pre.find((item) => item?.id === id);
          const newTargetArr = [
            ...filterTarget,
            { ...serachTarget, hasline: true },
          ];
          return newTargetArr;
        });
      }
    };

    const mouseUp = (event) => {
      if (event?.changedTouches?.[0]?.clientX) {
        mouseMove(event, true);
      }
      clearAll();
    };

    const endUp = (id, svgSave) => {
      const findLineTarget = [...targetelements, ...sourceelements].find(
        (element) => element.id === targetSave
      ); // 被连线对象
      const connectionTarget = (findLineTarget?.connections ?? []).find(
        (element) => element.id === id
      );
      playGif(connectionTarget, id, svgSave);
    };

    const playGif = (connectionTarget, id, svgSave) => {
      // 判断是否保留线
      if (connectionTarget?.ifline !== LINE_SAVE.SAVE) {
        setTimeout(() => {
          removeLine();
        }, 500);
        const playNode = document.getElementById("palyaudo");
        playNode.currentTime = 0;
        playNode.muted = false;
        playNode.play();
      } else {
        drawEnd(id, svgSave);
        setTarget(id);
        setTarget(targetSave);
        const successAudo = document.getElementById("successAudo");
        successAudo.muted = false;
        successAudo.currentTime = 0;
        successAudo.play();
      }
    };

    const getElement = (x, y) => {
      let node;
      const areaNodes = [...targetelements, ...sourceelements];
      for (const key in areaNodes) {
        const { id } = areaNodes[key];
        const domInfo = document.getElementById(id).getBoundingClientRect();
        const isRightNode = isPointInRect(
          x,
          y,
          domInfo.left,
          domInfo.top,
          domInfo.bottom,
          domInfo.right
        );
        if (isRightNode) {
          node = areaNodes[key];
        }
      }
      return node;
    };

    const isPointInRect = (x, y, left, top, bottom, right) => {
      return x >= left && x <= right && y >= top && y <= bottom;
    };

    const clearAll = () => {
      isMoveArea = "";
      ismove = false;
      setTargetSave(null);
      setPosition({ x: 0, y: 0 });
      setDrag(false);
      setSvgSave(false);
    };

    useEffect(() => {
      if (sourceelements?.length) {
        document
          .querySelector("img")
          .addEventListener("dragstart", function (e) {
            e.preventDefault();
            e.stopPropagation();
          });
      }
    }, [sourceelements]);

    useEffect(() => {
      if (sourceelements?.length) {
        const off = sourceelements.every((detail) => detail?.hasline);
        off && PlaySuccess();
      }
    }, [sourceelements]);

    const PlaySuccess = () => {
      const successNode = config.sucess?.[0];
      if (!successNode) {
        switchGame(nextConfigIndex); //没有成功gif切换
        return;
      }
      setOtherelements((pre) => {
        return [...pre, successNode];
      });
      const duration = successNode?.resource.duration;
      playTime && clearTimeout(playTime);
      playTime = setTimeout(() => {
        setOtherelements((pre) => {
          const noSuccessGif = pre.filter(
            (item) => item?.id !== successNode?.id
          );
          return [...noSuccessGif];
        });
        switchGame(nextConfigIndex); //没有成功gif切换
      }, duration);
    };

    const clickImg = (event, element) => {
      const imgaudo = document.getElementById(element?.id);
      const dragTime = setTimeout(() => {
        imgaudo.classList.toggle("scaleImg");
        clearTimeout(dragTime);
      }, 1000);
      imgaudo.classList.add("scaleImg");
    };

    return (
      <div>
        <div
          className="printContain"
          onTouchEnd={mouseUp}
          onTouchMove={mouseMove}
        >
          {otherelements.map((element) => (
            <StaticNode
              element={element}
              key={element.id}
              clickAudio={clickImg}
            ></StaticNode>
          ))}
          <div className="imgGroup sourceGroup">
            {sourceelements.map((element) => (
              <StaticNode
                onTouchStart={mouseDown}
                element={element}
                className="drag"
                key={element.id}
              ></StaticNode>
            ))}
          </div>
          <svg id="svgContain" style={svgstyle}>
            {lineArr.map((element) => (
              <StaticNode
                element={element}
                className="drag"
                key={element.id}
              ></StaticNode>
            ))}
          </svg>
          <div className="imgGroup targetGroup">
            {targetelements.map((element) => (
              <StaticNode
                element={element}
                key={element.id}
                onTouchStart={mouseDown}
              ></StaticNode>
            ))}
          </div>
        </div>
      </div>
    );
  }
});

export default LineGame;
