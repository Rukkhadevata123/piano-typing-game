/**
 * 通知系统 - 负责显示各类游戏通知
 */
export class NotificationSystem {
  constructor() {
    this.containers = new Map();
    this.activeNotifications = new Set();
  }

  /**
   * 显示分数反馈
   */
  showScoreFeedback(scoreDetails, column = null, scoreElement, gameBoard) {
    const isPositive = scoreDetails.points > 0;
    const text = `${scoreDetails.points > 0 ? '+' : ''}${scoreDetails.points}`;

    const position =
      column !== null && gameBoard
        ? this._getColumnPosition(column, gameBoard)
        : scoreElement
          ? this._getElementPosition(scoreElement)
          : { left: '50%', top: '30%' };

    this._showNotification({
      containerId: 'score-feedback-container',
      containerClass: 'score-feedback-container',
      className: `score-popup ${isPositive ? 'positive' : 'negative'}`,
      content: text,
      position,
      duration: 1000,
      animateClass: 'animate',
    });
  }

  /**
   * 显示连击里程碑
   */
  showComboMilestone(combo, points) {
    let level = 1;
    if (combo >= 200) level = 4;
    else if (combo >= 100) level = 3;
    else if (combo >= 50) level = 2;

    this._showNotification({
      containerId: 'combo-milestone-container',
      containerClass: 'combo-milestone-container',
      className: `combo-milestone level-${level}`,
      content: `🔥连击 ${combo} 奖励 +${points}`,
      duration: 3500,
      animateClass: 'show',
      animationName: 'comboEffect',
    });
  }

  /**
   * 显示连击中断
   */
  showComboBreak(combo, penalty) {
    this._showNotification({
      containerId: 'combo-milestone-container',
      containerClass: 'combo-milestone-container',
      className: 'combo-milestone combo-break',
      content: `💔连击中断 ${combo} 惩罚 ${penalty}`,
      duration: 2500,
      animateClass: 'show',
      animationName: 'comboEffect',
    });
  }

  /**
   * 显示时间切换通知
   */
  showTimeNotification(timeText) {
    this._showSystemNotification(
      `⏱️ 游戏时长: ${timeText}`,
      'time-notification'
    );
  }

  /**
   * 显示模式切换通知
   */
  showModeNotification(modeName) {
    this._showSystemNotification(
      `🎮 游戏模式: ${modeName}`,
      'mode-notification'
    );
  }

  /**
   * 显示主题切换通知
   */
  showThemeNotification(themeName) {
    this._showSystemNotification(`🎨 主题: ${themeName}`, 'theme-notification');
  }

  /**
   * 显示专注模式通知
   */
  showFocusModeNotification(isEnabled) {
    const statusClass = isEnabled ? 'focus-enabled' : 'focus-disabled';
    const content = isEnabled ? '🔥 专注模式已开启' : '😌 专注模式已关闭';
    this._showSystemNotification(
      content,
      `focus-mode-notification ${statusClass}`,
      2000
    );
  }

  /**
   * 统一的系统通知方法
   */
  _showSystemNotification(content, typeClass, duration = 1500) {
    this._showNotification({
      containerId: 'system-notification-container',
      containerClass: 'system-notification-container',
      className: `system-notification ${typeClass}`,
      content,
      duration,
      animateClass: 'show',
      hasExitAnimation: true,
    });
  }

  /**
   * 核心通知显示方法 - 统一动画处理
   */
  _showNotification(options) {
    const {
      containerId,
      containerClass,
      className,
      content,
      position,
      duration = 2000,
      animateClass = 'show',
      animationName = null,
      hasExitAnimation = false,
    } = options;

    // 获取或创建容器
    let container = this.containers.get(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = containerClass;
      document.body.appendChild(container);
      this.containers.set(containerId, container);
    }

    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = className;
    notification.innerHTML = content;

    // 设置位置
    if (position) {
      notification.style.position = 'absolute';
      notification.style.left =
        typeof position.left === 'string'
          ? position.left
          : `${position.left}px`;
      notification.style.top =
        typeof position.top === 'string' ? position.top : `${position.top}px`;
      if (position.origin) {
        notification.style.transformOrigin = position.origin;
      }
    }

    container.appendChild(notification);
    this.activeNotifications.add(notification);

    // 处理动画
    requestAnimationFrame(() => {
      notification.classList.add(animateClass);

      // 如果指定了动画名，监听动画结束
      if (animationName) {
        const handleAnimationEnd = (event) => {
          if (event.animationName === animationName) {
            this._removeNotification(notification);
          }
        };
        notification.addEventListener('animationend', handleAnimationEnd, {
          once: true,
        });
      } else {
        // 定时处理 - 统一添加退出动画
        setTimeout(() => {
          if (hasExitAnimation) {
            // 添加退出动画
            notification.classList.remove('show');
            notification.addEventListener(
              'transitionend',
              () => {
                this._removeNotification(notification);
              },
              { once: true }
            );
          } else {
            this._removeNotification(notification);
          }
        }, duration);
      }
    });

    return notification;
  }

  /**
   * 获取列位置
   */
  _getColumnPosition(column, gameBoard) {
    const rect = gameBoard.getBoundingClientRect();
    const styles = getComputedStyle(document.documentElement);
    const cellSize =
      parseInt(styles.getPropertyValue('--cell-size').replace('px', '')) || 60;
    const gap =
      parseInt(styles.getPropertyValue('--grid-gap').replace('px', '')) || 5;
    const boardPadding =
      parseInt(styles.getPropertyValue('--spacing').replace('px', '')) || 16;

    const cellX = boardPadding + column * (cellSize + gap) + cellSize / 2;
    const cellY = rect.height - cellSize / 2;

    return {
      left: rect.left + cellX,
      top: rect.top + cellY,
      origin: 'center bottom',
    };
  }

  /**
   * 获取元素位置
   */
  _getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left + rect.width / 2,
      top: rect.top,
      origin: 'center top',
    };
  }

  /**
   * 移除通知
   */
  _removeNotification(notification) {
    if (this.activeNotifications.has(notification)) {
      this.activeNotifications.delete(notification);
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }
  }

  /**
   * 清理所有通知
   */
  clearAll() {
    this.activeNotifications.forEach((notification) => {
      this._removeNotification(notification);
    });
  }
}
