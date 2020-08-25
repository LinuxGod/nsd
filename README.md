![NoSQL Desktop Logo](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/NoSQLDesktopLogo.png)

# NoSQL Desktop
English | [中文简体](./README.zh.md)

<a href="https://www.liunote.com" target="_blank">https://www.liunote.com </a>

***

- [Instructions](#instructions)
- [Development](#development)
    - [Environment](#environment)
    - [Start](#start)
- [Dependencies](#dependencies)
- [Pack](#pack)
    - [MacOS](#macos)
    - [Windows](#windows)
    - [Ubuntu](#ubuntu)
- [Screenshots](#screenshots)
- [Author](#author)
- [LICENSE](#license)

## Instructions
```
A visual client of NoSQL databases that only supports redis memory database currently, but in the future it will be a client that supports multiple types of NoSQL.
```

## Development
### Environment
```
NodeJS >= 10.x
Redis >= 5.x
```

### Dependencies
* React 16.8.6
* Redux           --State manager
* React-Router-V4 --Multi pages
* Ant Design      --UI
* React Intl      --i18n
* Gulp            --Merge i18n word
* node_redis      --redis client
* electron-log    --logs
* xlsx            --Data Export
* ...

### Start
```sh
# clone to local
$ git clone https://github.com/LinuxGod/nsd.git

# go to nsd directory
$ cd nsd

# yarn install or npm install
$ yarn install

# yarn start or npm start
$ yarn start

# yarn estart or npm run estart
$ yarn estart
```

## Pack
### MacOS
1.  Build
```sh
$ yarn build
```

2. Copy icon
```sh
# Copy icon.icns to build folder
$ cp src/assets/images/icon.icns build/icon.icns
```

3. Copy main.js
```sh
# Copy main.js to build folder and then rename to electron.js
cp src/main.js build/electron.js
```

4. Pack
```sh
$ yarn pack:dmg
```

### Windows
1.  Build
```sh
$ yarn build
```

2. Copy ico
```sh
# Copy src\assets\images\icon.ico to build\icon.ico
$ copy src\assets\images\icon.ico build\icon.ico

# copy src\assets\images\uninstall.ico to build\icon.ico
$ copy src\assets\images\uninstall.ico build\uninstall.ico
```

3. Copy main.js
```sh
# Copy to build directory and then rename to electron.js
$ copy src\main.js build\electron.js

# Copy to public directory and then rename to electron.js
$ copy src\main.js public\electron.js
```

4. pack
```sh
# pack 64bit app
$ yarn pack:win64

# pack 32 app
$ yarn pack:win32
```

## Ubuntu
1.  Build
```sh
$ yarn build
```

2. Copy icon
```sh
# Copy icon.icns to build folder
$ cp src/assets/images/icon.icns build/icon.icns
```

3. Copy main.js
```sh
# Copy main.js to build directory and then then rename to electron.js
cp src/main.js build/electron.js
```

4. Pack
```sh
$ yarn pack:deb
```

## Screenshots
![Welcome](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/welcome.png)
![Info](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/info.png)
![Connection](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/connection.png)
![Editor](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/editor.png)
![Terminal](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/terminal.png)


## Author
Email: <li.usichen@163.com>  
WeChat:  

![WeChat](https://gitee.com/linuxGod/Images/raw/master/nsd/wechat.png)

## LICENSE
[MIT](./LICENSE)