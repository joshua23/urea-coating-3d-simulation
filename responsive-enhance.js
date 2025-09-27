/**
 * 尿素包膜生产线3D全景模拟系统
 * 14英寸笔记本屏幕响应式增强脚本
 * 主要功能：动态布局调整、面板折叠、性能优化
 */

(function() {
    'use strict';

    // ===================================
    // 1. 屏幕检测功能
    // ===================================

    /**
     * 检测是否为14英寸笔记本
     * @returns {boolean}
     */
    function is14InchLaptop() {
        const width = window.screen.width;
        const height = window.screen.height;

        // 14英寸笔记本常见分辨率
        const resolutions14Inch = [
            { w: 1366, h: 768 },   // 最常见
            { w: 1440, h: 900 },   // 中端
            { w: 1600, h: 900 },   // 中高端
            { w: 1920, h: 1080 }   // 高端
        ];

        // 允许10px的误差范围
        return resolutions14Inch.some(res =>
            Math.abs(width - res.w) <= 10 &&
            Math.abs(height - res.h) <= 10
        );
    }

    /**
     * 获取屏幕类型
     * @returns {string}
     */
    function getScreenType() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (width <= 1280 && height <= 720) {
            return 'ultra-small';
        } else if (width <= 1366 && height <= 768) {
            return 'small-14inch';
        } else if (width <= 1440 && height <= 900) {
            return 'medium-14inch';
        } else if (width <= 1600 && height <= 900) {
            return 'large-14inch';
        } else if (width <= 1920 && height <= 1080) {
            return 'full-hd-14inch';
        } else {
            return 'large-screen';
        }
    }

    // ===================================
    // 2. 动态场景缩放
    // ===================================

    /**
     * 根据屏幕尺寸调整3D场景缩放
     */
    function adjustSceneScale() {
        const scene = document.querySelector('.scene');
        if (!scene) return;

        const screenType = getScreenType();
        const sceneSettings = {
            'ultra-small': { scale: 0.5, rotateX: 5, translateY: -10 },
            'small-14inch': { scale: 0.62, rotateX: 6, translateY: -6 },
            'medium-14inch': { scale: 0.75, rotateX: 10, translateY: -3 },
            'large-14inch': { scale: 0.8, rotateX: 12, translateY: -2 },
            'full-hd-14inch': { scale: 0.9, rotateX: 15, translateY: 0 },
            'large-screen': { scale: 1, rotateX: 20, translateY: 5 }
        };

        const settings = sceneSettings[screenType] || sceneSettings['large-screen'];

        scene.style.transform = `
            scale(${settings.scale})
            rotateX(${settings.rotateX}deg)
            rotateY(0deg)
            translateY(${settings.translateY}%)
        `;

        // 更新CSS变量（如果支持）
        if (CSS && CSS.supports('--scale-factor', '1')) {
            scene.style.setProperty('--scale-factor', settings.scale);
            scene.style.setProperty('--rotation-x', settings.rotateX + 'deg');
            scene.style.setProperty('--translate-y', settings.translateY + '%');
        }
    }

    // ===================================
    // 3. 设备间距智能调整
    // ===================================

    /**
     * 动态调整设备间距防止重叠
     */
    function adjustEquipmentSpacing() {
        const equipment = document.querySelectorAll('.equipment');
        const centerPanel = document.querySelector('.center-panel');

        if (!centerPanel || equipment.length === 0) return;

        const containerWidth = centerPanel.offsetWidth;
        const screenType = getScreenType();

        // 根据屏幕类型设置不同的间距策略
        let spacingStrategy = {};

        if (screenType === 'small-14inch') {
            // 1366×768 - 最紧凑布局
            spacingStrategy = {
                baseScale: 0.6,
                minSpacing: 8,
                positions: [2, 9, 17, 26, 41, 53, 63, 71, 80]
            };
        } else if (screenType === 'medium-14inch') {
            // 1440×900 - 适中布局
            spacingStrategy = {
                baseScale: 0.7,
                minSpacing: 10,
                positions: [4, 11, 20, 30, 44, 56, 66, 74, 82]
            };
        } else {
            // 默认布局
            spacingStrategy = {
                baseScale: 0.85,
                minSpacing: 12,
                positions: [5, 13, 22, 32, 46, 59, 69, 77, 85]
            };
        }

        // 应用新的位置和缩放
        equipment.forEach((eq, index) => {
            if (index < spacingStrategy.positions.length) {
                eq.style.left = spacingStrategy.positions[index] + '%';
                eq.style.transform = `scale(${spacingStrategy.baseScale})`;

                // 添加最小间距保护
                const rect = eq.getBoundingClientRect();
                if (index > 0) {
                    const prevRect = equipment[index - 1].getBoundingClientRect();
                    if (rect.left - prevRect.right < spacingStrategy.minSpacing) {
                        const newLeft = parseFloat(eq.style.left) + 2;
                        eq.style.left = newLeft + '%';
                    }
                }
            }
        });
    }

    // ===================================
    // 4. 面板折叠管理
    // ===================================

    /**
     * 初始化面板折叠功能
     */
    function initPanelCollapse() {
        const sidePanels = document.querySelectorAll('.side-panel');
        const screenType = getScreenType();

        // 14英寸屏幕自动启用折叠
        const shouldAutoCollapse = ['small-14inch', 'medium-14inch'].includes(screenType);

        sidePanels.forEach(panel => {
            // 添加折叠指示器
            if (!panel.querySelector('.collapse-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'collapse-indicator';
                indicator.innerHTML = '▶';
                panel.appendChild(indicator);
            }

            if (shouldAutoCollapse) {
                // 初始折叠状态
                panel.classList.add('auto-collapse');

                // 鼠标悬停展开
                panel.addEventListener('mouseenter', function() {
                    this.classList.add('expanded');
                    this.style.zIndex = '1000';
                });

                // 鼠标离开折叠
                panel.addEventListener('mouseleave', function() {
                    this.classList.remove('expanded');
                    this.style.zIndex = '';
                });

                // 触摸设备点击切换
                panel.addEventListener('click', function(e) {
                    if (e.target.classList.contains('collapse-indicator')) {
                        this.classList.toggle('expanded');
                    }
                });
            }
        });
    }

    /**
     * 切换面板折叠状态
     * @param {string} panelId - 面板ID
     */
    window.togglePanel = function(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.toggle('collapsed');
            panel.classList.toggle('expanded');

            // 保存状态到localStorage
            const isCollapsed = panel.classList.contains('collapsed');
            localStorage.setItem(`panel_${panelId}_collapsed`, isCollapsed);
        }
    };

    // ===================================
    // 5. 底部面板优化
    // ===================================

    /**
     * 初始化底部面板折叠
     */
    function initBottomPanelCollapse() {
        const bottomPanels = document.querySelector('.bottom-panels');
        if (!bottomPanels) return;

        const screenType = getScreenType();

        // 创建折叠头部
        if (!bottomPanels.querySelector('.panels-header')) {
            const header = document.createElement('div');
            header.className = 'panels-header';
            header.innerHTML = `
                <span>实时运行监控</span>
                <span class="toggle-icon">▼</span>
            `;
            bottomPanels.insertBefore(header, bottomPanels.firstChild);

            // 点击切换折叠状态
            header.addEventListener('click', function() {
                bottomPanels.classList.toggle('minimized');
                const icon = this.querySelector('.toggle-icon');
                icon.textContent = bottomPanels.classList.contains('minimized') ? '▲' : '▼';
            });
        }

        // 小屏幕默认最小化
        if (['ultra-small', 'small-14inch'].includes(screenType)) {
            bottomPanels.classList.add('minimized');
        }
    }

    // ===================================
    // 6. 文本大小自适应
    // ===================================

    /**
     * 动态调整文本大小
     */
    function adjustTextSize() {
        const root = document.documentElement;
        const screenType = getScreenType();

        const fontSizes = {
            'ultra-small': '11px',
            'small-14inch': '12px',
            'medium-14inch': '13px',
            'large-14inch': '14px',
            'full-hd-14inch': '15px',
            'large-screen': '16px'
        };

        root.style.fontSize = fontSizes[screenType] || '16px';

        // 调整特定元素的字体大小
        const title = document.querySelector('.title');
        if (title) {
            const titleSizes = {
                'ultra-small': '18px',
                'small-14inch': '22px',
                'medium-14inch': '26px',
                'large-14inch': '28px',
                'full-hd-14inch': '30px',
                'large-screen': '32px'
            };
            title.style.fontSize = titleSizes[screenType] || '32px';
        }
    }

    // ===================================
    // 7. 性能优化
    // ===================================

    /**
     * 应用性能优化
     */
    function optimizePerformance() {
        const screenType = getScreenType();
        const isSmallScreen = ['ultra-small', 'small-14inch', 'medium-14inch'].includes(screenType);

        if (isSmallScreen) {
            // 降低动画质量
            document.body.classList.add('reduce-motion');

            // 减少阴影复杂度
            const equipment = document.querySelectorAll('.equipment');
            equipment.forEach(eq => {
                eq.style.boxShadow = 'none';
            });

            // 简化过渡效果
            const style = document.createElement('style');
            style.id = 'performance-optimization';
            style.textContent = `
                .reduce-motion * {
                    transition-duration: 0.1s !important;
                    animation-duration: 0.1s !important;
                }
                .reduce-motion .equipment:hover {
                    transform: translateY(-2px);
                }
                .reduce-motion .face,
                .reduce-motion .chamber {
                    box-shadow: none !important;
                }
            `;

            if (!document.getElementById('performance-optimization')) {
                document.head.appendChild(style);
            }

            // 限制Three.js渲染质量（如果使用）
            const threeCanvas = document.querySelector('#threejs-view canvas');
            if (threeCanvas) {
                threeCanvas.style.imageRendering = 'optimizeSpeed';
            }
        }
    }

    // ===================================
    // 8. 视口监听和响应
    // ===================================

    /**
     * 处理窗口大小变化
     */
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            adjustSceneScale();
            adjustEquipmentSpacing();
            adjustTextSize();

            // 重新检测屏幕类型
            const screenType = getScreenType();
            document.body.setAttribute('data-screen-type', screenType);

            console.log(`屏幕类型：${screenType}，窗口尺寸：${window.innerWidth}×${window.innerHeight}`);
        }, 250);
    }

    // ===================================
    // 9. 本地存储管理
    // ===================================

    /**
     * 恢复用户偏好设置
     */
    function restoreUserPreferences() {
        // 恢复面板折叠状态
        const panels = document.querySelectorAll('.side-panel');
        panels.forEach(panel => {
            const isCollapsed = localStorage.getItem(`panel_${panel.id}_collapsed`) === 'true';
            if (isCollapsed) {
                panel.classList.add('collapsed');
            }
        });

        // 恢复缩放级别（如果用户自定义过）
        const customScale = localStorage.getItem('custom_scene_scale');
        if (customScale) {
            const scene = document.querySelector('.scene');
            if (scene) {
                scene.style.setProperty('--scale-factor', customScale);
            }
        }
    }

    // ===================================
    // 10. 初始化和事件绑定
    // ===================================

    /**
     * 初始化所有功能
     */
    function initialize() {
        // 检测屏幕类型
        const is14Inch = is14InchLaptop();
        const screenType = getScreenType();

        console.log(`
            ========================================
            尿素包膜生产线3D系统 - 响应式优化
            ========================================
            14英寸屏幕检测: ${is14Inch ? '是' : '否'}
            屏幕类型: ${screenType}
            屏幕分辨率: ${window.screen.width}×${window.screen.height}
            视口尺寸: ${window.innerWidth}×${window.innerHeight}
            设备像素比: ${window.devicePixelRatio}
            ========================================
        `);

        // 添加屏幕类型标记
        document.body.setAttribute('data-screen-type', screenType);
        if (is14Inch) {
            document.body.classList.add('laptop-14inch');
        }

        // 执行所有优化
        adjustSceneScale();
        adjustEquipmentSpacing();
        initPanelCollapse();
        initBottomPanelCollapse();
        adjustTextSize();
        restoreUserPreferences();

        // 14英寸屏幕应用性能优化
        if (is14Inch || ['small-14inch', 'medium-14inch'].includes(screenType)) {
            optimizePerformance();
        }

        // 添加CSS文件（如果尚未添加）
        if (!document.querySelector('link[href*="responsive-14inch.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'responsive-14inch.css';
            document.head.appendChild(link);
        }
    }

    // ===================================
    // 11. 公共API
    // ===================================

    // 导出公共方法供外部调用
    window.ResponsiveEnhance = {
        init: initialize,
        adjustScale: adjustSceneScale,
        adjustSpacing: adjustEquipmentSpacing,
        adjustText: adjustTextSize,
        is14Inch: is14InchLaptop,
        getScreenType: getScreenType,
        togglePanel: togglePanel,
        optimize: optimizePerformance
    };

    // ===================================
    // 12. 自动初始化
    // ===================================

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 监听屏幕方向变化
    if (window.matchMedia) {
        const orientationQuery = window.matchMedia('(orientation: portrait)');
        orientationQuery.addListener(handleResize);
    }

    // 监听全屏切换
    document.addEventListener('fullscreenchange', handleResize);

})();

// ===================================
// 辅助工具函数
// ===================================

/**
 * 手动调整场景缩放（供调试使用）
 * @param {number} scale - 缩放比例
 */
window.setSceneScale = function(scale) {
    const scene = document.querySelector('.scene');
    if (scene) {
        scene.style.setProperty('--scale-factor', scale);
        localStorage.setItem('custom_scene_scale', scale);
        console.log(`场景缩放已设置为: ${scale}`);
    }
};

/**
 * 重置所有自定义设置
 */
window.resetCustomSettings = function() {
    localStorage.clear();
    location.reload();
};