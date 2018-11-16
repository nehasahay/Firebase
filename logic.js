"use strict";

// Initialize Firebase
var config = {
    // Don't include this when you commit for security reasons
    // Please include your own database!
    apiKey: "AIzaSyAJS4YQWU5DmESeYueG1qH1NGkjv3DncEY",
    authDomain: "fir-click-counter-7cdb9.firebaseapp.com",
    databaseURL: "https://fir-click-counter-7cdb9.firebaseio.com",
    storageBucket: "fir-click-counter-7cdb9.appspot.com"
};

firebase.initializeApp(config);

let player1 = {
        name: "Waiting for Player 1...",
        choice: "",
        wins: 0,
        losses: 0,
    },
    player2 = {
        name: "Waiting for Player 2...",
        choice: "",
        wins: 0,
        losses: 0
    },
    thisPlayer = {
        name: "",
        key: ""
    },
    players = [];

// Where all potential players will be stored
const PLAYERSREF = firebase.database().ref("/players"),
    // Where the outcome of a game will be stored
    OUTCOMEREF = firebase.database().ref("/outcome"),
    // Where the chat messages will be stored
    MESSAGESREF = firebase.database().ref("/messages"),
    // A special location that stores all clients connected
    CONNECTEDREF = firebase.database().ref(".info/connected");


// Evaluates who won the game
function playTheGame() {
    const player1WinConditions =
        (player1.choice === "Rock" && player2.choice === "Scissors") ||
        (player1.choice === "Paper" && player2.choice === "Rock") ||
        (player1.choice === "Scissors" && player2.choice === "Paper");

    if (player1.choice === player2.choice) {
        OUTCOMEREF.set({
            outcome: "It's a tie!"
        });
    } else if (player1WinConditions) {
        player1.wins++;
        player2.losses++;
        OUTCOMEREF.set({
            outcome: player1.name + " wins!"
        });
    } else {
        player2.wins++;
        player1.losses++;
        OUTCOMEREF.set({
            outcome: player2.name + " wins!"
        });
    };

    PLAYERSREF.child(players[0]).update({
        wins: player1.wins,
        losses: player1.losses,
        choice: ""
    }).then(updateLocalPlayer(players[0], player1));

    PLAYERSREF.child(players[1]).update({
        wins: player2.wins,
        losses: player2.losses,
        choice: ""
    }).then(updateLocalPlayer(players[1], player2));
};


