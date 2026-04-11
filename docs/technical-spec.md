# Math Odyssey（数学奥德赛）— Technical Specification

## Tech Stack
- **Framework:** React 19 + Vite 8
- **Routing:** react-router-dom 7 (HashRouter for GitHub Pages)
- **State:** React Context + useReducer + localStorage
- **Deployment:** gh-pages → GitHub Pages
- **Style:** CSS variables, cyberpunk neon theme (Orbitron font, glass-morphism)
- **No other dependencies**

## Project Structure
```
math-adventure/
├── vite.config.js              # base: '/math-adventure/'
├── package.json
├── docs/                       # 设计文档
│   ├── game-design.md          # 游戏设计文档
│   └── technical-spec.md       # 技术规格文档
├── src/
│   ├── main.jsx                # ReactDOM + HashRouter + GameProvider
│   ├── App.jsx                 # Routes
│   ├── styles/
│   │   └── global.css          # CSS 变量、字体、霓虹/玻璃样式
│   ├── components/
│   │   ├── Layout.jsx          # StarField 背景 + Outlet
│   │   ├── StarField.jsx       # Canvas 粒子背景
│   │   ├── NeonButton.jsx      # 霓虹按钮
│   │   ├── NeonText.jsx        # 发光标题
│   │   ├── Modal.jsx           # 弹窗（顿悟卡片）
│   │   ├── ProgressBar.jsx     # 系统修复进度条
│   │   └── StationView.jsx     # 太空站全景（SVG，随修复变亮）
│   ├── screens/
│   │   ├── HomeScreen.jsx      # 标题页
│   │   ├── StationMap.jsx      # 太空站系统总览
│   │   ├── SystemView.jsx      # 单个系统的任务列表
│   │   └── MissionView.jsx     # 任务执行页（lazy load 对应任务组件）
│   ├── missions/
│   │   └── powercore/
│   │       ├── Mission1_Calibrate.jsx   # 校准反应堆（数轴）✅
│   │       ├── Mission2_Sequence.jsx    # 启动序列（PEMDAS）⏳
│   │       └── Mission3_PowerGrid.jsx   # 配电优化（运算性质）⏳
│   ├── context/
│   │   └── GameContext.jsx     # 游戏状态管理
│   └── data/
│       └── station.js          # 太空站系统/任务元数据
```

## Routes
```
/                          → HomeScreen（标题页）
/station                   → StationMap（太空站总览）
/station/powercore         → SystemView（能源核心 3 个任务）
/station/powercore/1       → MissionView → Mission1_Calibrate
/station/powercore/2       → MissionView → Mission2_Sequence
/station/powercore/3       → MissionView → Mission3_PowerGrid
```

## Game State (localStorage)
Key: `math-odyssey-progress`
```json
{
  "version": 1,
  "stationPower": 0,
  "systems": {
    "powercore": {
      "status": "in_progress",
      "missions": {
        "1": { "completed": false, "ahaMoments": [] },
        "2": { "completed": false, "ahaMoments": [] },
        "3": { "completed": false, "ahaMoments": [] }
      }
    },
    "navigation": { "status": "locked", "missions": {} },
    "comms": { "status": "locked", "missions": {} },
    "shields": { "status": "locked", "missions": {} },
    "launch": { "status": "locked", "missions": {} }
  }
}
```

### State Actions
- `RECORD_AHA` — 记录顿悟时刻 { systemId, missionId, ahaId }
- `COMPLETE_MISSION` — 完成任务 { systemId, missionId }
- `RESET` — 重置所有进度

### System Unlock Logic
系统按顺序解锁：powercore → navigation → comms → shields → launch
当前系统所有 3 个 mission 完成后，自动解锁下一个系统。

## Sprint Plan

| Sprint | 内容 | 状态 |
|--------|------|------|
| Sprint 1 | 骨架（项目 + 路由 + 太空站视图 + GameContext） | ✅ 完成 |
| Sprint 2 | Mission 1 — 校准反应堆（数轴） | ✅ 完成 |
| Sprint 3 | Mission 2 — 启动序列（PEMDAS） | ⏳ 待做 |
| Sprint 4 | Mission 3 — 配电优化（运算性质） | ⏳ 待做 |
| Sprint 5 | 打磨 + 部署 | ⏳ 待做 |

## Deployment
- GitHub repo: `zhoutao64/math-adventure`
- GitHub Pages URL: `https://zhoutao64.github.io/math-adventure/`
- Deploy command: `npm run deploy` (runs `vite build && gh-pages -d dist`)
