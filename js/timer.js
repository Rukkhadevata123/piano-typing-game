/**
 * 游戏计时器模块
 * 负责处理游戏计时相关的功能，包括：
 * - 倒计时的开始、暂停和重置
 * - 时间显示的更新
 * - 游戏结束的触发
 */

import { endGame } from "./game.js";
import { saveHighScore } from "./score.js";

// 计时器状态
const timerState = {
  timer: null, // 计时器引用
  timeLeft: 0, // 剩余时间
  isRunning: false, // 计时器运行状态
};

/**
 * 开始计时
 * @param {number} duration - 游戏时长（秒）
 */
function startTimer(duration) {
  // 清理可能存在的旧计时器
  stopTimer();

  timerState.timeLeft = duration;
  timerState.isRunning = true;
  updateTimerDisplay();

  timerState.timer = setInterval(() => {
    timerState.timeLeft--;
    updateTimerDisplay();

    if (timerState.timeLeft <= 0) {
      handleTimeUp();
    }
  }, 1000);
}

/**
 * 更新时间显示
 */
function updateTimerDisplay() {
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    timerElement.textContent = `剩余时间: ${timerState.timeLeft} 秒`;
  }
}

/**
 * 处理时间结束
 */
function handleTimeUp() {
  stopTimer();
  saveHighScore();
  endGame();
}

/**
 * 停止计时器
 */
function stopTimer() {
  if (timerState.timer) {
    clearInterval(timerState.timer);
    timerState.timer = null;
  }
  timerState.isRunning = false;
}

/**
 * 重置计时器
 */
function resetTimer() {
  stopTimer();
  timerState.timeLeft = 0;
  updateTimerDisplay();
}

export { startTimer, stopTimer, resetTimer };
