# 尿素包膜生产线3D全景模拟系统 - 14英寸屏幕响应式布局优化方案

## 1. 问题分析

### 1.1 当前布局问题诊断
通过分析现有代码，发现以下关键问题：

#### 设备重叠问题
- **根本原因**：设备使用`left`百分比定位，在小屏幕上相对距离过近
- **具体表现**：
  - 设备间距从6%到86%分布，在1366px宽度下，6%仅为82px
  - 设备宽度150-300px，导致相邻设备严重重叠
  - 3D变换`rotateX(20deg)`在小屏幕上加剧视觉拥挤

#### 文本可读性问题
- **字体过小**：基础字号16px在14英寸屏幕上偏小
- **面板拥挤**：左右面板宽度固定，占用过多水平空间
- **行高不足**：1.6的行高在密集信息展示时显得紧凑

#### 视口适配问题
- **固定容器**：`.panoramic-container`固定1920x1080px
- **无响应式断点**：缺少针对14英寸常见分辨率的媒体查询
- **场景缩放不当**：`.scene`基准宽度2200px超出屏幕范围

### 1.2 14英寸屏幕特性分析
- **常见分辨率**：
  - 1920×1080 (Full HD) - 高端笔记本
  - 1366×768 (HD) - 主流笔记本
  - 1600×900 (HD+) - 中端笔记本
- **可用视口**：扣除浏览器UI后约1300-1850px宽度
- **像素密度**：通常为125-150 DPI，需要适当放大元素

## 2. 14英寸屏幕适配策略

### 2.1 响应式布局架构
```
┌────────────────────────────────────────────────┐
│                  标题区域                       │ 高度: 48px
├────────────────────────────────────────────────┤
│                  控制按钮                       │ 高度: 44px
├──────┬──────────────────────────────┬──────────┤
│      │                              │          │
│ 左侧 │       3D场景展示区           │   右侧   │
│ 面板 │    (自适应缩放和间距)        │   面板   │
│ 折叠 │                              │   折叠   │
│      │                              │          │
├──────┴──────────────────────────────┴──────────┤
│              底部监控面板（可折叠）              │
└────────────────────────────────────────────────┘
```

### 2.2 核心优化策略

#### 策略一：智能视口适配
- 移除固定容器尺寸，采用百分比和视口单位
- 实现动态缩放，根据屏幕尺寸自动调整
- 保持16:9比例的同时适配不同分辨率

#### 策略二：设备间距优化
- 使用绝对定位+Transform组合替代纯百分比定位
- 增加最小间距保护，防止设备重叠
- 实现智能排列算法，动态调整设备位置

#### 策略三：面板折叠机制
- 左右面板默认折叠，点击展开
- 展开时使用半透明遮罩，不遮挡3D场景
- 底部面板支持收起，最大化3D展示空间

## 3. 具体CSS修改建议

### 3.1 基础响应式框架
```css
/* 移除固定尺寸，改用响应式容器 */
.panoramic-container {
    width: 100%;
    max-width: 1920px;
    height: 100vh;
    margin: 0 auto;
    padding: 8px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* 14英寸屏幕专用媒体查询 */
@media screen and (max-width: 1440px) and (max-height: 900px) {
    :root {
        --font-size-base: 14px;
        --space-xs: 0.25rem;
        --space-sm: 0.5rem;
        --space-md: 0.75rem;
        --space-lg: 1.25rem;
    }
}

/* 1366×768分辨率优化 */
@media screen and (max-width: 1366px) {
    :root {
        --font-size-base: 13px;
        --compact-mode: true;
    }

    .title {
        font-size: 24px;
        margin-bottom: 4px;
    }

    .controls {
        margin-bottom: 8px;
    }

    button {
        padding: 6px 12px;
        font-size: 13px;
    }
}
```

