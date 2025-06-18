/**
 * 输入管理器 - 统一处理键盘和触摸输入
 */
import { keyMap } from '../config/index.js';

export class InputManager {
  constructor(game) {
    this.game = game;
    this.keyboardEnabled = true;
    this.touchEnabled = true;

    // 绑定方法上下文
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  init() {
    this.initKeyboard();
    this.initTouch();
  }

  // === 键盘输入处理 ===
  initKeyboard() {
    if (this.keyboardEnabled) {
      document.addEventListener('keydown', this.handleKeyPress);
    }
  }

  handleKeyPress(event) {
    const key = event.key.toUpperCase();

    // 专注模式切换
    if (key === 'F') {
      event.preventDefault();
      this.game.toggleFocusMode();
      return;
    }

    // 主题切换
    if (key === 'T') {
      this.game.switchTheme();
      return;
    }

    // 游戏时长切换
    if (key === 'Q' && this.game.state.canSwitchSettings()) {
      this.game.switchGameTime();
      return;
    }

    // 游戏模式切换
    if (key === 'R' && this.game.state.canSwitchSettings()) {
      this.game.switchGameMode();
      return;
    }

    // 空格键重新开始游戏
    if (key === ' ' || key === 'SPACE') {
      if (this.game.state.isOver()) {
        this.game.init();
        return;
      }
    }

    // 游戏结束时不处理列输入
    if (this.game.state.isOver()) return;

    // 处理列输入
    const column = keyMap[key];
    if (typeof column === 'number') {
      this.updateActionTime();
      this.game.handleColumnInput(column);
    }
  }

  // === 触摸输入处理 ===
  initTouch() {
    if (this.touchEnabled) {
      const gameBoard = document.getElementById('game-board');
      if (gameBoard) {
        gameBoard.addEventListener('click', this.handleClick);
        gameBoard.addEventListener('touchstart', this.handleClick, {
          passive: false,
        });
      }
    }
  }

  handleClick(event) {
    event.preventDefault();

    const cell = event.target;
    if (cell.classList.contains('cell') && !this.game.state.isOver()) {
      const column = parseInt(cell.dataset.col);

      if (!isNaN(column)) {
        this.updateActionTime();
        this.game.handleColumnInput(column);
      }
    }
  }

  // === 专注模式支持 ===
  updateActionTime() {
    if (this.game.statsManager.focusMode) {
      this.game.statsManager.updateLastActionTime();
    }
  }
}
