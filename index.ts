const { io } = require('socket.io-client');

const { uri, auth: authorization } = require('./config');

const WSClient = io(uri, {
	auth: {
		token: authorization,
		client: 'RequestClient'
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

WSClient.on('disconnect', (reason: any) => {
	console.log(
		`[WS REQ] Disconnected from the RequestManager Websocket. (${reason})`
	);
});

function wsRequest(event: string, data: any) {
	return new Promise((resolve, reject) => {
		WSClient.emit(event, data, (resp: any) => {
			resolve(
				resp.map((response: any) => {
					if (!response.status || response.status != 'success') {
						return reject(new Error(response.text));
					}

					return response.response;
				})
			);
		});
	});
}
