var express = require("express");
var blackjack = require("./src/blackjack.js");
var app = express();

var expressWs = require('express-ws')(app);

app.use(express.static('debug'));

function heartbeat() {
  this.isAlive = true;
}

function noop() {}

const wss = expressWs.getWss();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './debug/index.html'));
});

app.ws('/blackjack', function(ws, req) {
    ws.id = Math.random().toString(36).substr(2, 9);
    ws.on('open', ()=>{
        ws.isAlive = true;
    })
    ws.on('message', (msg) => {
        console.log(msg);
        let jsonMsg;
        try {
            jsonMsg = JSON.parse(msg);
        }
        catch (e) { return; }
        if (jsonMsg.type == "join" || blackjack.findPlayerById(ws.id))
            switch (jsonMsg.type) {
                case "join":
                    blackjack.joinPlayer(500, ws, jsonMsg.username);
                    break;
                case "chat":
                    blackjack.sendMessage(ws.id, jsonMsg.message);
                    break;
                case "start":
                    blackjack.start(ws.id, jsonMsg.decks);
                    break;
                case "bet":
                    blackjack.bet(ws.id, jsonMsg.amount);
                    break;
                case "turn":
                    blackjack.turn(ws.id, jsonMsg.move);
                    break;
            }
    });
    ws.on('close', ()=>{
        blackjack.removePlayer(ws.id);
    });
    
    ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
        blackjack.removePlayer(ws.id);
        return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 10000);


app.listen(process.env.PORT, process.env.IP, () => {
    console.log("running on " + process.env.IP + ":" +
        process.env.PORT);
});
