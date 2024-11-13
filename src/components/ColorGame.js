// 涂色游戏
import React, { useEffect, useState } from 'react';
import { playAudio } from '../utils';
import { RESOURCE_TYPES, EVENT_TYPES, SCALE_RATIOS } from '../constants/gameTypes';
const svgTagNames = ['path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon']; // svg标签名

// 渲染元素组件 start
/**
 * @param {object} initelement 元素详情
 * @param {function} handleClickImage 点击元素
 * @param {function} handleTouchStartImage 按下元素
 * @param {function} handleTouchEndImage 松开元素
 * @param {function} handleClickColor 点击颜色
 * @returns 元素渲染
*/
function RenderElements({ initelement, handleClickImage, handleTouchStartImage, handleTouchEndImage, handleClickColor }) {
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
    transform: 'scale('+scale+')'
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
        if(EVENT_TYPES.CLICKABLE === event) {
            const textStyle1 = {
                ...textStyle,
                borderRadius: `${resource.borderradius}px`,
            };
            // 色值元素
            return (
                <div
                    style={textStyle1}
                    onTouchStart={() => {
                        handleTouchStartImage(initelement);
                    }}
                    onTouchEnd={() => {
                        handleTouchEndImage(initelement);
                        handleClickColor(initelement);
                    }}
                >
                    {resource.names}
                </div>
            );  
        } else {
            // 题目文本
            return <div style={textStyle}>{resource.names}</div>;
        }
    } else if(rtype === RESOURCE_TYPES.BACKGROUND) {
        return <img src={resource.paths} alt={resource.names} style={backgroundStyle} />;
    } else if(rtype === RESOURCE_TYPES.SVG) {
        if(EVENT_TYPES.CLICKABLE === event) {
            return <RenderElementsSvg imgStyle={imgStyle} initelement={initelement} handleClickImage={handleClickImage} />;
        } else {
            return <RenderElementsSvg imgStyle={imgStyle} initelement={initelement} handleClickImage={() => {return;}} />;
        }
    } else {
        return <div>暂不支持该资源类型</div>;
    }
  }
  return render();
};
// 渲染元素组件 end
// 渲染元素组件svg start
/**
 * @param {object} initelement 元素详情
 * @param {object} imgStyle 图片样式
 * @param {function} handleClickImage 点击元素
 * @returns 元素渲染
 */
function RenderElementsSvg({ imgStyle, initelement, handleClickImage }) {
    // console.log("渲染svg元素详情==", initelement);
    const svgContent = initelement.paths.svg;
    if (!svgContent) return null;
    const {
      width,
      height,
      viewBox,
      xmlns,
      path,
      circle,
      rect,
      ellipse,
      line,
      polyline,
      polygon,
    } = svgContent;
    // ------svg属性------
    const svgAttributes = {
        width: `${width}px`,
        height: `${height}px`,
        viewBox: viewBox,
        xmlns: xmlns,
        fill: "transparent",
        pointerEvents: "none", // 禁止点击事件
    };
    // ------含连字符的属性转换为驼峰式------
    const convertPropertyNames = (obj, upperCase) => {
        if (upperCase) {
          const convert = (key) => {
            if (key.includes('-')) {
              let camelCaseKey = key.replace(/-\w/g, (match) => match[1].toUpperCase());
              obj[camelCaseKey] = obj[key];
              delete obj[key];
            }
          };
          Object.keys(obj).forEach(convert);
        }
        return obj;
    };
    // ------svg元素对象------
    const svgs = svgTagNames.reduce((acc, tagName) => {
        acc[tagName] = {
            tagName,
            values: [],
        };
        return acc;
    }, {});
    // 绘制 svg 元素
    function draw() {
        if (this.values.length === 0) return null;
        return this.values.map((ele, index) => {
            const TagName = this.tagName;
            return <TagName key={index} {...ele} />;
        });
    }
    // 为svg元素对象每个内容标签 draw 方法
    Object.keys(svgs).forEach((key) => {
      svgs[key].draw = draw.bind(svgs[key]);
    });
    // ------svg内容标签属性------
    const getSvgTagAttr = (type, ele) => {
      let attr = {
        pointerEvents: "auto", // 允许点击事件
      };
      // 组合属性
      if (type in svgs) {
        const eleAttr = convertPropertyNames(ele, true); // 驼峰式属性
        svgs[type].values.push(Object.assign({}, eleAttr, attr));
      }
    };
    // ------svg内容标签数据-----
    const getSvgTagData = (type, content) => {
      if (Array.isArray(content)) {
        content.map((ele) => {
          getSvgTagAttr(type, ele);
        });
      } else {
        getSvgTagAttr(type, content);
      }
    };
    // ------svg内容------
    Object.entries({path, circle, rect, ellipse, line, polyline, polygon}).forEach(
      ([key, value]) => {
        if (value) {
          getSvgTagData(key, value);
        }
      }
    );
    // ------svg渲染------
    const svgElement = (
      <svg
        style={imgStyle}
        {...svgAttributes}
        // onClick={() => {
        //   handleClickImage(initelement);
        // }}
        onTouchEnd={() => {
            handleClickImage(initelement);
        }}
      >
        {Object.entries(svgs).map(([key, value]) => {   
            return value.draw();
        })}
      </svg>
    );
    return svgElement;
  }
  // 渲染元素组件svg end

