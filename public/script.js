let username = "";

$(document).ready(() => {
    $("#enter").click(() => {
        username = $("#name").val();
        socket.send(JSON.stringify({ "type": "join", "username": username }));
    });

    $("#betButton").click(() => {
        socket.send(JSON.stringify({ "type": "bet", "amount": $("#bet").val() }));
    });
});

const socket = new WebSocket('wss://webscraper-cookiealex.c9users.io:8080/blackjack');

let players = [];

socket.addEventListener('open', function(event) {
    console.log("connected");
    $("#enter").prop('disabled', false);
});

socket.addEventListener('message', function(event) {
    $(document.body).append(`<p>${event.data}</p>`);
    var jsonMsg = JSON.parse(event.data);
    switch (jsonMsg.type) {
        case "joined":
            if (jsonMsg.name !== username)
                $("#playerlist").append(`<p>${jsonMsg.name} 500 0 waiting</p>`);
            else $("#betButton").prop('disabled', false);
            break;
        case "players":
            $("#playerlist").empty();
            jsonMsg.players.forEach(p => {
                $("#playerlist").append(`<div>${p.name} ${p.chips} ${p.currentBet} ${p.status}</div>`);
            });
            break;
    }
});


window.onbeforeunload = function() {
    socket.onclose = function() {}; // disable onclose handler first
    socket.close();
};