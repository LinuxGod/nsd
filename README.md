![NoSQL Desktop Logo](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/NoSQLDesktopLogo.png)

# NoSQL Desktop
中文简体 | [English](./README.en.md)

<a href="https://www.liunote.com" target="_blank">https://www.liunote.com</a>

***

- [项目介绍](#项目介绍)
- [开发](#开发)
    - [环境要求](#环境要求)
    - [启动项目](#启动项目)
- [依赖](#依赖)
- [打包](#打包)
    - [MacOS](#macos)
    - [Windows](#windows)
    - [Ubuntu](#ubuntu)
- [截屏](#截屏)
- [作者](#作者)
- [协议](#协议)

## 项目介绍
一个NoSQL数据库的可视化客户端。目前只支持redis内存数据库，但未来会是支持多种NoSQL的客户端。
1. 友好的UI
2. 易用的功能

## 开发
### 环境要求
```
NodeJS >= 10.x
Redis >= 5.x
```

### 依赖
* React 16.8.6
* Redux           --状态管理
* React-Router-V4 --多页面
* Ant Design      --UI
* React Intl      --国际化
* Gulp            --合并国际化词条
* node_redis      --redis client
* electron-log    --日志管理
* xlsx            --数据导出
* ...

### 启动项目
```sh
# 克隆到本地
$ git clone https://github.com/LinuxGod/nsd.git

# 进入项目目录
$ cd nsd

# yarn install 或 npm install
$ yarn install

# yarn start 或 npm start
$ yarn start

# yarn estart 或 npm run estart
$ yarn estart
```

## 打包
### MacOS
1.  打包
```sh
$ yarn build
```

2. 复制 icon
```sh
# 复制src/assets/images/icon.icns到build文件夹
$ cp src/assets/images/icon.icns build/icon.icns
```

3. 复制 main.js
```sh
# 复制并修改文件名称
$ cp src/main.js build/electron.js
```

4. 打包
```sh
$ yarn pack:dmg
```

### Windows
1.  构建
```sh
$ yarn build
```

2. 复制 ico
```sh
# 复制 src\assets\images\icon.ico 到 build\icon.ico
$ copy src\assets\images\icon.ico build\icon.ico

# 复制 src\assets\images\uninstall.ico 到 build\icon.ico
$ copy src\assets\images\uninstall.ico build\uninstall.ico
```

3. 复制 main.js
```sh
# 复制main.js到build目录并重命名为electron.js
$ copy src\main.js build\electron.js

# 复制main.js到public目录并重命名为electron.js
$ copy src\main.js public\electron.js
```

4. 打包
```sh
# 打包64位程序
$ yarn pack:win64

# 打包32位程序
$ yarn pack:win32
```

## Ubuntu
1.  打包
```sh
$ yarn build
```

2. 复制
```sh
# 复制src/assets/images/icon.icns到build文件夹
$ cp src/assets/images/icon.icns build/icon.icns
```

3. 复制
```sh
# 复制并修改文件名称
$ cp src/main.js build/electron.js
```

4. 打包
```sh
$ yarn pack:deb
```

## 截屏
![欢迎](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/welcome.png)
![服务器信息](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/info.png)
![连接](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/connection.png)
![编辑器](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/editor.png)
![命令行](https://gitee.com/linuxGod/Images/raw/master/nsd/Screenshots/terminal.png)

## 作者
邮箱: <li.usichen@163.com>  
微信:  

![我的微信](https://gitee.com/linuxGod/Images/raw/master/nsd/wechat.png)

## 协议
[MIT](./LICENSE)