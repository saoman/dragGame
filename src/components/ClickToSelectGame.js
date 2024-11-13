// 点选游戏
import React, { useEffect, useRef, useState } from 'react';
import { playAudio } from '../utils';
import { RESOURCE_TYPES, EVENT_TYPES, SCALE_RATIOS, IS_ANSWER } from '../constants/gameTypes';

// 渲染元素组件 start
/**
 * @param {object} initelement 元素详情
 * @param {function} handleClickImage 点击元素
 * @param {function} handleTouchStartImage 按下元素
 * @param {function} handleTouchEndImage 松开元素
 * @returns 元素渲染
*/
function RenderElements({initelement, handleClickImage, handleTouchStartImage, handleTouchEndImage}) {
  const { tops, lefts, levels, rtype, event, resource, scale, id, answer } = initelement;
//   console.log('渲染元素详情==', initelement);
  // 图片样式
  const imgStyle = {
    width: `${resource.withs}px`,
    height: `${resource.highs}px`,
    position: 'absolute',
    top: `${tops}px`,
    left: `${lefts}px`,
    zIndex: `${levels}`,
    transform: 'scale('+scale+')',
  };
  // 底图样式==受父级影响 未能铺满 待处理????????
  const backgroundStyle = {
    ...imgStyle,
    width: `100%`,
    height: `100%`
  };
  // 文本样式
  const textStyle = {
    ...imgStyle,
    fontSize: `${resource.fontsize}px`,
    color: `${resource.fontcolor}`,
    // padding: '0 14px',
    fontWeight: 600,
    boxSizing: 'border-box',
    backgroundColor: `${resource.backgroundcolor}`,
    borderWidth: `${resource.framewide}px`,
    // borderTopWidth: 0,
    borderStyle: 'solid',
    borderColor: `${resource.framecolor}`,
    borderBottomLeftRadius: `${resource.borderradius}px`,
    borderBottomRightRadius: `${resource.borderradius}px`,
    lineHeight: `${resource.highs - resource.framewide}px`
  };
  const render = () => {
    if(rtype === RESOURCE_TYPES.IMAGE || rtype === RESOURCE_TYPES.GIF) {
        if(EVENT_TYPES.CLICKABLE === event) {
            return (
                <img
                    src={resource.paths}
                    alt={resource.names}
                    style={imgStyle}
                    onTouchStart={() => {
                        handleTouchStartImage(initelement);
                    }}
                    onTouchEnd={() => {
                        handleTouchEndImage(initelement);
                        handleClickImage(initelement);
                    }}
                />
            );
        } else {
            return (
                <img
                    src={resource.paths}
                    alt={resource.names}
                    style={imgStyle}
                />
            );
        }
    } else if(rtype === RESOURCE_TYPES.AUDIO) {
    //   return <audio src={resource.paths} controls={false} style={{ display: "none" }}></audio>;
    } else if(rtype === RESOURCE_TYPES.TEXT) {
        return (
            <div style={textStyle}>
                {resource.names}
            </div>
        );
    } else if(rtype === RESOURCE_TYPES.BACKGROUND) {
        return <img
            src={resource.paths}
            alt={resource.names}
            style={backgroundStyle}
        />;
    } else {
        return <div>暂不支持该资源类型</div>;
    }
  }
  return render();
};
// 渲染元素组件 end

// 主组件 start
/**
 * 
 * @param {*} props 
 * @returns 
*/
export default function ClickToSelectGame({config, configIndex, switchGame}) {
    const timerArray = useRef([]); // 定时器数组
    const nextConfigIndex = configIndex + 1; // 下一页游戏配置索引
    const { withs = 0, highs = 0, initelements = []} = config;
    const [initelementsDefault, setInitelementsDefault] = useState(initelements);
    // console.log('页面元素列表', withs, highs, initelements);

    useEffect(() => {
        if(initelements.length <= 0) return; // 页面元素为空
        // 初始化页面元素
        initelements.forEach((item, index) => { 
            item.scale = SCALE_RATIOS.NORMAL; // 初始缩放为1
            if(item.rtype == RESOURCE_TYPES.AUDIO) { // 如果存在音频文件，直接播放
                timerArray.current[index] = setTimeout(() => {
                    // 播放音频
                    playAudio(item.resource.paths);
                }, item.play); // 延迟播放音频
            }
        });
        setInitelementsDefault(initelements);
        return () => clearAllTimer(); // 销毁定时器
    }, [initelements]);
    // 清除全部定时器
    const clearAllTimer = () => {
        timerArray.current.forEach((item) => {
            clearTimeout(item);
        });
        // 定时器数组置空
        timerArray.current = [];
    };
    // 点击元素（可能触发播放音频、可能是触发选择答案）
    const handleClickImage = (item) => {
        console.log('点击元素详情==', item);
        // 重置initelementsDefault
        setInitelementsDefault(initelements);
        // 发送游戏日志
        const isAnswer = item.answer == IS_ANSWER.TRUE ? true : false;
        // 当前点击图片所带的事件~
        if(item.clicks && item.clicks.length > 0) {
            item.clicks.forEach((element) => {
                if(element.rtype ==  RESOURCE_TYPES.AUDIO) {
                    // 播放音频
                    playAudio(element.resource.paths);
                }
                if(element.rtype ==  RESOURCE_TYPES.IMAGE || element.rtype ==  RESOURCE_TYPES.GIF || element.rtype ==  RESOURCE_TYPES.TEXT){
                    // element.isAnswer = isAnswer;
                    handleAddElement(element); // 显示反馈图标
                    setTimeout(() => {
                        if(!isAnswer) {
                            handleRemoveElement(element.id); // 移除反馈图标
                        } else {
                            switchGame(nextConfigIndex); // 切换游戏
                        }
                    }, 1000);
                }
            });
        }
    };
    // 按下元素
    const handleTouchStartImage = (item) => {
        // console.log('按下元素详情==', item);
        if(item.clicks && item.clicks.length > 0) {
            item.scale = SCALE_RATIOS.LARGE;
            setInitelementsDefault((prev) => [...prev, item]);
        }
    };
    // 松开元素
    const handleTouchEndImage = (item) => {
        // console.log('松开元素详情==', item);
        if(item.clicks && item.clicks.length > 0) {
            // 恢复原状
            item.scale = SCALE_RATIOS.NORMAL;
            setInitelementsDefault((prev) => [...prev, item]);
        }
    };
    // 添加元素
    const handleAddElement = (item) => {
        console.log('添加元素详情==', item);
        setInitelementsDefault((prev) => [...prev, item]);
    };
    // 移除元素
    const handleRemoveElement = (id) => {
        console.log('移除元素详情==', id);
        setInitelementsDefault((prev) => prev.filter((item) => item.id !== id));
    };
    return (
        <div>
            {/* 页面初始内容-例如：图片、文字、底图 */}
            {initelementsDefault.length > 0 && 
                initelementsDefault.map((initelement, index) => {
                    return <RenderElements key={index} initelement={initelement} handleClickImage={handleClickImage} handleTouchStartImage={handleTouchStartImage} handleTouchEndImage={handleTouchEndImage} />
                })}
        </div>
    );
};
// 主组件 end