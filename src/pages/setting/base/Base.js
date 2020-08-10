import React from 'react'
import { connect } from 'react-redux'
import {
    Select,
    Row
} from 'antd'
import { get } from '@/util/localstorage';
import { injectIntl } from "react-intl";

const Option = Select.Option
class Base extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            theme: get("theme")
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    changeTheme(theme){
        this.props.changeTheme(theme)
    }

    changeLanguage(lang) {
        // message
        // .loading('正在切换语言...', 2.5)
        // .then(() => message.success('语言切换成功', 2.5))
        // .then(() => message.info('Loading finished is finished', 2.5))
        this.props.changeLanguage(lang)
    }

    render() {
        const { intl, locale } = this.props;
        return(
            <div style={{height: '100%', paddingTop: '20px'}}>
                <Row gutter={2} style={{height: '40px', lineHeight: '40px'}}>
                    <div style={{display: "flex"}}>
                        <div style={{width: "80px", textAlign: "left"}}>
                            { intl.formatMessage({id: 'setting.base.theme'}) }
                        </div>
                        <div style={{flex: 1, textAlign: "left"}}>
                            <Select defaultValue={this.state.theme} size="small" style={{ width: 120 }} onChange={(text)=>{
                                this.changeTheme(text)
                            }}>
                                <Option value="dark">{ intl.formatMessage({id: 'setting.base.theme.dark'}) }</Option>
                                <Option value="light">{ intl.formatMessage({id: 'setting.base.theme.light'}) }</Option>
                            </Select>
                        </div>
                    </div>
                </Row>

                <Row gutter={2} style={{height: '40px', lineHeight: '40px'}}>
                    <div style={{display: "flex"}}>
                        <div style={{width: "80px", textAlign: "left"}}>
                            { intl.formatMessage({id: 'setting.base.language'}) }
                        </div>
                        <div style={{flex: 1, textAlign: "left"}}>
                            <Select defaultValue={locale} size="small" style={{ width: 120 }} onChange={(value)=>{
                                this.changeLanguage(value)
                            }}>
                                <Option value="zh">简体中文</Option>
                                <Option value="en">English</Option>
                            </Select>
                        </div>
                    </div>
                </Row>
            </div>
        )
    }

}

const mapStateToProps = (state, ownProps) => ({
    locale: state.setting.language
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    changeTheme: (val) => {
        dispatch({
            type: "SETTING/CHANGE_THEME",
            theme: val
        })
    },
    changeLanguage: (val) => {
        dispatch({
            type: "SETTING/CHANGELANGUAGE",
            language: val
        })
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(Base));

