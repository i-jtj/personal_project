const audioEl=document.getElementById("audioEl");
const cvs=document.getElementById("canvasEl");
// const cvs=document.querySelector("canvas");
const ctx=cvs.getContext("2d");


// 初始化canvas
function initCanvas(){
 const size=500;
 cvs.width=size * devicePixelRatio;
 cvs.height=size * devicePixelRatio;
 cvs.style.width=cvs.style.height=size+"px";
}

initCanvas();

function draw(datas,maxValue){
const r =cvs.width / 4 + 20 * devicePixelRatio;
const center=cvs.width / 2;
ctx.clearRect(0,0,cvs.width,cvs.height);

const hslStep=360 / (datas.length -1);
const maxLen=cvs.width / 2 -r;
const minLen=2 * devicePixelRatio;
// return
for(let i=0;i<datas.length;i++){

    ctx.beginPath();

    const len=Math.max((datas[i] / maxValue) * maxLen,minLen);
    const rotate=hslStep * i;
    ctx.strokeStyle=`hsl(${rotate}deg,65%,65%)`;
    ctx.lineWidth=minLen;
    const rad=(rotate *  Math.PI) / 180;
    const beginX=center + Math.cos(rad) * r;
    const beginY=center + Math.sin(rad) * r;
    const endX=center + Math.cos(rad) * (r + len);
    const endY=center + Math.sin(rad) * (r + len);
    ctx.moveTo(beginX,beginY);
    ctx.lineTo(endX,endY);
    ctx.stroke();
}
}

draw(new Array(256).fill(0).map(()=>Math.random()*255),255);

let isInited=false;
let analyser,buffer;

audioEl.onplay=function(){
    if(!isInited){
        const audioContext=new AudioContext();
        analyser=audioContext.createAnalyser();
        const source=audioContext.createMediaElementSource(audioEl);
        analyser.fftSize=512;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        buffer=new Uint8Array(analyser.frequencyBinCount);//无符号的8位整数数组
   
        
        isInited=true;
    }
}

function drawLoop(){
    requestAnimationFrame(drawLoop);
    if(!isInited)return;
    analyser.getByteFrequencyData(buffer);
    const offset=Math.floor((buffer.length*2)/3);
    const datas=new Array(offset *2);
    for(let i=0;i<offset;i++){
        datas[i]=datas[datas.length-i-1]=buffer[i];
    }
    draw(datas,255);
}

drawLoop();
