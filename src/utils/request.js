import { gameData } from '../data/gameData';

// 模拟GET请求
export function get(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据url返回对应的本地数据
      resolve(getMockData(url));
    }, 100);
  });
}

// 模拟POST请求
export function post(url, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url.includes('addGameLog')) {
        resolve({ code: 200, msg: '记录成功' });
      }
    }, 100);
  });
}

// 获取模拟数据
function getMockData(url) {
  // 根据不同的url返回不同的本地数据
  if (url.includes('palygames')) {
    return gameData;
  }
  return null;
}

// 其他辅助函数保持不变
export function getUrlParameter(name) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(name) || '';
}
