/**
 * 应用入口文件
 */
import { Game } from './core/Game.js';

/**
 * 游戏初始化
 */
function initGame() {
  try {
    const game = new Game();
    window.gameInstance = game; // 方便调试
    game.init();
  } catch (error) {
    console.error('游戏初始化失败:', error);
    showErrorMessage('游戏加载失败，请刷新页面重试。', error.message);
  }
}

/**
 * 错误信息显示
 */
function showErrorMessage(title, detail) {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.innerHTML = `
      <div class="error-message">
        ${title}
        <br>
        错误信息: ${detail}
      </div>
    `;
  }
}

// DOM 加载完成后直接启动游戏
document.addEventListener('DOMContentLoaded', initGame);
