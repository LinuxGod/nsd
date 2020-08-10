import { remove, get, put } from '@/util/localstorage'
import Config from '@/config/config'

const connectReducer = (
    state = {
        activeKey: "Welcome",
        currentDb: 0,   // 当前选择的DB
        redisActiveData: [],    // 打开的tab标签连接信息数据
        connected: {},  // 已经在后台生成redis连接对象的连接。格式 {redis_connect$9e28f438-33e9-404b-9a71-6f5273cab49d: {name: '连接名称', status: true}}
        currentSelect: (null == get("redis_connect_data")) ? "" : get("redis_connect_data")[0].key, // 添加连接数据打开界面时默认选中第一个,没有连接数据默认为空
        sidebarData: ( null == get("sidebarData") ) ? Config.SidebarData : get("sidebarData"),
        redis: (null == get("redis_connect_data")) ? [] : get("redis_connect_data"),
        ConnectionFormValidateStatus: true,    // 所有校验通过: true, 所有校验不通过: false
        ConnectionFormValidate: {
            NameStatus: "success",
            HostStatus: "success",
            PortStatus: "success",
            NameStatusMsg: "create.connect.redis.validate.msg", // intl id
            HostStatusMsg: "create.connect.redis.validate.msg",
            PortStatusMsg: "create.connect.redis.validate.msg"
        }
    },
    action
) => {

    switch(action.type) {
        case 'CONNECTINFO/REDIS/SAVE':  // 更新连接信息,保存到redux和localstorage
            put("redis_connect_data", action.data)
            put("sidebarData", action.sidebarData)

            return {
                ...state,
                redisActiveData: action.redisActiveData,
                sidebarData: action.sidebarData,
                redis: action.data
            }
        case 'CONNECTINFO/REDIS/UPDATEVALIDATESTATUS':
            return {
                ...state,
                ConnectionFormValidate: action.ValidateStatus,
                ConnectionFormValidateStatus: action.allStatus
            }
        case 'CONNECTINFO/UPDATE/CURRENTDB':
            return {
                ...state,
                currentDb: action.db
            }
        case 'CONNECTINFO/UPDATE/CONNECTIONVALIDATESTATUS':
            // 重置状态
            return {
                ...state,
                ConnectionFormValidate: {
                    NameStatus: "success",
                    HostStatus: "success",
                    PortStatus: "success",
                    NameStatusMsg: "create.connect.redis.validate.msg",
                    HostStatusMsg: "create.connect.redis.validate.msg",
                    PortStatusMsg: "create.connect.redis.validate.msg"
                }
            }
        case 'CONNECTINFO/REDIS/CHANGESELECT':
            return {
                ...state,
                currentSelect: action.selectedKey
            }
        case 'CONNECTINFO/REDIS/UPDATECONNECTED':
            let sidebarData = JSON.parse(JSON.stringify(state.sidebarData))
            let connected = action.connected

            if(sidebarData.length > 2) {
                let children = sidebarData[1].children
                for(let k in connected) {
                    if(!connected[k].status) {  // 将无效的连接的url改为#号
                        children.map((item, index) => {
                            if(item.key === k) {
                                sidebarData[1].children[index]["url"] = "#"
                            }
                        })
                    } else {    // 有效连接
                        children.map((item, index) => {
                            if(item.key === k) {
                                sidebarData[1].children[index]["url"] = Config.route.Content
                            }
                        })
                    }
                }
            }

            return {
                ...state,
                connected: action.connected,
                sidebarData: sidebarData
            }
        case 'CONNECTINFO/REDIS/DELETE':
            let NewSelect = ""
            let key = action.currentSelectKey
            let _data = JSON.parse(JSON.stringify(state.redis))

            for(let i = 0; i < _data.length; i++){
                if(key === _data[i].key){
                    _data.splice(i, 1)
                }
            }

            let _sidebarData = JSON.parse(JSON.stringify(state.sidebarData))
            let childrenLength = _sidebarData[1].children.length
            if(childrenLength === 1){
                // 若果children中只有一个元素则将sidebarData中的第二个元素都删掉(没有连接)
                _sidebarData.splice(1, 1)
            } else if(childrenLength > 1) {
                let delKey = key
                for(let i = 0; i < _sidebarData[1].children.length; i++){
                    if(delKey === _sidebarData[1].children[i].key) {
                        _sidebarData[1].children.splice(i, 1)
                    }
                }
            }

            // 覆盖原来的值
            if(_data.length <= 0) {
                remove("redis_connect_data")
            } else {
                put("redis_connect_data", _data)
                NewSelect = _data[0].key
            }
            put("sidebarData", _sidebarData)

            return {
                ...state,
                redis: _data,
                currentSelect: NewSelect,
                sidebarData: _sidebarData
            }
        case 'CONNECTINFO/REDIS/ACTIVECONNECTDATA/ADD':
            let _redisActiveData = ( null == state.redisActiveData ) ? [] : JSON.parse(JSON.stringify(state.redisActiveData))

            let obj = {}
            if(_redisActiveData.length <= 0){
                for(let i = 0; i < state.redis.length; i++){
                    if(action.activeKey === state.redis[i].key) {
                        obj = state.redis[i]
                        obj["key"] = state.redis[i].key
                    }
                }
                _redisActiveData.push(obj)
            } else {
                // 检查是否已经存在打开了的tab
                let exist = false
                for(let j = 0; j < _redisActiveData.length; j++){
                    if(_redisActiveData[j].key === action.activeKey) {
                        exist = true
                    }
                }
                // 打开tab,将数据放入redux,自动渲染tab页
                if(!exist){
                    let obj2 = {}
                    for(let i = 0; i < state.redis.length; i++){
                        if(action.activeKey === state.redis[i].key) {
                            obj2 = state.redis[i]
                            obj2["key"] = state.redis[i].key
                        }
                    }
                    _redisActiveData.push(obj2)
                }
            }

            return {
                ...state,
                activeKey: action.activeKey,
                redisActiveData: _redisActiveData
            }
        case 'CONNECTINFO/REDIS/ACTIVECONNECTDATA/CHANGEACTIVETAB':
            return {
                ...state,
                activeKey: action.activeKey
            }
        case 'CONNECTINFO/REDIS/ACTIVECONNECTDATA/REMOVEACTIVETAB':
            let targetKey = action.targetKey
            let activeKey = state.activeKey

            let lastIndex;
            state.redisActiveData.forEach((pane, i) => {
                if (pane.key === targetKey) {
                    lastIndex = i - 1;
                }
            });
            const panes = state.redisActiveData.filter(pane => pane.key !== targetKey);
            if (panes.length && activeKey === targetKey) {
                if (lastIndex >= 0) {
                    activeKey = panes[lastIndex].key;
                } else {
                    activeKey = panes[0].key;
                }
            }

            if(panes.length <= 0) {
                activeKey = "Welcome"   // 关闭完所有tab时激活 welcome (选中欢迎界面)
            }

            return {
                ...state,
                activeKey: activeKey,
                redisActiveData: panes
            }
        case 'CONNECTINFO/REDIS/ACTIVEKEY/UPDATE':
            return {
                activeKey: action.key
            }
        case 'CONNECTINFO/REDIS/ACTIVECONNECTDATA/ACTIVETAB':
            return {
                ...state,
                activeKey: action.activeKey
            }
        default:
            return state
    }
}

export default connectReducer;