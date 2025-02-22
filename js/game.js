/**
 * 游戏核心模块
 * 负责处理游戏主要逻辑，包括：
 * - 游戏板初始化和渲染
 * - 按键处理
 * - 方块生成和消除
 * - 分数统计
 * - 游戏状态管理
 */

import { playSound } from "../audio/sounds.js";
import { increaseScore, resetScore, getScore } from "./score.js";
import { startTimer, stopTimer, resetTimer } from "./timer.js";
import { updateStats, resetStats, getFinalStats } from "./stats.js";

// 游戏核心配置
const gameConfig = {
  rows: 6,
  columns: 6,
  initialDuration: 60,
  points: {
    hit: 10,
    miss: -5,
  },
  difficulty: {
    minRate: 0.3,      // 最小生成概率
    maxRate: 0.6,      // 最大生成概率
    initialRate: 0.4,  // 初始概率
    minBlocks: 1,      // 每行最少方块数
    maxBlocks: 4,      // 每行最多方块数
    maxConsecutive: 3  // 最大连续方块数
  },
};

// 游戏状态
let board = [];
let gameOver = false;
let currentDifficulty = gameConfig.difficulty.initialRate;

/**
 * 生成随机难度
 * 在最小和最大概率之间完全随机
 */
function randomizeDifficulty() {
  const { minRate, maxRate } = gameConfig.difficulty;
  const range = maxRate - minRate;
  currentDifficulty = minRate + Math.random() * range;
}

/**
 * 生成随机二进制行
 * @returns {Array<number>} 包含0和1的数组
 */
function generateRandomRow() {
  let row;
  do {
    row = Array.from({ length: gameConfig.columns }, () => 
      Math.random() < currentDifficulty ? 1 : 0
    );
  } while (!isValidRow(row));
  return row;
}

/**
 * 验证行的有效性
 * @param {Array<number>} row - 要验证的行
 * @returns {boolean} 是否是有效的行
 */
function isValidRow(row) {
  const { minBlocks, maxBlocks, maxConsecutive } = gameConfig.difficulty;
  
  // 计算方块总数
  const totalBlocks = row.filter(cell => cell === 1).length;
  if (totalBlocks < minBlocks || totalBlocks > maxBlocks) return false;

  // 检查连续方块
  let consecutive = 0;
  for (let cell of row) {
    if (cell === 1) {
      consecutive++;
      if (consecutive > maxConsecutive) return false;
    } else {
      consecutive = 0;
    }
  }

  return true;
}

/**
 * 初始化游戏
 */
function initGame() {
  // 重置游戏状态
  resetScore();
  resetTimer();
  resetStats();
  gameOver = false;

  // 初始化难度
  currentDifficulty = gameConfig.difficulty.initialRate;

  // 初始化游戏板
  board = Array.from({ length: gameConfig.rows }, () => generateRandomRow());

  // 开始游戏
  renderBoard();
  startTimer(gameConfig.initialDuration);
  document.getElementById("game-over").style.display = "none";
  
  // 添加加载完成标记
  document.getElementById("game-container").classList.add("loaded");
}

/**
 * 渲染游戏板
 */
function renderBoard() {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";

  board.forEach((row, rowIndex) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    row.forEach((cell, colIndex) => {
      const cellDiv = document.createElement("div");
      cellDiv.className = `cell ${cell === 1 ? "filled" : ""}`;
      cellDiv.dataset.row = rowIndex;
      cellDiv.dataset.col = colIndex;
      rowDiv.appendChild(cellDiv);
    });

    gameBoard.appendChild(rowDiv);
  });
}

/**
 * 处理整行下落
 */
function dropAllRows() {
  board.pop();
  randomizeDifficulty();  // 完全随机化难度
  board.unshift(generateRandomRow());
  renderBoard();
}

/**
 * 处理按键事件
 * @param {KeyboardEvent} event 键盘事件
 */
function handleKeyPress(event) {
  if (gameOver) return;

  const keyMap = { A: 0, S: 1, D: 2, J: 3, K: 4, L: 5 };
  const column = keyMap[event.key.toUpperCase()];

  if (column !== undefined) {
    const lastRow = gameConfig.rows - 1;
    if (board[lastRow][column] === 1) {
      // 命中处理
      board[lastRow][column] = 0;
      increaseScore(gameConfig.points.hit);
      playSound("tap");
      updateStats(true);

      // 检查是否需要下落
      if (board[lastRow].every(cell => cell === 0)) {
        dropAllRows();
      }
    } else {
      // 未命中处理
      increaseScore(gameConfig.points.miss);
      playSound("error");
      updateStats(false);
    }

    renderBoard();
  }
}

/**
 * 更新历史记录
 * @param {Object} stats 游戏统计数据
 * @param {number} finalScore 最终得分
 */
function updateHistory(stats, finalScore) {
  const historyContainer = document.getElementById("history-stats");
  const historyEntry = document.createElement("div");
  historyEntry.className = "history-entry";

  historyEntry.innerHTML = `
    <div>得分: ${finalScore}</div>
    <div>CPS: ${stats.cps}</div>
    <div>准确率: ${stats.accuracy}%</div>
    <div>最大连击: ${stats.maxCombo}</div>
  `;

  // 保持最近3条记录
  while (historyContainer.children.length >= 3) {
    historyContainer.removeChild(historyContainer.firstChild);
  }

  historyContainer.appendChild(historyEntry);
}

/**
 * 结束游戏
 */
function endGame() {
  gameOver = true;
  stopTimer();
  playSound("gameOver");

  const stats = getFinalStats();
  const finalScore = getScore();

  updateHistory(stats, finalScore);

  // 更新结束界面
  document.getElementById("final-score").textContent = finalScore;
  document.getElementById("final-cps").textContent = stats.cps;
  document.getElementById("final-accuracy").textContent = `${stats.accuracy}%`;
  document.getElementById("final-max-combo").textContent = stats.maxCombo;

  document.getElementById("game-over").style.display = "block";
}

// 事件监听器
document.addEventListener("keydown", handleKeyPress);
document.getElementById("restart-button").addEventListener("click", initGame);

export { initGame, endGame };

// 启动游戏
initGame();