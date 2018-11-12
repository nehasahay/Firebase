// Initialize Firebase
var config = {
    // Don't include this when you commit for security reasons.
    // Please include your own database!
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};

firebase.initializeApp(config);

let player1,
    player1Choice = "",
    player1Wins = 0,
    player1Losses = 0,
    player2,
    player2Choice = "",
    player2Wins = 0,
    player2Losses = 0;

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
        $("#player1-wins").text(player1Wins);
        $("#player2-losses").text(player2Losses);
        $("#result").text("Player 1 Wins!");
    } else {
        player2Wins++;
        player1Losses++;
        // This text isn't updated to sync across clients
        $("#player2-wins").text(player2Wins);
        $("#player1-losses").text(player1Losses);
        $("#result").text("Player 2 Wins!");
    };

    console.log(players);

    playersRef.child(players[0]).update({
        wins: player1Wins,
        losses: player1Losses,
        choice: ""
    }).then(updateLocalPlayer1);

    // Updating player 1 makes the playersRef.limitToFirst(2) execute before this does
    // since it's on value change
    playersRef.child(players[1]).update({
        wins: player2Wins,
        losses: player2Losses,
        choice: ""
    }).then(updateLocalPlayer2);
    // player1Choice = "";
    // player2Choice = "";
};

// Where the players will be stored
let playersRef = firebase.database().ref("/players");

// A special location that stores all clients connected
let connectedRef = firebase.database().ref(".info/connected");

let thisPlayer;

let players;

// Executes both on load and on every new connection
connectedRef.on("value", function (snap) {

    // If we have a connection (snap.val() is a boolean)
    if (snap.val()) {
        // Push a new player to the database
        let player = playersRef.push({
            name: "",
            choice: "",
            wins: 0,
            losses: 0,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        thisPlayer = player.key;
        console.log(thisPlayer);
        // Removes the player from the database if the client disconnects
        player.onDisconnect().remove();
    };

}, function (errorObject) {
    // In case of error this will print the error
    console.log("The read failed: " + errorObject.code);
});

// playersRef.on("value", function (snap) {
//     // When first loaded or when the connections list changes...
//     let numberOfObservers = snap.numChildren();
//     // console.log(numberOfObservers);
//     // console.log(snap.val());
// });


$(".collection-item").on("click", function () {
    if (players.indexOf(thisPlayer) !== -1) {
        playersRef.child(thisPlayer).update({
            choice: this.text
        });
        updateLocalPlayer1();
        updateLocalPlayer2();
    };

    if (player1Choice && player2Choice) {
        playTheGame();
    };
});


playersRef.orderByKey().limitToFirst(2).on("value", function (snap) {
    players = Object.keys(snap.val());
    console.log(players);
});


function updateLocalPlayer1() {
    console.log(players[0]);
    playersRef.child(players[0]).on("value", function (snap) {
        console.log(snap.val());
        player1Choice = snap.val().choice;
        player1Wins = snap.val().wins;
        player1Losses = snap.val().losses;
    });
};


function updateLocalPlayer2() {
    console.log(players[1]);
    playersRef.child(players[1]).on("value", function (snap) {
        console.log(snap.val());
        player2Choice = snap.val().choice;
        player2Wins = snap.val().wins;
        player2Losses = snap.val().losses;
    });
};


//once()
$("#whatever").on("click", function () {
    let text = this.previousElementSibling.value.trim();
    playersRef.child(thisPlayer).update({
        name: text
    });
    console.log(thisPlayer);
});