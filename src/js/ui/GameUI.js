/**
 * 主UI控制器 - 整合UIManager和GameRenderer的功能
 */
import { BoardRenderer } from './BoardRenderer.js';
import { NotificationSystem } from './NotificationSystem.js';
import { ThemeManager } from './ThemeManager.js';
import { safeStorage } from '../utils/storage.js';
import { formatTime } from '../utils/helpers.js';

export class GameUI {
  constructor(game) {
    console.log('[GameUI] 初始化');
    this.game = game;

    // 子组件
    this.boardRenderer = new BoardRenderer(game.board);
    this.notifications = new NotificationSystem();
    this.themeManager = new ThemeManager();

    // UI状态
    this.history = safeStorage.get('gameHistory', []);
    this.restartHandler = null;

    // 初始化主题
    this.initTheme();
  }

  initTheme() {
    this.themeManager.applyCurrentTheme();
    this.boardRenderer.setThemeIndex(this.themeManager.getCurrentThemeIndex());
  }

  // === 游戏初始化 ===
  initialize() {
    console.log('[GameUI] 初始化UI');

    // 渲染游戏板
    this.renderBoard();

    // 初始化UI状态
    this.updateMode(this.game.modes.getModeManager().getModeName());
    this.updateTimer(this.game.getTimeLeft());
    this.updateStats(this.game.statsManager.getStats());
    this.updateScore(this.game.scoreSystem.getScore());
    this.updateRating(this.game.ratingSystem.getRating());

    this.hideGameOver();
  }

  // === 渲染方法 ===
  renderBoard() {
    const gameBoard = this.getElementById('game-board');
    this.boardRenderer.renderBoard(gameBoard);
  }

  updateGameState(result) {
    // 立即渲染保证UI同步
    if (result.needsRender) {
      this.renderBoard();
    }

    switch (result.type) {
      case 'hit':
        this.handleHitResult(result);
        break;
      case 'miss':
        this.handleMissResult(result);
        break;
      case 'gameEnd':
        break;
    }
  }

  handleHitResult(result) {
    if (result.comboMilestone) {
      this.notifications.showComboMilestone(
        result.comboMilestone.combo,
        result.comboMilestone.points
      );

      // 显示常规分数反馈（不显示连击信息避免重复）
      const feedbackDetails = { ...result.scoreDetails };
      feedbackDetails.details.milestoneBonus = 0;
      this.showScoreFeedback(feedbackDetails, result.column);
    } else {
      this.showScoreFeedback(result.scoreDetails, result.column);
    }
  }

  handleMissResult(result) {
    if (result.comboBreak) {
      this.notifications.showComboBreak(
        result.comboBreak.combo,
        result.comboBreak.penalty
      );
    }
    this.showScoreFeedback(result.scoreDetails, result.column);
  }

  showScoreFeedback(scoreDetails, column = null) {
    const scoreElement = this.getElementById('score');
    const gameBoard = this.getElementById('game-board');
    this.notifications.showScoreFeedback(
      scoreDetails,
      column,
      scoreElement,
      gameBoard
    );
  }

  // === 基础UI更新 ===
  updateTimer(timeLeft) {
    this.updateStatCard(
      'timer',
      `${typeof timeLeft === 'number' ? formatTime(timeLeft) : timeLeft}`
    );
  }

  updateStats(stats) {
    this.updateStatCard('accuracy', `${stats.accuracy}%`);
    this.updateStatCard('cps', stats.cps.toFixed(1));
    this.updateStatCard('combo', stats.currentCombo);
  }

  updateMode(modeText) {
    this.updateStatCard('mode', modeText);
  }

  updateScore(score, details) {
    this.updateStatCard('score', score);

    if (details?.multipliers) {
      this._updateMultiplier(details.multipliers.total);
    }
  }

  updateRating(ratingData) {
    // 更新等级分显示
    const ratingEl = this._getElement('player-rating');
    if (ratingEl) {
      ratingEl.innerHTML = `等级分: ${ratingData.rating.toFixed(1)} <button id="rating-details-button" title="查看等级分详情">ⓘ</button>`;

      // 绑定按钮点击事件
      const btn = ratingEl.querySelector('#rating-details-button');
      if (btn) {
        btn.onclick = () => this.showRatingDetails();
      }
    }

    // 更新等级显示
    const levelEl = this._getElement('rating-level');
    if (levelEl) {
      levelEl.innerHTML = `<span style="color:${ratingData.level.color}">${ratingData.level.name}</span>`;
      this._addLevelTooltip(levelEl);
    }
  }

