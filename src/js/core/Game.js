/**
 * 游戏主控制器
 */
import { Board } from './Board.js';
import { GameModes } from './GameModes.js';
import { ScoreSystem } from './ScoreSystem.js';
import { StatsManager } from './StatsManager.js';
import { RatingSystem } from './RatingSystem.js';
import { GameUI } from '../ui/GameUI.js';
import { InputManager } from '../input/InputManager.js';
import { gameConfig } from '../config/index.js';
import { safeStorage } from '../utils/storage.js';
import { playSound } from '../utils/audio.js';
import { BackgroundManager } from '../utils/background.js';
import { formatTime } from '../utils/helpers.js';

export class Game {
  constructor() {
    console.log('[Game] 初始化');

    // 初始化游戏模式和难度管理器
    this.modes = new GameModes();

    // 初始化核心组件
    this.board = new Board(this.modes.getDifficultyManager());
    this.scoreSystem = new ScoreSystem();
    this.statsManager = new StatsManager();
    this.ratingSystem = new RatingSystem();

    // 初始化UI和输入
    this.ui = new GameUI(this);
    this.inputManager = new InputManager(this);

    // 游戏状态
    this.timeLeft = gameConfig.timeDurations[0];
    this.currentTimeIndex = parseInt(safeStorage.get('currentTimeIndex', '0'));
    this.gameOver = false;
    this.isPlaying = false;
    this.timer = null;
    this.currentLevel = null;

    this.setupCallbacks();
    this.setupRatingSystem();

    // 设置背景
    void BackgroundManager.setRandomBackground();
  }

  init() {
    console.log('[Game] 启动游戏');
    this.cleanup();
    this.reset();
    this.ui.initialize();
    this.initEventListeners();
    this.ui.markAsLoaded();
  }

  initEventListeners() {
    this.inputManager.init();
    this.ui.bindRestartButton(() => this.init());
  }

  // === 事件系统设置 ===
  setupCallbacks() {
    // 统计更新事件
    this.statsManager.on('statsUpdated', (data) => {
      this.ui.updateStats(data.currentStats);
    });

    // 专注模式游戏结束
    this.statsManager.on('focusGameEnd', (data) => {
      console.log(
        `[Game] 专注模式${data.reason === 'timeout' ? '超时' : '连续失误'}结束游戏`
      );
      this.endGame();
    });

    // 专注模式状态变化
    this.statsManager.on('focusModeChanged', (data) => {
      this.ui.updateFocusMode(data.focusMode);
    });

    // 分数变化
    this.scoreSystem.onScoreChange = (score, details) => {
      this.ui.updateScore(score, details);
    };
  }

  setupRatingSystem() {
    const currentRating = this.ratingSystem.getRating();
    this.currentLevel = currentRating.level;

    this.ratingSystem.onRatingUpdated = () => {
      const newRatingData = this.ratingSystem.getRating();
      const oldLevel = this.currentLevel;
      const newLevel = newRatingData.level;

      this.ui.updateRating(newRatingData);

      if (oldLevel.name !== newLevel.name) {
        const isLevelUp = this.ratingSystem.isLevelHigher(newLevel, oldLevel);
        this.ui.showLevelChangeAnimation(oldLevel, newLevel, isLevelUp);
        this.currentLevel = newLevel;
      }
    };
  }

  // === 核心游戏逻辑 ===
  reset() {
    console.log('[Game] 重置游戏');
    this.gameOver = false;
    this.isPlaying = false;
    this.timeLeft = gameConfig.timeDurations[this.currentTimeIndex];

    this.stopTimer();
    this.board.initialize();
    this.scoreSystem.reset();
    this.statsManager.reset();
    this.modes.getDifficultyManager().reset();
  }

  handleColumnInput(column) {
    if (this.gameOver) return;

    requestAnimationFrame(() => {
      const result = this.processInput(column);
      this.ui.updateGameState(result);
    });
  }

  processInput(column) {
    const isHit = this.board.getCell(gameConfig.rows - 1, column) === 1;

    if (isHit) {
      return this.handleHit(column);
    } else {
      return this.handleMiss(column);
    }
  }

  handleHit(column) {
    this.board.setCell(gameConfig.rows - 1, column, 0);

    // 更新统计
    this.statsManager.update(true);
    this.statsManager.recordHit();

    // 计算得分
    const stats = this.statsManager.getStats();
    const scoreDetails = this.scoreSystem.calculateScore(
      true,
      stats,
      this.timeLeft,
      gameConfig.timeDurations[this.currentTimeIndex]
    );

    void playSound('tap');

    // 首次命中启动游戏
    if (!this.isPlaying) {
      this.startGame();
    }

    // 处理方块下落
    this.processBlockDrop(column);

    return {
      type: 'hit',
      column,
      scoreDetails,
      stats,
      needsRender: true,
      comboMilestone:
        scoreDetails.details.milestoneBonus > 0
          ? {
              combo: stats.currentCombo,
              points: scoreDetails.details.milestoneBonus,
            }
          : null,
    };
  }

