// 资源类型常量
export const RESOURCE_TYPES = {
  IMAGE: 1,      // 图片资源
  GIF: 2,        // GIF动画资源
  AUDIO: 3,      // 音频资源
  TEXT: 4,       // 文本资源
  BACKGROUND: 5,  // 背景图片资源
  VIDEO: 6,      // 视频资源
  SVG: 7,        // SVG矢量图资源
};

// 事件类型常量
export const EVENT_TYPES = {
  NONE: 0,       // 无事件
  CLICKABLE: 1,  // 可点击事件
  DRAGGABLE: 5,  // 可拖动事件
  DROPPABLE: 7,  // 可接收拖放的事件
  CHOICEABLE: 8, // 可选择事件
};

// 游戏类型常量
export const GAME_TYPES = {
  SINGLECHOICE: 1,  // 单选游戏
  MULTIPLECHOICE: 2,  // 多选游戏
  DRAG: 3,  // 拖动游戏
  PICTUREWORDS: 4,  // 看图识字
  WORDGRAPHCONNECTION: 5,  // 字图连线
  PICTUREGUESSING: 6,  // 看图猜字
  LIANZIWORDS: 7,  // 连字组词
  LINE: 8,  // 连线游戏
  COLOURING: 9,  // 涂色游戏
};

// 元素缩放比例常量
export const SCALE_RATIOS = {
  SMALL: 0.5,
  NORMAL: 1,
  LARGE: 1.05,
};

// 单选游戏选项常量
export const IS_ANSWER = {
  TRUE: 1, // 正确
  FALSE: 0 // 错误
};