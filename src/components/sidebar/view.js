import React from 'react'
// import data from './data';
import { injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    Icon,
    Menu,
    Tooltip,
    Drawer,
    Button,
    Empty,
    Row,
    Col,
    message,
    Modal,
    Popconfirm
} from 'antd'
import styles from './sidebar.module.css'
import logo from '@/assets/images/logo.svg'
import { get } from '@/util/localstorage'
import RedisConnect from "@/pages/connect/redis/RedisConnect"

import { IpcRendererSendSync } from '@/util/ipc/ipcRedis'
import ipcChannel from '@/util/ipc/ipcChannel'

const uuidV4 = require('uuid/v4')

const { SubMenu } = Menu
class Sidebar extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            execAddMethod: false,   // 标记是否执行了add方法(添加新的连接信息)
            BtnDisabled: false,
            DrawerVisible: false,
            ServerInfoModal1Visible: false,
            ServerInfo: "",
            redis: []
        }
    }

    componentDidMount() {
        // this._generateLink()
        if("undefined" != typeof(window.electron)) {
            const { ConnectionFormValidateStatus } = this.props.connect
            window.electron.ipcRenderer.on('NewConnection', (result) => {
                // 添加连接信息全部校验通过才能关闭
                if(ConnectionFormValidateStatus) {
                    this.setState({
                        DrawerVisible: !this.state.DrawerVisible
                    })
                }
            })
        }
    }

    componentDidUpdate(){
        // 滚动到底部,因为add方法中redux更新是异步的,不能在后面执行滚动,需要在React Update后再进行滚动
        // 需要是在执行了add方法才能执行滚动
        if(this.state.execAddMethod) {
            let dom = document.getElementById("connection_menu")
            if(null != dom) {
                dom.scrollTop = dom.scrollHeight

                this.setState({
                    execAddMethod: false
                })
            }
        }
    }

    open(e, intl){
        if(-1 !== e.key.indexOf("_")){
            // App启动时已经在后台生成了数据连接对象,并将成功生成的key返回了前台,所有在此直接判断是否已经连接成功
            const { connected } = this.props.connect
            if(!connected[e.key].status) {
                this.notice(intl)
            } else {
                this.props.addTab(e.key)
            }
        } else {
            this.props.activeTab(e.key)
        }
    }

    notice(intl) {
        let secondsToGo = 8
        const modal = Modal.error({
          title: `${intl.formatMessage({id: "app.message.open.fail"})}`,
          okText: `${intl.formatMessage({id: "app.button.close"})} [${secondsToGo}]`,
          okType: 'danger',
          centered: true,
          content: <div>
                      <ol>
                        <li>{intl.formatMessage({id: "app.message.promise.running"})}</li>
                        <li>{intl.formatMessage({id: "app.message.please.check.configuration"})}</li>
                      </ol>
                   </div>
        });
        const timer = setInterval(() => {
          secondsToGo -= 1
          modal.update({
            okText: `${intl.formatMessage({id: "app.button.close"})} [${secondsToGo}]`
          });
        }, 1000)
        setTimeout(() => {
          clearInterval(timer)
          modal.destroy()
        }, secondsToGo * 1000)
    }

    setServerInfoModal1Visible(ServerInfoModal1Visible){
        this.setState({ServerInfoModal1Visible})
    }

    setDrawerVisible(params) {
        this.setState(params)
    }

    add(){
        let select = {
            name: "新建连接",
            host: "127.0.0.1",
            port: 6379,
            password: ""
        }
        
        let { redis } = this.props.connect

        // 解决深拷贝问题
        let redis_connect_list = JSON.parse(JSON.stringify(redis))
        let sidebarData = JSON.parse(JSON.stringify(this.props.connect.sidebarData))

        select["key"] = "redis_connect$" + uuidV4()
        redis_connect_list.push(select)

        if("redis" === sidebarData[1].key){
            let sub_menu = {
                "key": select["key"],
                "name": select["name"],
                "label": select["host"] + ":" + select["port"],
                "url": "/home/content"
            }
            
            sidebarData[1]["children"].push(sub_menu)
        } else {
            let menu = {
                "icon": "database",
                "key": "redis",
                "label": "Redis",
                "children": [{
                    "key": select["key"],
                    "name": select["name"],
                    "label": select["host"] + ":" + select["port"],
                    "url": "/home/content"
                }]
            }
            sidebarData.splice(1, 0, menu)
        }
        this.props.UpdateConnectionValidateStatus()
        this.props.Save(redis_connect_list, sidebarData)
        this.props.ChangeSelect(select.key)
        
        this.setState({
            execAddMethod: true
        })
    }

    changeConnect(key){
        this.props.ChangeSelect(key)
    }

    serverInfo(intl){
        let params = this.getConnectionByKey(this.props.connect.currentSelect)
        let result = IpcRendererSendSync(ipcChannel.ServerInfo, params[0])
        if(result.status){
            this.setState({
                ServerInfoModal1Visible: true,
                ServerInfo: result.info
            })
        } else {
            message.error(intl.formatMessage({id: "app.message.fail"}))
        }
    }

    testConnect(intl){
        let params = this.getConnectionByKey(this.props.connect.currentSelect)
        let result = IpcRendererSendSync(ipcChannel.TestConnect, params[0])
        if(result.status) {
            message.success(intl.formatMessage({id: "app.message.success"}))
        } else {
            message.error(intl.formatMessage({id: "app.message.fail"}))
        }
    }

    getConnectionByKey(key){
        return this.props.connect.redis.filter(item=>item.key === key)
    }

    render(){
        const { intl, Delete } = this.props
        const { collapsed, sidebarContainerHeight, contentContainerHeight } = this.props.setting
        const { activeKey, sidebarData, currentSelect, ConnectionFormValidateStatus, redis } = this.props.connect
        const { ServerInfoModal1Visible, ServerInfo, DrawerVisible } = this.state
        let Conn = redis.filter(item=>item.key === currentSelect)
        let ConnName = (Conn.length > 0) ? Conn[0].name : ""
        const BtnDisabled = (redis.length <= 0) ? true : false
        let theme = get("theme")
        return(
            <div className="ant-layout-sider-children">

                {/* redis info */}
                <Modal
                    keyboard={true}
                    destroyOnClose={true}
                    title={intl.formatMessage({id: "create.connect.redis.button.redis-info"})}
                    width={window.innerWidth}
                    style={{
                        top: 0
                    }}
                    visible={ServerInfoModal1Visible}
                    okText="关闭"
                    onOk={()=>{
                        // 因为添加了footer后不能使用esc按钮退出，重新加上ok和cancel后可以解决这个问题
                        this.setServerInfoModal1Visible(false)
                    }}
                    cancelText="取消"
                    onCancel={()=>{
                        // 因为添加了footer后不能使用esc按钮退出，重新加上ok和cancel后可以解决这个问题
                        this.setServerInfoModal1Visible(false)
                    }}
                    closeIcon={
                        <Icon
                            type="close"
                            style={{fontSize: "20px", color: "#000"}}
                            onClick={()=>{
                                this.setServerInfoModal1Visible(false)
                            }}
                        />
                    }
                    footer={[
                        <div key='ServerInfoModal1' style={{height: "55px", lineHeight: "55px", marginTop: "-12px"}}>
                            <Button
                                type="danger"
                                onClick={()=>{
                                    this.setServerInfoModal1Visible(false)
                                }}
                            >
                                {
                                    intl.formatMessage({id: "app.button.close"})
                                }
                            </Button>
                        </div>
                    ]}
                >
                    <textarea
                        rows="3"
                        cols="110"
                        style={{
                            resize: "none",
                            borderColor: "#CFCFCF",
                            width: window.innerWidth - 50,
                            height: window.innerHeight - 161
                        }}
                        value={ServerInfo}
                        className="lightSidebarContainerScrollbar"
                        readOnly
                      >
                        {ServerInfo}
                      </textarea>
                </Modal>

                <Drawer
                    title={intl.formatMessage({id: "create.connect.redis.create-connect"})}
                    height={window.innerHeight}
                    keyboard={true}
                    closable={false}
                    visible={DrawerVisible}
                    onClose={()=>{
                        // 点击遮罩层或右上角叉或取消按钮的回调,Drawer关闭前调用
                        // 所有校验通过才可以关闭
                        if(ConnectionFormValidateStatus) {
                            this.setDrawerVisible({DrawerVisible: false})
                        }
                    }}
                    afterVisibleChange={(visible)=>{
                        // 关闭Drawer,在后台生成连接对象
                        if(!visible){
                            let connected = IpcRendererSendSync(ipcChannel.connect, redis)
                            this.props.updateConnected(connected)

                            let result = IpcRendererSendSync(ipcChannel.ConnectionedRedisServerInfo, connected)
                            this.props.UpdateServerInfo(result.result)
                        }
                        if(redis.length <= 0) {
                            this.props.UpdateActiveKeyAndReloadBtnVisible("1", "none")
                        }
                    }}
                    placement="top"
                    bodyStyle={{
                        padding: 0
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: contentContainerHeight
                        }}
                    >
                        <div
                            id="connection_menu"
                            style={{
                                float: "left",
                                display: "inline",
                                width: 256,
                                height: contentContainerHeight - 44,
                                borderRight: "solid",
                                borderRightWidth: "thin",
                                borderRightColor: "#CFCFCF",
                                overflowY: "auto",
                                overflowX: "hidden"
                            }}
                            className="lightSidebarContainerScrollbar"
                        >
                            <Menu
                                onClick={this.handleClick}
                                style={{ width: 256 }}
                                defaultOpenKeys={['redis']}
                                selectedKeys={[currentSelect]}
                                mode="inline"
                                theme="light"
                            >
                                <SubMenu
                                    key="redis"
                                    title={
                                        <span>
                                            <Icon type="database" />
                                            <span>{intl.formatMessage({id: "create.connect.redis.connection"})}</span>
                                        </span>
                                    }
                                >
                                    {
                                        redis.map((item, index)=>(
                                            <Menu.Item
                                                key={item.key}
                                                onClick={(item)=>{
                                                    this.changeConnect(item.key)
                                                }}
                                            >
                                                {item.name}
                                            </Menu.Item>
                                        ))
                                    }
                                </SubMenu>
                            </Menu>
                        </div>
                        <div
                            style={{
                                float: "left",
                                display: "inline",
                                width: window.innerWidth - 256,
                                height: contentContainerHeight,
                                overflowY: "hidden",
                                paddingTop: 10,
                                paddingRight: 10,
                                paddingLeft: 10
                            }}
                        >
                            {
                                (redis.length > 0) ?
                                <RedisConnect onRef={(ref)=>{ this.child = ref}} /> :
                                <div style={{width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                </div>
                            }
                        </div>
                        <Row
                            gutter={16}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                width: window.innerWidth,
                                borderTop: '1px solid #e8e8e8',
                                padding: '10px 16px',
                                textAlign: 'left',
                                left: 0,
                                background: '#fff',
                                borderRadius: '0 0 4px 4px',
                                marginLeft: 0
                            }}
                        >
                            <Col span={12} style={{left: 0, textAlign: "left", paddingLeft: 0}}>
                                <Button
                                    disabled={BtnDisabled}
                                    onClick={()=>{
                                        this.serverInfo(intl)
                                    }}
                                >
                                    {
                                        intl.formatMessage({id: "create.connect.redis.button.redis-info"})
                                    }
                                </Button>
                                &nbsp;&nbsp;
                                <Button
                                    disabled={BtnDisabled}
                                    onClick={()=>{
                                        this.testConnect(intl)
                                    }}
                                >
                                    {
                                        intl.formatMessage({id: "create.connect.redis.button.test-connection"})
                                    }
                                </Button>
                                &nbsp;&nbsp;
                                <Popconfirm
                                    disabled={BtnDisabled}
                                    placement="top"
                                    title={intl.formatMessage({id: "app.button.remove"}) + "  " + ConnName + " ?"}
                                    onConfirm={()=>{
                                        Delete(currentSelect)
                                        // 删除后台生成的redis连接对象
                                        IpcRendererSendSync(ipcChannel.DeleteConnectObject, {key: currentSelect})
                                        // if(result.status) {
                                        //     console.log("删除成功")
                                        // }
                                        message.success(intl.formatMessage({id: "app.message.success"}))
                                    }}
                                    okText={intl.formatMessage({id: "app.button.apply"})}
                                    cancelText={intl.formatMessage({id: "app.button.cancel"})}
                                >
                                    <Button
                                        disabled={BtnDisabled}
                                        type="danger"
                                        // onClick={()=>{
                                        // }}
                                    >
                                        { intl.formatMessage({id: "app.button.remove"}) }
                                    </Button>
                                </Popconfirm>
                                &nbsp;&nbsp;
                                <Button type="primary"
                                    onClick={()=>{
                                        this.add()
                                    }}
                                >
                                    {intl.formatMessage({id: "app.button.add"})}
                                </Button>
                            </Col>
                            <Col span={12} style={{textAlign: "right", paddingRight: 0}}>
                                <Button
                                    type="danger"
                                    onClick={()=>{
                                        if(ConnectionFormValidateStatus) {
                                            this.setDrawerVisible({DrawerVisible: false})
                                        }
                                    }}
                                >
                                    {intl.formatMessage({id: "app.button.close"})}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Drawer>

                <div
                    className={`${styles['logo']} ${styles['logo-' + theme]}`}
                    style={{
                        // 在开发人员工具打开时会出现问题
                        WebkitAppRegion: 'drag'
                    }}
                >
                    {/*<Link to="/welcome">*/}
                        <img src={logo} alt="logo" />
                        &nbsp;&nbsp;
                        <h1>{ intl.formatMessage({id: 'app.name'}) }</h1>
                    {/*</Link>*/}
                </div>
                <Tooltip placement="rightTop" title={ intl.formatMessage({id: "create.connect.redis.create-connect"}) } style={{backgroundColor: 'orange'}}>
                    <div
                        className={`${styles['new-connect']} ${styles['new-connect-' + theme]}`}
                        onClick={()=>{
                            this.setDrawerVisible({DrawerVisible: true})
                        }}
                    >
                        <Icon
                            type="plus"
                            style={{fontSize: '23px', cursor: 'pointer', color: ("dark" === theme) ? '#FFF' : '#595959', bottom: '0px'}}
                        />
                    </div>
                </Tooltip>
                <div className={
                        `${
                            styles['sidebar-container-' + theme]}
                            ${styles['sidebar']}
                            ${styles['sidebar-' + theme]}
                            ${theme + 'SidebarContainerScrollbar'}
                        }`
                     }
                     style={{height: sidebarContainerHeight - 64 + 'px'}}
                >


                    <Menu
                        theme={theme}
                        onClick={(e) =>{
                            this.open(e, intl)
                        }}
                        style={{ padding: '16px 0', width: '100%', border: '0px' }}
                        selectedKeys={[activeKey]}
                        mode="inline"
                        inlineCollapsed={collapsed}
                    >
                        {
                            sidebarData.map((item) => {
                                if (item.children instanceof Array) {
                                    return (
                                        <SubMenu key={item.key}
                                                 title={
                                                    <span>
                                                        <Icon type={item.icon} /><span>{ item.label }</span>
                                                    </span>
                                                 }
                                        >
                                            {
                                                item.children.map((subItem) => (
                                                    <Menu.Item key={subItem.key}>
                                                        <Link to={subItem.url}>{ subItem.name }</Link>
                                                    </Menu.Item>
                                                ))
                                            }
                                        </SubMenu>
                                    )
                                } else {
                                    return (
                                        <Menu.Item key={item.key}>
                                            <Link to={item.url}>
                                                <Icon type={item.icon} /><span>{ intl.formatMessage({id: item.label}) }</span>
                                            </Link>
                                        </Menu.Item>
                                    )
                                }
                            })
                        }
                    </Menu>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return state
}

const mapDispatchToProps = (dispatch, ownProps) => ({
    addTab: (key) => {
        dispatch({
            type: "CONNECTINFO/REDIS/ACTIVECONNECTDATA/ADD",
            activeKey: key
        })
    },
    activeTab: (key) => {
        dispatch({
            type: 'CONNECTINFO/REDIS/ACTIVECONNECTDATA/ACTIVETAB',
            activeKey: key
        })
    },
    Save: (redis_connect_list, sidebarData) => {
        dispatch({
            type: 'CONNECTINFO/REDIS/SAVE',
            data: redis_connect_list,
            sidebarData: sidebarData,
        })
    },
    updateConnected: (connected) => {
        dispatch({
            type: 'CONNECTINFO/REDIS/UPDATECONNECTED',
            connected: connected
        })
    },
    ChangeSelect: (key) => {
        dispatch({
            type: "CONNECTINFO/REDIS/CHANGESELECT",
            selectedKey: key
        })
    },
    Delete: (currentSelect) => {
        dispatch({
            type: 'CONNECTINFO/REDIS/DELETE',
            currentSelectKey: currentSelect
        })
    },
    UpdateServerInfo: (ServerInfo) => {
		dispatch({
			type: "WELCOME/UPDATE/SERVERINFO",
			ServerInfo: ServerInfo
		})
    },
    UpdateActiveKeyAndReloadBtnVisible: (key, visible) => {
		dispatch({
			type: "WELCOME/UPDATE/ACTIVEKEYANDRELOADBTNVISIBLE",
			activeKey: key,
			visible: visible
		})
	},
    UpdateConnectionValidateStatus: () => {
        dispatch({
			type: "CONNECTINFO/UPDATE/CONNECTIONVALIDATESTATUS"
		})
    }
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(Sidebar))