/**
 * 主题管理器 - 负责主题切换和应用
 */
import { themes } from '../config/index.js';
import { safeStorage } from '../utils/storage.js';

export class ThemeManager {
  constructor() {
    this.currentThemeIndex = parseInt(safeStorage.get('currentTheme', '0'));
  }

  getCurrentThemeIndex() {
    return this.currentThemeIndex;
  }

  applyCurrentTheme() {
    const theme = themes[this.currentThemeIndex];
    document.documentElement.style.setProperty(
      '--primary-color',
      theme.color || theme.colors[0]
    );
    document.documentElement.style.setProperty(
      '--secondary-color',
      theme.secondary
    );
    return theme;
  }

  switchTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % themes.length;
    safeStorage.set('currentTheme', this.currentThemeIndex);
    const theme = this.applyCurrentTheme();
    return theme.name;
  }
}
