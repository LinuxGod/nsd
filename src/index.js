import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store/store';
import App from '@/App';
import 'antd/dist/antd.css';
import '@/assets/css/common.css';
import config from '@/config/config';
import { existKey, put } from '@/util/localstorage';
import Intl from '@/Intl';

if(!existKey("theme")){
    put("theme", config.theme)
}

ReactDOM.render(
    <Provider store={store}>
        <Intl>
            <HashRouter>
                <App />
            </HashRouter>
        </Intl>
    </Provider>,
    document.getElementById('root')
);