  handleMiss(column) {
    void playSound('error');

    // 检查专注模式
    const gameEndedByFocus = this.statsManager.recordMiss();
    if (gameEndedByFocus) {
      this.endGame();
      return { type: 'gameEnd' };
    }

    // 在更新统计前获取当前统计信息
    const statsBeforeUpdate = this.statsManager.getStats();

    // 计算得分
    const scoreDetails = this.scoreSystem.calculateScore(
      false,
      statsBeforeUpdate,
      this.timeLeft,
      gameConfig.timeDurations[this.currentTimeIndex]
    );

    // 检查连击中断
    const hasSignificantCombo = statsBeforeUpdate.currentCombo > 5;
    const hasComboPenalty = scoreDetails.details.comboPenalty > 0;

    // 更新统计
    this.statsManager.update(false);

    const stats = this.statsManager.getStats();

    return {
      type: 'miss',
      column,
      scoreDetails,
      stats,
      comboBreak:
        hasSignificantCombo && hasComboPenalty
          ? {
              combo: statsBeforeUpdate.currentCombo,
              penalty: scoreDetails.details.comboPenalty,
            }
          : null,
    };
  }

  processBlockDrop(column) {
    this.modes.getDifficultyManager().randomizeDifficulty();

    if (this.modes.getModeManager().isRowMode()) {
      if (this.board.isRowEmpty(gameConfig.rows - 1)) {
        this.board.dropAllRows();
      }
    } else {
      this.board.dropSingleColumn(column);
    }
  }

  startGame() {
    this.isPlaying = true;
    this.statsManager.startPlaying();
    this.startTimer();
  }

  startTimer() {
    this.stopTimer();

    const tick = () => {
      if (this.timeLeft <= 0) {
        this.endGame();
        return;
      }

      this.timeLeft--;
      this.ui.updateTimer(this.timeLeft);
      this.timer = setTimeout(tick, 1000);
    };

    tick();
  }

  stopTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  endGame() {
    if (this.gameOver) return;

    console.log('[Game] 游戏结束');
    this.gameOver = true;
    this.isPlaying = false;
    this.stopTimer();
    this.statsManager.stopPlaying();

    const stats = this.statsManager.getStats();
    const score = this.scoreSystem.getScore();
    const duration = gameConfig.timeDurations[this.currentTimeIndex];

    this.scoreSystem.saveHighScore();
    this.saveGameHistory(stats, score);

    // 更新等级分
    const gameData = {
      score,
      duration,
      stats,
      mode: this.modes.getModeManager().getCurrentMode().type,
    };

    const ratingResult = this.ratingSystem.updateRating(
      gameData,
      this.statsManager.focusMode
    );

    void playSound('gameOver');
    this.ui.showFinalStats(stats, score, duration, ratingResult);
  }

  saveGameHistory(stats, score) {
    const { type: modeType } = this.modes.getModeManager().getCurrentMode();
    const duration = gameConfig.timeDurations[this.currentTimeIndex];

    if (stats && score !== undefined && modeType) {
      this.ui.updateHistory(duration, modeType, stats, score);
    }
  }

  // === 输入处理方法（供InputManager调用）===
  toggleFocusMode() {
    if (this.isGameRunning()) {
      console.log('[Game] 游戏进行中，无法切换专注模式');
      return this.statsManager.focusMode;
    }

    const isFocusMode = this.statsManager.toggleFocusMode();
    this.ui.updateFocusMode(isFocusMode);
    this.ui.notifications.showFocusModeNotification(isFocusMode);

    return isFocusMode;
  }

  switchGameTime() {
    if (!this.canSwitchSettings()) return;

    this.currentTimeIndex =
      (this.currentTimeIndex + 1) % gameConfig.timeDurations.length;
    this.timeLeft = gameConfig.timeDurations[this.currentTimeIndex];
    safeStorage.set('currentTimeIndex', this.currentTimeIndex);

    const timeText = formatTime(this.timeLeft);
    this.ui.updateTimer(this.timeLeft);
    this.ui.notifications.showTimeNotification(timeText);
  }

  switchGameMode() {
    if (!this.canSwitchSettings()) return;

    const mode = this.modes.getModeManager().switchMode();
    this.ui.notifications.showModeNotification(mode.name);
    this.ui.updateMode(this.modes.getModeManager().getModeName());
  }

  switchTheme() {
    return this.ui.switchTheme();
  }

  // === 状态访问（供InputManager使用）===
  get state() {
    return {
      isOver: () => this.gameOver,
      canSwitchSettings: () => this.canSwitchSettings(),
    };
  }

  isGameRunning() {
    return this.isPlaying && !this.gameOver;
  }

  canSwitchSettings() {
    return this.gameOver || !this.isPlaying;
  }

  getTimeLeft() {
    return this.timeLeft;
  }

  cleanup() {
    this.stopTimer();
    this.statsManager.stopPlaying();
    this.ui.cleanup();
  }
}
