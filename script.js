/**
 * 尿素包膜生产线3D全景模拟系统
 * 主要功能：设备状态控制、实时监控、故障模拟、参数调节
 * - 设备状态控制（启动/停止）
 * - 3D视图操作（旋转/重置）
 * - 自动运行模式
 * - 实时参数调节
 * - 故障模拟与恢复
 */

// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素引用
    const equipments = document.querySelectorAll('.equipment');
    const startAllBtn = document.getElementById('start-all');
    const stopAllBtn = document.getElementById('stop-all');
    const autoModeBtn = document.getElementById('auto-mode');
    const rotateViewBtn = document.getElementById('rotate-view');
    const resetViewBtn = document.getElementById('reset-view');
    const scene = document.querySelector('.scene');
    const infoPanel = document.getElementById('equipment-info');
    
    // 监控与参数控制元素
    const monitorItems = document.querySelectorAll('.monitor-item');
    const statusIndicators = document.querySelectorAll('.status-indicator');
    const parameterSliders = document.querySelectorAll('.parameter-slider');
    const parameterValues = document.querySelectorAll('.parameter-value');
    
    // 故障模拟相关元素
    const faultSelector = document.getElementById('fault-selector');
    const faultType = document.getElementById('fault-type');
    const triggerFaultBtn = document.getElementById('trigger-fault');
    const resetFaultBtn = document.getElementById('reset-fault');
    const faultStatus = document.getElementById('fault-status');
    
    /**
     * 设备详细信息对象
     * 包含每个设备的技术参数和规格说明
     */
    const equipmentInfo = {
        'material-feeding': `
            <strong>电机械振动式投料机</strong><br>
            类型：电机械振动式<br>
            容量：42-280吨/小时（基于100 lbs/ft³沙子，0°-10°坡度，40 ft/min流速）<br>
            槽体尺寸：长度48-120英寸，宽度26-46英寸，深度6-15英寸<br>
            驱动方式：双旋转电动机（RE 5-6, 9-6, 13-6, 18-6, 24-6, 34-6, 45-6）<br>
            隔离方式：空气弹簧、弹簧、橡胶垫<br>
            控制方式：变频控制和动态刹车<br>
            槽体形状：标准波纹、锥形
        `,
        'z-elevator': `
            <strong>Z型提升机</strong><br>
            卸料高度：3296 mm<br>
            底部水平段：863 mm<br>
            机身材质：SUS304不锈钢<br>
            料斗容量：1.8L/6L可选<br>
            料斗倾斜角度：30°-45°<br>
            链条规格：节距38.1 mm<br>
            链轮直径：200-400 mm<br>
            运行速度：9-11 m/min（约0.15-0.18 m/s）<br>
            电机功率：2.2kW<br>
            适用物料：颗粒物，密度600-800 kg/m³
        `,
        'batch-separator': `
            <strong>液压分批筒</strong><br>
            几何参数：内径50 mm，杆径30 mm，行程200 mm，总长300 mm<br>
            安装类型：铰链式<br>
            端口大小：SAE 4<br>
            材质：筒体为碳钢，杆为铬镀层钢<br>
            表面处理：铬镀层<br>
            最大工作压力：210 bar<br>
            流量：10 L/min<br>
            速度：50 mm/s<br>
            循环时间：8秒
        `,
        'conveyor-20m': `
            <strong>2×20米输送机</strong><br>
            长度：2×20米<br>
            宽度：650mm<br>
            传送速度：可调<br>
            驱动方式：电机驱动皮带式<br>
            载重能力：与生产线处理能力匹配
        `,
        'conveyor-14m': `
            <strong>2×14米输送机</strong><br>
            长度：2×14米<br>
            宽度：650mm<br>
            传送速度：可调<br>
            驱动方式：电机驱动皮带式<br>
            载重能力：与生产线处理能力匹配
        `,
        'coating-machine': `
            <strong>2.44米软包膜剂包膜机</strong><br>
            <span style="text-decoration: underline;">整体尺寸:</span><br>
            长度: 2.44米（涂层盘直径）<br>
            宽度: 约1.8米<br> 
            高度: 约2.8米<br>
            <span style="text-decoration: underline;">涂层盘参数:</span><br>
            直径: 2.44米<br>
            倾斜角度: 约35度<br>
            材质: 不锈钢SUS304<br>
            处理能力: 约50 kg/批次<br>
            <span style="text-decoration: underline;">输送系统:</span><br>
            速度: 约0.8米/分钟<br>
            宽度: 0.65米<br>
            <span style="text-decoration: underline;">动态参数:</span><br>
            盘旋转速度: 8-10 RPM<br>
            喷涂时间: 约90分钟/批次<br>
            驱动电机: 5.5 kW
        `,
        'big-elevator': `
            <strong>17米大提升运送装置</strong><br>
            提升高度：17米<br>
            传送方式：链轮驱动皮带式，带料斗<br>
            处理能力：与生产线匹配<br>
            功能：将包膜后的物料提升至冷却塔
        `,
        'cooling-tower': `
            <strong>立窗式冷却装置</strong><br>
            类型：立窗式<br>
            冷却方式：空气流动冷却<br>
            功能：降低物料温度，固化包膜层<br>
            处理能力：与生产线匹配
        `,
        'packaging-machine': `
            <strong>包装机</strong><br>
            功能：将成品包装入袋或桶<br>
            包装规格：可调<br>
            速度：匹配生产线处理能力<br>
            包装方式：自动计量、填充、封口
        `
    };
    
    /**
     * 设备参数和状态对象
     * 存储每个设备的当前参数值和运行状态
     */
    const equipmentParams = {
        'material-feeding': { vibration: 60, status: 'stopped' },
        'z-elevator': { speed: 10, status: 'stopped' },
        'batch-separator': { cycle: 8, status: 'stopped' },
        'conveyor-20m': { speed: 40, status: 'stopped' },
        'conveyor-14m': { speed: 40, status: 'stopped' },
        'coating-machine': { rotation: 9, status: 'stopped' },
        'big-elevator': { speed: 10, status: 'stopped' },
        'cooling-tower': { airflow: 20, status: 'stopped' },
        'packaging-machine': { speed: 10, status: 'stopped' }
    };
    
    /**
     * 当前活动故障
     * 记录当前活动故障的设备ID和故障类型
     */
    let activeFault = {
        equipmentId: null,
        type: null
    };
    
    // ===== 控制面板功能 =====
    
    /**
     * 启动所有设备
     * 逐个启动设备，模拟生产线顺序启动的过程
     */
    startAllBtn.addEventListener('click', function() {
        // 如果存在故障，则不能启动
        if (activeFault.equipmentId) {
            alert('系统存在故障，请先排除故障！');
            return;
        }
        
        // 按顺序启动设备，模拟实际生产线的启动顺序
        const startSequence = [
            'material-feeding',
            'z-elevator',
            'batch-separator',
            'conveyor-20m',
            'conveyor-14m',
            'coating-machine',
            'big-elevator',
            'cooling-tower',
            'packaging-machine'
        ];
        
        // 定时启动每个设备，创造更真实的启动效果
        let startIndex = 0;
        const startInterval = setInterval(() => {
            if (startIndex < startSequence.length) {
                const equipment = document.getElementById(startSequence[startIndex]);
                if (equipment) {
                    startEquipment(equipment);
                }
                startIndex++;
            } else {
                clearInterval(startInterval);
            }
        }, 500); // 每0.5秒启动一台设备
        
        // 更新监控面板状态
        updateMonitorPanelStatus('running');
    });
    
    /**
     * 停止所有设备
     * 逐个停止设备，模拟生产线顺序停止的过程
     */
    stopAllBtn.addEventListener('click', function() {
        // 按相反顺序停止设备，模拟实际生产线的停止顺序
        const stopSequence = [
            'packaging-machine',
            'cooling-tower',
            'big-elevator', 
            'coating-machine',
            'conveyor-14m',
            'conveyor-20m',
            'batch-separator',
            'z-elevator',
            'material-feeding'
        ];
        
        let stopIndex = 0;
        const stopInterval = setInterval(() => {
            if (stopIndex < stopSequence.length) {
                const equipment = document.getElementById(stopSequence[stopIndex]);
                if (equipment) {
                    stopEquipment(equipment);
                }
                stopIndex++;
            } else {
                clearInterval(stopInterval);
            }
        }, 300); // 每0.3秒停止一台设备
        
        // 更新监控面板状态
        updateMonitorPanelStatus('stopped');
    });
    
    // ===== 设备控制功能 =====
    
    /**
     * 启动单个设备
     * @param {HTMLElement} equipment - 要启动的设备DOM元素
     */
    function startEquipment(equipment) {
        // 如果设备存在故障，则不能启动
        if (equipment.classList.contains('fault')) {
            return;
        }
        
        equipment.classList.remove('stopped');
        equipment.classList.add('running');
        const status = equipment.querySelector('.status');
        if (status) status.textContent = '运行中';
        
        // 更新设备状态对象
        const id = equipment.id;
        if (equipmentParams[id]) {
            equipmentParams[id].status = 'running';
        }
        
        // 更新对应的监控项
        updateMonitorItem(id, 'running');
    }
    
    /**
     * 停止单个设备
     * @param {HTMLElement} equipment - 要停止的设备DOM元素
     */
    function stopEquipment(equipment) {
        equipment.classList.remove('running');
        equipment.classList.add('stopped');
        const status = equipment.querySelector('.status');
        if (status) status.textContent = '停止';
        
        // 更新设备状态对象
        const id = equipment.id;
        if (equipmentParams[id]) {
            equipmentParams[id].status = 'stopped';
        }
        
        // 更新对应的监控项
        updateMonitorItem(id, 'stopped');
    }
    
    // 为每个设备添加点击功能
    equipments.forEach(equipment => {
        equipment.addEventListener('click', function(e) {
            // 自动模式下不允许手动控制设备
            if (!autoModeBtn.classList.contains('active')) {
                // 如果设备没有故障，则可以切换状态
                if (!this.classList.contains('fault')) {
                    if (this.classList.contains('running')) {
                        stopEquipment(this);
                    } else {
                        startEquipment(this);
                    }
                }
            }
            
            // 突出显示当前选中的设备
            equipments.forEach(eq => eq.classList.remove('selected'));
            this.classList.add('selected');
            
            // 显示设备信息
            const id = this.id;
            if (equipmentInfo[id]) {
                infoPanel.innerHTML = equipmentInfo[id];
            }
        });
    });
    
    // ===== 自动模式功能 =====
    let autoModeInterval;
    
    /**
     * 自动模式 - 自动循环运行各设备
     */
    autoModeBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        
        if (this.classList.contains('active')) {
            // 如果存在故障，则不能启动自动模式
            if (activeFault.equipmentId) {
                alert('系统存在故障，请先排除故障！');
                this.classList.remove('active');
                return;
            }
            
            // 激活自动模式
            let currentIndex = 0;
            equipments.forEach(equipment => stopEquipment(equipment));
            
            autoModeInterval = setInterval(function() {
                // 停止前一个设备
                if (currentIndex > 0) {
                    stopEquipment(equipments[currentIndex - 1]);
                }
                
                // 启动当前设备
                if (currentIndex < equipments.length) {
                    startEquipment(equipments[currentIndex]);
                    
                    // 滚动到当前设备
                    equipments[currentIndex].scrollIntoView({behavior: 'smooth', block: 'center'});
                    
                    // 突出显示当前设备
                    equipments.forEach(eq => eq.classList.remove('selected'));
                    equipments[currentIndex].classList.add('selected');
                    
                    // 显示设备信息
                    const id = equipments[currentIndex].id;
                    if (equipmentInfo[id]) {
                        infoPanel.innerHTML = equipmentInfo[id];
                    }
                    
                    currentIndex++;
                } else {
                    // 循环完成，重新开始
                    currentIndex = 0;
                }
            }, 5000); // 每5秒切换一个设备
        } else {
            // 停用自动模式
            clearInterval(autoModeInterval);
            equipments.forEach(equipment => stopEquipment(equipment));
        }
    });
    
    // ===== 3D视图控制 =====
    let isRotating = false;
    let rotationInterval;
    let rotateY = 0;
    
    /**
     * 旋转视图 - 控制3D场景旋转
     */
    rotateViewBtn.addEventListener('click', function() {
        if (!isRotating) {
            // 开始旋转
            isRotating = true;
            this.textContent = '停止旋转';
            rotationInterval = setInterval(function() {
                rotateY += 0.5; // 减慢旋转速度，更平滑
                scene.style.transform = `rotateX(20deg) rotateY(${rotateY}deg)`;
            }, 30);
        } else {
            // 停止旋转
            isRotating = false;
            this.textContent = '旋转视图';
            clearInterval(rotationInterval);
        }
    });
    
    /**
     * 重置视图 - 恢复3D场景默认角度
     */
    resetViewBtn.addEventListener('click', function() {
        // 重置视图
        isRotating = false;
        rotateViewBtn.textContent = '旋转视图';
        clearInterval(rotationInterval);
        rotateY = 0;
        scene.style.transform = 'rotateX(20deg) rotateY(0deg)';
    });
    
    // ===== 参数调节功能 =====
    
    /**
     * 处理参数滑块变化
     * 更新参数值显示和设备动画
     */
    parameterSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const paramType = this.dataset.param;
            const equipmentId = this.closest('.monitor-item').dataset.equipment;
            const valueDisplay = this.nextElementSibling;
            
            // 更新参数值显示
            let unitSuffix = '';
            switch(paramType) {
                case 'vibration': unitSuffix = 'Hz'; break;
                case 'speed': 
                    if (equipmentId === 'z-elevator' || equipmentId === 'big-elevator') {
                        unitSuffix = 'm/min';
                    } else if (equipmentId === 'packaging-machine') {
                        unitSuffix = '袋/min';
                    } else {
                        unitSuffix = 'm/min';
                    }
                    break;
                case 'cycle': unitSuffix = '秒'; break;
                case 'rotation': unitSuffix = 'RPM'; break;
                case 'airflow': unitSuffix = 'm/s'; break;
                default: unitSuffix = '';
            }
            
            const value = this.value;
            valueDisplay.textContent = value + unitSuffix;
            
            // 更新设备参数对象
            if (equipmentParams[equipmentId] && paramType in equipmentParams[equipmentId]) {
                equipmentParams[equipmentId][paramType] = parseFloat(value);
            }
            
            // 更新设备动画
            updateEquipmentAnimation(equipmentId, paramType, value);
        });
    });
    
    /**
     * 更新设备动画效果
     * 根据参数值调整设备的动画速度或其他视觉效果
     * @param {string} equipmentId - 设备ID
     * @param {string} paramType - 参数类型
     * @param {number} value - 参数值
     */
    function updateEquipmentAnimation(equipmentId, paramType, value) {
        const equipment = document.getElementById(equipmentId);
        if (!equipment || equipment.classList.contains('stopped')) return;
        
        // 根据设备类型和参数类型调整动画
        switch (equipmentId) {
            case 'material-feeding':
                if (paramType === 'vibration') {
                    // 调整振动频率
                    const vibrator = equipment.querySelector('.vibrator');
                    const material = equipment.querySelector('.material');
                    
                    if (vibrator && material) {
                        // 值越高，振动越快
                        const animationDuration = 1 - (value - 40) / 60; // 映射到0.33到1秒
                        vibrator.style.animationDuration = `${animationDuration}s`;
                        material.style.animationDuration = `${animationDuration}s`;
                    }
                }
                break;
                
            case 'z-elevator':
                if (paramType === 'speed') {
                    // 调整运行速度
                    const bucketsContainer = equipment.querySelector('.buckets-container');
                    const chainDetail = equipment.querySelector('.chain-detail');
                    
                    if (bucketsContainer && chainDetail) {
                        // 值越高，运动越快
                        const animationDuration = 12 - (value - 9) * 2; // 映射到8-12秒
                        bucketsContainer.style.animationDuration = `${animationDuration}s`;
                        chainDetail.style.animationDuration = `${animationDuration}s`;
                    }
                }
                break;
                
            case 'batch-separator':
                if (paramType === 'cycle') {
                    // 调整循环时间
                    const pistonRod = equipment.querySelector('.piston-rod');
                    const pistonEnd = equipment.querySelector('.piston-end');
                    const material = equipment.querySelector('.material');
                    
                    if (pistonRod && material) {
                        // 直接使用循环时间值
                        pistonRod.style.animationDuration = `${value}s`;
                        pistonEnd.style.animationDuration = `${value}s`;
                        material.style.animationDuration = `${value}s`;
                    }
                }
                break;
                
            case 'conveyor-20m':
            case 'conveyor-14m':
                if (paramType === 'speed') {
                    // 调整输送带速度
                    const belt = equipment.querySelector('.belt');
                    const materialFlow = equipment.querySelector('.material-flow');
                    
                    if (belt && materialFlow) {
                        // 值越高，运动越快
                        const beltDuration = 40 / value; // 速度与动画时间成反比
                        belt.style.animationDuration = `${beltDuration}s`;
                        materialFlow.style.animationDuration = `${beltDuration * 1.2}s`;
                    }
                }
                break;
                
            case 'coating-machine':
                if (paramType === 'rotation') {
                    // 调整旋转速度
                    const panInterior = equipment.querySelector('.pan-interior');
                    const particles = equipment.querySelector('.material-particles');
                    
                    if (panInterior && particles) {
                        // 值越高，旋转越快
                        const rotationDuration = 10 / value;
                        panInterior.style.animationDuration = `${rotationDuration}s`;
                        particles.style.animationDuration = `${rotationDuration * 0.8}s`;
                    }
                }
                break;
                
            case 'big-elevator':
                if (paramType === 'speed') {
                    // 调整提升速度
                    const buckets = equipment.querySelector('.buckets');
                    
                    if (buckets) {
                        // 值越高，提升越快
                        const elevationDuration = 12 - (value - 5);
                        buckets.style.animationDuration = `${elevationDuration}s`;
                    }
                }
                break;
                
            case 'cooling-tower':
                if (paramType === 'airflow') {
                    // 调整风速
                    const airFlow = equipment.querySelector('.air-flow');
                    
                    if (airFlow) {
                        // 值越高，流动越快
                        const airflowDuration = 30 / value;
                        airFlow.style.animationDuration = `${airflowDuration}s`;
                    }
                }
                break;
                
            case 'packaging-machine':
                if (paramType === 'speed') {
                    // 调整包装速度
                    const packageElem = equipment.querySelector('.package');
                    
                    if (packageElem) {
                        // 值越高，包装越快
                        const packagingDuration = 10 / value;
                        packageElem.style.animationDuration = `${packagingDuration}s`;
                    }
                }
                break;
        }
    }
    
    /**
     * 更新监控面板状态
     * @param {string} status - 状态类型 ('running', 'stopped', 'fault')
     */
    function updateMonitorPanelStatus(status) {
        statusIndicators.forEach(indicator => {
            const equipmentId = indicator.closest('.monitor-item').dataset.equipment;
            const equipment = document.getElementById(equipmentId);
            
            // 如果设备有故障，则不更新状态
            if (equipment && equipment.classList.contains('fault')) {
                return;
            }
            
            indicator.className = 'status-indicator';
            indicator.classList.add(status);
            
            switch(status) {
                case 'running':
                    indicator.textContent = '运行中';
                    break;
                case 'stopped':
                    indicator.textContent = '停止';
                    break;
                case 'fault':
                    indicator.textContent = '故障';
                    break;
            }
        });
    }
    
    /**
     * 更新特定设备的监控项状态
     * @param {string} equipmentId - 设备ID
     * @param {string} status - 状态类型
     */
    function updateMonitorItem(equipmentId, status) {
        const monitorItem = document.querySelector(`.monitor-item[data-equipment="${equipmentId}"]`);
        if (!monitorItem) return;
        
        const statusIndicator = monitorItem.querySelector('.status-indicator');
        if (!statusIndicator) return;
        
        statusIndicator.className = 'status-indicator';
        statusIndicator.classList.add(status);
        
        switch(status) {
            case 'running':
                statusIndicator.textContent = '运行中';
                // 启用参数控制
                const slider = monitorItem.querySelector('.parameter-slider');
                if (slider) slider.disabled = false;
                break;
            case 'stopped':
                statusIndicator.textContent = '停止';
                // 禁用参数控制
                const slider2 = monitorItem.querySelector('.parameter-slider');
                if (slider2) slider2.disabled = true;
                break;
            case 'fault':
                statusIndicator.textContent = '故障';
                // 禁用参数控制
                const slider3 = monitorItem.querySelector('.parameter-slider');
                if (slider3) slider3.disabled = true;
                break;
        }
    }
    
    // ===== 故障模拟功能 =====
    
    /**
     * 触发故障
     */
    triggerFaultBtn.addEventListener('click', function() {
        const equipmentId = faultSelector.value;
        const faultTypeValue = faultType.value;
        
        // 检查是否已有活动故障
        if (activeFault.equipmentId) {
            alert('已有故障正在处理中，请先重置故障！');
            return;
        }
        
        setFault(equipmentId, faultTypeValue);
    });
    
    /**
     * 重置故障
     */
    resetFaultBtn.addEventListener('click', function() {
        if (activeFault.equipmentId) {
            clearFault(activeFault.equipmentId);
        } else {
            alert('当前没有活动故障');
        }
    });
    
    /**
     * 设置故障状态
     * @param {string} equipmentId - 设备ID
     * @param {string} faultType - 故障类型
     */
    function setFault(equipmentId, faultType) {
        const equipment = document.getElementById(equipmentId);
        if (!equipment) return;
        
        // 停止设备
        stopEquipment(equipment);
        
        // 添加故障类
        equipment.classList.add('fault');
        equipment.classList.add(`fault-${faultType}`);
        
        // 更新设备状态显示
        const statusElem = equipment.querySelector('.status');
        if (statusElem) {
            let faultText = '';
            switch(faultType) {
                case 'overload': faultText = '故障: 过载'; break;
                case 'jam': faultText = '故障: 卡料'; break;
                case 'motor-failure': faultText = '故障: 电机故障'; break;
                case 'sensor-error': faultText = '故障: 传感器错误'; break;
                case 'power-loss': faultText = '故障: 断电'; break;
                default: faultText = '故障';
            }
            statusElem.textContent = faultText;
        }
        
        // 更新监控项状态
        updateMonitorItem(equipmentId, 'fault');
        
        // 记录活动故障
        activeFault.equipmentId = equipmentId;
        activeFault.type = faultType;
        
        // 更新故障状态信息
        updateFaultStatus(true, equipmentId, faultType);
    }
    
    /**
     * 清除故障状态
     * @param {string} equipmentId - 设备ID
     */
    function clearFault(equipmentId) {
        const equipment = document.getElementById(equipmentId);
        if (!equipment) return;
        
        // 移除所有故障类
        equipment.classList.remove('fault');
        equipment.classList.remove('fault-overload');
        equipment.classList.remove('fault-jam');
        equipment.classList.remove('fault-motor-failure');
        equipment.classList.remove('fault-sensor-error');
        equipment.classList.remove('fault-power-loss');
        
        // 更新设备状态显示
        const statusElem = equipment.querySelector('.status');
        if (statusElem) {
            statusElem.textContent = '停止';
        }
        
        // 更新监控项状态
        updateMonitorItem(equipmentId, 'stopped');
        
        // 清除活动故障记录
        activeFault.equipmentId = null;
        activeFault.type = null;
        
        // 更新故障状态信息
        updateFaultStatus(false);
    }
    
    /**
     * 更新故障状态显示
     * @param {boolean} hasActiveFault - 是否有活动故障
     * @param {string} [equipmentId] - 故障设备ID
     * @param {string} [faultType] - 故障类型
     */
    function updateFaultStatus(hasActiveFault, equipmentId, faultType) {
        if (hasActiveFault) {
            // 设置故障状态显示
            faultStatus.classList.add('active');
            
            // 获取设备名称
            let equipmentName = '';
            switch(equipmentId) {
                case 'material-feeding': equipmentName = '投料机'; break;
                case 'z-elevator': equipmentName = 'Z型提升机'; break;
                case 'batch-separator': equipmentName = '液压分批筒'; break;
                case 'conveyor-20m': equipmentName = '2×20米输送机'; break;
                case 'conveyor-14m': equipmentName = '2×14米输送机'; break;
                case 'coating-machine': equipmentName = '包膜机'; break;
                case 'big-elevator': equipmentName = '17米提升装置'; break;
                case 'cooling-tower': equipmentName = '冷却装置'; break;
                case 'packaging-machine': equipmentName = '包装机'; break;
                default: equipmentName = '未知设备';
            }
            
            // 获取故障类型描述
            let faultTypeDesc = '';
            switch(faultType) {
                case 'overload': faultTypeDesc = '过载'; break;
                case 'jam': faultTypeDesc = '卡料'; break;
                case 'motor-failure': faultTypeDesc = '电机故障'; break;
                case 'sensor-error': faultTypeDesc = '传感器错误'; break;
                case 'power-loss': faultTypeDesc = '断电'; break;
                default: faultTypeDesc = '未知故障';
            }
            
            faultStatus.innerHTML = `<strong>警告:</strong> ${equipmentName}发生${faultTypeDesc}故障，系统停止运行！`;
        } else {
            // 恢复正常状态显示
            faultStatus.classList.remove('active');
            faultStatus.textContent = '系统正常运行';
        }
    }
    
    // ===== 初始化 =====
    
    /**
     * 系统初始化
     * 设置初始状态，配置默认值等
     */
    function initSystem() {
        // 初始化所有设备为停止状态
        equipments.forEach(equipment => {
            stopEquipment(equipment);
        });
        
        // 初始化参数滑块
        parameterSliders.forEach(slider => {
            slider.disabled = true; // 默认禁用，只有设备运行时才启用
            
            // 触发一次input事件以更新参数值显示
            const event = new Event('input');
            slider.dispatchEvent(event);
        });
        
        // 默认选中第一个设备并显示其信息
        if (equipments.length > 0) {
            equipments[0].classList.add('selected');
            const id = equipments[0].id;
            if (equipmentInfo[id]) {
                infoPanel.innerHTML = equipmentInfo[id];
            }
        }
        
        // 监听故障选择器变化
        faultSelector.addEventListener('change', function() {
            // 可以在这里添加特定设备的故障类型选项
        });
    }
    
    // 调用初始化函数
    initSystem();

    /**
     * ========== Three.js 3D模型加载与渲染 ===========
     * 本段代码用于在threejs-view容器中加载并显示在线3D工业模型。
     * 以投料机为例，加载glTF模型。
     */

    // Three.js相关变量（类型见注释）
    var renderer; // THREE.WebGLRenderer
    var scene3D;  // THREE.Scene
    var camera;   // THREE.PerspectiveCamera
    var controls; // OrbitControls（可选）
    var mixer = null; // THREE.AnimationMixer | null

    /**
     * 初始化Three.js场景
     */
    function initThreeJS() {
        // 获取渲染容器
        var container = document.getElementById('threejs-view'); // HTMLElement | null
        if (!container) return;

        // 创建渲染器
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x001a5c, 0.0); // 背景透明
        container.appendChild(renderer.domElement);

        // 创建场景
        scene3D = new THREE.Scene();

        // 添加环境光和方向光
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // 环境光
        scene3D.add(ambientLight);
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.8); // 方向光
        dirLight.position.set(5, 10, 7);
        scene3D.add(dirLight);

        // 创建相机
        camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(2, 2, 6);
        camera.lookAt(0, 1, 0);

        // 渲染循环
        function animate() {
            requestAnimationFrame(animate);
            if (mixer) mixer.update(0.016); // 更新动画
            renderer.render(scene3D, camera);
        }
        animate();
    }

    /**
     * 加载在线glTF模型（以投料机为例）
     * @param url glTF模型的在线URL（string）
     */
    function loadGLTFModel(url) {
        var loader = new THREE.GLTFLoader();
        loader.load(
            url,
            function(gltf) {
                // 加载成功，添加到场景
                scene3D.add(gltf.scene);
                // 如果有动画，自动播放
                if (gltf.animations && gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(gltf.scene);
                    gltf.animations.forEach(function(clip) {
                        mixer.clipAction(clip).play();
                    });
                }
            },
            undefined,
            function(error) {
                console.error('3D模型加载失败:', error);
            }
        );
    }

    // 初始化Three.js
    initThreeJS();
    // 加载真实工业投料机模型（Vibrating Feeder）
    // 来源：KhronosGroup glTF Sample Models - VC (工业机械设备)
    loadGLTFModel('https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/VC/glTF/VC.gltf');
});
 