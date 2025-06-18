/**
 * 游戏模式和难度管理
 */
import { gameConfig } from '../config/index.js';

export class DifficultyManager {
  constructor() {
    this.currentDifficulty = gameConfig.difficulty.initialRate;
  }

  randomizeDifficulty() {
    const { minRate, maxRate } = gameConfig.difficulty;
    this.currentDifficulty = minRate + Math.random() * (maxRate - minRate);
    return this.currentDifficulty;
  }

  getCurrentDifficulty() {
    return this.currentDifficulty;
  }

  reset() {
    this.currentDifficulty = gameConfig.difficulty.initialRate;
  }
}

export class ModeManager {
  constructor() {
    this.currentModeIndex = 0;
  }

  switchMode() {
    this.currentModeIndex =
      (this.currentModeIndex + 1) % gameConfig.modes.length;
    return this.getCurrentMode();
  }

  getCurrentMode() {
    return gameConfig.modes[this.currentModeIndex];
  }

  isRowMode() {
    return this.getCurrentMode().type === 'row';
  }

  getModeName() {
    return this.isRowMode() ? '整行' : '单块';
  }
}

export class GameModes {
  constructor() {
    this.difficultyManager = new DifficultyManager();
    this.modeManager = new ModeManager();
  }

  // 代理方法
  getDifficultyManager() {
    return this.difficultyManager;
  }

  getModeManager() {
    return this.modeManager;
  }
}
