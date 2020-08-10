import {existKey, put, get} from '@/util/localstorage'
import config from '@/config/config'

const settingReducer = (
    state = {
        sidebarContainerHeight: window.innerHeight - 64,
        contentContainerHeight: window.innerHeight - 64,
        contentContainerWidth: window.innerWidth - 256,
        sidebarContainerWidth: 256,
        theme: config.theme,
        collapsed: false,
        language: (null == get("language")) ? 'zh' : get("language")
    },
    action
) => {
    let theme = ""
    if("undefined" != typeof(action.theme)) {
        theme = action.theme
        put("theme", theme)
    } else {
        theme = state.theme
        if(!existKey("theme")){
            put("theme", theme)
        }
    }

    switch(action.type) {
        case 'SETTING/CHANGE_THEME':
            return {
                ...state,
                theme: theme
            }
        case 'SETTING/COLLAPSED':
            return  {
                ...state,
                collapsed: action.status,
                sidebarContainerWidth: action.status ? 80 : 256,
                contentContainerWidth: action.status ? window.innerWidth - 80 : window.innerWidth - 256
            }
        case 'SETTING/CHANGELANGUAGE':
            put("activeTab", "2")
            put("language", action.language)
            return  {
                ...state,
                language: action.language
            }
        case 'SETTING/CHANGEWINDOWSSIZE':
            return  {
                ...state,
                sidebarContainerHeight: action.size.sidebarContainerHeight,
                contentContainerHeight: action.size.contentContainerHeight,
                contentContainerWidth: action.size.contentContainerWidth,
            }
        default:
            return state
    }
}

export default settingReducer;