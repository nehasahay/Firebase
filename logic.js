"use strict";

// Initialize Firebase
var config = {
    // Don't include this when you commit for security reasons.
    // Please include your own database!
    apiKey: "AIzaSyAJS4YQWU5DmESeYueG1qH1NGkjv3DncEY",
    authDomain: "fir-click-counter-7cdb9.firebaseapp.com",
    databaseURL: "https://fir-click-counter-7cdb9.firebaseio.com",
    storageBucket: "fir-click-counter-7cdb9.appspot.com"
};

firebase.initializeApp(config);

let player1Name = "Waiting for Player 1...",
    player1Choice = "",
    player1Wins = 0,
    player1Losses = 0,
    player2Name = "Waiting for Player 2...",
    player2Choice = "",
    player2Wins = 0,
    player2Losses = 0,
    players = [],
    thisPlayer = {
        name: "",
        key: ""
    };

// Where all potential players will be stored
const PLAYERSREF = firebase.database().ref("/players"),
    // Where the chat messages will be stored
    MESSAGESREF = firebase.database().ref("/messages"),
    // A special location that stores all clients connected
    CONNECTEDREF = firebase.database().ref(".info/connected");


function playTheGame() {
    const player1WinConditions =
        (player1Choice === "Rock" && player2Choice === "Scissors") ||
        (player1Choice === "Paper" && player2Choice === "Rock") ||
        (player1Choice === "Scissors" && player2Choice === "Paper");

    if (player1Choice === player2Choice) {
        $("#result").text("It's a tie!");
    } else if (player1WinConditions) {
        player1Wins++;
        player2Losses++;
        // This text isn't updated to sync across clients        
        $("#result").text("Player 1 Wins!");
    } else {
        player2Wins++;
        player1Losses++;
        // This text isn't updated to sync across clients
        $("#result").text("Player 2 Wins!");
    };

    PLAYERSREF.child(players[0]).update({
        wins: player1Wins,
        losses: player1Losses,
        choice: ""
    }).then(updateLocalPlayer1);

    PLAYERSREF.child(players[1]).update({
        wins: player2Wins,
        losses: player2Losses,
        choice: ""
    }).then(updateLocalPlayer2);
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
        player.onDisconnect().remove();
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


document.querySelectorAll(".collection-item").forEach(choice => {
    choice.addEventListener("click", function () {
        if (players.indexOf(thisPlayer.key) !== -1) {
            PLAYERSREF.child(thisPlayer.key).update({
                choice: this.text
            });
            updateLocalPlayer1();
            updateLocalPlayer2();
        };

        if (player1Choice && player2Choice) {
            playTheGame();
        };
    });
});


// Replace the following two functions with "value" if you can't fix the disconnect error
// Detects a new player 1 or 2.
PLAYERSREF.orderByKey().limitToFirst(2).on("child_added", function (snap) {
    players.push(snap.key);
    console.log(players);
    displayPlayer();

}, function (errorObject) {
    // In case of error this will print the error
    console.log("The read failed: " + errorObject.code);
});


// Removes a disconnected player 1 or 2.
PLAYERSREF.orderByKey().limitToFirst(2).on("child_removed", function (snap) {
    let index = players.indexOf(snap.key);
    players.splice(index, 1);
    console.log(players);

    // Update the local values of whichever player disconnected.
    if (!index) {
        player1Wins = 0;
        player1Losses = 0;
    } else {
        player2Wins = 0;
        player2Losses = 0;
    };

}, function (errorObject) {
    // In case of error this will print the error
    console.log("The read failed: " + errorObject.code);
});


function updateLocalPlayer1() {
    console.log(players[0]);
    PLAYERSREF.child(players[0]).on("value", function (snap) {
        console.log(snap.val());
        player1Name = snap.val().name;
        player1Choice = snap.val().choice;
        player1Wins = snap.val().wins;
        player1Losses = snap.val().losses;
        $("#player1-wins").text(player1Wins);
        $("#player1-losses").text(player1Losses);
        displayPlayer();
    }, function (errorObject) {
        // In case of error this will print the error
        console.log("The read failed: " + errorObject.code);
    });
};


function updateLocalPlayer2() {
    console.log(players[1]);
    if (PLAYERSREF.child(players[1])) {
        PLAYERSREF.child(players[1]).on("value", function (snap) {
            console.log(snap.val());
            player2Name = snap.val().name;
            player2Choice = snap.val().choice;
            player2Wins = snap.val().wins;
            player2Losses = snap.val().losses;
            $("#player2-wins").text(player2Wins);
            $("#player2-losses").text(player2Losses);
            displayPlayer();
        }, function (errorObject) {
            // In case of error this will print the error
            console.log("The read failed: " + errorObject.code);
        });
    };
};


function displayPlayer() {
    let player1Header = document.querySelector("h5");
    player1Header.textContent = player1Name;
    let player2Header = document.querySelectorAll("h5")[1];
    console.log(player2Header);
    player2Header.textContent = (players.length < 2) ? "Waiting for Player 2..." : player2Name;
    if (players.indexOf(thisPlayer.key) !== -1) {
        let container = document.querySelectorAll(".collection")[players.indexOf(thisPlayer.key)];
        Array.from(container.childNodes).forEach(choice => {
            choice.className = "collection-item waves-effect waves-teal";
        });
    };
};


document.addEventListener("DOMContentLoaded", function () {
    var elem = document.querySelector("#name-modal");
    var instance = M.Modal.init(elem, {
        dismissible: false
    });
    instance.open();
});


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
    console.log(thisPlayer);
});


// Use the enter key to submit the chat message
document.querySelector("#message-text").addEventListener("keypress", function (event) {
    if (event.keyCode == 13) {
        event.preventDefault();
        MESSAGESREF.push({
            name: thisPlayer.name,
            message: this.value.trim()
        });
        this.value = "";
    };
});


// Use the button to submit the chat message
document.querySelector("#message-button").addEventListener("click", function (event) {
    event.preventDefault();
    MESSAGESREF.push({
        name: thisPlayer.name,
        message: document.querySelector("#message-text").value.trim()
    });
    document.querySelector("#message-text").value = "";
});


MESSAGESREF.on("child_added", function (snap) {
    let message = snap.val();
    let container = document.querySelector("#message-list");
    let messageWrapper = document.createElement("p");
    let messageText = message.name + ((message.message === "connected." || message.message === "disconnected.") ? " " : ": ") + message.message;
    messageWrapper.textContent = messageText;

    container.appendChild(messageWrapper);
    container.scrollTop = container.scrollHeight;
});