### 3.2 3D场景自适应缩放
```css
/* 主布局弹性容器 */
.main-layout {
    display: flex;
    flex: 1;
    gap: 8px;
    min-height: 0; /* 防止flex子项溢出 */
    position: relative;
}

/* 中央3D场景容器 */
.center-panel {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 3D场景响应式缩放 */
.production-line-3d {
    width: 100%;
    height: 100%;
    position: relative;
}

.scene {
    width: 100%;
    height: 100%;
    position: absolute;
    transform-style: preserve-3d;
    /* 使用CSS变量控制缩放 */
    --scale-factor: 1;
    --rotation-x: 15deg;
    --translate-y: 0%;
    transform:
        scale(var(--scale-factor))
        rotateX(var(--rotation-x))
        rotateY(0deg)
        translateY(var(--translate-y));
    transition: transform 1.5s ease;
}

/* 14英寸屏幕场景调整 */
@media screen and (max-width: 1440px) {
    .scene {
        --scale-factor: 0.8;
        --rotation-x: 10deg;
        --translate-y: -5%;
    }
}

@media screen and (max-width: 1366px) {
    .scene {
        --scale-factor: 0.7;
        --rotation-x: 8deg;
        --translate-y: -8%;
    }
}
```

### 3.3 设备位置智能布局
```css
/* 设备基础样式优化 */
.equipment {
    position: absolute;
    transform-style: preserve-3d;
    cursor: pointer;
    transition: transform 0.3s ease;
    /* 添加最小间距保护 */
    min-width: 80px;
    margin: 0 10px;
}

/* 使用CSS Grid进行设备定位 */
.equipment-grid {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 20px;
    width: 100%;
    height: 100%;
    padding: 20px;
}

/* 重新定义设备位置 - 使用transform确保间距 */
#material-feeding {
    grid-column: 1;
    transform: translate(0, 0) scale(0.9);
}

#z-elevator {
    grid-column: 2;
    transform: translate(20px, -30px) scale(0.9);
}

#batch-separator {
    grid-column: 3;
    transform: translate(40px, -20px) scale(0.9);
}

#conveyor-20m {
    grid-column: 4 / 6;
    transform: translate(60px, 0) scale(0.85);
}

#conveyor-14m {
    grid-column: 6 / 7;
    transform: translate(80px, -10px) scale(0.85);
}

#coating-machine {
    grid-column: 7;
    transform: translate(100px, 0) scale(0.9);
}

#big-elevator {
    grid-column: 8;
    transform: translate(120px, -40px) scale(0.85);
}

#cooling-tower {
    grid-column: 8;
    transform: translate(140px, -20px) scale(0.85);
}

#packaging-machine {
    grid-column: 9;
    transform: translate(160px, 0) scale(0.9);
}

/* 1366px屏幕设备缩放 */
@media screen and (max-width: 1366px) {
    .equipment {
        transform: scale(0.75);
    }

    /* 调整设备间距 */
    #material-feeding { transform: translate(0, 0) scale(0.75); }
    #z-elevator { transform: translate(10px, -20px) scale(0.75); }
    #batch-separator { transform: translate(20px, -15px) scale(0.75); }
    #conveyor-20m { transform: translate(30px, 0) scale(0.7); }
    #conveyor-14m { transform: translate(40px, -5px) scale(0.7); }
    #coating-machine { transform: translate(50px, 0) scale(0.75); }
    #big-elevator { transform: translate(60px, -30px) scale(0.7); }
    #cooling-tower { transform: translate(70px, -15px) scale(0.7); }
    #packaging-machine { transform: translate(80px, 0) scale(0.75); }
}
```

### 3.4 可折叠面板设计
```css
/* 侧边面板折叠机制 */
.side-panel {
    position: relative;
    background: rgba(0, 26, 92, 0.95);
    border-radius: 8px;
    transition: all 0.3s ease;
    overflow: hidden;
}

/* 左侧面板 */
.left-panel {
    width: 280px;
    margin-right: 8px;
}

.left-panel.collapsed {
    width: 40px;
}

/* 右侧面板 */
.right-panel {
    width: 280px;
    margin-left: 8px;
}

.right-panel.collapsed {
    width: 40px;
}

/* 折叠按钮 */
.panel-toggle {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.panel-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* 折叠时隐藏内容 */
.collapsed .info-panel,
.collapsed .fault-panel,
.collapsed .parameter-panel {
    opacity: 0;
    visibility: hidden;
    transform: scale(0.95);
}

/* 折叠时显示图标 */
.collapsed .panel-icon {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
    writing-mode: vertical-rl;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

/* 1366px屏幕默认折叠 */
@media screen and (max-width: 1366px) {
    .side-panel {
        width: 40px;
    }

    .side-panel:hover {
        width: 240px;
    }

    .side-panel:not(:hover) .info-panel,
    .side-panel:not(:hover) .fault-panel,
    .side-panel:not(:hover) .parameter-panel {
        opacity: 0;
        visibility: hidden;
    }
}
```