  // === 统计卡片更新 ===
  updateStatCard(type, value) {
    const card = document.querySelector(`[data-stat="${type}"]`);
    if (!card) return;

    const valueElement = card.querySelector('.stat-value');
    if (valueElement) {
      valueElement.textContent = value;

      // 添加更新动画
      card.classList.add('updated');
      setTimeout(() => {
        card.classList.remove('updated');
      }, 300);
    }
  }

  // === 主题切换 ===
  switchTheme() {
    const themeName = this.themeManager.switchTheme();
    this.boardRenderer.setThemeIndex(this.themeManager.getCurrentThemeIndex());
    this.renderBoard();
    this.notifications.showThemeNotification(themeName);
    return themeName;
  }

  updateFocusMode(isFocusMode) {
    const gameTitle = document.querySelector('h1');
    if (gameTitle) {
      gameTitle.style.color = isFocusMode ? '#e74c3c' : '';
    }
  }

  // === 游戏结束界面 ===
  showFinalStats(stats, finalScore, duration, ratingResult = null) {
    const gameOver = this._getElement('game-over');
    if (!gameOver) return;

    this._updateElement(
      'final-duration',
      duration ? formatTime(duration) : '0s'
    );
    this._updateElement('final-score', finalScore);
    this._updateElement('final-cps', stats.cps.toFixed(2));
    this._updateElement('final-accuracy', `${stats.accuracy.toFixed(2)}%`);
    this._updateElement('final-max-combo', stats.maxCombo);

    this._updateRatingResult(ratingResult);

    setTimeout(() => {
      gameOver.style.display = 'block';
      requestAnimationFrame(() => gameOver.classList.add('show'));
    }, 1000);
  }

  hideGameOver() {
    const gameOver = this._getElement('game-over');
    if (!gameOver) return;

    gameOver.classList.remove('show');
    setTimeout(() => (gameOver.style.display = 'none'), 300);
  }

  // === 段位动画 ===
  showLevelChangeAnimation(oldLevel, newLevel, isLevelUp = true) {
    if (!oldLevel || !newLevel || oldLevel.name === newLevel.name) return;

    const gameOver = this._getElement('game-over');
    if (gameOver && gameOver.classList.contains('show')) {
      gameOver.classList.remove('show');
      setTimeout(() => (gameOver.style.display = 'none'), 300);
    }

    const container = document.createElement('div');
    container.className = `level-change-animation ${isLevelUp ? '' : 'level-down'}`;

    container.innerHTML = `
      <div class="level-change-content">
        <div class="level-change-title">${isLevelUp ? '段位晋升' : '段位下降'}</div>
        <div class="level-change-from" style="color:${oldLevel.color}">${oldLevel.name}</div>
        <div class="level-change-arrow">${isLevelUp ? '→' : '↓'}</div>
        <div class="level-change-to" style="color:${newLevel.color}">${newLevel.name}</div>
      </div>
    `;

    document.body.appendChild(container);
    setTimeout(() => container.classList.add('show'), 100);
    setTimeout(() => this._removeElement(container), 4000);
  }

  // === 事件绑定 ===
  bindRestartButton(handler) {
    const button = this._getElement('restart-button');
    if (!button) return;

    this.unbindRestartButton();
    this.restartHandler = (e) => {
      e.preventDefault();
      button.disabled = true;
      handler();
      setTimeout(() => (button.disabled = false), 1000);
    };
    button.addEventListener('click', this.restartHandler);
  }

  unbindRestartButton() {
    const button = this._getElement('restart-button');
    if (button && this.restartHandler) {
      button.removeEventListener('click', this.restartHandler);
      this.restartHandler = null;
    }
  }

  // === 历史记录 ===
  updateHistory(duration, mode, stats, score) {
    const entry = { duration, mode, stats, score, timestamp: Date.now() };
    this.history.push(entry);
    if (this.history.length > 1) this.history.shift();
    safeStorage.set('gameHistory', this.history);
    this._updateHistoryUI(entry);
  }

  // === 工具方法 ===
  getElementById(id) {
    return this._getElement(id);
  }

  markAsLoaded() {
    const container = this._getElement('game-container');
    if (container) container.classList.add('loaded');
  }

  // === 清理 ===
  cleanup() {
    this.unbindRestartButton();
    this.notifications.clearAll();
  }

  // === 私有方法 ===
  _getElement(id) {
    return document.getElementById(id.replace(/_/g, '-'));
  }

