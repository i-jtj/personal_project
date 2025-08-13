/**
 * 激光同步顺序过渡动画系统
 * @param {Array} laserArr 激光实例数组 
 * @param {Number} duration 过渡持续时间(秒)
 * @param {Function} easingFunc 缓动函数(0-1)
 */
function createSyncLaserSystem(laserArr, duration = 3, easingFunc = t => t) {
  // 验证并初始化Vector3
  if (!Array.isArray(laserArr)) throw new Error('laserArr必须为数组');
  if (laserArr.length < 2) throw new Error('至少需要2个激光实例');
console.log('laserArr',laserArr)
  // 确保所有位置都是THREE.Vector3
  const lasers = laserArr.map(laser => {
    const instance =laser; // 浅拷贝
    if (!instance.options) instance.options = {};

    ['startPosition', 'endPosition'].forEach(key => {
      if (!(instance.options[key] instanceof THREE.Vector3)) {
        const pos = instance.options[key] || {};
        instance.options[key] = new THREE.Vector3(pos.x || 0, pos.y || 0, pos.z || 0);
      }
    });
    return instance;
  });
  // 状态变量
  let progress = 0;
  let isPlaying = false;
  let animationId = null;
  let lastTime = null;
  
  // 保存所有激光的初始和目标位置
  const originalPositions = lasers.map(laser => ({
    start: laser.options.startPosition.clone(),
    end: laser.options.endPosition.clone()
  }));

  // 获取每个激光的目标位置（下一激光的初始终点）
  function getTargetPositions() {
    return lasers.map((_, index) => {
      const nextIndex = (index + 1) % lasers.length;
      return originalPositions[nextIndex].end.clone();
    });
  }

  // 更新所有激光位置
  function updateLasers(t) {
    const easedT = easingFunc(t);
    const targetPositions = getTargetPositions();

    lasers.forEach((laser, index) => {
      // 计算新位置（从当前位置到下一个目标位置）
      const newPosition = laser.options.endPosition.clone().lerp(
        targetPositions[index],
        easedT
      );

      // 更新激光位置
      laser.options.endPosition.copy(newPosition);
        // console.log('updateDir-T',lasers)

      // 调用更新方法
      if (typeof laser.updateDir === 'function') {
        laser.updateDir(laser.options);
      }
    });
  }

  // 动画循环
  function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    progress += deltaTime / duration;

    // 更新所有激光
    updateLasers(progress);

    // 完成一轮过渡后重置（无缝循环）
    if (progress >= 1) {
      progress = 0;
      // 更新原始位置为当前达到的位置
      lasers.forEach((laser, index) => {
        originalPositions[index].end.copy(laser.options.endPosition);
      });
    }

    if (isPlaying) {
      animationId = requestAnimationFrame(animate);
    }
  }

  return {
    start() {
      if (isPlaying) return;
      isPlaying = true;
      lastTime = null;
      animationId = requestAnimationFrame(animate);
    },
    stop() {
      isPlaying = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    setDuration(newDuration) {
      duration = Math.max(0.1, newDuration);
    },
    setEasingFunc(newEasingFunc) {
      easingFunc = typeof newEasingFunc === 'function' ? newEasingFunc : t => t;
    },
    reset() {
      lasers.forEach((laser, index) => {
        laser.options.endPosition.copy(originalPositions[index].end);
        if (typeof laser.updateDir === 'function') {
          laser.updateDir(laser.options);
        }
      });
      progress = 0;
    }
  };
}


export {createSyncLaserSystem}