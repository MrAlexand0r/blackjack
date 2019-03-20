let cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
let suits = ["heart", "club", "spade", "diamond"];

let deck = [];
let players = [];
let dealer = { cards: [], cardValue: 0 };

let status = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    BUSTED: 'busted',
    BLACKJACK: 'blackjack'
}

let gameStarted = false;
let currentPlayer = -1;

module.exports = {
    joinPlayer: (startingchips, ws, name) => joinPlayer(startingchips, ws, name),
    deal: () => deal(),
    sendMessage: (id, msg) => sendMessage(id, msg),
    start: (id, decks) => start(id, decks),
    bet: (id, amount) => bet(id, amount),
    turn: (id, move) => turn(id, move),
    findPlayerById: (id) => findPlayerById(id),
    removePlayer: (id) => removePlayer(id)
};


function joinPlayer(startingchips, ws, name) {
    name = name.replace(/ {1,}/g," ").trim();
    if(!name){
        sendError(ws, "Your name can't be empty!");
        return;
    }
    if (findPlayerById(ws.id)) {
        sendError(ws, "You already joined!");
        return;
    }
    if (findPlayerByName(name)) {
        sendError(ws, "This player is already on this Table!");
        return;
    }
    players.push({
        chips: startingchips,
        host: players.length === 0,
        cards: [],
        cardValue: 0,
        status: status.WAITING,
        name: name,
        currentBet: 0,
        ws: ws
    });
    sendAll(JSON.stringify({ "type": "joined", "name": name }));
    sendPlayerList();
}

function removePlayer(id) {
    console.log("removing: " + id);
    players.splice(players.findIndex(x => x.id == id), 1);
}

function start(id, decks) {
    let sender = findPlayerById(id);
    if (!sender) {
        return;
    }
    if (!sender.host) {
        sendError(sender.ws, "Only the host can start the game!");
        return;
    }
    if (decks < 1 || decks > 8) {
        sendError(sender.ws, "Decks can only range from 1 to 8.");
        return;
    }
    if (gameStarted) {
        sendError(sender.ws, "Game has already been started!");
        return;
    }
    for (let i = 0; i < decks; i++) {
        buildDeck();
    }
}

function start(decks) {
    for (let i = 0; i < decks; i++) {
        buildDeck();
    }
}

function buildDeck() {
    for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < cards.length; j++) {
            deck.push(suits[i] + " " + cards[j]);
        }
    }
    shuffle(deck);
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function deal() {
    let card = deck.pop();
    dealer.cards.push(card);
    dealer.cardValue = getCardValue(card);
    for (let i = 0; i < players.length * 2; i++) {
        let card = deck.pop();
        players[i % players.length].cards.push(card);
        players[i % players.length].cardValue += getCardValue(card);
        if(players[i % players.length].cardValue === 21) 
            players[i % players.length].status = status.BLACKJACK;
        else
            players[i % players.length].status = status.PLAYING;
    }
}

function getCardValue(card) {
    let value = card.split(" ")[1];
    let numbervalue = value - 0;
    if (!isNaN(numbervalue)) return numbervalue;
    else if (value === 'A') {
        return 11;
    }
    else return 10;
}


function turn(id, move) {
    let nextplayer = true;
    if (!gameStarted) {
        sendError(players[currentPlayer].ws, "The game hasn't started yet!");
        return;
    }
    if (players[currentPlayer].ws.id !== id) {
        sendError(findPlayerById(id).ws, "It's not your turn!");
        return;
    }
    if (players[currentPlayer].status !== status.PLAYING) {
        sendError(players[currentPlayer].ws, "Wait for the next round!");
        return;
    }
    switch (move) {
        case "stand":
            players[currentPlayer].status = status.WAITING;

            break;
        case "hit":
            let card = deck.pop();
            players[currentPlayer].cards.push(card);
            players[currentPlayer].cardValue += getCardValue(card);
            if (players[currentPlayer].cardValue > 21) {
                players[currentPlayer].status = status.BUSTED;
            }
            else nextplayer = false;
            break;
    }
    checkGameEnd(nextplayer);
}

function bet(id, amount) {
    let player = findPlayerById(id);
    amount -= 0;
    if (isNaN(amount)) {
        sendError(player.ws, "Chips must be numeral!");
    }
    if (player.chips < amount) {
        sendError(player.ws, "You don't have enough chips for that bet!");
        return;
    }
    if (amount < 1 || amount % 5 !== 0) {
        sendError(player.ws, "You can only bet chips!");
        return;
    }
    if (amount < 0) {
        sendError(player.ws, "nice try.");
        return;
    }
    if (gameStarted) {
        sendError(player.ws, "You can bet again next round!");
        return;
    }
    player.currentBet = amount;
    sendAll(JSON.stringify({ "type": "bet", "name": player.name, "amount": amount }));
    if (players.filter(x => x.currentBet === 0).length == 0) {
        start(1);
        players.forEach(x => {
            x.cards = [];
            x.cardValue = 0;
        });
        dealer.cards = [];
        deal();

        sendPlayerList();
        gameStarted = true;
        checkGameEnd(true);
    }
}

function checkGameEnd(nextplayer){
    if (players.filter(x => x.status === status.PLAYING).length > 0) {
        if (nextplayer) {
            while(players[++currentPlayer].status === status.BLACKJACK);
        } 
        sendPlayerList();
        sendTurn();
    }
    else {
        while(dealer.cardValue < 17){
            let card = deck.pop();
            dealer.cards.push(card);
            dealer.cardValue += getCardValue(card);
        }
        for(let i = 0; i < players.length; i++){
            if(players[i].status === status.BLACKJACK && dealer.cardValue < 21){
                players[i].chips += Math.floor(players[i].currentBet * (3/2));
            }
            else if(players[i].status === status.BUSTED || (dealer.cardValue < 22 && players[i].cardValue < dealer.cardValue)){
                players[i].chips -= players[i].currentBet;
            }
            else if((players[i].currentBet > 0 && players[i].cardValue > dealer.cardValue) || dealer.cardValue > 21){
                players[i].chips += players[i].currentBet;
            }
            players[i].currentBet = 0;
            players[i].status = status.WAITING;
            gameStarted = false;
            currentPlayer = -1;
        }
        sendPlayerList();
    }
}

function sendPlayerList() {
    let payload = { type: "players", players: [] };
    for (let i = 0; i < players.length; i++) {
        payload.players.push({
            name: players[i].name,
            chips: players[i].chips,
            currentBet: players[i].currentBet,
            status: players[i].status,
            cards: players[i].cards,
            cardValue: players[i].cardValue
        });
    }
    payload.dealer = dealer;
    sendAll(JSON.stringify(payload));
}


function findPlayerById(id) {
    return players.find(e => {
        return e.ws.id === id;
    });
}

function findPlayerByName(name) {
    return players.find(e => {
        return e.name === name;
    });
}


function sendMessage(id, msg) {
    let sender = findPlayerById(id);
    let payload = { type: "chat", sender: sender.name, message: msg };
    for (let i = 0; i < players.length; i++) {
        players[i].ws.send(JSON.stringify(payload));
    }
}

function sendAll(string) {
    for (let i = 0; i < players.length; i++) {
        players[i].ws.send(string);
    }
}

function sendError(ws, message) {
    let payload = { type: "error", message: message };
    ws.send(JSON.stringify(payload));
}

function sendTurn() {
    console.log(currentPlayer);
    sendAll(JSON.stringify({ "type": "turn", "name": players[currentPlayer].name }));
}