### 3.5 底部监控面板优化
```css
/* 底部面板可折叠 */
.bottom-panels {
    position: relative;
    background: rgba(0, 26, 92, 0.95);
    border-radius: 8px 8px 0 0;
    transition: all 0.3s ease;
    max-height: 200px;
    overflow-y: auto;
}

.bottom-panels.minimized {
    max-height: 32px;
}

.bottom-panels-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: rgba(0, 47, 167, 0.3);
    cursor: pointer;
}

/* 监控网格响应式布局 */
.monitor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    padding: 12px;
}

/* 1366px屏幕监控项紧凑模式 */
@media screen and (max-width: 1366px) {
    .monitor-grid {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;
        padding: 8px;
    }

    .monitor-item {
        padding: 8px;
        font-size: 12px;
    }

    .parameter-control {
        font-size: 11px;
    }

    .parameter-slider {
        height: 4px;
    }
}
```

## 4. 文本可读性优化

### 4.1 字体大小响应式调整
```css
/* 基础字体大小调整 */
@media screen and (max-width: 1440px) {
    body {
        font-size: 14px;
    }

    h1 { font-size: 26px; }
    h2 { font-size: 18px; }
    h3 { font-size: 14px; }

    .label {
        font-size: 11px;
        padding: 4px 8px;
    }

    .status {
        font-size: 10px;
        padding: 2px 6px;
    }
}

@media screen and (max-width: 1366px) {
    body {
        font-size: 13px;
    }

    h1 { font-size: 22px; }
    h2 { font-size: 16px; }
    h3 { font-size: 13px; }

    .label {
        font-size: 10px;
        padding: 3px 6px;
    }

    .status {
        font-size: 9px;
        padding: 2px 5px;
    }
}
```

### 4.2 文本布局优化
```css
/* 提高可读性的行高和间距 */
.info-panel,
.fault-panel,
.parameter-panel {
    line-height: 1.4; /* 降低行高，节省空间 */
}

/* 列表项优化 */
.parameter-panel ul {
    padding-left: 16px; /* 减少缩进 */
}

.parameter-panel li {
    margin-bottom: 4px; /* 减少间距 */
    font-size: 0.9em;
}

/* 紧凑模式下的嵌套列表 */
@media screen and (max-width: 1366px) {
    .parameter-panel ul ul {
        padding-left: 12px;
        font-size: 0.85em;
    }
}
```

## 5. 性能优化建议

### 5.1 CSS性能优化
```css
/* 使用will-change优化动画性能 */
.equipment {
    will-change: transform;
}

.scene {
    will-change: transform;
}

/* 减少重绘和重排 */
.equipment:hover {
    transform: translateY(-3px); /* 减小位移量 */
}

/* 使用transform替代position动画 */
.connection {
    transition: transform 0.3s ease;
}
```

### 5.2 硬件加速
```css
/* 启用GPU加速 */
.production-line-3d,
.scene,
.equipment {
    transform: translateZ(0);
    backface-visibility: hidden;
}
```

## 6. 实施步骤

### 第一步：备份现有文件
```bash
cp styles.css styles.backup.css
cp index.html index.backup.html
```

### 第二步：创建响应式CSS文件
创建新文件 `responsive-14inch.css`，包含所有优化样式。

### 第三步：修改HTML结构
1. 在`<head>`中添加：
```html
<link rel="stylesheet" href="responsive-14inch.css">
```

2. 为面板添加折叠功能：
```html
<div class="side-panel left-panel" id="leftPanel">
    <button class="panel-toggle" onclick="togglePanel('leftPanel')">◀</button>
    <span class="panel-icon">设备信息</span>
    <!-- 原有内容 -->
</div>
```