  _updateElement(id, content) {
    const el = this._getElement(id);
    if (el) el.textContent = content;
  }

  _updateMultiplier(multiplierValue) {
    let multiplierEl = document.getElementById('multiplier');

    if (!multiplierEl) {
      const scoreCard = document.querySelector('[data-stat="score"]');
      if (!scoreCard) return;

      multiplierEl = document.createElement('div');
      multiplierEl.id = 'multiplier';
      multiplierEl.className = 'multiplier';
      scoreCard.appendChild(multiplierEl);
    }

    const oldValue = parseFloat(multiplierEl.dataset.value || '1.0');
    const newValue = parseFloat(multiplierValue);

    multiplierEl.textContent = `×${multiplierValue}`;
    multiplierEl.dataset.value = newValue.toString();

    multiplierEl.className = `multiplier ${newValue >= 4 ? 'excellent' : newValue >= 2.5 ? 'good' : 'normal'}`;

    if (Math.abs(newValue - oldValue) > 0.1) {
      const animationClass = newValue > oldValue ? 'pulse-up' : 'pulse-down';
      multiplierEl.classList.add(animationClass);

      const handleAnimationEnd = (event) => {
        if (
          event.animationName ===
          (newValue > oldValue ? 'pulseUp' : 'pulseDown')
        ) {
          multiplierEl.classList.remove(animationClass);
        }
      };
      multiplierEl.addEventListener('animationend', handleAnimationEnd, {
        once: true,
      });
    }
  }

