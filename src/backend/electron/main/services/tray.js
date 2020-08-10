const { app, BrowserWindow, Menu, Tray, shell } = require('electron')
const log = require('electron-log')
const process = require('process')
const Window = require('./window')

module.exports = {
    creteTray: () => {
        // C:\\Users\\liu\\Projects\\VisualStudioCodeProjects\\kvd\\src\\assets\\images\\icon.ico
        let tray = new Tray('/Users/liu/Documents/Projects/VisualStudioCodeWorkSpace/kvd/src/assets/images/tray/tray_16x16.png')
        const contextMenu = Menu.buildFromTemplate([
            {
                label: '关于',
                type: 'normal',
                click: async () => {
                    app.whenReady().then(()=>{
                        let win = new BrowserWindow({
                            width: 550,
                            height: 350,
                            frame: false,
                            resizable: false,
                            webPreferences: {
                              nodeIntegration: true
                            }
                        })
                        win.loadURL(Window.getPath("About"))
                        global["AppWindows"] = {"AboutWindow": win}
                    })
                }
            }
            ,{
                label: '更新',
                type: 'normal',
                click: async () => {
                }
            }
            // ,{
            //     label: '隐藏',
            //     type: 'normal',
            //     click: async () => {
            //         global.app.hide()
            //     }
            // }
            // ,{
            //     label: '显示',
            //     type: 'normal',
            //     click: async () => {
            //         global.app.focus()
            //     }
            // }
            ,{
                label: '退出',
                type: 'normal',
                click: () => {
                    // app.CloseMainWindow()
                    global.app.quit()
                }
            }
        ])
        tray.setToolTip('NoSQL Desktop')
        tray.setContextMenu(contextMenu)
    }
}