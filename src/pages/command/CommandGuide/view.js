import React from 'react'
import { connect } from "react-redux"
import { injectIntl } from 'react-intl'
import {
	Icon,
	Row,
	Col
} from 'antd'
import { IpcRendererSendSync } from '@/util/ipc/ipcRedis'
import ipcChannel from '@/util/ipc/ipcChannel'
import './CommandGuide.css'

const Config = require('@/config/config')
class CommandGuidePage extends React.Component {

    constructor(props){
        super(props)
        this.state = {
			title: "",
			ConsoleModalVisible: true,
			CommandLineGuideVisible: false,
			ContentContainerWidth: 1000,
			ContentContainerHeight: 685
        }
    }

    componentDidMount(){
		window.addEventListener('resize', this.handleResize.bind(this)) // 监听窗口大小改变
	}

	handleResize = e => {
		this.setState({
			ContentContainerWidth: e.target.innerWidth,
			ContentContainerHeight: e.target.innerHeight
		})
	}
	
	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize.bind(this)) // 移除监听窗口大小
	}
	
	setConsoleModalVisible(ConsoleModalVisible){
		this.setState({ConsoleModalVisible})
	}

	setWindowTitle(obj, t) {
		if(obj.scrollTop > 25) {
			this.setState({
				title: t
			})
		} else if(obj.scrollTop <= 25) {
			this.setState({
				title: ""
			})
		}
	}

    render() {
		const { intl } = this.props
		const { ContentContainerHeight, title } = this.state

        return (
            <div className="CommandLineGuideRoot" style={{width: "100%", height: ContentContainerHeight}}>
				<div style={{width: "100%", height: "64px", WebkitAppRegion: 'drag'}}>
					<Row>
						<Col span={8}>
							<div style={{width: "100%", height: "64px", lineHeight: "64px", paddingLeft: "15px"}}>
								{/* { intl.formatMessage({id: 'app.name'})+"命令行指南" } */}
							</div>
						</Col>
						<Col
							span={8}
							style={{
								height: "64px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: "bold",
								fontSize: "20px"
							}}
						>
							{title}
						</Col>
						<Col
							span={8}
							style={{
								float: 'right',
								width: '90px',
								height: '64px',
								lineHeight: "64px"
							}}
						>
							<Icon
								type="minus"
								style={{cursor: 'pointer', fontSize: '20px', color: '#595959', WebkitAppRegion: 'no-drag'}}
								onClick={()=>{
									IpcRendererSendSync(ipcChannel.MinimizeCommandLineGuideWindow, {})
								}}
							/>
							<Icon
								type="border"
								style={{cursor: 'pointer', fontSize: '18px', color: '#595959', marginLeft: '10px', WebkitAppRegion: 'no-drag'}}
								onClick={()=>{
									IpcRendererSendSync(ipcChannel.ZoomCommandLineGuideWindow, {})
								}}
							/>
							<Icon
								type="close"
								style={{cursor: 'pointer', fontSize: '20px', color: '#595959', marginLeft: '10px', WebkitAppRegion: 'no-drag'}}
								onClick={()=>{
									IpcRendererSendSync(ipcChannel.CloseCommandLineGuideWindow, {})
								}}
							/>
						</Col>
					</Row>
				</div>

				<div
					className="lightSidebarContainerScrollbar"
					style={{
						height: ContentContainerHeight - 64,
						width: "100%",
						backgroundColor: "#FFFFFF",
						overflowY: "auto",
						overflowX: "hidden"
					}}
					onScroll={(obj) => {
						let t = intl.formatMessage({id: 'app.name'}) + " " +
								intl.formatMessage({id: "app.command.line"}) + " " +
								intl.formatMessage({id: "app.guide"})
						this.setWindowTitle(obj.nativeEvent.target, t)
					}}
				>
					<div
						style={{
							width: "100%",
							textAlign: "center"
						}}
					>
						<h1 style={{fontSize: "20px", fontWeight: "bold", marginTop: "0px"}}>
							{
								intl.formatMessage({id: 'app.name'}) + " " +
								intl.formatMessage({id: "app.command.line"}) + " " +
								intl.formatMessage({id: "app.guide"})
							}
						</h1>
						<div
							style={{
								height: "25px",
								lineHeight: "25px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							}}
						>
							<Icon
								type="github"
								style={{fontSize: '20px', cursor: 'pointer'}}
								onClick={()=>{
									IpcRendererSendSync(ipcChannel.OpenGitHub, {})
								}}
							/>
							&nbsp;
							{`${intl.formatMessage({id: "app.version"})}:${Config.version}`}
						</div>
					</div>
					<div
						style={{
							padding: "0px 15px",
							fontSize: "16px",
							lineHeight: "30px"
						}}
					>
						<p style={{fontWeight: "bold"}}>描述</p>
						<p style={{textIndent: "2em"}}>
							NoSQL Desktop命令行是为了更快捷的使用redis相关命令而诞生的，支持和redis-cli一致的redis命令，为了方便使用并增加了一些额外的命令，敬请查阅相关说明。
						</p>
						<br />
						<p style={{fontWeight: "bold"}}>支持的命令</p>
						<p style={{textIndent: "2em"}}>常用的redis命令</p>
						<br />
						<p style={{fontWeight: "bold"}}>不支持的命令</p>
						<p style={{textIndent: "2em"}}>
							1.select
						</p>
						<br />
						<p style={{fontWeight: "bold"}}>额外的命令</p>
						<p style={{textIndent: "2em"}}>1. 清屏</p>
						<p style={{textIndent: "4em"}}>clear</p>
						<p style={{textIndent: "4em"}}>cls</p>
						<p style={{textIndent: "2em"}}>2. 退出/关闭</p>
						<p style={{textIndent: "4em"}}>exit</p>
						<p style={{textIndent: "4em"}}>quit</p>
					</div>

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

export default connect(
    mapStateToProps
)(injectIntl(CommandGuidePage))