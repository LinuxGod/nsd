import React from 'react';
import {
	Icon,
	Tag,
	Row,
	Col,
	Tabs,
	Result,
	message,
	Typography,
	Descriptions
} from 'antd';
import { IpcRendererSendSync } from '@/util/ipc/ipcRedis'
import ipcChannel from '@/util/ipc/ipcChannel'
import { connect } from 'react-redux'
import { injectIntl } from "react-intl"
import logo from '@/assets/images/logo.svg'
const Config = require('@/config/config')

const { Paragraph, Text } = Typography;
const { TabPane } = Tabs;
class welcomeComponent extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			chartsHeight: 500
		}
		this.charts = []
	}

	componentDidMount(){
		this.getServerInfo()
		window.addEventListener('resize', this.handleResize.bind(this)) // 监听窗口大小改变
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize.bind(this)) // 移除监听窗口大小
	}

	componentDidUpdate(){
		this.charts = []
		this.createKeyBarCharts()
	}
	
	handleResize = e => {
		this.charts.map(chart => {
			chart.resize({
				silent: false,
				width: "auto",
				height: "auto"
			})
		})
	}

	getServerInfo(){
		let { connected } = this.props.connect
		let results = IpcRendererSendSync(ipcChannel.ConnectionedRedisServerInfo, connected)
		this.props.UpdateServerInfo(results.result)
	}

	createKeyBarCharts(){
		const { ServerInfo } = this.props.welcome
		
		for(let i = 0; i < ServerInfo.length; i++){
			if(!ServerInfo[i].connected) {
				continue
			}
			let myChart = window.echarts.init(document.getElementById(ServerInfo[i].uuid))
			let xAxisData = ServerInfo[i].ChartsData.xAxisData
			let SeriesData = ServerInfo[i].ChartsData.SeriesData

			let option = {
				color: ['#1990FF'],
				// title: {
				// 	text: "各实例键数量"
				// },
				tooltip: {
					trigger: 'axis',
					formatter: function (params) {
						return params[0].name + " Key Statistics: " + params[0].data
					}
				},
				xAxis: {
					type: 'category',
					data: xAxisData
				},
				yAxis: {
					show: false,
					type: 'value'
				},
				series: [{
					data: SeriesData,
					type: 'bar',
					markPoint: {
						data: [
							{value: 200, xAxis: 1},
							{value: 201, xAxis: 11}
						]
					},
				}]
			};
	
			// 使用刚指定的配置项和数据显示图表。
			myChart.setOption(option);
			this.charts.push(myChart)
		}
	}
	
	chanageTab(activeKey){
		if(1 === parseInt(activeKey, 10)) {
			this.props.UpdateActiveKeyAndReloadBtnVisible(activeKey, "none")
		} else if(2 === parseInt(activeKey, 10)) {
			this.props.UpdateActiveKeyAndReloadBtnVisible(activeKey, "block")
			this.getServerInfo()
		}
	}

	render(){
		const { intl, setting, welcome } = this.props
		const { contentContainerHeight } = setting
		const { activeKey, ReloadBtnVisible, ServerInfo } = welcome

		return (
			<div style={{height: '100%', paddingLeft: "10px", paddingRight: "10px", paddingTop: "10px", backgroundColor: '#f0f0f0'}}>
				
				<Tabs
					activeKey={activeKey}
					tabBarExtraContent={
						<div id="ReloadConnectionInfo" style={{marginRight: "10px", display: ReloadBtnVisible}}>
							<Icon
								type="redo"
								style={{fontSize: "20px", cursor: "pointer"}}
								onClick={()=>{
									this.getServerInfo()
									message.success(intl.formatMessage({id: "app.message.success"}))
								}}
							>
							</Icon>
						</div>
					}
					hideAdd={false}
					tabBarGutter={1}
					tabBarStyle={{
						backgroundColor: '#ffffff',
						margin: 0
					}}
					onChange={(activeKey)=>{
						this.chanageTab(activeKey)
					}}
				>
					<TabPane tab={intl.formatMessage({id: "app.welcome"})} key="1">
						<div
							style={{
								height: contentContainerHeight - 65,
								backgroundColor: '#ffffff',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
								<Row style={{height: "60px"}}>
									<Col span={12} style={{height: "60px", width: "70px", padding: "0px 10px 0px 0px"}}>
										<img
											src={logo}
											alt="logo"
											style={{width: "60px", height: "60px"}}
										/>
									</Col>
									<Col span={12} style={{padding: "0px"}}>
										<Row style={{height: "30px"}}>
											<Col span={12} style={{width: "130px", display: "flex", alignItems: "center", justifyContent: "flex-start", height: "30px", margin: "0px", padding: "0px"}}>
												<p style={{fontWeight: "bold"}}>{intl.formatMessage({id: "app.name"})}</p>
											</Col>
										</Row>
										<Row style={{height: "30px"}}>
											<Col span={12} style={{width: "130px", display: "flex", height: "30px", alignItems: "center", justifyContent: "flex-start", padding: "0px"}}>
												<p>{`${intl.formatMessage({id: "app.version"})}:${Config.version}`}</p>
											</Col>
										</Row>
									</Col>
									{/* <Col style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
										<Icon
											type="github"
											style={{fontSize: "20px", cursor: "pointer"}}
											onClick={()=>{
											}}
										>
										</Icon>
									</Col> */}
								</Row>
						</div>
					</TabPane>
					{
						(ServerInfo.length <= 0) ?
						"" :
						<TabPane tab={intl.formatMessage({id: "create.connect.redis.connection"})} key="2" forceRender={true}>
							<div
								style={{
									height: contentContainerHeight - 65,
									overflowY: "auto",
									overflowX: "hidden"
								}}
								className="lightSidebarContainerScrollbar"
							>
								{
									ServerInfo.map((item, index) => {
										if(item.connected){
											return <div key={index}>
													<Row gutter={[16, 24]} style={{backgroundColor: "#ffffff", padding: "20px"}}>
														<Col span={6} xs={24} sm={24} md={24} lg={24} xl={24} xxl={10}>
															<Tag color="cyan">{item.ConnectName}</Tag>
															<Descriptions title="Server" size={this.state.size} size="small">
																{
																	item.Server.map((item2, index2) => (
																		<Descriptions.Item key={index2} label={item2.name}>{item2.value}</Descriptions.Item>
																	))
																}
															</Descriptions>
															<br />
															<Descriptions title="Memory" size={this.state.size} size="small">
																{
																	item.Memory.map((item2, index2) => (
																		<Descriptions.Item key={index2} label={item2.name}>{item2.value}</Descriptions.Item>
																	))
																}
															</Descriptions>
															<br />
															<Descriptions title="Stats" size={this.state.size} size="small">
																{
																	item.Stats.map((item2, index2) => (
																		<Descriptions.Item key={index2} label={item2.name}>{item2.value}</Descriptions.Item>
																	))
																}
															</Descriptions>
															<br />
														</Col>
														<Col span={6} xs={24} sm={24} md={24} lg={24} xl={24} xxl={14}>
															<div id={item.uuid} style={{height: this.state.chartsHeight, width: "100%"}}>
															</div>
														</Col>
													</Row>
													{/* 末尾不加br */}
													{/* {
														(ServerInfo.length == index + 1) ?
														"" :
														<div><br /><br /></div>
													} */}
												</div>
										} else {
											return <div key={index} style={{backgroundColor: "#fff", padding: "20px"}}>
														<Tag color="cyan">{item.ConnectName}</Tag>
														<Result
															status="error"
															title="获取数据失败"
														>
															<div className="desc">
																<Paragraph>
																	<Text
																	strong
																	style={{
																		fontSize: 16,
																	}}
																	>
																	提示:
																	</Text>
																</Paragraph>
																<Paragraph>
																	<Icon style={{ color: 'red' }} type="cloud" /> 检查Redis Server是否已经启动
																</Paragraph>
																<Paragraph>
																	<Icon style={{ color: 'red' }} type="file-search" /> 检查连接信息是否正确
																</Paragraph>
															</div>
														</Result>
													</div>
										}
									})
								}
							</div>
						</TabPane>
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
	UpdateActiveKeyAndReloadBtnVisible: (key, visible) => {
		dispatch({
			type: "WELCOME/UPDATE/ACTIVEKEYANDRELOADBTNVISIBLE",
			activeKey: key,
			visible: visible
		})
	},
	UpdateServerInfo: (ServerInfo) => {
		dispatch({
			type: "WELCOME/UPDATE/SERVERINFO",
			ServerInfo: ServerInfo
		})
	}
})
  
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(injectIntl(welcomeComponent))