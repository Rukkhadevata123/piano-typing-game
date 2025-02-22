/**
 * 分数管理模块
 * 负责处理游戏分数相关的所有功能，包括：
 * - 分数的增加和重置
 * - 最高分记录的保存和读取
 * - 分数显示的更新
 */

// 游戏分数状态
const scoreState = {
  current: 0,
  highScores: JSON.parse(localStorage.getItem("highScores") || "[]"),
};

/**
 * 增加分数
 * @param {number} points - 要增加的分数，可以是负数
 */
function increaseScore(points) {
  scoreState.current = Math.max(0, scoreState.current + points);
  displayScore();
}

/**
 * 更新分数显示
 */
function displayScore() {
  const scoreElement = document.getElementById("score");
  if (scoreElement) {
    scoreElement.textContent = `分数: ${scoreState.current}`;
  }
}

/**
 * 获取当前分数
 * @returns {number} 当前分数
 */
function getScore() {
  return scoreState.current;
}

/**
 * 保存最高分记录
 * 将当前分数添加到最高分列表，并只保留前5个最高分
 */
function saveHighScore() {
  scoreState.highScores.push(scoreState.current);
  scoreState.highScores.sort((a, b) => b - a);
  scoreState.highScores.splice(5); // 只保留前5个最高分
  localStorage.setItem("highScores", JSON.stringify(scoreState.highScores));
}

/**
 * 重置分数
 */
function resetScore() {
  scoreState.current = 0;
  displayScore();
}

export {
  increaseScore,
  displayScore,
  resetScore,
  saveHighScore,
  getScore,
  scoreState as highScores, // 导出时重命名，保持向后兼容
};