### 第四步：添加JavaScript交互
```javascript
// 面板折叠功能
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    panel.classList.toggle('collapsed');
}

// 检测屏幕尺寸并自动调整
function adjustForScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width <= 1366) {
        document.querySelector('.scene').style.setProperty('--scale-factor', '0.65');
        // 自动折叠侧边面板
        document.querySelectorAll('.side-panel').forEach(panel => {
            panel.classList.add('collapsed');
        });
    } else if (width <= 1440) {
        document.querySelector('.scene').style.setProperty('--scale-factor', '0.75');
    } else {
        document.querySelector('.scene').style.setProperty('--scale-factor', '1');
    }
}

// 页面加载和窗口调整时执行
window.addEventListener('load', adjustForScreenSize);
window.addEventListener('resize', adjustForScreenSize);
```

### 第五步：测试和调优
1. 在1920×1080分辨率下测试
2. 在1366×768分辨率下测试
3. 使用Chrome DevTools模拟14英寸设备
4. 检查设备间距和文本可读性
5. 验证交互功能正常

## 7. 完整的响应式CSS代码示例

创建 `responsive-14inch.css` 文件，包含以下优化代码：

```css
/* ========================================
   14英寸笔记本屏幕响应式优化样式表
   ======================================== */

/* 1. 基础响应式设置 */
@media screen and (max-width: 1920px) {
    .panoramic-container {
        width: 100%;
        height: 100vh;
        padding: 8px;
    }
}

/* 2. 14英寸屏幕断点 (1440×900) */
@media screen and (max-width: 1440px) and (max-height: 900px) {
    :root {
        --font-size-base: 14px;
        --space-xs: 0.25rem;
        --space-sm: 0.5rem;
        --space-md: 0.75rem;
        --space-lg: 1rem;
    }

    .title {
        font-size: 28px;
        margin-bottom: 6px;
    }

    .controls {
        gap: 8px;
        margin-bottom: 12px;
    }

    button {
        padding: 8px 14px;
        font-size: 14px;
    }

    .scene {
        transform: scale(0.8) rotateX(12deg) translateY(-3%);
    }

    /* 设备尺寸缩放 */
    .equipment {
        transform: scale(0.85);
    }

    /* 调整设备位置防止重叠 */
    #material-feeding { left: 5%; }
    #z-elevator { left: 14%; }
    #batch-separator { left: 24%; }
    #conveyor-20m { left: 34%; }
    #conveyor-14m { left: 48%; }
    #coating-machine { left: 62%; }
    #big-elevator { left: 72%; }
    #cooling-tower { left: 80%; }
    #packaging-machine { left: 88%; }
}

/* 3. 主流14英寸屏幕断点 (1366×768) */
@media screen and (max-width: 1366px) and (max-height: 768px) {
    :root {
        --font-size-base: 13px;
        --space-xs: 0.2rem;
        --space-sm: 0.4rem;
        --space-md: 0.6rem;
        --space-lg: 0.8rem;
    }

    .title {
        font-size: 24px;
        margin-bottom: 4px;
    }

    .controls {
        gap: 6px;
        margin-bottom: 8px;
    }

    button {
        padding: 6px 12px;
        font-size: 13px;
        letter-spacing: 0;
    }

    .main-layout {
        gap: 4px;
    }

    .scene {
        transform: scale(0.65) rotateX(8deg) translateY(-5%);
    }

    /* 更激进的设备缩放 */
    .equipment {
        transform: scale(0.7);
    }

    /* 重新布局设备，增加水平间距 */
    #material-feeding {
        left: 3%;
        transform: scale(0.65);
        width: 120px;
    }
    #z-elevator {
        left: 11%;
        transform: scale(0.65);
        width: 60px;
    }
    #batch-separator {
        left: 20%;
        transform: scale(0.65);
        width: 90px;
    }
    #conveyor-20m {
        left: 29%;
        transform: scale(0.6);
        width: 240px;
    }
    #conveyor-14m {
        left: 44%;
        transform: scale(0.6);
        width: 160px;
    }
    #coating-machine {
        left: 57%;
        transform: scale(0.65);
        width: 110px;
    }
    #big-elevator {
        left: 67%;
        transform: scale(0.6);
        width: 80px;
    }
    #cooling-tower {
        left: 75%;
        transform: scale(0.65);
        width: 95px;
    }
    #packaging-machine {
        left: 84%;
        transform: scale(0.65);
        width: 130px;
    }

    /* 连接线调整 */
    .connection {
        height: 6px;
    }

    /* 标签和状态文字优化 */
    .label {
        font-size: 10px;
        padding: 3px 6px;
        bottom: -30px;
    }

    .status {
        font-size: 9px;
        padding: 2px 5px;
        bottom: -45px;
    }

    /* 侧边面板默认折叠 */
    .left-panel,
    .right-panel {
        width: 36px;
        overflow: hidden;
        cursor: pointer;
    }

    .left-panel:hover,
    .right-panel:hover {
        width: 220px;
        z-index: 100;
        background: rgba(0, 26, 92, 0.98);
    }

    /* 折叠时隐藏内容 */
    .left-panel:not(:hover) .info-panel,
    .left-panel:not(:hover) .fault-panel,
    .right-panel:not(:hover) .parameter-panel {
        opacity: 0;
        pointer-events: none;
    }

    /* 折叠指示器 */
    .side-panel::after {
        content: '▶';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: rgba(255, 219, 0, 0.8);
        font-size: 16px;
    }

    .side-panel:hover::after {
        display: none;
    }

    /* 底部监控面板紧凑模式 */
    .bottom-panels {
        max-height: 160px;
    }

    .monitor-panel h2 {
        font-size: 14px;
        margin-bottom: 8px;
    }

    .monitor-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 6px;
        padding: 8px;
    }

    .monitor-item {
        padding: 6px;
    }

    .item-label {
        font-size: 11px;
        margin-bottom: 4px;
    }

    .status-indicator {
        font-size: 10px;
        padding: 2px 4px;
        margin-bottom: 4px;
    }

    .parameter-control {
        margin-top: 4px;
    }

    .parameter-control label {
        font-size: 10px;
        display: block;
        margin-bottom: 2px;
    }

    .parameter-slider {
        width: 100%;
        height: 3px;
    }

    .parameter-value {
        font-size: 10px;
        display: inline-block;
        margin-top: 2px;
    }
}

/* 4. 极小屏幕优化 (1280×720) */
@media screen and (max-width: 1280px) and (max-height: 720px) {
    .scene {
        transform: scale(0.55) rotateX(5deg) translateY(-8%);
    }

    /* 隐藏部分非关键元素 */
    .parameter-panel ul ul {
        display: none;
    }

    /* 简化监控面板 */
    .monitor-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .monitor-item:nth-child(n+7) {
        display: none;
    }
}

/* 5. 触摸设备优化 */
@media (pointer: coarse) {
    button {
        min-height: 44px; /* iOS推荐的最小触摸目标 */
    }

    .parameter-slider {
        height: 6px;
    }

    .equipment {
        min-width: 44px;
        min-height: 44px;
    }
}

/* 6. 打印样式优化 */
@media print {
    .controls,
    .bottom-panels {
        display: none;
    }

    .side-panel {
        width: auto !important;
    }

    .scene {
        transform: none !important;
    }
}

/* 7. 高对比度模式 */
@media (prefers-contrast: high) {
    .label {
        background-color: white;
        color: black;
        font-weight: bold;
    }

    .status {
        border: 2px solid currentColor;
    }
}

/* 8. 动画性能优化 */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

## 8. JavaScript增强功能

创建 `responsive-enhance.js` 文件：

```javascript
// 响应式增强功能
(function() {
    'use strict';

    // 检测是否为14英寸笔记本
    function is14InchLaptop() {
        const width = window.screen.width;
        const height = window.screen.height;
        const dpr = window.devicePixelRatio || 1;

        // 常见14英寸分辨率检测
        const resolutions = [
            { w: 1366, h: 768 },
            { w: 1440, h: 900 },
            { w: 1600, h: 900 },
            { w: 1920, h: 1080 }
        ];

        return resolutions.some(res =>
            Math.abs(width - res.w) < 50 &&
            Math.abs(height - res.h) < 50
        );
    }

    // 动态调整场景缩放
    function adjustSceneScale() {
        const scene = document.querySelector('.scene');
        if (!scene) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let scaleFactor = 1;
        let rotationX = 20;
        let translateY = 0;

        if (viewportWidth <= 1280) {
            scaleFactor = 0.55;
            rotationX = 5;
            translateY = -8;
        } else if (viewportWidth <= 1366) {
            scaleFactor = 0.65;
            rotationX = 8;
            translateY = -5;
        } else if (viewportWidth <= 1440) {
            scaleFactor = 0.75;
            rotationX = 12;
            translateY = -3;
        } else if (viewportWidth <= 1600) {
            scaleFactor = 0.85;
            rotationX = 15;
            translateY = -2;
        }

        scene.style.transform = `
            scale(${scaleFactor})
            rotateX(${rotationX}deg)
            rotateY(0deg)
            translateY(${translateY}%)
        `;
    }

    // 智能设备间距调整
    function adjustEquipmentSpacing() {
        const equipment = document.querySelectorAll('.equipment');
        const containerWidth = document.querySelector('.center-panel').offsetWidth;

        if (containerWidth < 1000) {
            // 紧凑布局
            equipment.forEach((eq, index) => {
                const baseLeft = 3 + (index * 10); // 10%的间距
                eq.style.left = `${baseLeft}%`;
                eq.style.transform = 'scale(0.6)';
            });
        }
    }

    // 面板自动折叠
    function setupPanelAutoCollapse() {
        const panels = document.querySelectorAll('.side-panel');
        const viewportWidth = window.innerWidth;

        if (viewportWidth <= 1366) {
            panels.forEach(panel => {
                panel.classList.add('auto-collapse');

                // 鼠标进入展开
                panel.addEventListener('mouseenter', function() {
                    this.classList.add('expanded');
                });

                // 鼠标离开折叠
                panel.addEventListener('mouseleave', function() {
                    this.classList.remove('expanded');
                });
            });
        }
    }

    // 文本大小自适应
    function adjustTextSize() {
        const viewportWidth = window.innerWidth;
        const root = document.documentElement;

        if (viewportWidth <= 1280) {
            root.style.fontSize = '12px';
        } else if (viewportWidth <= 1366) {
            root.style.fontSize = '13px';
        } else if (viewportWidth <= 1440) {
            root.style.fontSize = '14px';
        } else {
            root.style.fontSize = '16px';
        }
    }

    // 性能优化：降低动画质量
    function optimizePerformance() {
        const viewportWidth = window.innerWidth;

        if (viewportWidth <= 1366) {
            // 禁用复杂动画
            document.body.classList.add('reduce-motion');

            // 降低阴影质量
            const style = document.createElement('style');
            style.textContent = `
                .reduce-motion * {
                    transition-duration: 0.1s !important;
                }
                .reduce-motion .equipment {
                    box-shadow: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 初始化
    function init() {
        adjustSceneScale();
        adjustEquipmentSpacing();
        setupPanelAutoCollapse();
        adjustTextSize();

        if (is14InchLaptop()) {
            console.log('检测到14英寸笔记本，应用优化设置');
            optimizePerformance();
            document.body.classList.add('laptop-14inch');
        }
    }

    // 事件监听
    window.addEventListener('load', init);
    window.addEventListener('resize', function() {
        adjustSceneScale();
        adjustTextSize();
    });

    // 导出公共API
    window.ResponsiveEnhance = {
        adjustScale: adjustSceneScale,
        adjustSpacing: adjustEquipmentSpacing,
        is14Inch: is14InchLaptop
    };
})();
```

## 9. 总结

### 优化成果
1. **设备不再重叠**：通过智能间距和缩放算法，确保所有设备清晰可见
2. **文本可读性提升**：根据屏幕尺寸动态调整字体大小和行高
3. **空间利用率提高**：可折叠面板设计，最大化3D场景展示空间
4. **性能优化**：针对小屏幕降低动画复杂度，提升渲染性能

### 关键改进点
- 移除固定容器尺寸，采用响应式布局
- 实现多级媒体查询，精确适配14英寸屏幕
- 设备位置和大小动态调整，防止重叠
- 侧边面板支持折叠，优化空间利用
- 文本大小分级调整，保证可读性

### 后续建议
1. 添加用户偏好设置，允许手动调整缩放比例
2. 实现更智能的设备排列算法
3. 添加全屏模式支持
4. 考虑添加移动端触摸手势支持
5. 实现深色/浅色主题切换

这套优化方案专门针对14英寸笔记本屏幕的特点，通过响应式设计、智能布局和交互优化，确保在有限的屏幕空间内提供最佳的用户体验。