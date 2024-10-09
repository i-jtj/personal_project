 let obj={name:'lisi',sex:'男',arr:[]};
    obj.sub=obj;
    obj.arr.push(obj);

    function deepClone(value){
    // 使用缓存处理循环引用问题（原始对象1-->克隆对象1，建立映射关系结构），递归再次遇到相同对象时，直接从缓存中获取，从而不用重复克隆，进而决绝无限递归问题

        const cache = new Map();//weakmap，可解决高阶函数闭包造成内存泄漏，这里可不用。
        function _deepClone(){
        if(value === null || typeof value !== 'object'){
            return value
        }
        if(cache.has(value)){//缓存存在
            return cache.get(value);
        }

        const result=Array.isArray(value) ? []:{};
        
        cache.set(value,result);

        for(const key in value){
            result[key] = _deepClone(value[key]);
        }

        return result;
        }

        return _deepClone(value);
    }

    let res=deepClone(obj);
    console.log(res);
