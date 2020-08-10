const IpcRendererSendSync = (ipcChannel, params) => {
    if("undefined" == typeof(window.electron)) {
        return {
            "status": false,
            "code": 0,
            "msg": "unsupported electron ipcRenderer"
        }
    }
    // 浏览器中无法使用,因为electron的ipcRenderer中使用到了nodejs的fs模块
    return window.electron.ipcRenderer.sendSync(ipcChannel, params)
}

export { IpcRendererSendSync }