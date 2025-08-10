

// 1. 初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.FogExp2(0x050510, 0.002);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 添加控制器便于调试
    // 3. 添加OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
// 2. 激光材质
class LaserMaterial extends THREE.ShaderMaterial {
  constructor(color) {
    super({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uBrightness: { value: 1.0 },
        uSpeed: { value: 1.0 },
        uLength: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uBrightness;
        uniform float uSpeed;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // 核心光束
          float beam = smoothstep(0.7, 1.0, 1.0 - abs(vUv.x - 0.5) * 2.0);
          
          // 长度渐变
          float lengthFade = smoothstep(0.0, 0.3, vUv.y) * 
                           (1.0 - smoothstep(0.7, 1.0, vUv.y));
          
          // 动态效果
          float pulse = 0.8 + 0.2 * sin(uTime * uSpeed * 2.0);
          
          // 组合效果
          float intensity = beam * lengthFade * pulse * uBrightness;
          vec3 finalColor = uColor * intensity;
          
          gl_FragColor = vec4(finalColor, intensity * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }
}

// 3. 扫动激光类
class SweepingLaser {
  constructor(options) {
    this.options = {
      startPosition: new THREE.Vector3(0, 0, 0),
      endPosition: new THREE.Vector3(0, 0, -10),
      color: 0xff0000,
      width: 0.3,
      speed: 1.0,
      brightness: 1.0,
      sweepRange: Math.PI / 3,
      sweepSpeed: 0.5,
      ...options
    };
    
    this.group = new THREE.Group();
    this.group.position.copy(this.options.startPosition);
    
    // 计算方向和长度
    this.direction = new THREE.Vector3().subVectors(
      this.options.endPosition, 
      this.options.startPosition
    ).normalize();
    this.length = this.options.startPosition.distanceTo(this.options.endPosition);
    
    // 创建光束几何体 - 调整原点位置
    this.geometry = new THREE.PlaneGeometry(this.options.width, this.length, 1, 32);
    
    // 将几何体沿Y轴移动，使起点在原点
    this.geometry.translate(0, this.length/2, 0);
    
    this.material = new LaserMaterial(this.options.color);
    this.beam = new THREE.Mesh(this.geometry, this.material);
    
    // 调整旋转方式 - 使用lookAt确保方向准确
    this.beam.rotation.x = -Math.PI / 2; // 调整旋转方向
    this.beam.lookAt(this.direction);
    
    this.group.add(this.beam);
    this.time = 0;
    this.sweepAngle = 0;
  }
  updateDir(options){
    this.options = {
      startPosition: new THREE.Vector3(0, 0, 0),
      endPosition: new THREE.Vector3(0, 0, -10),
      color: 0xff0000,
      width: 0.3,
      speed: 1.0,
      brightness: 1.0,
      sweepRange: Math.PI / 3,
      sweepSpeed: 0.5,
      ...options
    };
     const udirection = new THREE.Vector3().subVectors(
      this.options.endPosition, 
      this.options.startPosition
    ).normalize();
     this.beam.lookAt(udirection);
  // 更新材质
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uBrightness.value = this.options.brightness;
    this.material.uniforms.uSpeed.value = this.options.speed;
  }
  update(delta) {
    this.time += delta;
    this.sweepAngle += delta * this.options.sweepSpeed;
    
    const currentAngle = Math.sin(this.sweepAngle) * this.options.sweepRange;
    const direction = this.direction.clone()
      .applyAxisAngle(new THREE.Vector3(10, 10, -10), 0);
    
    // 更新光束方向
    // this.beam.lookAt(direction);
    
    // 更新材质
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uBrightness.value = this.options.brightness;
    this.material.uniforms.uSpeed.value = this.options.speed;
  }
}

// 4. 创建激光系统
const laserSystem = {
  lasers: [],
  clock: new THREE.Clock(),
  
  addLaser(options) {
    const laser = new SweepingLaser(options);
    this.lasers.push(laser);
    scene.add(laser.group);
    return laser;
  },
  
  update() {
    const delta = this.clock.getDelta();
    this.lasers.forEach(laser => laser.update(delta));
    controls.update();
  }
};

// 5. 创建两条独立扫动的激光
const laser1 = laserSystem.addLaser({
  startPosition: new THREE.Vector3(10, 0, 0),
  endPosition: new THREE.Vector3(-11, 10, 12),
  color: 0xff5555,
  width: 2,
  brightness: 2,
  sweepRange:1,
  sweepSpeed: 0
});

const laser2 = laserSystem.addLaser({
  startPosition: new THREE.Vector3(10, 0, 0),
  endPosition: new THREE.Vector3(7,-50, 10),
  color: 0x55aaff,
  width: 1.5,
  brightness: 2,
  sweepRange:0,
  sweepSpeed:0
});


// 6. 添加坐标辅助和地面网格
const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// 7. 动画循环
function animate() {
  requestAnimationFrame(animate);
  laserSystem.update();
  renderer.render(scene, camera);
}

animate();

setTimeout(()=>{
  let laserArr=laserSystem.lasers
  let laser1=laserArr[1]
  let l1options=laser1['options']

  let  startPosition= new THREE.Vector3(10, 0, 0)
  let endPosition = new THREE.Vector3(5,-50, 2)
  l1options['startPosition']=startPosition
  l1options['endPosition']=endPosition
  laser1.updateDir(l1options)
console.log("尝试在控制台操作激光:",l1options);
},2000)

// 8. 窗口大小调整
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 控制台测试命令
console.log("尝试在控制台操作激光:");
console.log("laser1.options.brightness = 2.0; // 增加激光1亮度");
console.log("laser2.options.sweepSpeed = 0.8; // 加快激光2扫动速度");