  _updateRatingResult(ratingResult) {
    const container = document.getElementById('rating-container');
    if (!container) return;

    if (ratingResult?.changed) {
      this._updateElement('game-rating', ratingResult.gameRating.toFixed(1));
      this._updateElement(
        'current-rating',
        ratingResult.currentRating.toFixed(1)
      );

      const newBestContainer = document.getElementById('new-best-container');
      if (newBestContainer) {
        newBestContainer.style.display = ratingResult.isNewBest
          ? 'block'
          : 'none';
      }

      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  }

  _updateHistoryUI(entry) {
    const container = document.getElementById('history-stats');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'history-entry';

    div.innerHTML = `
      <div class="history-header">
        <span>时长: ${formatTime(entry.duration)}</span>
        <span>模式: ${entry.mode === 'row' ? '整行' : '单块'}</span>
      </div>
      <div>得分</div>
      <div>${entry.score}</div>
      <div>CPS</div>
      <div>${entry.stats.cps.toFixed(1)}</div>
      <div>准确率</div>
      <div>${entry.stats.accuracy.toFixed(1)}%</div>
      <div>最大连击</div>
      <div>${entry.stats.maxCombo}</div>
    `;

    container.innerHTML = '';
    container.appendChild(div);
  }

  _removeElement(element) {
    element.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    }, 1000);
  }

  _addLevelTooltip(levelEl) {
    const existingTooltip = document.querySelector('.level-tooltip-global');
    if (existingTooltip) {
      existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'level-tooltip-global';
    tooltip.innerHTML = `
      <div class="level-tooltip-title">段位等级</div>
      ${this._generateLevelTooltipItems()}
    `;

    document.body.appendChild(tooltip);

    levelEl.addEventListener('mouseenter', (e) => {
      this._positionTooltip(tooltip, e.currentTarget);
      tooltip.classList.add('show');
    });

    levelEl.addEventListener('mouseleave', () => {
      tooltip.classList.remove('show');
    });

    window.addEventListener('beforeunload', () => {
      if (document.body.contains(tooltip)) {
        document.body.removeChild(tooltip);
      }
    });
  }

  _positionTooltip(tooltip, triggerElement) {
    const rect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.right + 12;
    let top = rect.top;

    if (left + 320 > viewportWidth - 16) {
      left = rect.left - 320 - 12;
    }

    if (left < 16) {
      left = (viewportWidth - 320) / 2;
    }

    if (top + 400 > viewportHeight - 16) {
      top = viewportHeight - 400 - 16;
    }

    if (top < 16) {
      top = 16;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  _generateLevelTooltipItems() {
    const levels = [
      { name: '青铜等级', color: '#cd7f32', range: '0-5000' },
      { name: '白银等级', color: '#c0c0c0', range: '5000-6250' },
      { name: '黄金等级', color: '#ffd700', range: '6250-7500' },
      { name: '蓝宝石等级', color: '#0073cf', range: '7500-8750' },
      { name: '红宝石等级', color: '#e0115f', range: '8750-10000' },
      { name: '绿宝石等级', color: '#50c878', range: '10000-11250' },
      { name: '紫水晶等级', color: '#9966cc', range: '11250-12500' },
      { name: '珍珠等级', color: '#fdeef4', range: '12500-13750' },
      { name: '黑曜石等级', color: '#413839', range: '13750-15000' },
      { name: '钻石等级', color: '#b9f2ff', range: '15000+' },
    ];

    return levels
      .map(
        (level) => `
        <div class="level-tooltip-item">
          <span style="color:${level.color}">${level.name}</span>
          <span>${level.range}</span>
        </div>
      `
      )
      .join('');
  }

  // === 等级分详情弹窗 ===
  showRatingDetails() {
    if (!this.game.ratingSystem || document.querySelector('.modal-overlay'))
      return;

    const records = this.game.ratingSystem.getBestRecords();
    const ratingData = this.game.ratingSystem.getRating();

    const overlay = this._createModal();
    const modal = this._createRatingModal(ratingData, records);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('show'));
  }

  _createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const closeModal = () => {
      overlay.classList.add('closing');
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 300);
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });

    return overlay;
  }

  _createRatingModal(ratingData, records) {
    const modal = document.createElement('div');
    modal.className = 'rating-details-modal';
    modal.onclick = (e) => e.stopPropagation();

    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h2>玩家等级分详情</h2>
        <button id="close-modal-btn" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
      </div>
      
      <p class="current-rating">
        当前等级分: <span>${ratingData.rating.toFixed(1)}</span> 
        <span class="level-badge" style="color:${ratingData.level.color}">${ratingData.level.name}</span>
      </p>
      
      <p>总游戏场次: ${ratingData.games}</p>
      
      ${this._createRecordsTable(records)}
      
      <div class="rating-button-container">
        <button class="modal-button export-button" id="export-data-btn">
          <span>📊</span> <span>导出记录</span>
        </button>
        <button class="modal-button close-button" id="close-modal-btn-2">
          <span>✖</span> <span>关闭</span>
        </button>
      </div>
    `;

    // 绑定事件
    const closeBtn = modal.querySelector('#close-modal-btn');
    const closeBtn2 = modal.querySelector('#close-modal-btn-2');
    const exportBtn = modal.querySelector('#export-data-btn');

    if (closeBtn) {
      closeBtn.onclick = () => {
        const overlay = modal.closest('.modal-overlay');
        if (overlay) overlay.click();
      };
    }

    if (closeBtn2) {
      closeBtn2.onclick = () => {
        const overlay = modal.closest('.modal-overlay');
        if (overlay) overlay.click();
      };
    }

    if (exportBtn) {
      exportBtn.onclick = () => this._exportRatingData(records);
    }

    return modal;
  }

  _createRecordsTable(records) {
    if (!records || records.length === 0) {
      return '<p>暂无游戏记录</p>';
    }

    const rows = records
      .map((record, index) => {
        const date = new Date(record.date);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        const focusTag = record.focusMode
          ? '<span class="focus-mode-tag">专注</span>'
          : '';

        return `
          <tr ${record.focusMode ? 'class="focus-mode-record"' : ''}>
            <td>${index + 1}</td>
            <td><strong>${record.rating.toFixed(1)}</strong>${focusTag}</td>
            <td>${record.score}</td>
            <td>${record.accuracy.toFixed(2)}%</td>
            <td>${record.cps.toFixed(2)}</td>
            <td>${record.maxCombo || '-'}</td>
            <td>${record.duration}s</td>
            <td>${dateStr}</td>
          </tr>
        `;
      })
      .join('');

    return `
      <table class="rating-records-table">
        <thead>
          <tr>
            <th>排名</th><th>等级分</th><th>分数</th><th>准确率</th>
            <th>CPS</th><th>最大连击</th><th>时长</th><th>日期</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  _exportRatingData(records) {
    const headers = [
      '排名',
      '等级分',
      '分数',
      '准确率',
      'CPS',
      '最大连击',
      '时长',
      '日期',
      '专注模式',
    ];
    let csvContent = headers.join(',') + '\n';

    records.forEach((record, index) => {
      const date = new Date(record.date);
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

      const row = [
        index + 1,
        record.rating.toFixed(1),
        record.score,
        record.accuracy.toFixed(2) + '%',
        record.cps.toFixed(2),
        record.maxCombo || '-',
        record.duration + 's',
        dateStr,
        record.focusMode ? '是' : '否',
      ];

      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `piano-game-ratings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