// Executes both on load and on every new connection
CONNECTEDREF.on("value", function (snap) {
    // If we have a connection (snap.val() is a boolean)
    if (snap.val()) {
        // Push a new player to the database
        let player = PLAYERSREF.push({
            name: "",
            choice: "",
            wins: 0,
            losses: 0,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        thisPlayer.key = player.key;
        console.log(thisPlayer);
        // Removes the player from the database if the client disconnects
        player.onDisconnect().remove(function () {
            document.querySelector("#result").textContent = "";
        });
    };

}, function (errorObject) {
    // In case of error this will print the error
    console.log("The read failed: " + errorObject.code);
});


// PLAYERSREF.on("value", function (snap) {
//     // When first loaded or when the connections list changes...
//     let numberOfObservers = snap.numChildren();
//     // console.log(numberOfObservers);
//     // console.log(snap.val());
// });


// Updates the choice made by a player
document.querySelectorAll(".collection-item").forEach(choice => {
    choice.addEventListener("click", function () {
        if (players.indexOf(thisPlayer.key) !== -1) {
            PLAYERSREF.child(thisPlayer.key).update({
                choice: this.text
            });
            updateLocalPlayer(players[0], player1);
            updateLocalPlayer(players[1], player2);
        };

        OUTCOMEREF.set({
            outcome: ""
        });

        if (player1.choice && player2.choice) {
            playTheGame();
        };
    });
});


// Displays the outcome of a game
OUTCOMEREF.on("value", function (snap) {
    if (snap.val()) {
        document.querySelector("#result").textContent = snap.val().outcome;
    };
}, function (errorObject) {
    // In case of error this will print the error
    console.log("The read failed: " + errorObject.code);
});


// Replace the following two functions with "value" for players = Object.keys(snap.val())?
// Detects a new player 1 or 2
PLAYERSREF.orderByKey().limitToFirst(2).on("child_added", function (snap) {
    players.push(snap.key);
    console.log(players);
    displayPlayer();

}, function (errorObject) {
    // In case of error this will print the error
    console.log("The read failed: " + errorObject.code);
});


// Removes a disconnected player
PLAYERSREF.orderByKey().limitToFirst(2).on("child_removed", function (snap) {
    let index = players.indexOf(snap.key);
    players.splice(index, 1);

    MESSAGESREF.push({
        name: snap.val().name,
        message: "disconnected."
    });

    // Update the local values of whichever player disconnected
    if (!index) {
        player1.wins = 0;
        player1.losses = 0;
    } else {
        player2.wins = 0;
        player2.losses = 0;
    };

}, function (errorObject) {
    // In case of error this will print the error
    console.log("The read failed: " + errorObject.code);
});


// Pulls data about the given player and stores that locally
function updateLocalPlayer(key, player) {
    PLAYERSREF.child(key).on("value", function (snap) {
        console.log(snap.val());
        if (snap.val()) {
            player.name = snap.val().name;
            player.choice = snap.val().choice;
            player.wins = snap.val().wins;
            player.losses = snap.val().losses;
        };
        displayPlayer();
    }, function (errorObject) {
        // In case of error this will print the error
        console.log("The read failed: " + errorObject.code);
    });
};


// Updates the display for the game
function displayPlayer() {
    let player1Header = document.querySelector("h5");
    player1Header.textContent = player1.name;
    let player2Header = document.querySelectorAll("h5")[1];
    player2Header.textContent = (players.length < 2) ? "Waiting for Player 2..." : player2.name;
    if (players.indexOf(thisPlayer.key) !== -1) {
        let container = document.querySelectorAll(".collection")[players.indexOf(thisPlayer.key)];
        Array.from(container.childNodes).forEach(choice => {
            choice.className = "collection-item waves-effect waves-teal";
        });
    };
    $("#player1-wins").text(player1.wins);
    $("#player1-losses").text(player1.losses);
    $("#player2-wins").text(player2.wins);
    $("#player2-losses").text(player2.losses);
};


// Displays a modal for the player's name once the page loads
document.addEventListener("DOMContentLoaded", function () {
    var elem = document.querySelector("#name-modal");
    var instance = M.Modal.init(elem, {
        dismissible: false
    });
    instance.open();
});


// Stores this player's name
document.querySelector("#name-button").addEventListener("click", function () {
    event.preventDefault();
    let input = document.querySelector("#name-input").value.trim();
    thisPlayer.name = input ? input : "Anonymous";
    PLAYERSREF.child(thisPlayer.key).update({
        name: thisPlayer.name
    }).then(function () {
        MESSAGESREF.push({
            name: thisPlayer.name,
            message: "connected."
        });
    });
});


// Use the enter key to submit a chat message
document.querySelector("#message-text").addEventListener("keypress", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        MESSAGESREF.push({
            name: thisPlayer.name,
            message: this.value.trim()
        });
        this.value = "";
    };
});


// Use the button to submit a chat message
document.querySelector("#message-button").addEventListener("click", function (event) {
    event.preventDefault();
    MESSAGESREF.push({
        name: thisPlayer.name,
        message: document.querySelector("#message-text").value.trim()
    });
    document.querySelector("#message-text").value = "";
});


// Adds a message to the chat
MESSAGESREF.on("child_added", function (snap) {
    let message = snap.val();
    let container = document.querySelector("#message-list");
    let messageWrapper = document.createElement("p");
    if (message.message === "connected." || message.message === "disconnected.") {
        messageWrapper.innerHTML = "<em>" + message.name + " " + message.message + "</em>";
        messageWrapper.className = "center-align";
    } else {
        messageWrapper.innerHTML = "<strong>" + message.name + ":</strong> " + message.message;
    };

    container.appendChild(messageWrapper);
    container.scrollTop = container.scrollHeight;
});