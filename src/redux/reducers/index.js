import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as loadingReducer } from '@/components/loading';

import commonReducer from './common/commonReducer';
import settingReducer from './setting/settingReducer';
import connectReducer from './connect/connectReducer';
import welcomeReducer from './welcome/welcomeReducer';

// 通过combineReducers把多个reducer进行合并
const reducers = combineReducers({
    common: commonReducer,
    setting: settingReducer,
    connect: connectReducer,
    loading: loadingReducer,
    routing: routerReducer,
    welcome: welcomeReducer
})

export default reducers;