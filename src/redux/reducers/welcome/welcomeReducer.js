const welcomeReducer = (
    state = {
        ReloadBtnVisible: "none",
        activeKey: "1",    // 默认激活第一个tab面板
        ServerInfo: []
    },
    action
) => {
    switch(action.type) {
        case 'WELCOME/UPDATE/ACTIVEKEYANDRELOADBTNVISIBLE':
            return  {
                ...state,
                activeKey: action.activeKey,
                ReloadBtnVisible: action.visible
            }
        case 'WELCOME/UPDATE/SERVERINFO':
            return  {
                ...state,
                ServerInfo: action.ServerInfo
            }
        default:
            return state
    }
}

export default welcomeReducer;