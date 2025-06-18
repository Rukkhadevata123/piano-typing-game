/**
 * 背景管理工具
 */
const BING_API_URL = 'https://bing.biturl.top/';

export class BackgroundManager {
  static async setRandomBackground() {
    try {
      const response = await fetch(BING_API_URL);
      if (!response.ok) throw new Error('获取壁纸失败');

      const data = await response.json();
      const imageUrl = data.url;

      document.body.style.backgroundImage = `url(${imageUrl})`;
      document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      document.body.style.backgroundBlendMode = 'multiply';
    } catch (error) {
      console.error('设置背景失败:', error);
    }
  }
}
