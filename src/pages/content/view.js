import React from 'react'
import {
    Icon,
    Tabs
} from 'antd'
import { injectIntl } from 'react-intl'
import { createHashHistory } from 'history'
import {connect} from "react-redux"
import { view as Redis } from './redis'

const Config = require('@/config/config')

const TabPane = Tabs.TabPane
class contentComponent extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            loading: false,
            collapsed: false,
            passwordShow: false,
            testBtnText: "测试连接",
            currentSelectType: "redis",
            currentSelectIndex: 0
        }
    }

    componentDidMount(){
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.connect.redisActiveData.length <= 0) {
            createHashHistory().push(Config.route.Welcome)   // 转到欢迎页
        }
        return nextProps
    }

    onChange = activeKey => {
        this.props.changeActiveTab(activeKey)
    }

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    }

    remove = targetKey => {
        this.props.removeActiveTab(targetKey)
    }

    render(){
        const { connect } = this.props
        const { activeKey, redisActiveData } = connect
        
        return (
            <div style={{height: '100%', backgroundColor: '#fff'}}>
                <Tabs
                    hideAdd
                    onChange={this.onChange}
                    activeKey={activeKey}
                    type="editable-card"
                    onEdit={this.onEdit}
                >
                    {
                        redisActiveData.map(item => (
                            <TabPane
                                tab={
                                    <span>
                                    <Icon type="database" />
                                        {item.name}
                                    </span>
                                }
                                key={item.key}
                            >
                                <Redis />
                            </TabPane>
                        ))
                    }
                </Tabs>
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
    changeActiveTab: (key) => {
        dispatch({
            type: "CONNECTINFO/REDIS/ACTIVECONNECTDATA/CHANGEACTIVETAB",
            activeKey: key
        })
    },
    removeActiveTab: (key) => {
        dispatch({
            type: "CONNECTINFO/REDIS/ACTIVECONNECTDATA/REMOVEACTIVETAB",
            targetKey: key
        })
    }
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(contentComponent));