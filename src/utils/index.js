// 预加载配置中指定的资源
export function prefetchConfigResources(config) {
  const targetNames = ['clicks', 'erros', 'oks', 'sucess'];
  const resourcesToPrefech = new Set(); // 使用 Set 来自动去重

  // 递归遍历配置对象
  function traverseConfig(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const key in obj) {
      const value = obj[key];
      // 检查是否为目标键名且值为数组
      if (targetNames.includes(key) && Array.isArray(value)) {
        value.forEach(item => {
          if (item && item.resource && item.resource.paths) {
            // 使用 Set 的 add 方法添加路径
            resourcesToPrefech.add(item.resource.paths);
          } else {
            console.warn('无效的资源项:', item);
          }
        });
      } else if (typeof value === 'object') {
        // 继续遍历子对象
        traverseConfig(value);
      }
    }
  }

  traverseConfig(config);
  
  // 将 Set 转换回数组，并使用 prefetchResources 函数预加载资源
  prefetchResources([...resourcesToPrefech]);
}

// 预加载指定的资源
export function prefetchResources(resources) {
  console.log("🚀 ~ prefetchResources ~ resources:", resources)
  resources.forEach(resource => {
    const extension = resource.split('.').pop().toLowerCase();

    // 定义支持的资源类型
    const supportedTypes = {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      audio: ['mp3', 'wav', 'ogg']
    };

    // 确定资源类型
    const resourceType = Object.keys(supportedTypes).find(type => 
      supportedTypes[type].includes(extension)
    );

    if (resourceType === 'image') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = resource;
      document.head.appendChild(link);
      console.log(`预加载图片资源: ${resource}`);
    } else if (resourceType === 'audio') {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = resource;
      console.log(`预加载音频资源: ${resource}`);
    } else {
      console.warn(`不支持的资源类型: ${resource}`);
    }
  });
}

// 用于跟踪当前播放的音频
let currentAudio = null;

// 播放音频并管理当前播放状态
export function playAudio(src) {
  // 如果有正在播放的音频，停止它
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  
  // 创建并播放新的音频
  currentAudio = new Audio(src);
  currentAudio.play().catch(error => console.error('音频播放失败:', error));
  
  // 音频播放结束时重置currentAudio
  currentAudio.onended = () => {
    currentAudio = null;
  };
}
