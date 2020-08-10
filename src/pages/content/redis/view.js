import React from 'react'
import Highlighter from 'react-highlight-words'
import {
    Button,
    Input,
    Select,
    Icon,
    Table,
    Spin,
    Modal,
    message,
    Tooltip,
    Pagination
} from 'antd/lib/index'

import "./view.css"
import { createHashHistory } from 'history'
import { injectIntl } from 'react-intl'
import {connect} from "react-redux"
import { IpcRendererSendSync } from '@/util/ipc/ipcRedis'
import ipcChannel from '@/util/ipc/ipcChannel'
import EditModal from './EditModal'
const Config = require('@/config/config')

const { Option } = Select
const { confirm } = Modal

class redisComponent extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            closeAllTab: false,
            AddOrModifyModalVisible: false,
            currentEidtType: "string",
            tableRowNumber: 5,
            searchText: '',
            selectedOne: false,
            EditType: "",    // 值: add, modify. 默认是添加
            DataKey: "",
            newKey: "",
            ttl: -1,
            selectedRowKeys: [],
            dbs: [],
            dataSource: [],
            serverInfoColumns: [
                {
                    title: '名称',
                    width: 150,
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: '值',
                    dataIndex: 'value',
                    key: 'value',
                }
            ],
            pagination: {
                totalRow: 0,
                currentPage: 1,
                defaultCurrent: 1,
                pageSize: 30,
                defaultPageSize: 30
            },
            loading: false
        }
    }

    componentDidMount(){
        this.init()
    }

    init(){
        const { activeKey } = this.props.connect
        let params = {
            redisClientId: activeKey
        }
        let results = IpcRendererSendSync(ipcChannel.CountDatabases, params)
        this.setState({
            dbs: results
        })

        this.refreshData()
    }
    
    toggle = value => {
        this.setState({ loading: value });
    }

    refreshData(callback){
        const { intl } = this.props
        const { activeKey, currentDb } = this.props.connect
        const { pagination  } = this.state
        let params = {
            redisClientId: activeKey,
            db: currentDb,
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize
        }

        this.toggle(true)
        let result = IpcRendererSendSync(ipcChannel.paginate, params)
        if(result.status) {
            let p = JSON.parse(JSON.stringify(pagination))
            p.totalRow = result.paginate.totalRow

            this.setState({
                dataSource: result.data,
                pagination: p
            },()=>{
                this.toggle(false)
                if("function" == typeof(callback)) {
                    callback(true)
                }
            })
        } else {
            message.error(intl.formatMessage({"id": result.message}))
            createHashHistory().push(Config.route.Welcome)   // 转到欢迎页
        }
    }

    onSelectChange = selectedRowKeys => {
        let selectedOne = false
        if(selectedRowKeys.length === 1){
            selectedOne = true
        } else {
            selectedOne = false
        }

        this.setState({
            selectedRowKeys,
            selectedOne: selectedOne
        })
    }

    onSelect = (e) => {
        let params = {
            redisClientId: this.props.connect.activeKey,
            db: e.key.split("$")[1],
            key: e.key.split("$")[0]
        }
        
        let result = IpcRendererSendSync(ipcChannel.RedisGet, params)
        this.setState({
            currentEidtType: result.keyType.toUpperCase()
        })
    }

    setAddOrModifyModalVisible(object) {
        this.setState(object,()=>{
            this.refreshData()
        });
    }

    doCancel(){
        this.setAddOrModifyModalVisible({AddOrModifyModalVisible: false, EditType: ""})
    }

    delete(intl){
        let that = this
        const { currentDb, activeKey } = this.props.connect
        const { selectedRowKeys } = this.state
        if(selectedRowKeys.length <= 0) {
            message.error(intl.formatMessage({id: "app.message.select.data"}))
            return
        }

        confirm({
            title: `${intl.formatMessage({id: "app.message.notification"})}[${intl.formatMessage({id: "app.message.danger"})}]`,
            content: `${intl.formatMessage({id: "app.button.delete"})} ${intl.formatMessage({id: "app.message.selected"})}  ${intl.formatMessage({id: "app.message.data"})}?`,
            okType: 'danger',
            okText: intl.formatMessage({id: "app.button.ok"}),
            cancelText: intl.formatMessage({id: "app.button.cancel"}),
            onOk() {
                let params = {
                    redisClientId: activeKey,
                    db: currentDb,
                    keys: selectedRowKeys
                }

                let result = IpcRendererSendSync(ipcChannel.Delete, params)
                if(result.status){
                    message.success(intl.formatMessage({id: "app.message.success"}))
                    that.setState({
                        selectedOne: false,
                        selectedRowKeys: []
                    })
                    that.refreshData()
                } else {
                    message.success(intl.formatMessage({id: "app.message.fail"}))
                }
            },
            onCancel() {
            },
        })
    }

    flush(intl){
        let that = this
        let { currentDb, redisActiveData, activeKey } = this.props.connect

        let data = redisActiveData.filter((item, index) => {
            if(item.key === activeKey) return item
        })

        confirm({
            title: `${intl.formatMessage({id: "app.message.notification"})}[${intl.formatMessage({id: "app.message.danger"})}]`,
            content: `${intl.formatMessage({id: "app.button.flush"})}: ${data[0].name}#DB${currentDb}`,
            okText: intl.formatMessage({id: "app.button.ok"}),
            cancelText: intl.formatMessage({id: "app.button.cancel"}),
            okType: 'danger',
            onOk() {
                let params = {
                    redisClientId: activeKey,
                    db: currentDb
                }
                let result = IpcRendererSendSync(ipcChannel.FlushDB, params)
                if(result.status){
                    message.success(intl.formatMessage({id: "app.message.success"}))
                    that.refreshData()
                } else {
                    message.error(intl.formatMessage({id: "app.message.fail"}))
                }
            },
            onCancel() {
            },
          })
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              ref={node => {
                this.searchInput = node;
              }}
              placeholder={`Search ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="primary"
              onClick={() => this.handleSearch(selectedKeys, confirm)}
              icon="search"
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Search
            </Button>
            <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </div>
        ),
        filterIcon: filtered => (
          <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
          record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.select());
          }
        },
        render: text => (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[this.state.searchText]}
            autoEscape
            textToHighlight={text.toString()}
          />
        ),
      });
    
      handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
      };
    
      handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
      };

    openMenu(args){
        let dbIndex = ""
        if(args.length > 0) {
            dbIndex = args[args.length - 1].substring(2, 3)
        }

        let params = {
            redisClientId: this.props.connect.activeKey,
            db: dbIndex
        }

        let result = IpcRendererSendSync(ipcChannel.QueryDataForArr, params)
        if(result.status) {
            this.setState({
                dataSource: result.data
            })
        }

        this.setState({
            currentEidtType: "TABLE",
        })
    }

    /**
     * 导出数据
     * @param {*} intl 
     */
    export(intl){
        const { currentDb, activeKey } = this.props.connect
        let selected = this.state.selectedRowKeys
        if(selected.length <= 0){
            message.error(intl.formatMessage({id: "app.message.select.data"}))
            return
        }

        let result = IpcRendererSendSync(ipcChannel.Export, {
            select: selected,
            db: currentDb,
            redisClientId: activeKey
        })

        let modal = null, secondsToGo = 8
        if(result.status){
            if("success" === result.message) {
                modal = Modal.info({
                title: intl.formatMessage({id: "app.message.notification"}),
                icon: <Icon type="info-circle" />,
                okText: ``,
                content: <div>
                                <p>{`${intl.formatMessage({id: "app.export.message.exporting"})}...`}</p>
                        </div>
                })

                let timer = setInterval(() => {
                    secondsToGo -= 1;
                    modal.update({
                        okType: "default",
                        icon: <Icon type="check-circle" style={{color: "#51C41B"}} />,
                        content: <div>
                                    <p>{intl.formatMessage({id: "app.export.message.success"})}</p>
                                    <p>{`${intl.formatMessage({id: "app.export.message.path"})}: ${result.filePath}`}</p>
                                </div>,
                        okText: `${intl.formatMessage({id: "app.button.ok"})} [${secondsToGo}]`
                    })
                }, 1000)
                setTimeout(() => {
                    clearInterval(timer)
                    modal.destroy()
                }, secondsToGo * 1000)
            } else if("cancel" === result.message) {
                // modal.destroy()
            }
        } else {
            let timer = setInterval(() => {
                secondsToGo -= 1;
                modal.update({
                    okType: "danger",
                    icon: <Icon type="close-circle" style={{color: "#F5232D"}} />,
                    content: <div>
                                <p>{intl.formatMessage({id: "app.export.message.fail"})}</p>
                            </div>,
                    okText: `${intl.formatMessage({id: "app.button.close"})} [${secondsToGo}]`
                })
            }, 1000)
            setTimeout(() => {
                clearInterval(timer)
                modal.destroy()
            }, secondsToGo * 1000)
        }
    }

    /**
     * 打开命令行窗口
     */
    _OpenCommandLineWindow(){
        let { redisActiveData, activeKey, currentDb } = JSON.parse(JSON.stringify(this.props.connect))
        let params = redisActiveData.filter((item, index) => {
            if(activeKey === item.key) return item
        })[0]
        params["db"] = currentDb
        IpcRendererSendSync(ipcChannel.OpenCommandLineWindow, params)
    }

    openEditModal(object){
        // type: add/modify
        this.setState({
            EditType: object.type,
            DataKey: object.key
        },()=>{
            this.setAddOrModifyModalVisible({AddOrModifyModalVisible: true})
        })
    }

    renderEditModal(){
        const { activeKey, currentDb } = this.props.connect
        const { EditType, DataKey, AddOrModifyModalVisible } = this.state
        if(EditType.length > 0) {
            return (
                <EditModal
                    RefreshData={this.refreshData.bind()}
                    EditType={EditType}
                    RedisClientId={activeKey}
                    DataKey={DataKey}
                    db={currentDb}
                    visible={AddOrModifyModalVisible}
                    close={()=>{this.doCancel()}}
                />
            )
        }
    }

    serverInfo(intl) {
        let { serverInfoColumns } = this.state
        const { activeKey } = this.props.connect
        let result = IpcRendererSendSync(ipcChannel.ServerInfoLittle, {RedisClientId: activeKey})
        Modal.info({
            title: intl.formatMessage({id: "create.connect.redis.button.redis-info"}),
            okText: intl.formatMessage({id: "app.button.ok"}),
            onOk() {},
            width: 800,
            content: (
              <div
                style={{height: "350px", overflowY: "auto", overflowX: "hidden" }}
                className="lightSidebarContainerScrollbar"
              >
                <Table
                    showHeader={false}
                    pagination={false}
                    dataSource={result.result}
                    columns={serverInfoColumns}
                />
              </div>
            )
        })
    }

    render(){
        const { intl, setting } = this.props
        const { currentDb } = this.props.connect
        const { collapsed, contentContainerWidth, contentContainerHeight } = setting
        const { selectedRowKeys, dbs, loading, dataSource, selectedOne, pagination } = this.state
        const { pageSize, defaultPageSize, totalRow, currentPage, defaultCurrent, } = pagination
        const rowSelection = {
            selectedRowKeys,
            columnWidth: 50,
            onChange: this.onSelectChange
        }
        const barWidth = collapsed ? window.innerWidth - 80 : window.innerWidth - 256

        const columns2 = [{
            title: intl.formatMessage({id: "table.header.type"}),
            align: "center",
            dataIndex: "type",
            key: "type",
            ellipsis: true,
            width: "80px",
            render: (text, record) => (
                <div style={{ wordWrap: 'break-word', wordBreak: 'break-word'}}>
                  {text}
                </div>
            ),
            ...this.getColumnSearchProps("type")
        },{
            title: "TTL",
            align: "left",
            dataIndex: "ttl",
            key: "ttl",
            ellipsis: true,
            width: "100px",
            render: (text, record) => (
                <div style={{ wordWrap: 'break-word', wordBreak: 'break-word'}}>
                  {text}
                </div>
            ),
            ...this.getColumnSearchProps("ttl")
        },{
            title: intl.formatMessage({id: "table.header.key"}),
            align: "left",
            dataIndex: "name",
            key: "name",
            ellipsis: true,
            render: (text, record) => (
                <div style={{ wordWrap: 'break-word', wordBreak: 'break-word'}}>
                  {text}
                </div>
            ),
            ...this.getColumnSearchProps("name")
        },{
            title: intl.formatMessage({id: "table.header.value"}),
            align: "left",
            dataIndex: "value",
            key: "value",
            ellipsis: true,
            render: (text, record) => (
                <div style={{ wordWrap: 'break-word', wordBreak: 'break-word'}}>
                  {text}
                </div>
            ),
            ...this.getColumnSearchProps("value")
        }]

        return (
            <div style={{height: '100%', backgroundColor: '#fff'}}>
                
                {
                    this.renderEditModal()
                }

                <div style={{height: (window.innerHeight - 104) + 'px', width: (window.innerWidth - 80) + 'px', backgroundColor: '#fff', marginTop: '-16px'}}>
                    <div style={{
                            width: barWidth,
                            height: "40px",
                            lineHeight: "40px",
                            borderBottomColor: "#E8E8E8",
                            borderBottomStyle: "solid",
                            borderBottomWidth: "1px",
                        }}
                    >
                        <div style={{display: "flex"}}>
                            <div style={{flex: 1, paddingLeft: "5px"}}>
                                <Select
                                    defaultValue={currentDb}
                                    style={{ width: "100px", height: "35px" }}
                                    placeholder="Please select"
                                    onChange={(val)=>{
                                        this.props.UpdateCurrentDB(val)
                                        pagination.currentPage = 1
                                        this.setState({
                                            selectedRowKeys: [],
                                            currentDb: val,
                                            pagination: pagination
                                        },()=>{
                                            this.refreshData()
                                        })
                                    }}
                                >
                                    {
                                        dbs.map((item, index)=>(
                                            <Option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.text}
                                            </Option>
                                        ))
                                    }
                                </Select>
                                <span style={{marginLeft: "10px"}}>
                                    DB{currentDb + " KEYS: " + totalRow}
                                </span>
                            </div>
                            
                            <div style={{width: "300px", textAlign: "right", paddingRight: "10px"}}>
                                <Tooltip title={intl.formatMessage({id: 'app.command.line'})}>
                                    <Icon
                                        type="code"
                                        style={{ fontSize: '20px', color: '#404040', marginLeft: '15px' }} 
                                        onClick={()=>{
                                            let result = IpcRendererSendSync(ipcChannel.CheckEnvironment, {})
                                            if(result.exist) {
                                                this._OpenCommandLineWindow()
                                            } else {
                                                message.error("需要配置REDIS_HOME环境变量")
                                            }
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title={intl.formatMessage({id: "create.connect.redis.button.redis-info"})}>
                                    <Icon
                                        type="info-circle"
                                        style={{ fontSize: '20px', color: '#404040', marginLeft: '10px' }} 
                                        onClick={()=>{
                                            this.serverInfo(intl)
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title={intl.formatMessage({id: "app.button.refresh"})}>
                                    <Icon
                                        type="reload"
                                        style={{ fontSize: '20px', color: '#1990FF', marginLeft: '15px' }} 
                                        onClick={()=>{
                                            this.refreshData(function(res){
                                                if(res){
                                                    message.success(intl.formatMessage({id: "app.message.success"}))
                                                }
                                            })
                                        }}
                                    />
                                </Tooltip>
                                {
                                    (true === selectedOne) ? 
                                    <Tooltip title={intl.formatMessage({id: "app.button.modify"})}>
                                        <Icon
                                            type="edit"
                                            style={{ fontSize: '20px', color: '#1990FF', marginLeft: '15px' }} 
                                            onClick={()=>{
                                                this.openEditModal({type: "modify", key: selectedRowKeys[0]})
                                            }}
                                        />
                                    </Tooltip> :
                                    <Tooltip title={intl.formatMessage({id: "app.button.add"})}>
                                        <Icon
                                            type="plus-circle"
                                            style={{ fontSize: '20px', color: '#1990FF', marginLeft: '15px' }} 
                                            onClick={()=>{
                                                this.openEditModal({type: "add", key: ""})
                                            }}
                                        />
                                    </Tooltip>
                                }
                                <Tooltip title={intl.formatMessage({id: "app.button.delete"})}>
                                    <Icon
                                        type="close-circle"
                                        style={{ fontSize: '20px', color: '#FF0000', marginLeft: '15px' }} 
                                        onClick={()=>{
                                            this.delete(intl)
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title={intl.formatMessage({id: "app.button.flush"})}>
                                    <Icon
                                        type="delete"
                                        style={{ fontSize: '20px', color: '#FF0000', marginLeft: '15px' }} 
                                        onClick={()=>{
                                            this.flush(intl)
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title={intl.formatMessage({id: "app.button.export"})}>
                                    <Icon
                                        type="export"
                                        style={{
                                            fontSize: '20px',
                                            color: '#8A33F6',
                                            marginLeft: '10px'
                                        }} 
                                        onClick={()=>{
                                            this.export(intl)
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div style={{
                            width: contentContainerWidth,
                            height: contentContainerHeight - 120,
                            overflowY: "auto",
                            padding: "3px 3px",
                            borderBottom: "#f1f1f1 1px solid"
                         }}
                         className="lightSidebarContainerScrollbar"
                    >
                            <Spin spinning={loading}>
                                <Table
                                    bordered={true}
                                    size="small"
                                    rowSelection={rowSelection}
                                    dataSource={dataSource}
                                    columns={columns2}
                                    style={{tableLayout: "fixed"}}
                                    onRow={record => {
                                        return {
                                            onClick: event => {}, // 点击行
                                            onDoubleClick: event => {   // 双击行
                                                this.openEditModal({type: "modify", key: record.key})
                                            }
                                        }
                                    }}
                                    pagination={false}
                                />
                            </Spin>
                    </div>
                    <div
                        style={{
                            width: contentContainerWidth,
                            height: "40px",
                            bottom: "0px",
                            backgroundColor: "#fff",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <Pagination
                            showQuickJumper
                            size="small"
                            pageSize={pageSize}
                            defaultPageSize={defaultPageSize}
                            total={totalRow}
                            current={currentPage}
                            defaultCurrent={defaultCurrent}
                            onChange={(page, pageSize)=>{
                                pagination.currentPage = parseInt(page, 10)
                                this.setState({
                                    pagination: pagination
                                },()=>{
                                    this.refreshData()
                                })
                            }}
                        />
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

const mapDispatchToProps = (dispatch, ownProps) => ({
    UpdateCurrentDB: (db) => {
        dispatch({
            type: "CONNECTINFO/UPDATE/CURRENTDB",
            db: db
        })
    }
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(redisComponent));