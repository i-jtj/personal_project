const laserGroupArr = [
    {
      startPosition: {x:10,y:0,z:0},
      endPosition:{x:8,y:-35, z:8},
      color: 0x55aaff,
      width: 1.5,
      brightness: 2,
      sweepRange:0,
      sweepSpeed:0
    },
    {
      startPosition: {x:10,y:0,z:0},
      endPosition:{x:8,y:-38, z:8},
      color: 0xff5555,
      width: 2,
      brightness: 2,
      sweepRange:1,
      sweepSpeed: 0
    },
     {
      startPosition: {x:10,y:0,z:0},
      endPosition: {x:9,y:-36, z:9},
      color: 0x55aaff,
      width: 1.5,
      brightness: 2,
      sweepRange:0,
      sweepSpeed:0
    },
]

  function isObj(data){
    return Object.prototype.toString.call(data) === '[object Object]'
  }

function getLaserGroups(num=3,start={x:-10,y:0,z:0}){
  let res=[];
  if(num==null || !isObj(start) || num<=0){
    return res;
  }
  let x=-10, y=-35,z=8
  let item = null;
  for(let i=0;i<num;i++){
    x-=i
    y-=i
    z-=i
    item ={
          startPosition: {...start},
          endPosition: {x:x,y:y,z:z},
          color: 0x55aaff,
          width: 1.5,
          brightness: 2,
          sweepRange:0,
          sweepSpeed:0
        }
    res.push(item)
  }
  return res;
}
export {laserGroupArr,getLaserGroups}