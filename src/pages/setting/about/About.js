import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import {
    Table,
    Icon,
    Divider
} from 'antd'
import styles from './about.module.css'
const Config = require('@/config/config')

class About extends React.Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        const { intl, setting } = this.props
        const { contentContainerHeight } = setting

        const shortcutColumns = [
            {
                title: intl.formatMessage({ id: "app.message.sequence" }),
                dataIndex: 'serialnumber',
                key: 'serialnumber'
            }, {
                title: intl.formatMessage({ id: "app.message.shortcut" }),
                dataIndex: 'shortcut',
                key: 'shortcut'
            }, {
                title: intl.formatMessage({ id: "app.message.describe" }),
                dataIndex: 'describe',
                key: 'describe'
            }
        ]

        const shortcutData = []
        Config.shortcut.global.map((item, index) => {
            shortcutData.push({
                key: index,
                serialnumber: index + 1,
                shortcut: item.Shortcut,
                describe: intl.formatMessage({ id: item.i18nId })
            })
        })

        return (
            <div
                // className={styles["root"]}
                style={{
                    height: contentContainerHeight - 5,
                    width: "100%",
                    marginTop: "3px",
                    padding: "24px 24px 24px 0px",
                    overflowX: 'hidden',
                    overflowY: 'auto'
                }}
                className="lightSidebarContainerScrollbar"
            >
                <div style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    {intl.formatMessage({id: "app.name"})}
                </div>
                <p>
                    {`${intl.formatMessage({ id: "app.version" })}:${Config.version}`}
                </p>
                {/*<p>https://www.github.com/LinuxGod/nsd</p>*/}
                <Icon type="github" style={{ fontSize: '25px', marginTop: "5px", cursor: 'pointer' }} />

                <Divider />

                <div
                    style={{
                        textAlign: "left",
                        height: "auto"
                    }}
                >
                    <p className={styles["title"]}>{intl.formatMessage({ id: "app.message.introduction" })}</p>
                    <p style={{ textIndent: "2em", lineHeight: "30px", letterSpacing: "1px"}}>NoSQL，泛指非关系型的数据库。随着互联网web2.0网站的兴起，传统的关系数据库在处理web2.0网站，特别是超大规模和高并发的SNS类型的web2.0纯动态网站已经显得力不从心，出现了很多难以克服的问题，而非关系型的数据库则由于其本身的特点得到了非常迅速的发展。NoSQL数据库的产生就是为了解决大规模数据集合多重数据种类带来的挑战，尤其是大数据应用难题。为了支持更直观的数据展示，所以开发了此客户端。</p>
                    <p style={{ textIndent: "2em", lineHeight: "30px", letterSpacing: "1px" }}>这是一款支持多种NoSQL数据库的用户界面管理工具。</p>
                    <p className={styles["title"]}>{intl.formatMessage({ id: "app.message.shortcut" })}</p>
                    <Table columns={shortcutColumns} dataSource={shortcutData} bordered pagination={false} />
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
)(injectIntl(About))