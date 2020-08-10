const { app } = require('electron')
const log = require('electron-log')
const Application = require('./backend/electron/main/services/application.js')
const Window = require('./backend/electron/main/services/window.js')
const Menu = require('./backend/electron/main/services/menu.js')
// const Tray = require('./backend/electron/main/services/tray.js')

require('./backend/electron/main/ipc/ipc')

/**
 * log file position:
 * on Linux: ~/.config/{app name}/logs/{process type}.log
 * on macOS: ~/Library/Logs/{app name}/{process type}.log
 * on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
 */
log.transports.file.fileName = 'nsd.log';
log.transports.file.level = 'info';

log.info('(main/index) app start');
log.info(`(main/index) log file at ${log.transports.file.file}`);

app.on('ready', () => {
  log.info('(main/index) app ready');
  Application.init();
  // Tray.creteTray();
  Menu.init();

  global.app = app
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (Window.getCount() === 0) {
    Application.init();
  }
});

app.on('quit', () => {
  log.info('(main/index) app quit');
  log.info('(main/index) <<<<<<<<<<<<<<<<<<<');
});

// Register to global, so renderer can access these with remote.getGlobal
global.services = {
  Application,
  Window,
};
