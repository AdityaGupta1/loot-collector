var WebSocketServer = require('websocket').server;
var http = require('http');
var port = 8000;
var clients = {};

var server = http.createServer(function (request, response) {
});
server.listen(port, function () {
});
console.log("connected on port " + port);

socket = new WebSocketServer({
    httpServer: server
});

socket.on('request', function (request) {
    var connection = request.accept(null, request.origin);

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            // assume that message is in JSON format
            var json = JSON.parse(message.utf8Data);

            switch (json.type) {
                // connect
                case "connect":
                    clients[json.text] = connection;
                    console.log("clients: " + clients);
                    break;
                // message
                case "update":
                case "create-text":
                    for (var username in clients) {
                        clients[username].send(JSON.stringify(json));
                    }
                    break;
                // unknown
                default:
                    console.log("what is this m8 this is not a recognized type");
                    break;
            }


            console.log(request.origin + ", " + message.utf8Data);
            connection.send(message.utf8Data);
        }
    });

    connection.on('close', function (connection) {
        console.log("connection closed");
    });
});