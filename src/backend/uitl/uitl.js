// 工具类
module.exports = {
    sleep: (millisecond) => {   // 程序休眠,时间毫秒
        let now = new Date(); 
        let exitTime = now.getTime() + millisecond; 
        while (true) { 
            now = new Date(); 
            if (now.getTime() > exitTime) 
            return;
        }
    }
}