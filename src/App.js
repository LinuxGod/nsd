import React from 'react'
import { Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import en_US from 'antd/es/locale/en_US'
import zh_CN from 'antd/es/locale/zh_CN'
import { view as Loading } from '@/components/loading'
import { view as About } from '@/pages/about'
import { view as Home } from '@/pages'
import { view as Command } from '@/pages/command'
import { view as CommandGuide } from '@/pages/command/CommandGuide'
import { get } from '@/util/localstorage'
const Config = require("@/config/config")

const App = () => {
    return (
        <>
            <ConfigProvider
                locale={("zh" === get("language")) ? zh_CN : en_US}
            >
                <Loading />
                <Route exact path="/" component={Home} />
                <Route path={Config.route.Home} component={Home} />
                <Route path={Config.route.About} component={About} />
                <Route path={Config.route.Command} component={Command} />
                <Route path={Config.route.CommandGuide} component={CommandGuide} />
            </ConfigProvider>
        </>
    )
}

export default App