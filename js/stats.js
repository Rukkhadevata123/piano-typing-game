/**
 * 游戏统计模块
 * 负责处理游戏中的各种统计数据，包括：
 * - 命中/未命中统计
 * - 连击系统
 * - CPS(每秒按键次数)计算
 * - 准确率计算
 */

// 统计数据
const stats = {
  totalHits: 0, // 总命中次数
  totalMisses: 0, // 总未命中次数
  currentCombo: 0, // 当前连击数
  maxCombo: 0, // 最大连击数
  keyPresses: 0, // 总按键次数
  startTime: Date.now(), // 开始时间戳
};

/**
 * 更新统计数据
 * @param {boolean} isHit - 是否命中目标
 */
function updateStats(isHit) {
  if (isHit) {
    stats.totalHits++;
    stats.currentCombo++;
    stats.maxCombo = Math.max(stats.maxCombo, stats.currentCombo);
  } else {
    stats.totalMisses++;
    stats.currentCombo = 0; // 未命中重置连击
  }
  stats.keyPresses++;

  updateDisplay();
}

/**
 * 计算当前准确率
 * @returns {number} 准确率百分比
 */
function calculateAccuracy() {
  const total = stats.totalHits + stats.totalMisses;
  return total > 0 ? (stats.totalHits / total) * 100 : 0;
}

/**
 * 计算当前CPS
 * @returns {number} 每秒按键次数
 */
function calculateCPS() {
  const elapsedSeconds = (Date.now() - stats.startTime) / 1000;
  return elapsedSeconds > 0 ? stats.keyPresses / elapsedSeconds : 0;
}

/**
 * 更新显示数据
 */
function updateDisplay() {
  // 更新准确率显示
  const accuracy = calculateAccuracy();
  document.getElementById("accuracy").textContent =
    `准确率: ${accuracy.toFixed(1)}%`;

  // 更新CPS显示
  const cps = calculateCPS();
  document.getElementById("cps").textContent = `CPS: ${cps.toFixed(2)}`;

  // 更新连击显示
  document.getElementById("combo").textContent = `连击: ${stats.currentCombo}`;
}

/**
 * 获取最终统计数据
 * @returns {Object} 包含所有统计数据的对象
 */
function getFinalStats() {
  return {
    accuracy: calculateAccuracy().toFixed(1),
    cps: calculateCPS().toFixed(2),
    maxCombo: stats.maxCombo,
    totalHits: stats.totalHits,
    totalMisses: stats.totalMisses,
  };
}

/**
 * 重置所有统计数据
 */
function resetStats() {
  stats.totalHits = 0;
  stats.totalMisses = 0;
  stats.currentCombo = 0;
  stats.maxCombo = 0;
  stats.keyPresses = 0;
  stats.startTime = Date.now();
  updateDisplay();
}

export { updateStats, resetStats, getFinalStats };
