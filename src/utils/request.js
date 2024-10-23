import axios from 'axios';

// 根据环境确定baseURL
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return '/api'; // 本地开发环境使用代理
  } else {
    return 'http://codetest.lelequ.net/prod-api'; // 生产环境直接访问API
  }
};

// 创建axios实例
const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 例如,添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data;
  },
  (error) => {
    // 对响应错误做点什么
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权,可以在这里处理登出逻辑
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error(`未知错误: ${error.message}`);
      }
    }
    return Promise.reject(error);
  }
);

// 封装GET请求
export function get(url, params) {
  return instance.get(url, { params });
}

// 封装POST请求
export function post(url, data) {
  return instance.post(url, data);
}

// 封装PUT请求
export function put(url, data) {
  return instance.put(url, data);
}

// 封装DELETE请求
export function del(url) {
  return instance.delete(url);
}

export default instance;
