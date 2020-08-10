import React from 'react';
import {
    Tabs
} from 'antd';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import About from './about/About';
import Base from './base/Base';

const TabPane = Tabs.TabPane;
class settingComponent extends React.Component {

    componentDidMount() {
    }

    componentWillUnmount() {
    }
    render(){
        const { intl } = this.props
        return (
            <div style={{display: 'flex', textAlign: 'center', height: '100%', width: '100%', backgroundColor: '#fff'}}>
                <Tabs
                    defaultActiveKey="1"
                    tabPosition="left"
                    tabBarGutter={0}
                    style={{ height: '100%', width: '100%' }}
                    tabBarStyle={{ width: "100px"}}
                >
                    <TabPane
                        tab={ intl.formatMessage({id: 'setting.base'}) }
                        key={1}
                    >
                        <Base />
                    </TabPane>
                    <TabPane
                        tab={ intl.formatMessage({id: 'setting.about'}) }
                        key={2}
                        className="lightSidebarContainerScrollbar"
                    >
                        <About />
                    </TabPane>
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
  
export default connect(
    mapStateToProps
)(injectIntl(settingComponent))