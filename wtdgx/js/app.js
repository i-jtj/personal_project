const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// 设置场景、相机和渲染器
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


    function createData(x=100,y=-100,z=50){
  

        // 添加射灯（激光）
        const laserMaterial = new THREE.LineBasicMaterial({color: 0x03a9f4});
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0)); // 起点
        points.push(new THREE.Vector3(x, y, z)); // 终点（可以根据需要调整）
        const laserGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const laser = new THREE.Line(laserGeometry, laserMaterial);
        scene.add(laser);


        return scene
    }

    let x=100,y=100,z=0;
  
    // let {camera,scene}=createData(x,y,z)
    // renderer.render(scene, camera);

    var dsq=setInterval(()=>{
        y+=1
        z+=1
        let scene= createData(x,y,z);

        renderer.render(scene, camera);
            
        console.log(x,y,z)

        if(y>600) clearTimeout(dsq)
    },5)

    // 设置相机位置和视角
    camera.position.set(10, 10, 10); // 设置摄像机位置
    camera.lookAt(1, 10, 2); // 设置摄像机朝向
    
// 动画循环渲染场景
// function animate() {
//     requestAnimationFrame(animate);
//     renderer.render(scene, camera);
// }
// animate();