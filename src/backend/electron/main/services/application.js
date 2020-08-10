const Window = require('./window')
const Config = require('../../../../config/config')
const { globalShortcut, Notification } = require('electron')
const log = require('electron-log')

module.exports = {
    init() {
        // this.AutoUpdater()
        this.CreateMainWindow()
    },
    AutoUpdater(){  // 自动更新
        if(Notification.isSupported()){
            let myNotification = new Notification({
                title: '发现新版本',
                body: '当前版本: 2.1.0 最新版本: 2.2.3'
            })
              
            myNotification.click = () => {
            }

            myNotification.show()
        }
    },
    CreateMainWindow(){     // App Main Window / 应用主窗口
        let win = Window.create({
            minWidth: 1000,
            minHeight: 685,
            width: 1000,
            height: 685,
            frame: false,
            show: false, // 先隐藏
            webPreferences: {
                nodeIntegration: true
            }
        })
        win.loadURL(Window.getPath("Welcome"))  // 主界面是welcome界面

        // win.webContents.openDevTools()

        global["shortcut"] = Config.shortcut.global

        let data = global["shortcut"]
        for(let i = 0; i < data.length; i++){
            // 注册快捷键
            globalShortcut.register(data[i].Shortcut, () => {
                global.AppWindows.MainWindow.webContents.send(data[i].ipcRender, data[i].describe)
            })
        }

        win.on("focus", (WinObj)=>{
            if("undefined" != typeof(global.AppWindows)) {
                global.AppWindows.ActiveWindow = "MainWindow"
            }
        })

        // 初始化后再显示
        win.on('ready-to-show', function () {
            win.show()
        })

        global["AppWindows"] = {"MainWindow": win}
    },
    CreateCommandLineWindow(params) {   // 命令行窗口
        let WindowKey = params.host.replace(/\./g, "") + "_" + params.port + "_" + params.db + "_" + new Date().getTime()

        let win = Window.create({
            minWidth: 1000,
            minHeight: 685,
            width: 1000,
            height: 685,
            frame: false,
            show: false,    // 先隐藏
            webPreferences: {
                nodeIntegration: true
            }
        })

        let args = '?host=' + params.host + '&port=' + params.port + '&password=' + params.password + '&db=' + params.db + '&WindowId=' + WindowKey
        win.loadURL(Window.getPath("Command") + args);

        // win.webContents.openDevTools()

        let position = global.AppWindows[global.AppWindows.ActiveWindow].getPosition()  // 获取当前活动窗口的位置
        win.setPosition(position[0] + 64, position[1] + 64) // 设置打开命令窗口的位置(设置窗口偏移量)

        win.on("focus", (WinObj)=>{
            if("undefined" != typeof(global.AppWindows)) {
                global.AppWindows.ActiveWindow = WindowKey
            }
        })

        // 初始化后再显示
        win.on('ready-to-show', function () {
            win.show()
        })

        let AppWindows = global.AppWindows
        AppWindows[WindowKey] = win
        global["AppWindows"] = AppWindows
    },
    CreateCommandLineGuideWindow() {    // 命令行使用指南窗口

        if("undefined" != typeof(global.AppWindows.CommandLineGuideWindow)) {
            // 已打开窗口,激活窗口
            global.AppWindows.CommandLineGuideWindow.showInactive()
            return
        }

        let win = Window.create({
            minWidth: 1000,
            minHeight: 685,
            width: 1000,
            height: 685,
            frame: false,
            show: false,    // 先隐藏
            webPreferences: {
                nodeIntegration: true
            }
        })
        win.loadURL(Window.getPath("CommandGuide"));

        // win.webContents.openDevTools()

        let position = global.AppWindows[global.AppWindows.ActiveWindow].getPosition()  // 获取当前活动窗口的位置
        win.setPosition(position[0] + 64, position[1] + 64) // 设置打开命令窗口的位置(设置窗口偏移量)

        win.on("focus", (WinObj)=>{
            if("undefined" != typeof(global.AppWindows)) {
                global.AppWindows.ActiveWindow = "CommandLineGuideWindow"
            }
        })

        // 初始化后再显示
        win.on('ready-to-show', function () {
            win.show()
        })

        let AppWindows = global.AppWindows
        AppWindows["CommandLineGuideWindow"] = win
        global["AppWindows"] = AppWindows
    }
}