// 主组件 start
/**
 * 
 * @param {*} config 
 * @param {number} config.withs 页面宽度
 * @param {number} config.highs 页面高度
 * @param {array} config.initelements 页面元素列表
 * @param {array} config.success 成功反馈元素列表
 * @returns 
*/
export default function ColorGame({config, configIndex, switchGame}) {
    const defaultBorderColor = '#C9CEFB'; // 色板默认border颜色
    const activeBorderColor = '#FFFFFF'; // 色板活跃border颜色
    const nextConfigIndex = configIndex + 1; // 下一页游戏配置索引
    const { withs = 0, highs = 0, initelements = [], sucess: successFeedbackData = [] } = config;
    const [initelementsDefault, setInitelementsDefault] = useState(initelements);
    const [currentColor, setCurrentColor] = useState(''); // 当前选中的色板颜色值
    const [needColorSvgCount, setNeedColorSvgCount] = useState(0); // 需要涂色的svg元素总数
    const [successSvgs, setSuccessSvgs] = useState([]);  // 已涂色的svg元素数组
    // console.log('页面元素列表', withs, highs, initelements);

    useEffect(() => {
        let timer = null;
        if(initelements.length <= 0) return; // 页面元素为空
        // 初始化页面元素
        initelements.forEach((item) => { 
            item.scale = SCALE_RATIOS.NORMAL; // 初始缩放为1
            item.resource.framecolor1 = item.resource.framecolor; // 保存初始framecolor
            if(item.rtype == RESOURCE_TYPES.AUDIO) { // 如果存在音频文件，直接播放
                timer = setTimeout(() => {
                    // 播放音频
                    playAudio(item.resource.paths);
                }, item.play); // 延迟播放音频
            }
        });
        const initelements1 = initelements.filter((item) => item.rtype === RESOURCE_TYPES.SVG && item.event === EVENT_TYPES.CLICKABLE).length;
        setNeedColorSvgCount(initelements1);
        setInitelementsDefault(initelements);
        return () => clearTimeout(timer); // 销毁定时器
    }, [initelements]);
    // 选择色值
    const handleClickColor = (item) => {
        // console.log('点击色板颜色==', item);
        setCurrentColor(item.resource.backgroundcolor); // 保存当前选中色值
    };
    // svg元素涂色
    const changeSvgFillColor = (item, color) => {
        // console.log('改变svg颜色==', item, color);
        const svgContent = item.paths.svg;
        if (!svgContent) return;
        svgTagNames.forEach((type) => {
            if (svgContent[type]) {
                if (Array.isArray(svgContent[type])) {
                    svgContent[type].map((ele) => {
                        ele.fill = color;
                    });
                } else {
                    svgContent[type].fill = color;
                }
            }
        });
    };
    // 判断是否全部涂色完成
    const isAllColorSvg = (item) => {
        // 已涂色svg元素数组
        const successSvgs1 = Array.from(new Set([...successSvgs, item.id]));
        setSuccessSvgs(successSvgs1);
        if (successSvgs1.length >= needColorSvgCount) {
            // 播放反馈音频
            console.log('全部涂色完成', successFeedbackData);
            if (successFeedbackData.length > 0) {
                successFeedbackData.forEach((element) => {
                    if (element.rtype == RESOURCE_TYPES.AUDIO) {
                        // 播放音频
                        playAudio(element.resource.paths);
                    }
                    if(element.rtype == RESOURCE_TYPES.IMAGE || element.rtype == RESOURCE_TYPES.GIF || element.rtype == RESOURCE_TYPES.TEXT){
                        handleAddElement(element); // 显示反馈图标
                        setTimeout(() => {
                            handleRemoveElement(element.id); // 移除反馈图标
                        }, element.resource.duration);
                    }
                });
            }
            switchGame(nextConfigIndex); // 切换游戏
        }
    };
    // 元素点击事件, 点击svg(改变svg颜色,播放反馈音频) || 图片元素(有音频则播放音频)
    const handleClickImage = (item) => {
        // console.log("点击元素详情==", item, currentColor);
        // 未选择色值
        if (item.rtype === RESOURCE_TYPES.SVG && !currentColor) {
            console.log("未选择色值");
            alert("请选择色值");
            return;
        } else if (item.rtype === RESOURCE_TYPES.IMAGE || item.rtype === RESOURCE_TYPES.GIF || (item.rtype === RESOURCE_TYPES.SVG && currentColor)) {
            if (item.clicks && item.clicks.length > 0) {
                item.clicks.forEach((element) => {
                    if (element.rtype == RESOURCE_TYPES.AUDIO) {
                        // 播放音频
                        playAudio(element.resource.paths);
                    }
                });
            }
            if (item.rtype === RESOURCE_TYPES.SVG) {
                // svg元素涂色
                changeSvgFillColor(item, currentColor);
                // 是否全部涂色完成
                isAllColorSvg(item);
            }
        } else {
            console.log("暂不支持该资源类型");
        }
    };
    // 按下元素
    const handleTouchStartImage = (item) => {
        // console.log('按下元素详情==', item, initelementsDefault);
        initelementsDefault.map(el => el.resource.framecolor = el.resource.framecolor1); // 重置色值
        // 放大5%
        item.scale = SCALE_RATIOS.LARGE;
        item.resource.framecolor = activeBorderColor;
        setInitelementsDefault((prev) => [...prev, item]);
    };
    // 松开元素
    const handleTouchEndImage = (item) => {
        // console.log('松开元素详情==', item);
        // 恢复原状
        item.scale = SCALE_RATIOS.NORMAL;
        setInitelementsDefault((prev) => [...prev, item]);
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
                    return <RenderElements key={index} initelement={initelement} handleClickImage={handleClickImage} handleTouchStartImage={handleTouchStartImage} handleTouchEndImage={handleTouchEndImage} handleClickColor={handleClickColor} />;
                })}
        </div>
    );
};
// 主组件 end