import React from 'react'
import { connect } from "react-redux"
import { injectIntl } from "react-intl"
import {
    Form,
    Input,
    Icon,
    InputNumber,
    Tooltip
} from 'antd'

import "./RedisConnect.css"

const RedisConnect = Form.create({
    name: 'connection_form',
    mapPropsToFields(props) {
        // 取出当前选中的数据
        let obj = props.connect.redis.filter(item=>item.key === props.connect.currentSelect)
        obj = (obj.length > 0) ? obj[0] : obj
        return {
          key: Form.createFormField({
            ...obj.key,
            value: obj.key,
          }),
          name: Form.createFormField({
            ...obj.name,
            value: obj.name,
          }),
          host: Form.createFormField({
            ...obj.host,
            value: obj.host,
          }),
          port: Form.createFormField({
            ...obj.port,
            value: obj.port,
          }),
          password: Form.createFormField({
            ...obj.password,
            value: obj.password,
          })
        }
    },
    onValuesChange(props, changedValues, allValues) {
        const { redis, sidebarData, redisActiveData } = props.connect
        let data = JSON.parse(JSON.stringify(redis))
        let NewSidebarData = JSON.parse(JSON.stringify(sidebarData))

        let NewRedisActiveData = []
        if("undefined" != typeof(redisActiveData)) {
            NewRedisActiveData = JSON.parse(JSON.stringify(redisActiveData))

            // 更新 props.connect.redisActiveData
            NewRedisActiveData.map((item, index) => {
                if(item.key === allValues.key) {
                    NewRedisActiveData[index] = allValues
                }
            })
        }
        
        // 更新 props.connect.redis
       redis.map((item, index) => {
            if(item.key === allValues.key) {
                data[index] = allValues
            }
        })

        // 更新 props.connect.sidebarData
        NewSidebarData[1].children.map((item, index) => {
            if(item.key === allValues.key){
                let d = item
                d.name = allValues.name
                d.label = allValues.host + ":" + allValues.port
                NewSidebarData[1].children[index] = d
            }
        })

        /**
         * 1、限制名称在1-15个字符之间
         * 2、限制host不能为空
         * 3、限制port为正整数
         */
        let validate = JSON.parse(JSON.stringify(props.connect.ConnectionFormValidate))
        if("undefined" != typeof(changedValues.name)) {
            let reg = new RegExp(/^.{1,15}$/g)
            if(changedValues.name.length <=0) {
                // 不符合规则
                validate.NameStatus = "error"
                validate.NameStatusMsg = "create.connect.redis.name.validate"
            } else {
                if(reg.test(changedValues.name)){
                    // 符合规则
                    validate.NameStatus = "success"
                    validate.NameStatusMsg = "create.connect.redis.validate.msg"
                } else {
                    // 不符合规则
                    validate.NameStatus = "error"
                    validate.NameStatusMsg = "create.connect.redis.name.help"
                }
            }
        } else if("undefined" != typeof(changedValues.host)) {
            if(changedValues.host.length <= 0){
                // 不符合规则
                validate.HostStatus = "error"
                validate.HostStatusMsg = "create.connect.redis.host.validate"
            } else {
                // 符合规则
                validate.HostStatus = "success"
                validate.HostStatusMsg = "create.connect.redis.validate.msg"
            }
        } else if("undefined" != typeof(changedValues.port)) {
            let reg = new RegExp(/^[1-9]\d*$/g)
            if(reg.test(changedValues.port)){
                // 符合规则
                validate.PortStatus = "success"
                validate.PortStatusMsg = "create.connect.redis.validate.msg"
            } else {
                // 不符合规则
                validate.PortStatus = "error"
                validate.PortStatusMsg = "create.connect.redis.port.validate"
            }
        }
        let allStatus = false
        if(
            "success" === validate.NameStatus &&
            "success" === validate.HostStatus &&
            "success" === validate.PortStatus
        ) {
            allStatus = true
        } else {
            allStatus = false
        }

        props.UpdateValidateStatus(validate, allStatus)
        props.Save(data, NewSidebarData, NewRedisActiveData)
    }
  })(
        props => {
            const { intl, form, connect } = props
            const { getFieldDecorator } = form
            const { ConnectionFormValidate } = connect

            return (
                <Form hideRequiredMark>
                    <Form.Item
                        style={{display: "none"}}
                        label={intl.formatMessage({id: "create.connect.redis.name"})}
                    >
                        {
                            getFieldDecorator('key')(<Input/>)
                        }
                    </Form.Item>
                    <Form.Item
                        label={
                            <span>
                                {intl.formatMessage({id: "create.connect.redis.name"})}
                                &nbsp;
                                <Tooltip title={intl.formatMessage({id: "create.connect.redis.name.help"})}>
                                    <Icon type="question-circle-o" />
                                </Tooltip>
                            </span>
                        }
                        validateStatus={ConnectionFormValidate.NameStatus}
                        help={intl.formatMessage({id: ConnectionFormValidate.NameStatusMsg})}
                    >
                        {
                            getFieldDecorator('name')(
                                <Input
                                    placeholder={intl.formatMessage({id: "app.form.input.placeholder.must"})}
                                />
                            )
                        }
                    </Form.Item>
                    <Form.Item
                        label={
                            <span>
                                {intl.formatMessage({id: "create.connect.redis.host"})}
                                &nbsp;
                                <Tooltip title={intl.formatMessage({id: "create.connect.redis.host.help"})}>
                                    <Icon type="question-circle-o" />
                                </Tooltip>
                            </span>
                        }
                        validateStatus={ConnectionFormValidate.HostStatus}
                        help={intl.formatMessage({id: ConnectionFormValidate.HostStatusMsg})}
                    >
                        {
                            getFieldDecorator('host')(
                                <Input
                                    style={{ width: '100%' }}
                                    placeholder={intl.formatMessage({id: "app.form.input.placeholder.must"})}
                                />
                            )
                        }
                    </Form.Item>
                    <Form.Item
                        label={intl.formatMessage({id: "create.connect.redis.port"})}
                        validateStatus={ConnectionFormValidate.PortStatus}
                        help={intl.formatMessage({id: ConnectionFormValidate.PortStatusMsg})}
                    >
                        {
                            getFieldDecorator('port')(
                                <InputNumber
                                    min={0}
                                    max={65535}
                                    style={{width: '100%'}}
                                    placeholder={intl.formatMessage({id: "app.form.input.placeholder.must"})}
                                />
                            )
                        }
                    </Form.Item>
                    <Form.Item
                        label={intl.formatMessage({id: "create.connect.redis.password"})}
                    >
                        {
                            getFieldDecorator('password')(
                                <Input.Password
                                    placeholder={intl.formatMessage({id: "app.form.input.placeholder.optional"})}
                                />
                            )
                        }
                    </Form.Item>
                </Form>
            )
        }
  )

const mapStateToProps = (state) => {
    return {
        ...state
    }
}
const mapDispatchToProps = (dispatch, ownProps) => ({
    Save: (data, sidebarData, NewRedisActiveData) => {
        dispatch({
            type: 'CONNECTINFO/REDIS/SAVE',
            data: data,
            sidebarData: sidebarData,
            redisActiveData: NewRedisActiveData
        })
    },
    UpdateValidateStatus: (ValidateStatus, allStatus) => {
        dispatch({
            type: "CONNECTINFO/REDIS/UPDATEVALIDATESTATUS",
            ValidateStatus: ValidateStatus,
            allStatus: allStatus
        })
    }
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(
    injectIntl(RedisConnect)
)
