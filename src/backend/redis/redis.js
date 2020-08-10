const { promisify } = require('util')
const redis = require("redis")
const uuidV4 = require('uuid/v4')
const fs = require("fs")
const XLSX = require("xlsx")
const Application = require('../electron/main/services/application')
const { dialog, shell } = require('electron')
const log = require('electron-log')
const os = require('os')
const { sleep } = require('../uitl/uitl')
const process = require('process')
const path = require("path")
const Config = require('../../config/config')

module.exports = {
    pool: {},
    ConnectReids: async function(params){
        let results = {}
        for(let i = 0; i < params.length; i++){
            let conn = await this.connect(params[i])
            results[params[i].key] = {name: params[i].name, status: conn.status}
            this.pool[params[i].key] = conn.client
        }
        return results
    },
    TestConnect: async function(params){
        let conn = await this.connect(params)
        return {status: conn.status}
    },
    connect: async function(params){
        return new Promise(function(resolve, reject){
            let client = redis.createClient({
                host: params.host,
                port: params.port,
                db: 0,
                connect_timeout: 1000,
                password: params.password,
                retry_strategy: function (options) {
                    if (options.error && options.error.code === "ECONNREFUSED") {
                        // End reconnecting on a specific error and flush all commands with
                        // a individual error
                        resolve({
                            status: false,
                            client: null
                        })
                    }
                }
            })

            client.on("error", err => {
                resolve({
                    status: false,
                    client: null
                })
            })

            client.on("ready", function(){
                resolve({
                    status: true,
                    client: client
                })
            })
        })
    },
    GenerateConnectObject: async function(params){
        if(params.length <= 0){
            return {
                status: false,
                generated: [],
                msg: "NO HAS CONNECTION INFO"
            }
        }
        let generated = []
        for(let i = 0; i < params.length; i++){
            let auth = ""
            if("undefined" != params[i].password) {
                auth = '&password=' + params[i].password
            }
            let client = redis.createClient('redis://' + params[i].host + ':' + params[i].port + "?db=0" + auth);
            let asyncSet = promisify(client.set).bind(client)
            let res = await asyncSet(uuidV4(), "test", "EX", 2)    // 设置临时key(2秒后过期),检查是否已经连接上
            if("OK" == res){
                this.pool[params[i].key] = client
                generated.push({
                    key: params[i].key,
                    status: true
                })
            } else {
                // 连接失败(redis服务器没启动等情况)
                generated.push({
                    key: params[i].key,
                    status: false
                })
            }
        }

        return {
            status: true,
            generated: generated,
            msg: "GENERATE DONE"
        }
    },
    DeleteConnectObject: async function(params){
        delete this.pool[params.key]
        return {status: true}
    },
    RenameKey: async function(params) {
        const client = this.pool[params.RedisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncRename = promisify(client.rename).bind(client)

        let isOk = await asyncSelect(params.db)
        if("OK" == isOk){
            let result = await asyncRename(params["OldKey"], params["NewKey"])
            return {
                status: result
            }
        }
    },
    redisGet: async function (params) {
        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncGet = promisify(client.get).bind(client)
        const asyncKeyType = promisify(client.type).bind(client)

        let isOK = await asyncSelect(params.db)
        if("OK" == isOK){
            return {
                key: params.key,
                value: await asyncGet(params.key),
                keyType: await asyncKeyType(params.key)
            }
        } else {
            return {
                key: params.key,
                value: null,
                keyType: null
            }
        }
    },
    SetKeyTTL: async function(params){
        const asyncSelect = promisify(this.pool[params.redisClientId].select).bind(this.pool[params.redisClientId])
        const asyncExpire = promisify(this.pool[params.redisClientId].expire).bind(this.pool[params.redisClientId])

        let isOK = await asyncSelect(params["db"])
        if("OK" == isOK){
            let v = asyncExpire(params["key"], params["newTTL"])
            .then(result => {
            })

            return true
        } else {
            return false
        }
    },
    Delete: async function(params){
        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncDelete = promisify(client.del).bind(client)

        let isOK = await asyncSelect(params["db"])
        if("OK" == isOK){
            let deleteFailed = []
            let deleteSuccess = []
            let keys = params.keys
            for(let i = 0; i < keys.length; i++){
                let success = await asyncDelete(keys[i])
                if(1 == success){
                    deleteSuccess.push(keys[i])
                } else {
                    deleteFailed.push(keys[i])
                }
            }

            return {
                status: true,
                deleteFailed: deleteFailed,
                deleteSuccess: deleteSuccess
            }
        } else {
            return {
                status: false,
                deleteFailed: [],
                deleteSuccess: []
            }
        }
    },
    FlushDB: async function(params){
        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncFlushdb = promisify(client.flushdb).bind(client)

        let db = params["db"]
        if("number" == typeof(db)) {
            let isOK = await asyncSelect(db)
            if("OK" == isOK){
                let success = await asyncFlushdb()
                if("OK" == success) {
                    return {
                        message: "操作成功",
                        status: true
                    }
                } else {
                    return {
                        message: "操作失败",
                        status: false
                    }
                }
            } else {
                return {
                    message: "操作失败",
                    status: false
                }
            }

        } else {
            return {
                message: "参数错误",
                status: false
            }
        }
    },
    KeyType: async function(params) {
        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncKeyType = promisify(client.type).bind(client)

        let isOK = await asyncSelect(params["db"])
        if("OK" == isOK){
            return await asyncKeyType(params["key"])
        }
    },
    countDatabases: async function(params){
        if(null == this.pool[params.redisClientId]) {
            return {
                data: []
            }
        }
        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        let dbIndex = 0
        let status = true
        let results = []
        while(status){  // config get databases 可能被禁,所有用此办法获取db的数量
            try {
                let isOK = await asyncSelect(dbIndex)
                if("OK" == isOK){
                    results.push({
                        text: "DB" + dbIndex,
                        value: dbIndex
                    })
                    dbIndex++
                }
            } catch(err) {
                if("ERR" == err.code){
                    status = false
                }
            }
        }
        return results
    },
    QueryDataForArr: async function(params){
        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncKeys = promisify(client.keys).bind(client)
        const asyncGet = promisify(client.get).bind(client)
        const asyncKeyType = promisify(client.type).bind(client)
        const asyncHGetAll = promisify(client.hgetall).bind(client)
        const asyncSmembers = promisify(client.smembers).bind(client)
        const asyncLrange = promisify(client.lrange).bind(client)
        const asyncZrange = promisify(client.zrange).bind(client)
        const asyncTTL = promisify(client.ttl).bind(client)

        let isOK = await asyncSelect(params["db"])
        if("OK" == isOK) {
            let data = []
            let keys = await asyncKeys("*")
            for(let i = 0; i < keys.length; i++){
                let val = null
                let type = await asyncKeyType(keys[i])

                if("hash" == type) {
                    val = await asyncHGetAll(keys[i])
                    if("object" == typeof(val)){
                        val = JSON.stringify(val)
                    }
                } else if("string" == type) {
                    val = await asyncGet(keys[i])
                } else if("set" == type) {
                    val = await asyncSmembers(keys[i])
                } else if("zset" == type) {
                    val = await asyncZrange(keys[i], 0, -1, 'WITHSCORES')
                } else if("list" == type){
                    val = await asyncLrange(keys[i], 0, -1)
                }

                data.push({
                    key: keys[i],
                    name: keys[i],
                    value: val,
                    type: type,
                    ttl: await asyncTTL(keys[i])
                })
            }

            return {
                status: true,
                data: data
            }
        } else {
            return {
                status: false,
                data: null
            }
        }
    },
    paginate: async function(params) {
        if(null == this.pool[params.redisClientId]) {
            return {
                status: false,
                data: []
            }
        }
        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncKeys = promisify(client.keys).bind(client)
        const asyncGet = promisify(client.get).bind(client)
        const asyncKeyType = promisify(client.type).bind(client)
        const asyncHGetAll = promisify(client.hgetall).bind(client)
        const asyncSmembers = promisify(client.smembers).bind(client)
        const asyncLrange = promisify(client.lrange).bind(client)
        const asyncZrange = promisify(client.zrange).bind(client)
        const asyncTTL = promisify(client.ttl).bind(client)
        // const asyncExists = promisify(client.exists).bind(client)

        let isOK = await asyncSelect(params["db"])
        if("OK" == isOK){
            let keys = []
            try {
                keys = await asyncKeys("*")
            } catch(e) {
                log.error("keys 命令已被禁用")
                return {
                    status: false,
                    message: "app.message.error",
                    data: []
                }
            }
            
            this.paginate["pageSize"] = params.pageSize
            this.paginate["currentPage"] = params.currentPage
            let totalPage = (keys.length % params.pageSize == 0) ? keys.length / params.pageSize : Math.floor(keys.length / params.pageSize + 1)
            this.paginate["totalPage"] = totalPage
            let totalRow = keys.length
            this.paginate["totalRow"] = totalRow

            let arrayStartIndex = (params.currentPage - 1) * params.pageSize           // 取数开始下标
            let arrayEndIndex = arrayStartIndex + (params.pageSize - 1)     // 取数结束下标
            
            let data = []
            let startIndex = 0, endIndex = 0
            if(keys.length < this.paginate.pageSize){
                endIndex = keys.length - 1
                startIndex = 0
            } else {
                endIndex = arrayEndIndex
                startIndex = arrayStartIndex
            }
            for(let i = startIndex; i <= endIndex; i++){
                if("undefined" != typeof(keys[i])){
                    let val = null
                    let type = await asyncKeyType(keys[i])

                    if("hash" == type) {
                        val = await asyncHGetAll(keys[i])
                        if("object" == typeof(val)){
                            val = JSON.stringify(val)
                        }
                    } else if("string" == type) {
                        val = await asyncGet(keys[i])
                    } else if("set" == type) {
                        val = await asyncSmembers(keys[i])
                    } else if("zset" == type) {
                        val = await asyncZrange(keys[i], 0, -1, 'WITHSCORES')
                    } else if("list" == type){
                        val = await asyncLrange(keys[i], 0, -1)
                    }

                    data.push({
                        key: keys[i],
                        name: keys[i],
                        value: val,
                        type: type,
                        ttl: await asyncTTL(keys[i])
                    })
                }
            }

            return {
                status: true,
                message: "app.message.success",
                data: data,
                paginate: {
                    totalPage: totalPage,
                    totalRow: totalRow
                }
            }
        } else {
            return {
                status: false,
                message: "app.message.error",
                data: []
            }
        }
    },
    updatePaginateObject: function(){

    },
    Save: async function (params) {
        if(null == params){
            return {
                status: false,
                message: "参数错误",
                data: []
            }
        } else {
            if(null == this.pool[params.RedisClientId]) {
                return {
                    status: false,
                    message: "参数错误",
                    data: []
                }
            }
            const client = this.pool[params.RedisClientId]
            const asyncSelect = promisify(client.select).bind(client)
            const asyncExpire = promisify(client.expire).bind(client)
            const asyncSet = promisify(client.set).bind(client)     // string
            const asyncRpush = promisify(client.rpush).bind(client) // list
            const asyncHmset = promisify(client.hmset).bind(client) // hash
            const asyncSadd = promisify(client.sadd).bind(client)   // set
            const asyncZadd = promisify(client.zadd).bind(client)   // zset

            let isOK = await asyncSelect(params["db"])
            if("OK" == isOK) {
                return new Promise((resolve, reject) => {
                    let type = params["type"]
                    let ttl = (null === params["ttl"]) ? -1 : params["ttl"]
                    if("hash" == type) {
                        try {
                            let data = JSON.parse(params["value"])

                            asyncHmset(params["key"], data)
                            .then(result => {
                                if(-1 !== ttl) {
                                    asyncExpire(params["key"], ttl)
                                    .then(res => {
                                        resolve({
                                            status: true,
                                            message: "app.message.success",
                                            data: "Success"
                                        })
                                    })
                                    .catch(e => {
                                    })
                                } else {
                                    resolve({
                                        status: true,
                                        message: "app.message.success",
                                        data: "Success"
                                    })
                                }
                            })
                            .catch(e => {
                                log.error(e)
                                resolve({
                                    status: false,
                                    message: "app.message.fail",
                                    data: "Failed"
                                })
                            })
                        } catch (e) {
                            // log.info(e instanceof SyntaxError) // true
                            log.error(e)
                            resolve({
                                status: false,
                                message: "app.message.format.error",
                                data: "Format Error"
                            })
                        }
                    } else if("string" == type) {
                        asyncSet(params["key"], params["value"])
                        .then(result => {
                            if("OK" == result) {
                                if(-1 !== ttl) {
                                    asyncExpire(params["key"], ttl)
                                    .then(res => {
                                        resolve({
                                            status: true,
                                            message: "app.message.success",
                                            data: "Success"
                                        })
                                    })
                                    .catch(e => {
                                    })
                                } else {
                                    resolve({
                                        status: true,
                                        message: "app.message.success",
                                        data: "Success"
                                    })
                                }
                            } else {
                                resolve({
                                    status: false,
                                    message: "app.message.fail",
                                    data: "Failed"
                                })
                            }
                        })
                        .catch(e => {
                            log.error(e)
                            resolve({
                                status: false,
                                message: "app.message.error",
                                data: "Error"
                            })
                        })
                    } else if("set" == type) {
                        asyncSadd(params["key"], params["value"])
                        .then(result => {
                            if(-1 !== ttl) {
                                asyncExpire(params["key"], ttl)
                                .then(res => {
                                    resolve({
                                        status: true,
                                        message: "app.message.success",
                                        data: "Success"
                                    })
                                })
                                .catch(e => {
                                })
                            } else {
                                resolve({
                                    status: true,
                                    message: "app.message.success",
                                    data: "Success"
                                })
                            }
                        })
                        .catch(e => {
                            log.error(e)
                            resolve({
                                status: false,
                                message: "app.message.fail",
                                data: "Failed"
                            })
                        })
                    } else if("zset" == type) {
                        let array = params["value"]
                        if(!Array.isArray(array)) {
                            array = array.split(",")
                        }

                        if(!((array.length % 2) == 0)) {
                            // 错误: 格式错误,不是偶数位
                            resolve({
                                status: false,
                                message: "app.message.format.error",
                                data: "Format Error"
                            })
                            log.error("Value Format Error!")
                        } else {
                            // 将奇数位和偶数位元素交换,例如: ["a", 0, "b", 1, "c", 2] 改为 [0, "a", 1, "b", 2, "c"]
                            let i = 0
                            while(i < array.length) {
                                let temp1 = array[i]
                                let temp2 = array[i + 1]
                                array[i] = temp2
                                array[i + 1] = temp1
                                i = i + 2
                            }

                            client.zadd(params["key"], array, (err, res) => {
                                if(err) {
                                    resolve({
                                        status: false,
                                        message: "app.message.error",
                                        data: err
                                    })
                                } else {
                                    if(-1 !== ttl) {
                                        asyncExpire(params["key"], ttl)
                                        .then(res => {
                                            resolve({
                                                status: true,
                                                message: "app.message.success",
                                                data: "Success"
                                            })
                                        })
                                        .catch(e => {
                                        })
                                    } else {
                                        resolve({
                                            status: true,
                                            message: "app.message.success",
                                            data: "Success"
                                        })
                                    }
                                }

                            })
                        }
                    } else if("list" == type){
                        let val = params["value"]
                        if(!Array.isArray(val)) {
                            val = val.split(",")
                        }
                        asyncRpush(params["key"], val)
                        .then(result => {
                            if(-1 !== ttl) {
                                asyncExpire(params["key"], ttl)
                                .then(res => {
                                    resolve({
                                        status: true,
                                        message: "app.message.success",
                                        data: "Success"
                                    })
                                })
                                .catch(e => {
                                })
                            } else {
                                resolve({
                                    status: true,
                                    message: "app.message.success",
                                    data: "Success"
                                })
                            }
                        })
                        .catch(e => {
                            log.error(e)
                            resolve({
                                status: false,
                                message: "app.message.fail",
                                data: "Failed"
                            })
                        })
                    }
                })
            }
        }
    },
    keys: async function (params) {
        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncKeys = promisify(client.keys).bind(client)

        let keys = []
        let isOK = await asyncSelect(params["db"])
        if("OK" == isOK) {
            keys = await asyncKeys("*")
        }
        return keys
    },
    generatePoolKey: function (params) {
        let key = params.host + params.port
        return key.replace(/\./g, "") + "$" + uuidV4()
    },
    Exists: async function(params) {
        if(null == this.pool[params.redisClientId]) {
            return {
                status: false,
                message: "app.message.error",
                exists: null
            }
        }

        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncExists = promisify(client.exists).bind(client)

        let isOK = await asyncSelect(params["db"])
        if("OK" == isOK){
            let exists = await asyncExists(params["key"])
            return {
                status: true,
                message: "app.message.success",
                exists: exists   // (1 == exist) ? true : false
            }
        } else {
            return {
                status: false,
                message: "app.message.error",
                exists: null
            }
        }
    },
    ServerInfo: async function(params) {
        let testConn = await this.TestConnect(params)
        if(!testConn.status){
            return {status: false, info: null}
        }

        const conn = await this.connect(params)
        const asyncInfo = promisify(conn.client.info).bind(conn.client)
        let serverInfo = await asyncInfo()
        return {status: true, info: serverInfo}
    },
    ServerInfoLittle: async function(params){
        const client = this.pool[params.RedisClientId]
        const asyncInfo = promisify(client.info).bind(client)

        // 为了减少redis server的压力,可以一次性获取info信息
        let server = await asyncInfo("Server")
        let keyspace = await asyncInfo("Keyspace")

        let results = []
        server = server.split("\r\n")
        keyspace = keyspace.split("\r\n")
        server.map(item => {
            let p = item.indexOf(":")
            if( -1 != p) {
                let k = item.substring(0, p)
                if("redis_version" == k || "os" == k || "tcp_port" == k || "config_file" == k) {
                    results.push({
                        name: k,
                        value: item.substring(p + 1, item.length)
                    })
                }
            }
        })

        keyspace.map(item => {
            let p = item.indexOf(":")
            if( -1 != p) {
                let k = item.substring(0, p), v = item.substring(p + 1, item.length)
                results.push({
                    name: k,
                    value: v
                })
            }
        })
        return {"status": true, result: results}
    },
    ConnectionedRedisServerInfo: async function(params){
        let results = []

        for(let k in params){
            let result = {}, server = [], memory = [], stats = [], xAxis = [], series = []
            if(null == this.pool[k]){
                log.error("client is null")

                result["connected"] = false
                result["ConnectName"] = params[k].name
                results.push(result)
                continue
            }
            let client = this.pool[k]
            let asyncInfo = promisify(client.info).bind(client)
            let asyncSelect = promisify(client.select).bind(client)
            let asyncDbsize = promisify(client.dbsize).bind(client)
            let info = await asyncInfo()

            let infoArr = info.split("\r\n")
            
            infoArr.map(item => {
                let p = item.indexOf(":")
                if( -1 != p) {
                    let k = item.substring(0, p)

                    // 获取服务器相关的信息
                    if(
                        "redis_version" == k ||
                        "process_id" == k ||
                        "os" == k ||
                        "tcp_port" == k ||
                        "uptime_in_days" == k ||
                        "uptime_in_seconds" == k ||
                        "arch_bits" == k ||
                        "connected_clients" == k
                    ) {
                        server.push({
                            name: k,
                            value: item.substring(p + 1, item.length)
                        })
                    }

                    // 获取内存相关的信息
                    if(
                        "total_system_memory_human" == k ||
                        "used_memory_human" == k ||
                        "used_memory_rss" == k ||
                        "used_memory_peak_human" == k
                    ) {
                        memory.push({
                            name: k,
                            value: item.substring(p + 1, item.length)
                        })
                    }

                    // 获取一般信息
                    if(
                        "total_connections_received" == k ||
                        "total_commands_processed" == k ||
                        "expired_keys" == k ||
                        "evicted_keys" == k
                    ) {
                        stats.push({
                            name: k,
                            value: item.substring(p + 1, item.length)
                        })
                    }

                    // 获取db及其key的数量
                    // if(-1 != item.indexOf("keys=")){
                    //     let dbArr = item.split(",")
                    //     let p2 = dbArr[0].indexOf(":")
                    //     let db = dbArr[0].substring(0, p2)
                    //     let keyNum = dbArr[0].substring(p2 + 6, dbArr[0].length)
                    //     xAxis.push(db)
                    //     series.push(keyNum)
                    // }
                }
            })

            // 单独获取,处理echarts数据
            let dbIndex = 0
            let status = true
            while(status){  // config get databases 可能被禁,所有用此办法获取db的数量
                try {
                    let isOK = await asyncSelect(dbIndex)
                    if("OK" == isOK){
                        let size = await asyncDbsize()
                        xAxis.push("DB"+dbIndex)
                        series.push(size)
                        dbIndex++
                    }
                } catch(err) {
                    if("ERR" == err.code){
                        status = false
                    }
                }
            }

            result["connected"] = true
            result["ConnectName"] = params[k].name
            result["uuid"] = uuidV4()
            result["Server"] = server
            result["Memory"] = memory
            result["Stats"] = stats
            result["ChartsData"] = {
                xAxisData: xAxis,
                SeriesData: series
            }

            results.push(result)
        }

        return {"status": true, result: results}
    },
    GetDataByKey: async function(params){
        const client = this.pool[params.RedisClientId]
        const asyncSelect = promisify(client.select).bind(client)
        const asyncStrlen = promisify(client.strlen).bind(client)
        const asyncGet = promisify(client.get).bind(client)
        const asyncGetrange = promisify(client.getrange).bind(client)
        const asyncKeyType = promisify(client.type).bind(client)
        const asyncHGetAll = promisify(client.hgetall).bind(client)
        const asyncSmembers = promisify(client.smembers).bind(client)
        const asyncLrange = promisify(client.lrange).bind(client)
        const asyncZrange = promisify(client.zrange).bind(client)
        const asyncTTL = promisify(client.ttl).bind(client)

        let key = params.key
        let db = params.db
        let isOK = await asyncSelect(db)
        if("OK" == isOK){
            let type = await asyncKeyType(key)

            let value = ""
            if("hash" == type) {
                value = await asyncHGetAll(key)
                value = JSON.stringify(value)
                // if("object" == typeof(value)){
                //     value = JSON.stringify(value)
                // }
            } else if("string" == type) {
                value = await asyncGet(key)
                // value = await asyncGetrange(key, start, end)
            } else if("set" == type) {
                value = await asyncSmembers(key)
            } else if("zset" == type) {
                value = await asyncZrange(key, 0, -1, 'WITHSCORES')
                // value = value.join(",")
            } else if("list" == type){
                value = await asyncLrange(key, 0, -1)
            }
            return {
                db: db,
                key: key,
                type: type,
                value: value,
                ttl: await asyncTTL(key)
            }
        }
    },
    getData: async function(client, db, key, size) {
        if(key.length <= 0){
            return {
                db: db,
                key: "",
                type: "",
                val: "",
                ttl: ""
            }
        }
        const asyncGet = promisify(client.get).bind(client)
        const asyncGetrange = promisify(client.getrange).bind(client)
        const asyncKeyType = promisify(client.type).bind(client)
        const asyncHGetAll = promisify(client.hgetall).bind(client)
        const asyncSmembers = promisify(client.smembers).bind(client)
        const asyncLrange = promisify(client.lrange).bind(client)
        const asyncZrange = promisify(client.zrange).bind(client)
        const asyncTTL = promisify(client.ttl).bind(client)

        let type = await asyncKeyType(key)
        let val = ""
        if("hash" == type) {
            val = await asyncHGetAll(key)
            if("object" == typeof(val)){
                val = JSON.stringify(val)
            }
        } else if("string" == type) {
            // val = await asyncGet(key)
            val = await asyncGetrange(key, 0, 100000)
        } else if("set" == type) {
            val = await asyncSmembers(key)
        } else if("zset" == type) {
            val = await asyncZrange(key, 0, -1, 'WITHSCORES')
        } else if("list" == type){
            val = await asyncLrange(key, 0, -1)
        }
        return {
            db: db,
            key: key,
            type: type,
            val: val.toString(),
            ttl: await asyncTTL(key)
        }
    },
    Import: function(params){
        // shell.showItemInFolder(os.homedir())

        dialog.showOpenDialog({
            properties: ['openDirectory']
        },function (files) {
          if (files){// 如果有选中
            // 发送选择的对象给子进程
            // event.sender.send('selectedItem', files[0])
          }
        })

        return {
            status: true
        }
    },
    Export: async function(params){
        const client = this.pool[params.redisClientId]
        const asyncSelect = promisify(client.select).bind(client)

        let data = [["Key","Value","Type","TTL"]]
        let db = params.db
        let isOK = await asyncSelect(db)

        return new Promise(async (resolve, reject)=>{
            if("OK" == isOK){
                let keys = params.select    // 选择的keys
                if(keys.length <= 0){
                    resolve({
                        status: false,
                        message: "请选择要导出的数据"
                    })
                } else {
                    for(let i = 0; i < keys.length; i++){
                        let data1 = await this.getData(client, db, keys[i])
                        data.push([
                            keys[i],
                            data1.val,
                            data1.type,
                            data1.ttl
                        ])
                    }
                }
            } else {
                resolve({
                    status: false,
                    message: "选择DB失败"
                })
            }
    
            const options = {
                title: '导出Excel',
                filters: [
                  { name: '.xlsx', extensions: ['xlsx'] }
                ]
            }
            dialog.showSaveDialog(options)
            .then(result => {
                if(result.canceled){
                    resolve({
                        status: true,
                        message: "cancel",
                        filePath: result.filePath
                    })
                }

                let workbook = XLSX.utils.book_new()
                let sheetName = "DB" + params["db"]
                let ws = XLSX.utils.aoa_to_sheet(data)
    
                /* Add the worksheet to the workbook */
                XLSX.utils.book_append_sheet(workbook, ws, sheetName)
                XLSX.writeFile(workbook, result.filePath)
                resolve({
                    status: true,
                    message: "success",
                    filePath: result.filePath
                })
            })
            .catch(err => {
                resolve({
                    status: false,
                    message: "fail",
                    error: err,
                    filePath: ""
                })
            })
        })
    },
    OpenGitHub: async function(){   // 浏览器打开项目地址
        shell.openExternal(Config.Repository)
        return {status: true}
    },
    OpenCommandLineWindow: async function(params){  // 打开命令行窗口
        Application.CreateCommandLineWindow(params)
        return {status: true}
    },
    OpenCommandLineGuideWindow: async function(){   // 打开命令行使用手册
        Application.CreateCommandLineGuideWindow()
        return {status: true}
    },
    CloseCommandLineGuideWindow: async function(){  // 关闭命令行使用手册
        global.AppWindows.CommandLineGuideWindow.close()
        delete global.AppWindows["CommandLineGuideWindow"]  // 关闭窗口后删除global中的窗口对象
        return {status: true}
    },
    MinimizeMainWindow: async function() {  // 最小化主窗口
        global.AppWindows.MainWindow.minimize()
        return {status: true}
    },
    ZoomMainWindow: async function(){   // 放大/缩小主窗口
        let MainWindow = global.AppWindows.MainWindow
        if(!MainWindow.isMaximized()) {
            MainWindow.maximize()
        } else {
            MainWindow.unmaximize()
        }
        return {status: true}
    },
    CloseMainWindow: async function(){  // 关闭主窗口
        for(let window in global.AppWindows){
            if("ActiveWindow" != window) {
                AppWindows[window].close()
            }
        }
        delete global.AppWindows    // 关闭所有窗口后删除global中的AppWindow对象
        return {status: true}
    },
    CloseAboutWindow: async function(){
        global.AppWindows["AboutWindow"].close()
        delete global.AppWindows["AboutWindow"]  // 关闭窗口后删除global中的窗口对象
        return {status: true}
    },
    MinimizeCommandLineWindow: async function(WindowId){    // 最小化命令行窗口
        global.AppWindows[WindowId].minimize()
        return {status: true}
    },
    ZoomCommandLineWindow: async function(WindowId){    // 放大/缩小命令行窗口
        let CommandLineWindow = global.AppWindows[WindowId]
        if(!CommandLineWindow.isMaximized()) {
            CommandLineWindow.maximize()
        } else {
            CommandLineWindow.unmaximize()
        }
        return {status: true}
    },
    MinimizeCommandLineGuideWindow: async function(WindowId){    // 最小化命令行窗口
        global.AppWindows.CommandLineGuideWindow.minimize()
        return {status: true}
    },
    ZoomCommandLineGuideWindow: async function(WindowId){    // 放大/缩小命令行窗口
        let CommandLineGuideWindow = global.AppWindows.CommandLineGuideWindow
        if(!CommandLineGuideWindow.isMaximized()) {
            CommandLineGuideWindow.maximize()
        } else {
            CommandLineGuideWindow.unmaximize()
        }
        return {status: true}
    },
    CloseCommandLineWindow: async function(WindowId){   // 关闭命令行窗口
        global.AppWindows[WindowId].close()
        delete global.AppWindows[WindowId]  // 关闭窗口后删除global中的窗口对象
        return {status: true}
    },
    CheckEnvironment: async () => {
        return new Promise((resolve, reject)=>{
            let p = process.env.PATH.split(path.delimiter)
            // if("undefined" === typeof(process.env.REDIS_HOME)) {
            //     return {exist: false}
            // }
            let res = p.filter((item, index) => {
                if(item.toLowerCase().indexOf("redis") != -1) {
                    return item
                } else {
                    return null
                }
            })
            if(res.length > 0) {
                resolve({
                    exist: true
                })
            } else {
                resolve({
                    exist: false
                })
            }
        })
    }
};
