import React from 'react'
import { connect } from "react-redux"
import { injectIntl } from 'react-intl'
import {
	Dropdown,
	Tooltip,
	message,
	Button,
	Input,
	Menu,
	Icon,
	Row,
	Col
} from 'antd'
import './command.css'
import { IpcRendererSendSync } from '@/util/ipc/ipcRedis'
import ipcChannel from '@/util/ipc/ipcChannel'
import { fuzzyQuery } from '@/util/util'
import { writeText, readText } from '@/util/electron'

const { Search } = Input

class CommandPage extends React.Component {

    constructor(props){
        super(props)
        this.state = {
			CommandLineGuideVisible: false,
			ContentContainerWidth: 1000,
			ContentContainerHeight: 685,
			currentConnectInfo: {},
			CommandInputValue: "",
			CommandResults: "",
			CommandHistory: [],
			CommandHistoryTemp: [],	// 用于查找历史命令时暂存CommandHistory的数据
			WindowId: null,
			SelectText: "",
			HistoryVisible: false,
			DragboxRefreshCode: new Date().getTime(),	// 用更新这个参数使Dragbox组件刷新
			CurrentCommandIndex: -1	// CommandHistory 数组的下标, 这里-1表示数组是空状态
		}
    }

    componentDidMount(){
		this.initData()
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
	
	initData(){
		let url = this.props.location.search
		url = url.substring(1, url.length)
		let currentConnectInfo = {
			host: url.split("&")[0].split("=")[1],
			port: parseInt(url.split("&")[1].split("=")[1]),
			password: url.split("&")[2].split("=")[1],
			db: parseInt(url.split("&")[3].split("=")[1])
		}
		this.setState({
			WindowId: url.split("&")[4].split("=")[1],
			currentConnectInfo: currentConnectInfo
		})
	}

	setCommandLineGuideVisible(CommandLineGuideVisible){
		this.setState({CommandLineGuideVisible})
	}

	setCommandInputFocus = () => {
        this.refs.CommandInput.input.focus()
	}

	onChangeCommandInputValue(text){
        this.setState({
            CommandInputValue: text
        })
    }
	
	exec(e){
		let {
			currentConnectInfo,
			CommandResults,
			CommandHistory,
			CurrentCommandIndex,
			WindowId,
			CommandInputValue 
		} = this.state

        if(e.keyCode === 13) {	// 按了回车键
            if(CommandInputValue.length <= 0) return

            // 退出命令行
            if("quit" === CommandInputValue.toLowerCase() || "exit" === CommandInputValue.toLowerCase()){
				// this.setState({
                //     CommandInputValue: "",
                //     CommandResults: ""
				// })
				IpcRendererSendSync(ipcChannel.CloseCommandLineWindow, WindowId)
				return
            }

            // 清除屏幕
            if("clear" === CommandInputValue.toLowerCase() || "cls" === CommandInputValue.toLowerCase()){
                this.setState({
                    CommandInputValue: "",
                    CommandResults: ""
                })
                return
            }

			let params = currentConnectInfo
			params["command"] = CommandInputValue
			
            let result = IpcRendererSendSync("ExecRedisCommand", params)
			let res1 = "    " + result.results
			res1 = res1.replace(/[\n\n]/g, "\n    ")
			res1 = res1.substring(0, res1.length - 4)
			let info = params.host + ":" + params.port + "#DB" + params.db + ">>: " + params.command + "\n"
			let results = info + res1
			CommandResults += results
			
			// 将执行的命令放入历史
			if(CommandHistory.indexOf(CommandInputValue) === -1){
				CommandHistory.push(CommandInputValue)
			}

			this.setState({
				CurrentCommandIndex: CommandHistory.length,
				CommandResults: CommandResults,
				CommandHistory: CommandHistory
			},()=>{
				this.scrollToBottom()
			})
		} else if(e.keyCode === 38){		// 按了向上键
			if(CommandHistory.length <= 0) {
				this.setState({
					CommandInputValue: "",
					CurrentCommandIndex: -1
				})
			} else {
				this.setState({
					CommandInputValue: CommandHistory[--CurrentCommandIndex],
					CurrentCommandIndex: --CurrentCommandIndex
				})
			}
		} else if(e.keyCode === 40){		// 按了向下键
			if(CommandHistory.length <= 0) {
				this.setState({
					CommandInputValue: "",
					CurrentCommandIndex: -1
				})
			} else {
				this.setState({
					CommandInputValue: CommandHistory[++CurrentCommandIndex],
					CurrentCommandIndex: ++CurrentCommandIndex
				})
			}
		}
	}

	clearCommandLine(){
        this.setState({
            CommandInputValue: "",
            CommandResults: ""
        })
        this.refs.CommandInput.input.focus()
    }
	
	scrollToBottom(){
        let refs = this.refs
        refs.CommandInput.input.focus()
        refs.ConsoleDiv.scrollTop = refs.ConsoleDiv.scrollHeight
        this.setState({
            CommandInputValue: ""
        })
	}

	copy(){
		// if(this.state.SelectText.length > 0){
			writeText(this.state.SelectText)
			message.success('复制成功')
		// }
	}

	paste(){
		this.setState({
			CommandInputValue: this.state.CommandInputValue.concat(readText())
		},()=>{
			this.setCommandInputFocus()
		})
	}

	select(){
		let txt = window.getSelection().toString()
		if(txt.length > 0){
			this.setState({
				SelectText: txt
			})
		}
	}

	menu(intl){
		return (
			<Menu>
				<Menu.Item key="copy" onClick={()=>{this.copy()}}>{intl.formatMessage({id: "app.copy"})}</Menu.Item>
				<Menu.Item key="paste" onClick={()=>{this.paste()}}>{intl.formatMessage({id: "app.paste"})}</Menu.Item>
				<Menu.Item key="history" onClick={()=>{this.showCommandHistory()}}>{intl.formatMessage({id: "app.history"})}</Menu.Item>
			</Menu>
		)
	}

	showCommandHistory(){
		this.setState({
			HistoryVisible: true,
		})
	}

	search(value){
		if(value.length <= 0) return
		const { CommandHistory } = this.state
		let res = fuzzyQuery(CommandHistory, value)
		if(res.length > 0) {
			this.setState({
				CommandHistory: res,
				DragRefresh: new Date().getTime(),
				CommandHistoryTemp: CommandHistory
			})	
		}
	}

    render() {
		const { intl } = this.props
		const {
			currentConnectInfo,
			CommandResults,
			ContentContainerHeight,
			WindowId,
			CommandInputValue,
			HistoryVisible,
			CommandHistory,
			CommandHistoryTemp
		} = this.state
        let CommandLineHeight = ContentContainerHeight - 128    // 命令行可视窗口高度

        return (
			<div
				className="CommandLineRoot"
			>
				<div
					className="header"
					style={{
						WebkitAppRegion: 'drag'
					}}
					onDoubleClick={()=>{
						IpcRendererSendSync(ipcChannel.ZoomCommandLineWindow, WindowId)
					}}
				>
					<Row>
						<Col span={8}>
							<div
								style={{
									width: "100%",
									height: "64px",
									lineHeight: "64px",
									paddingLeft: "15px",
									fontSize: "18px",
									fontWeight: "bold"
								}}
							>
								{
									intl.formatMessage({id: 'app.name'}) + " " +
									intl.formatMessage({id: 'app.command.line'})
								}
							</div>
						</Col>
						<Col span={8}></Col>
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
									IpcRendererSendSync(ipcChannel.MinimizeCommandLineWindow, WindowId)
								}}
							/>
							<Icon
								type="border"
								style={{cursor: 'pointer', fontSize: '18px', color: '#595959', marginLeft: '10px', WebkitAppRegion: 'no-drag'}}
								onClick={()=>{
									IpcRendererSendSync(ipcChannel.ZoomCommandLineWindow, WindowId)
								}}
							/>
							<Icon
								type="close"
								style={{cursor: 'pointer', fontSize: '20px', color: '#595959', marginLeft: '10px', WebkitAppRegion: 'no-drag'}}
								onClick={()=>{
									IpcRendererSendSync(ipcChannel.CloseCommandLineWindow, WindowId)
								}}
							/>
						</Col>
					</Row>
				</div>

				<Dropdown overlay={this.menu(intl)} trigger={['contextMenu']}>
					<div
						ref="ConsoleDiv"
						style={{
							height: CommandLineHeight,
							// flex: 1,
							width: "100%",
							backgroundColor: "#1E1E1E",
							overflowY: "auto",
							overflowX: "hidden"
						}}
						className="CommandMoadlContainerScrollbar"
						onDoubleClick={()=>{
							this.setCommandInputFocus()
						}}
						onClick={()=>{
							this.setState({
								HistoryVisible: false
							})
						}}
					>
						<pre
							ref="ResultsPre"
							style={{
								color: "#fff",
								fontSize: "16px",
								whiteSpace: "pre-wrap",
								wordWrap: "break-word"
							}}
							onMouseUp={()=>{
								this.select()
							}}
						>
							{CommandResults}
						</pre>
						<div style={{display: "flex"}}>
							<span style={{color: "#fff", fontSize: "16px"}}  onMouseUp={()=>{this.select()}}>
								{currentConnectInfo.host+":"+currentConnectInfo.port+"#DB"+currentConnectInfo.db}>>:
							</span>
							<Input
								ref="CommandInput"
								autoFocus="autoFocus"
								style={{
									flexGrow: 1,
									height: "21px",
									color: "#fff",
									backgroundColor: "#1E1E1E",
									border: "none",
									borderWidth: 0,
									outline: "none",
									paddingTop: "0px",
									paddingBottom: "0px",
									paddingLeft: "4px",
									paddingRight: "2px",
									boxShadow: "none",
									fontSize: "16px"
								}}
								value={CommandInputValue}
								onChange={(e)=>{
									this.onChangeCommandInputValue(e.target.value)
								}}
								onKeyDown={(e)=>{
									this.exec(e)
								}}
							/>
						</div>
					</div>
				</Dropdown>

				<div
					style={{
						display: HistoryVisible ? "block" : "none",
						position: "absolute",
						top: "65px",
						right: "10px",
						width: "200px",
						height: CommandLineHeight - 2,
						backgroundColor: "#fff"
					}}
				>
					<div style={{textAlign: "center", width: "100%", height: "40px", lineHeight: "40px"}}>
						{intl.formatMessage({id: "app.history"})}
					</div>
					<div style={{paddingLeft: "2px", paddingRight: "2px"}}>
						<Search
							placeholder={intl.formatMessage({id: "app.key.words"})}
							onSearch={(text)=>{
								this.search(text)
							}}
							onChange={(obj)=>{
								let val = obj.target.value
								if(val.length <= 0){
									this.setState({
										CommandHistory: CommandHistoryTemp
									})
								}
							}}
						/>
					</div>
					<div
						style={{width: "100%", height: CommandLineHeight - 74, overflowY: "auto"}}
						className="lightSidebarContainerScrollbar"
					>
						<Menu>
							{
								CommandHistory.map((item, index)=>(
									<Menu.Item
										key={index}
										style={{height: "30px", lineHeight: "30px"}}
										onClick={(obj)=>{
											this.setState({
												HistoryVisible: false,
												CommandInputValue: obj.item.props.children
											},()=>{
												this.setCommandInputFocus()
											})
										}}
									>
										{item}
									</Menu.Item>
								))
							}
						</Menu>
					</div>
				</div>

				<div style={{width: "100%", height: "64px", backgroundColor: "#FFFFFF", bottom: 0, position: "fixed", WebkitAppRegion: 'drag'}}>

					<Row>
						<Col
							span={8}
							style={{
								height: "64px"
							}}
						>
							<Tooltip key="CommandLineGuide" title={ intl.formatMessage({id: 'app.guide'}) }>
								<Icon
									type="info-circle"
									style={{ fontSize: '20px', color: '#000000', float: "left", marginTop: "20px", marginLeft: '15px', WebkitAppRegion: 'no-drag' }} 
									onClick={()=>{
										IpcRendererSendSync(ipcChannel.OpenCommandLineGuideWindow, {})
									}}
								/>
							</Tooltip>
							<Tooltip key="CommandLineRepository" title={ intl.formatMessage({id: 'app.repository'}) }>
								<Icon
									key="OpenGithub"
									type="github"
									style={{ fontSize: '20px', color: '#000000', float: "left", marginTop: "20px", marginLeft: '15px', cursor: "pointer", WebkitAppRegion: 'no-drag' }}
									onClick={()=>{
										IpcRendererSendSync(ipcChannel.OpenGitHub, {})
									}}
								/>
							</Tooltip>
						</Col>
						<Col span={8}></Col>
						<Col
							span={8}
							style={{
								float: 'right',
								width: '150px',
								height: '64px',
								lineHeight: "64px"
							}}
						>
							<Button
								type="primary"
								key='clearCommand'
								style={{
									WebkitAppRegion: 'no-drag'
								}}
								onClick={()=>{
									this.clearCommandLine()
								}}
							>
								{intl.formatMessage({id: "app.button.clear"})}
							</Button>
							&nbsp;&nbsp;
							<Button
								type="danger"
								key='CloseCommandModal'
								style={{
									WebkitAppRegion: 'no-drag'
								}}
								onClick={()=>{
									IpcRendererSendSync(ipcChannel.CloseCommandLineWindow, WindowId)
								}}
							>
								{
									intl.formatMessage({id: "app.button.close"})
								}
							</Button>
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

export default connect(
    mapStateToProps
)(injectIntl(CommandPage))