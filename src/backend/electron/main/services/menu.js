const { app, shell, Menu } = require('electron');
const Log = require('electron-log');

const isMac = process.platform === 'darwin'

module.exports = {
  getTemplate() {
    return [
      // { role: 'appMenu' }
      ...(isMac ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }] : []),
      // { role: 'windowMenu' }
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' }
          ,{ role: 'zoom' }
          // ,{ role: 'close' }
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              await shell.openExternal('https://nsdesktop.com')
            }
          }
        ]
      }
    ];
  },
  init() {
    const menu = Menu.buildFromTemplate(this.getTemplate());
    Menu.setApplicationMenu(menu);
  }
}