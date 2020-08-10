const pkg = require('../../package.json')

/**
 * 配置信息
 */
module.exports = {
    "app-name": "NoSQL Desktop",
    "version": pkg.version,
    "theme": "dark",
    Repository: pkg.repository.url,
    Setting: "",
    shortcut: { // 快捷键
        global: [
            {"Shortcut": "Alt+N", "ipcRender": "NewConnection", "i18nId": "create.connect.redis.create-connect", "describe": "新建连接"}
            ,{"Shortcut": "Alt+C", "ipcRender": "OpenCommandLine", "i18nId": "app.message.open.terminal", "describe": "打开命令行"}
            ,{"Shortcut": "Alt+A", "ipcRender": "OpenWelcome", "i18nId": "app.message.open.welcome", "describe": "打开欢迎"}
            ,{"Shortcut": "Alt+S", "ipcRender": "OpenSettings", "i18nId": "app.message.open.setting", "describe": "打开设置"}
            // ,{"Shortcut": "Alt+A+D", "ipcRender": "OpenAdd", "describe": "打开添加"}
            // ,{"Shortcut": "Alt+I", "ipcRender": "OpenImport", "describe": "打开导入"}
            // ,{"Shortcut": "Alt+E", "ipcRender": "OpenExport", "describe": "打开导出"}
        ]
    },
    route: {    // react router
        Home: "/home",
        Command: "/command",
        CommandGuide: "/CommandGuide",
        Welcome: "/home/welcome",
        Content: "/home/content",
        Setting: "/home/setting",
        About: "/about"
    },
    SidebarData: [  // 默认侧边菜单
        {
            "icon": "home",
            "key": "Welcome",
            "label": "app.welcome",
            "url": "/home/welcome"
        }
        ,{
            "icon": "setting",
            "key": "Setting",
            "label": "menu.setting",
            "url": "/home/setting"
        }
    ]
}
