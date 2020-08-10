import React from 'react';
import {
    Icon,
    Row,
    Col
} from 'antd';
import styles from './header.module.css';
import {connect} from "react-redux";
import { IpcRendererSendSync } from '@/util/ipc/ipcRedis'
import ipcChannel from '@/util/ipc/ipcChannel'

class Header extends React.Component{
    constructor(props){
        super(props)
        this.state = {

        }
    }

    componentDidMount() {
    }

    render() {
        const { collapsed } = this.props.setting
        return(
            <div className={`${styles['header-wrapper']}`}>
                <div style={{height: '64px'}}>
                    <Row
                        style={{
                            // 在开发人员工具打开时会出现问题
                            WebkitAppRegion: 'drag'
                        }}
                        onDoubleClick={()=>{
                            IpcRendererSendSync(ipcChannel.ZoomMainWindow, {})
                        }}
                        onClick={()=>{
                        }}
                    >
                        <Col span={8}>
                            <div style={{float: 'left', width: '64px', height: '64px', WebkitAppRegion: 'no-drag'}}>
                                <span className={styles['header-collapsed']} onClick={() => {
                                    this.props.setCollapsed(!collapsed)
                                }}>
                                    <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
                                </span>
                            </div>
                        </Col>
                        <Col span={8}></Col>
                        <Col span={8}>
                            <div style={{float: 'right', width: '115px', height: '64px'}}>
                                <div className={styles['header-user-info']}>
                                    <Icon
                                        type="minus"
                                        style={{WebkitAppRegion: 'no-drag', cursor: 'pointer', fontSize: '20px', color: '#595959'}}
                                        onClick={()=>{
                                            IpcRendererSendSync(ipcChannel.MinimizeMainWindow, {})
                                        }}
                                    />
                                    <Icon
                                        type="border"
                                        style={{WebkitAppRegion: 'no-drag', cursor: 'pointer', fontSize: '18px', color: '#595959', marginLeft: '10px'}}
                                        onClick={()=>{
                                            IpcRendererSendSync(ipcChannel.ZoomMainWindow, {})
                                        }}
                                    />
                                    <Icon
                                        type="close"
                                        style={{WebkitAppRegion: 'no-drag', cursor: 'pointer', fontSize: '20px', color: '#595959', marginLeft: '10px'}}
                                        onClick={()=>{
                                            IpcRendererSendSync(ipcChannel.CloseMainWindow, {})
                                        }}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
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
    setCollapsed: (status) => {
        dispatch({
            type: "SETTING/COLLAPSED",
            status: status
        })
    }
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);