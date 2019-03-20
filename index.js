var express = require("express");
var blackjack = require("./src/blackjack.js");
var app = express();

var expressWs = require('express-ws')(app);

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './public/index.html'));
})

app.ws('/blackjack', function(ws, req) {
    ws.id = Math.random().toString(36).substr(2, 9);
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
});

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("running on " + process.env.IP + ":" +
        process.env.PORT);
});
