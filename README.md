## IMG-Helper

给墨水屏快速裁图

✅ Img-Helper 项目改造完成 - React + TypeScript 版本
```
📁 项目结构：
─ index.html                     (新的 Vite 入口文件)
─ vite.config.ts                 (Vite 构建配置)
─ tsconfig.json                  (TypeScript 配置)
─ tsconfig.app.json              (应用层 TypeScript 配置)
─ package.json                   (依赖配置)
─ eslint.config.js              (ESLint 配置)
─ .gitignore                     (Git 忽略文件)
─ README.md                      (更新的项目说明)
│
└─ src/
   ├─ main.tsx                   (React 应用入口)
   ├─ App.tsx                    (主应用组件)
   ├─ App.css                    (应用样式)
   ├─ index.css                  (全局样式)
   │
   ├─ components/                (React 组件)
   │  ├─ Header.tsx              (头部组件)
   │  ├─ Canvas.tsx              (画布组件)
   │  ├─ ControlBar.tsx          (控制栏组件)
   │  └─ Footer.tsx              (页脚组件)
   │
   ├─ hooks/                     (自定义 Hooks)
   │  └─ useDrawingBoard.ts      (绘图板 Hook)
   │
   └─ utils/                     (工具函数/类)
      └─ DrawingBoard.ts         (核心绘图逻辑类 - TypeScript 版)
```

🎯 核心特性已保留：
✓ 图片拖拽上传
✓ 粘贴上传图片
✓ Canvas 缩放 (20%-200%)
✓ 图片旋转 (90度递增)
✓ 多种预设尺寸
✓ 截图导出功能
✓ 响应式设计

🛠️ 技术栈：
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.0.8 (构建工具)
- Canvas API (绘图)

📝 项目改造说明：
1. 原有的 JavaScript 代码已完全改写为 TypeScript
2. 原有的 DrawingBoard 类保留了所有逻辑，但用 TypeScript 重写
3. 分离为 React 组件和 Hook 的模块化结构
4. 使用 Vite 作为构建工具，性能更好
5. 添加了 ESLint 和 TypeScript 支持

🚀 使用方法：
1. npm install          # 安装依赖
2. npm run dev          # 开发模式 (http://localhost:5173)
3. npm run build        # 构建生产版本
4. npm run preview      # 预览生产版本
5. npm run lint         # 代码检查