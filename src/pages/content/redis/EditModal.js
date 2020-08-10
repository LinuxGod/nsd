import React, { useState, useEffect } from 'react'
import { connect } from "react-redux"
import { injectIntl } from "react-intl"
import {
    Form,
    Col,
    Row,
    Input,
    Select,
    Icon,
    InputNumber,
    message,
    Modal,
    Button,
    Popconfirm
} from 'antd'

import './EditModal.css'
import { IpcRendererSendSync } from '@/util/ipc/ipcRedis'
import ipcChannel from '@/util/ipc/ipcChannel'

const { TextArea } = Input
const { Option } = Select
const { confirm } = Modal

const EditModal = (props) => {
    const {
        intl,
        db,
        form,
        EditType,
        visible
    } = props
    const { getFieldDecorator } = props.form
    const [DisabledKey, setDisabledKey] = useState(true)
    const [saveObject, setSaveObject] = useState({
        type: "",
        value: "",
        ttl: -1,
        RedisClientId: props.RedisClientId,
        db: db,
        key: props.DataKey
    })

    useEffect(()=>{
        if("modify" === EditType) {
            getData().then(res=>{
                if(res) {
                }
            })
        }
    },[])

    const getData = () => {
        return new Promise(function(resolve, reject){
            let result = IpcRendererSendSync(ipcChannel.GetDataByKey, saveObject)
            let object = saveObject
            object["value"] = result.value
            setSaveObject(object)
            
            form.setFieldsValue({key: result.key})
            form.setFieldsValue({type: result.type})
            form.setFieldsValue({value: result.value})
            form.setFieldsValue({ttl: result.ttl})

            resolve(true)
        })
    }

    const EditKey = (intl) => {
        if(DisabledKey){
            setDisabledKey(false)
        } else {
            let object = saveObject
            let OldKey = saveObject.key
            let NewKey = form.getFieldValue("key")

            if(OldKey === NewKey) {
                setDisabledKey(true)
                return
            }

            object.key = NewKey
            setSaveObject(object)

            let result = IpcRendererSendSync(ipcChannel.RenameKey, {RedisClientId: object.RedisClientId, db: db, OldKey: OldKey, NewKey: NewKey})
            if("OK" === result.status) {
                message.success(intl.formatMessage({id: "app.message.success"}))
                setDisabledKey(true)
            } else {
                message.error(intl.formatMessage({id: "app.message.fail"}))
            }
        }
    }

    const save = (intl) => {
        let params = saveObject
        form.validateFields(err => {
            if(!err) {
                console.info('success')
                params["type"] = form.getFieldValue("type")
                params["ttl"] = form.getFieldValue("ttl")
                params["key"] = form.getFieldValue("key")
                params["value"] = form.getFieldValue("value")
                
                if("modify" === EditType){
                    let result = IpcRendererSendSync(ipcChannel.Save, {RedisClientId:  props.RedisClientId, ...params})

                    if(result.status) {
                        message.success(intl.formatMessage({id: result.message}))
                    } else {
                        message.error(intl.formatMessage({id: result.message}))
                    }
                } else {
                    let p = {
                        redisClientId:  props.RedisClientId,
                        key: params.key,
                        db: props.connect.currentDb
                    }
                    let result = IpcRendererSendSync(ipcChannel.Exists, p)
                    if(result.status) {
                        if(1 === result.exists) {
                            // 存在相同的key
                            confirm({
                                title: `${intl.formatMessage({id: "app.message.danger"})}`,
                                content: `${intl.formatMessage({id: "app.message.existing"})}"${p.key}",${intl.formatMessage({id: "app.message.override"})}?`,
                                okText: intl.formatMessage({id: "app.message.override"}),
                                okType: 'danger',
                                cancelText: intl.formatMessage({id: "app.button.cancel"}),
                                centered: true,
                                icon: <Icon type="question-circle" style={{color: "#FF0000"}} />,
                                onOk() {
                                    let result = IpcRendererSendSync(ipcChannel.Save, {RedisClientId:  props.RedisClientId, ...params})

                                    if(result.status) {

                                    } else {
                                        message.error(intl.formatMessage({id: result.message}))
                                    }
                                },
                                onCancel() {
                                },
                            })
                        } else {
                            let result = IpcRendererSendSync(ipcChannel.Save, {RedisClientId:  props.RedisClientId, ...params})

                            if(result.status) {
                                message.success(intl.formatMessage({id: result.message}))
                            } else {
                                message.error(intl.formatMessage({id: result.message}))
                            }
                        }
                    } else {
                        message.error(intl.formatMessage({id: result.message}))
                    }
                }

            }
        })
    }

    return [
        (
            <Modal
                key="EditModal"
                title={intl.formatMessage({id: ("add" === EditType) ? "app.button.addto" : "app.button.modifyto"}) + " DB" + db}
                width={window.innerWidth + 2}
                // height={window.innerHeight}
                style={{top: 0}}
                visible={visible}
                destroyOnClose={true}
                closeIcon={
                    <Icon
                        type="close"
                        onClick={props.close}
                    />
                }
                footer={[
                    <div key="CustomFooter" style={{display: "flex", height: "50px"}}>
                        <div style={{flex: 0.6, display: "flex", alignItems: "center"}}>
                            <Popconfirm
                                placement="rightBottom"
                                title={
                                    <div
                                        style={{
                                            width: "400px"
                                        }}
                                    >
                                        <div>{intl.formatMessage({id: "app.message.help"})}</div>
                                        <div>{`string value 格式: 任意字符串`}</div>
                                        <div>{`list value 格式: value 1, value 2, ...`}</div>
                                        <div>{`set value 格式: value 1, value 2, ...`}</div>
                                        <div>{`zset value 格式: member 1,score,member 2,score, ...`}</div>
                                        <div>{`hash value 格式: {"key 1": "value 1", "key 2": "value 2", ...}`}</div>
                                    </div>
                                }
                                okText={intl.formatMessage({id: "app.button.ok"})}
                                cancelText={intl.formatMessage({id: "app.button.cancel"})}
                            >
                                <Icon
                                    type="question-circle"
                                    style={{
                                        fontSize: '20px',
                                        color: '#4E4E4E',
                                        marginLeft: '15px'
                                    }}
                                />
                            </Popconfirm>
                        </div>
                        <div style={{flex: 0.4, display: "flex", alignItems: "center", justifyContent: "flex-end", marginRight: "15px"}}>
                            <Button
                                onClick={props.close}
                            >
                                {intl.formatMessage({id: "app.button.close"})}
                            </Button>
                            <Button
                                type="primary"
                                onClick={()=>{
                                    save(intl)
                                }}
                            >
                                {intl.formatMessage({id: "app.button.save"})}
                            </Button>
                        </div>
                    </div>
                ]}
            >
                <Form layout="vertical" hideRequiredMark>
                    <Row>
                        <Col span={24}>
                            <Form.Item label={intl.formatMessage({id: "table.header.type"})}>
                            {getFieldDecorator('type', {
                                initialValue: "",
                                rules: [{ required: true, message: intl.formatMessage({id: "app.form.input.placeholder.must"}) }],
                            })(
                                <Select
                                    disabled={("modify" === EditType) ? true : false}
                                    style={{ width: "100%"}}
                                    onChange={
                                        (value)=>{
                                            // this.changeSaveObject({key: "type", value: value})
                                        }
                                    }
                                >
                                    <Option value="">{intl.formatMessage({id: "app.message.please.select"})}</Option>
                                    <Option value="string">string</Option>
                                    <Option value="list">list</Option>
                                    <Option value="set">set</Option>
                                    <Option value="zset">zset</Option>
                                    <Option value="hash">hash</Option>
                                </Select>
                            )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item label="TTL">
                            {getFieldDecorator('ttl', {
                                    initialValue: -1
                                })(
                                <InputNumber
                                    style={{width: '100%'}}
                                    placeholder={intl.formatMessage({id: "app.form.input.placeholder.optional"})}
                                    onChange={(obj)=>{

                                    }}
                                />
                            )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item label={intl.formatMessage({id: "table.header.key"})}>
                            {getFieldDecorator('key', {
                                initialValue: "",
                                rules: [{ required: true, message: intl.formatMessage({id: "app.form.input.placeholder.must"}) }],
                            })(
                                <Input
                                    disabled={("modify" === EditType) ? DisabledKey : false}
                                    type="text"
                                    style={{width: '100%'}}
                                    placeholder={intl.formatMessage({id: "app.form.input.placeholder.must"})}
                                    addonAfter={
                                        ("modify" === EditType) ?
                                        <Icon
                                            type={(true === DisabledKey) ? "form" : "check"}
                                            style={{color: "#1990FF", cursor: "pointer"}}
                                            onClick={()=>{
                                                EditKey(intl)
                                            }}
                                        /> :
                                        ""
                                    }
                                    onChange={(obj)=>{

                                    }}
                                />
                            )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item>
                            {getFieldDecorator('value', {
                                    initialValue: "",
                                    rules: [{ required: true, message: intl.formatMessage({id: "app.form.input.placeholder.must"}) }],
                                })(
                                <TextArea
                                    type="text"
                                    style={{height: window.innerHeight - 479, width: window.innerWidth - 50, marginTop: "10px", resize: "none"}}
                                    placeholder={intl.formatMessage({id: "app.form.input.placeholder.must"})}
                                    // placeholder={`[${intl.formatMessage({id: "app.form.input.placeholder.must"})}]\r\nstring value 格式: 任意字符串\r\nlist value 格式: value 1, value 2, ...\r\nset value 格式: value 1, value 2, ...\r\nzset value 格式: member 1,score,member 2,score, ...\r\nhash value 格式: {"key 1": "value 1", "key 2": "value 2", ...}`}
                                    onChange={(obj)=>{
                                        // AutoSave(obj)
                                    }}
                                />
                            )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        )
    ]
}

const mapStateToProps = (state) => {
    return {
        ...state
    }
}

export default Form.create()(
    connect(mapStateToProps)(
        injectIntl(EditModal)
    )
)