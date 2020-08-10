import React from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { createHashHistory } from 'history'
import { view as Header } from '@/components/header'
import { view as Sidebar } from '@/components/sidebar'

import { view as Welcome } from './welcome'
import { view as Setting } from './setting'
import { view as Content } from './content'
// import { view as RedisView } from './redis'
import { IpcRendererSendSync } from '@/util/ipc/ipcRedis'
// import ipcChannel from '@/util/ipc/ipcChannel'
import ipcChannel from '@/util/ipc/ipcChannel'
import { get } from '@/util/localstorage'
import styles from './home.module.css'
const Config = require("@/config/config")

class Home extends React.Component{

  componentDidMount() {
    // 初始化连接(在后台生成redis连接对象)
		let result = IpcRendererSendSync(ipcChannel.connect, this.props.connect.redis)
    this.props.updateConnected(result)
    window.addEventListener('resize', this.handleResize.bind(this)) // 监听窗口大小改变

    if("undefined" != typeof(window.electron)) {
      const ipcRenderer = window.electron.ipcRenderer

      // 快捷键: Alt + C 打开命令行
      ipcRenderer.on('OpenCommandLine', (event, result) => {
        let { redisActiveData, currentDb, activeKey } = JSON.parse(JSON.stringify(this.props.connect))
        if(redisActiveData.length > 0) {
          let params = redisActiveData.filter((item, index) => {
            if(activeKey === item.key) {
              return item
            }
          })
          
          if(params.length > 0) {
            params = params[0]
            params["db"] = currentDb
            IpcRendererSendSync(ipcChannel.OpenCommandLineWindow, params)
          }
        }
      })

      // 快捷键: Alt + S 打开设置
      ipcRenderer.on('OpenSettings', async (event, result) => {
        this.props.activeTab("Setting")
        createHashHistory().push(Config.route.Setting)
      })

      // 快捷键: Alt + W 打开欢迎
      ipcRenderer.on('OpenWelcome', async (event, result) => {
        this.props.activeTab("Welcome")
        createHashHistory().push(Config.route.Welcome)
      })

    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize.bind(this)) // 移除监听窗口大小
  }

  handleResize = e => {
    this.props.changeClientSize({
      sidebarContainerHeight: e.currentTarget.innerHeight - 64,
      contentContainerHeight: window.innerHeight - 64,
      contentContainerWidth: window.innerWidth - this.props.setting.sidebarContainerWidth
    })
  }

  render() {
    const { sidebarContainerWidth, sidebarContainerHeight } = this.props.setting
    const sidebarStyle = {
      flex: '0 0 ' + sidebarContainerWidth + 'px',
      width: sidebarContainerWidth + 'px'
    };
    let theme = get("theme")
    return(
          <div className="ant-layout ant-layout-has-sider">
            <div style={sidebarStyle} className={"ant-layout-sider ant-layout-sider-" + theme}>
              <Sidebar />
            </div>
            <div className={`${styles['content-wrapper']} ant-layout`}>
              <div className={`${styles.header} ant-layout-header`}>
                <Header />
              </div>
              <div style={{display: 'flex', height: sidebarContainerHeight + "px"}}>
                <div className={`${styles.content} ant-layout-content`} style={{overflowY: "hidden"}}>
                  <Route path={Config.route.Welcome} component={Welcome} />
                  <Route path={Config.route.Content} component={Content} />
                  <Route path={Config.route.Setting} component={Setting} />
                </div>
              </div>
            </div>
          </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    ...state
  }
}
const mapDispatchToProps = (dispatch, ownProps) => ({
  activeTab: (key) => {
      dispatch({
          type: 'CONNECTINFO/REDIS/ACTIVECONNECTDATA/ACTIVETAB',
          activeKey: key
      })
  },
  changeClientSize: (size) => {
    dispatch({
      type: 'SETTING/CHANGEWINDOWSSIZE',
      size: size
    })
  },
  updateConnected: (connected) => {
		dispatch({
		  type: 'CONNECTINFO/REDIS/UPDATECONNECTED',
		  connected: connected
		})
	}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)