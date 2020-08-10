const log = require('electron-log')
const { ipcMain } = require('electron')
const redis = require('../../../redis/redis')
const command = require('../../../redis/command')
const ipcChannel = require('../../../../util/ipc/ipcChannel')

log.transports.file.level = 'info';
for(let k in ipcChannel) {
    // 添加事件监听
    ipcMain.on(ipcChannel[k], (event, params) => {
        log.debug(`Execute ${ipcChannel[k]} Method`)
        log.info(params)
        redis[ipcChannel[k]](params).then(results => {
            log.info(results)
            event.returnValue = results
        })
    })
}

ipcMain.on('Test', (event, params)=>{
    redis.Test()
})

ipcMain.on('ExecRedisCommand', (event, params)=>{
    command.ExecRedisCommand(params, (results)=>{
        event.returnValue = results
    })
})