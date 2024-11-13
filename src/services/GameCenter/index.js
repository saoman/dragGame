import { get } from '../../utils/request';

// 获取游戏列表
export function getGameList(params) {
  return get('/miniapp/wx/cartoon/palygames', params);
}