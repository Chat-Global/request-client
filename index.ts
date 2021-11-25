const { io } = require('socket.io-client');
const { createServer } = require('http');
const axios = require('axios');

createServer((req: any, res: any) => res.end('HTTP Server running.')).listen(8080);

const { uri, auth: authorization, client } = require('./config');

const WSClient = io(uri, {
    auth: {
        token: authorization,
        client: client,
        type: 'RequestClient'
    }
});

console.log('[WS REQ] Trying to connect to the RequestManager WebSocket...');

WSClient.on('connect_error', (error: string) => {
    console.log(
        `[WS REQ] Error while trying to connect to the RequestManager Websocket! (${error})`
    );
});

WSClient.on('connect', () => {
    console.log(
        `[WS REQ] Connected to the RequestManager WebSocket! (${WSClient.id})`
    );
});


WSClient.on('disconnect', (reason: string) => {
    console.log(
        `[WS REQ] Disconnected from the RequestManager Websocket. (${reason})`
    );
});


WSClient.on('request', async (data: any, callback: any) => {
    const req = await axios(data).then((res: any) => ({ status: 'success', response: res.data })).catch((err: any) => ({ status: 'error', text: err.toString() }));
    callback(req);
});


WSClient.on('requests', async (data: any, callback: any) => {
    const result = [];
    for (const requestData of data) {
        const req = await axios(requestData.request).then((res: any) => ({ status: 'success', response: res.data })).catch((err: any) => ({ status: 'error', text: err.toString() }));
        result.push(req);
    }
    callback(result);
});


WSClient.on('ping', (callback: any) => {
    callback();
});
