const log = require('electron-log')
const iconv = require('iconv-lite')
const OS = require('os')
// const util = require('util')
const process = require('process')
const path = require('path')
const { exec } = require('child_process')

module.exports = {
    ExecRedisCommand: function(params, callback){

        if("undefined" != params.command && params.command.length <= 0){
            callback({
                status: false,
                results: "Error"
            })
        } else {
            let c = params.command.replace(/\s+/g, ' ')
            let otherParam = "", passwordInfo = ""
            let OSType = OS.platform()      // win32 / linux / darwin / aix / freebsd / openbsd / sunos
            if("darwin" == OSType) {
                // 如果是MacOS，则使用以下参数
                otherParam = " 2>/dev/null"
                if("keys *" == c){
                    c = "keys '*'"
                }
            }

            if("undefined" != params.password && params.password.length > 0){
                passwordInfo = " -a " + params.password
            }

            let command1 = `redis-cli -h ${params.host} -p ${params.port} ${passwordInfo} -n ${params.db} ${c} ${otherParam}`
            
            log.info(`exec: ${command1}`)
            try {
                // 需要配置环境变量
                let p = process.env.PATH.split(path.delimiter)
                let res = p.filter((item, index) => {
                    if(item.toLowerCase().indexOf("redis") != -1) {
                        return item
                    } else {
                        return null
                    }
                })
                p = process.env.REDIS_HOME
                if(res.length > 0) {
                    p = res[0]
                }
                
                exec(command1, {encoding: "buffer" }, (error, stdout, stderr) => {
                    if (error) {
                        log.error(error)
                        let errStr = Buffer.from(stderr, 'base64')
                        let errData = iconv.decode(errStr, 'gbk')
                        callback({
                            status: true,
                            results: errData
                        })
                    } else {
                        let rawStr = Buffer.from(stdout,'base64')
                        let data = iconv.decode(rawStr,'gbk')
                        log.info(data)
                        callback({
                            status: true,
                            results: data
                        })
                    }
                })
            } catch(e) {
                log.error(e)
                callback({
                    status: false,
                    results: "Error"
                })
            }
        }
    }
}