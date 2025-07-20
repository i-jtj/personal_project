import {createCurve} from './curve.js';

const docker=document.querySelector('#dockerBox')
const items=document.querySelector('.menu').children
const range = 300,maxScale = 2;

function layout(curve){
    for(let item of items){
        const rect = item.getBoundingClientRect();
        const x=rect.x + rect.width / 2;
        const scale=curve(x);
        item.style.setProperty('--i',scale)
    }
}
docker.onmousemove= function(e){
    const curve=createCurve(range,e.clientX,1,maxScale);
    layout(curve)
}

docker.onmouseleave = function (){
    layout(()=>1)
}

