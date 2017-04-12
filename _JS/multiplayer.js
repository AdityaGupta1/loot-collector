var connection = new WebSocket("ws://localhost:8000");
connection.onopen = function () {
    console.log("connection opened");
};

connection.onerror = function (error) {
    console.log(error);
};

var username = "";

function connect(name) {
    username = name;

    var msg = {
        type: "connect",
        text: name,
        date: Date.now()
    };

    try {
        connection.send(JSON.stringify(msg));
    } catch (error) {
        console.log("m8 you are not connected yet");
    }
}

function sendUpdate() {
    if (username == "") {
        console.log("use connect(username) to connect to the server");
        return;
    }

    var msg = {
        type: "update",
        playerX: player.x,
        playerY: player.y,
        username: username,
        date: Date.now()
    };

    connection.send(JSON.stringify(msg));
}

connection.onmessage = function (message) {
    // assume that message is in JSON format
    var json = JSON.parse(message.data);

    switch (json.type) {
        case "update":
            if (json.username == username) {
                return;
            }

            otherPlayerPositions[json.username] = [parseInt(json.playerX), parseInt(json.playerY)];
            console.log(json);
            break;
        default:
            break;
    }
};

function drawOtherPlayers() {
    otherPlayerActors.forEach(function (otherPlayer) {
        otherPlayer.kill();
    });

    for (var pos in otherPlayerPositions) {
        if (otherPlayerPositions.hasOwnProperty(pos)) {
            // x and y positions at which player will be drawn
            var xy = otherPlayerPositions[pos];

            // get first dead actor from pool
            var otherPlayer = otherPlayerActors.getFirstDead();
            // revive actor at position from dictionary
            otherPlayer.reset(xy[0], xy[1]);
        }
    }
}

/**
 * create other player pool
 */
function createOtherPlayers() {
    // add other player group group
    otherPlayerActors = game.add.group();
    otherPlayerActors.enableBody = true;
    game.physics.enable(otherPlayerActors, Phaser.Physics.ARCADE);

    // 10 player pool
    otherPlayerActors.createMultiple(10, 'wizard');
}

/* function sendMessage(message) {
 if (username == "") {
 console.log("use connect(username) to connect to the server");
 return;
 }

 var msg = {
 type: "message",
 text: message,
 username: username,
 date: Date.now()
 };

 connection.send(JSON.stringify(msg));
 } */