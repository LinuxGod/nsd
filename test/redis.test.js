const Redis = require("../src/backend/redis/redis")

describe('redis module test', ()=>{
    
    // pretreatment
    beforeAll(()=>{
    })

    /**
     * Test ConnectRedis Method
     */
    test('Test ConnectRedis Method, should be success.', async ()=>{
        let results = await Redis.ConnectReids([{key: "abcd1234", name: "New Connection 78", host: "127.0.0.1", port: 6378, password: "6378redis"}])
        expect(results).toEqual({"abcd1234": { name: 'New Connection 78', status: true }})
    })

    /**
     * Test TestConnect Method
     */
    test('Test TestConnect Method, should be success.', async ()=>{
        let results = await Redis.TestConnect({host: "127.0.0.1", port: 6379, password: ""})
        expect(results).toEqual({"status": true})
    })

    /**
     * Test DeleteConnectObject Method
     */
    test('Test DeleteConnectObject Method, should be success.', async ()=>{
        let results = await Redis.DeleteConnectObject({host: "127.0.0.1", port: 6379, password: ""})
        expect(results).toEqual({"status": true})
    })


    // aftertreatment
    afterAll(()=>{
    })
})