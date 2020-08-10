/**
 * 使用spilt方法实现模糊查询
 * @param  {Array}  list     进行查询的数组
 * @param  {String} keyWord  查询的关键词
 * @return {Array}           查询的结果
 */
const fuzzyQuery = (list, keyWord) => {
    let arr = []
    for (let i = 0; i < list.length; i++) {
      if(list[i].toLocaleUpperCase().split(keyWord.toLocaleUpperCase()).length > 1) {
        arr.push(list[i])
      }
    }
    return arr
}

/**
 * 程序暂停,时间毫秒
 * @param {int}} millisecond 
 */
const sleep = (millisecond) => {
  let now = new Date(); 
  let exitTime = now.getTime() + millisecond; 
  while (true) { 
      now = new Date(); 
      if (now.getTime() > exitTime) 
      return;
  }
}

export {
    fuzzyQuery,
    sleep
}