/**
 * 天气配置文件
 */

export const weatherConfig = {
  // 和风天气 API Key
  apiKey: '598a41cf8b404383a148d15a41fa0b55',

  // API Host（可选，留空则使用免费版端点）
  apiHost: '',

  // 默认城市
  defaultCity: '北京',

  // 语言设置
  lang: 'zh' as 'zh' | 'en',

  // 更新间隔（分钟）
  updateInterval: 30,

  // 是否使用模拟数据
  useMockData: false, // 改为 false，尝试使用真实 API
};

/**
 * API Key 配置说明：
 *
 * 和风天气免费版限制：
 * - 每天 1000 次调用
 * - 实时天气、逐天预报、逐小时预报
 * - 支持全球城市
 *
 * 如何获取 API Key：
 * 1. 访问 https://dev.qweather.com/
 * 2. 注册账号并登录
 * 3. 进入"控制台" -> "应用管理"
 * 4. 创建新应用（选择"Web API"）
 * 5. 复制 API Key 到上方配置
 */
