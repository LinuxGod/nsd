const { app, BrowserWindow } = require('electron')
const Config = require('../../../../config/config')
const pkg = require("../../../../../package.json")

let count = 0;

module.exports = {
    create(opts) {
        count += 1
        let win = new BrowserWindow(opts)
        win.on('close', () => {
            count -= 1
            win = null
        })
        return win
    },
    getCount() {
        return count
    },
    getPath(route) {
        let path = "file://" + app.getAppPath().replace(/\\/g, "/") + "/build/index.html#" + Config.route[route]
        if (pkg.DEV) {
            path = 'http://localhost:3000/#' + Config.route[route];
        }
        return path
    }
}