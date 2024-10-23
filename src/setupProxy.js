const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://codetest.lelequ.net/prod-api',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // 删除请求路径中的 '/api' 前缀
      },
    })
  );
};
