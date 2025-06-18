/**
 * 游戏配置统一导出
 */

// 游戏核心配置
export const gameConfig = {
  rows: 9,
  columns: 6,
  initialDuration: 60,
  points: {
    hit: 10,
    miss: -5,
  },
  difficulty: {
    minRate: 0.3,
    maxRate: 0.6,
    initialRate: 0.4,
    minBlocks: 1,
    maxBlocks: 4,
    maxConsecutive: 3,
  },
  timeDurations: [60, 90, 120, 150, 180, 210, 240, 270, 300, 5],
  modes: [
    { name: '整行模式', type: 'row' },
    { name: '单块模式', type: 'single' },
  ],
};

// 按键映射配置
export const keyMap = {
  A: 0,
  S: 1,
  D: 2,
  J: 3,
  K: 4,
  L: 5,
};

// 主题配置
export const themes = [
  { name: '蓝色主题', color: '#3498db', secondary: '#2980b9' },
  { name: '绿色主题', color: '#2ecc71', secondary: '#27ae60' },
  { name: '紫色主题', color: '#9b59b6', secondary: '#8e44ad' },
  {
    name: '彩虹主题',
    colors: [
      'rgba(255, 87, 34, 0.95)',
      'rgba(255, 193, 7, 0.95)',
      'rgba(76, 175, 80, 0.95)',
      'rgba(33, 150, 243, 0.95)',
      'rgba(156, 39, 176, 0.95)',
      'rgba(233, 30, 99, 0.95)',
    ],
    secondary: 'rgba(0, 0, 0, 0.1)',
  },
];
