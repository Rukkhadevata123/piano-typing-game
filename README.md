# 6K音游模拟器

[![GitHub](https://img.shields.io/badge/GitHub-Rukkhadevata123-black?style=flat-square&logo=github)](https://github.com/Rukkhadevata123/piano-typing-game-dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-v6.1.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

## 项目简介

基于Web技术的6列音游模拟器，通过键盘操作消除下落方块获得分数。游戏支持多种模式、主题和难度设置，包含完整的等级分系统和数据统计功能。

**在线体验：** [https://yoimiyalove.top/piano-typing-game/](https://yoimiyalove.top/piano-typing-game/)

## 技术栈

- **Vite** - 构建工具
- **JavaScript ES6+** - 核心开发语言
- **HTML5 + CSS3** - 界面实现
- **LocalStorage** - 数据持久化
- **Web Audio API** - 音效系统

## 游戏特性

### 核心玩法

- **6列布局**：对应键盘 A、S、D、J、K、L 六个按键
- **消块机制**：及时按键消除对应列的最底层方块
- **实时统计**：分数、准确率、CPS（每秒点击数）、连击数
- **动态难度**：方块生成频率随游戏进程自动调整

### 游戏模式

- **整行模式**：消除一行中所有方块后整体下落
- **单块模式**：单独消除方块，该列立即下落
- **专注模式**：1秒操作限制 + 2次失误限制，完成后获得20%等级分加成

### 计分系统

- **基础分数**：命中+10分，失误-5分
- **连击倍率**：非线性增长，最高可达3.4倍
- **里程碑奖励**：特定连击数（25、50、100等）额外奖励，最高800分
- **智能惩罚**：失误扣分根据当前连击数动态调整

### 等级分系统

采用十级段位制度，从青铜到钻石：

| 段位 | 等级分范围 | 段位 | 等级分范围 |
|------|------------|------|------------|
| 青铜等级 | 0-5000 | 绿宝石等级 | 10000-11250 |
| 白银等级 | 5000-6250 | 紫水晶等级 | 11250-12500 |
| 黄金等级 | 6250-7500 | 珍珠等级 | 12500-13750 |
| 蓝宝石等级 | 7500-8750 | 黑曜石等级 | 13750-15000 |
| 红宝石等级 | 8750-10000 | 钻石等级 | 15000+ |

**评分算法**：综合考虑分数、游戏时长、准确率、CPS等因素，使用时间衰减机制保持评分时效性。

### 自定义设置

- **时间选择**：60秒到300秒，共10个时长选项
- **主题切换**：4种颜色主题，包括彩虹渐变主题
- **数据导出**：支持CSV格式导出个人游戏记录

## 操作说明

### 基础操作

- **A、S、D** - 控制左侧三列
- **J、K、L** - 控制右侧三列

### 快捷键

- **R** - 切换游戏模式
- **Q** - 切换游戏时长
- **T** - 切换主题
- **F** - 切换专注模式
- **空格** - 重新开始游戏

## 本地开发

### 环境要求

- Node.js 20+
- npm 或 yarn

### 快速开始

```bash
# 克隆项目
git clone https://github.com/Rukkhadevata123/piano-typing-game-dev.git
cd piano-typing-game-dev

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 可用命令

```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建结果
npm run lint     # 代码检查
npm run format   # 代码格式化
```

## 项目结构

```
src/
├── js/
│   ├── core/                    # 核心逻辑层
│   │   ├── Game.js             # 主游戏控制器
│   │   ├── Board.js            # 游戏板逻辑
│   │   ├── GameModes.js        # 游戏模式和难度管理
│   │   ├── ScoreSystem.js      # 分数计算和管理
│   │   ├── StatsManager.js     # 统计数据管理
│   │   └── RatingSystem.js     # 等级分系统
│   ├── ui/                     # 用户界面层
│   │   ├── GameUI.js           # 主UI控制器
│   │   ├── BoardRenderer.js    # 游戏板渲染器
│   │   ├── NotificationSystem.js # 通知系统
│   │   └── ThemeManager.js     # 主题管理器
│   ├── input/                  # 输入处理层
│   │   └── InputManager.js     # 统一输入管理器
│   ├── config/                 # 配置层
│   │   └── index.js            # 统一配置文件
│   ├── utils/                  # 工具层
│   │   ├── audio.js            # 音频管理
│   │   ├── background.js       # 背景管理
│   │   ├── helpers.js          # 通用工具函数
│   │   └── storage.js          # 存储工具
│   └── main.js                 # 应用入口文件
├── css/                        # 样式文件
│   ├── components/             # 组件样式
│   ├── layout/                 # 布局样式
│   ├── utils/                  # 工具样式
│   └── style.css               # 主样式文件
├── public/                     # 静态资源
│   └── audio/                  # 音频文件
└── index.html                  # HTML入口文件
```

## 核心算法

### 连击倍率计算

```javascript
multiplier = 1 + Math.log(combo + 1) * 0.35
```

### 里程碑奖励计算

```javascript
bonus = Math.pow(1.6, milestoneIndex) * 8 * scaleFactor
```

### 等级分计算

综合评估分数、时长、准确率、CPS四个维度，使用加权平均和时间衰减算法。

## 兼容性说明

### 推荐环境

- Chrome 120+ / Firefox 120+
- 桌面端获得最佳体验
- 移动端建议横屏使用

### 已知限制

- 部分旧版浏览器可能存在音效问题
- iOS Safari可能有音效延迟
- 小屏幕设备体验受限

## 贡献指南

欢迎提交Issue和Pull Request。请确保：

1. 遵循现有代码风格
2. 通过ESLint检查
3. 提供清晰的提交信息
4. 测试相关功能

## 开源协议

MIT License - 可自由使用、修改和分发，需保留版权声明。

## 致谢

- **Claude Sonnet 4** - AI编程助手
- **arcxingye/EatKano** - 音效资源
- **Vite** - 构建工具支持
