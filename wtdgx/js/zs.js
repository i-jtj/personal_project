import {laserGroupArr} from './datas.js'
import {createSyncLaserSystem} from './transform.js'

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

  updateDir(options) {
      // 合并参数
      this.options = {
        startPosition: new THREE.Vector3(0, 0, 0),
        endPosition: new THREE.Vector3(0, 0, -10),
        // ...其他默认参数
        ...options
      };
      // 计算并存储方向向量
      this.direction = new THREE.Vector3().subVectors(
        this.options.endPosition, 
        this.options.startPosition
      ).normalize();
      
      // 正确设置光束朝向和位置
      // this.beam.position.copy(this.options.startPosition);
      this.beam.lookAt(this.options.endPosition);
      
      // 调整光束长度
      // const length = this.options.startPosition.distanceTo(this.options.endPosition);
      // this.beam.scale.z = length;
      
      // 更新材质参数
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
// const laser1 = laserSystem.addLaser({
//   startPosition: new THREE.Vector3(10, 0, 0),
//   endPosition: new THREE.Vector3(-11, 10, 12),
//   color: 0xff5555,
//   width: 2,
//   brightness: 2,
//   sweepRange:1,
//   sweepSpeed: 0
// });

// const laser2 = laserSystem.addLaser({
//   startPosition: new THREE.Vector3(10, 0, 0),
//   endPosition: new THREE.Vector3(7,-10, 10),
//   color: 0x55aaff,
//   width: 1.5,
//   brightness: 2,
//   sweepRange:0,
//   sweepSpeed:0
// });

  function isNEArr(data){
    return Array.isArray(data) && data.length
  }

  function isObj(data){
    return Object.prototype.toString.call(data) === '[object Object]'
  }


function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

function addLaserGroup(laserArr=[]) {
  if(!isNEArr(laserArr)) return;
    const laserOption={
      startPosition: new THREE.Vector3(0, 0, 0),
      endPosition: new THREE.Vector3(7,-10, 10),
      color: 0x55aaff,
      width: 1.5,
      brightness: 2,
      sweepRange:0,
      sweepSpeed:0
    }

  for(let item of laserArr){
    if(isObj(item)){
      for(let key in laserOption){
        if(laserOption.hasOwnProperty(key)){
          let isp = (key=='startPosition' || key==='endPosition') && isNumber(item[key].x) && isNumber(item[key].y) && isNumber(item[key].z)
          if(isp){
            laserOption[key] = new THREE.Vector3(item[key].x,item[key].y,item[key].z)
          }else{
            laserOption[key] = item[key];

          }
          // console.log('laserOption1',laserOption)
        }
      }
       laserSystem.addLaser(laserOption)
    }
  }
          // console.log('laserOption',laserArr)

}

// 6. 添加坐标辅助和地面网格
const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);


function animation(duration,from,to,fn){
  const dis = to - from;
  const speed  = dis / duration;
  const startTime = Date.now();
  let value = from;
  fn(value);
  function _run(){
    const now = Date.now();
    const time = now  - startTime;
    if(time > duration){
      value = to;
      fn(value);
      return;
    }
    const d = time * speed;
    value = from + d;
    fn(value);

    requestAnimationFrame(_run);

  }

  requestAnimationFrame(_run);
}

// 7. 动画循环
function animate() {
  requestAnimationFrame(animate);
  laserSystem.update();
  renderer.render(scene, camera);
}

animate();

addLaserGroup(laserGroupArr)


// 8. 窗口大小调整
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let laserArr=laserSystem.lasers
const transformLaser = createSyncLaserSystem(
  laserArr, // 你的激光实例数组
  1,
  t =>t * t // 缓入缓出效果
);
transformLaser.start()

console.log('laserArr1',laserArr)
  /**
   * startPosition: new THREE.Vector3(10, 0, 0),
    endPosition: new THREE.Vector3(7,-10, 10),
   */

//   let laserArr=laserSystem.lasers
//   let laserItem2=laserArr[1]
//   let l2options=laserItem2['options']

//   let  startPosition= new THREE.Vector3(10, 0, 0)
//   l2options['startPosition']=startPosition
//   let x=10,y=-10,z=10;
// animation(1000,10,9,(val)=>{
//   x=val
//   let endPosition = new THREE.Vector3(x,y,z)
//   l2options['endPosition']=endPosition
//   laserItem2.updateDir(l2options)
// // console.log("尝试在控制台操作激光:x==="+x);
// })

// animation(1000,-10,-20,(val)=>{
//   y=val
//   let endPosition = new THREE.Vector3(x,y, z)
//   l2options['endPosition']=endPosition
//   laserItem2.updateDir(l2options)
// // console.log("尝试在控制台操作激光:y==="+y);
// })

// animation(1000,10,5,(val)=>{
//   z=val
//   let endPosition = new THREE.Vector3(x,y, z)
//   l2options['endPosition']=endPosition
//   laserItem2.updateDir(l2options)
// // console.log("尝试在控制台操作激光:z==="+z);
// })

