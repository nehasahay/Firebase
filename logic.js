// Initialize Firebase
var config = {
    // Don't include this when you commit for security reasons.
    // Please include your own database!
};

firebase.initializeApp(config);

let database = firebase.database();

let player1 = "Player 1",
    player1Choice = "",
    player1Wins = 0,
    player1Loses = 0,
    player2 = "Player 2",
    player2Choice = "",
    player2Wins = 0,
    player2Loses = 0;

function playTheGame() {
    let player1WinConditions =
        (player1Choice === "Rock" && player2Choice === "Scissors") ||
        (player1Choice === "Paper" && player2Choice === "Rock") ||
        (player1Choice === "Scissors" && player2Choice === "Paper");

    if (player1Choice === player2Choice) {
        $("#result").text("It's a tie!");
    } else if (player1WinConditions) {
        player1Wins++;
        player2Loses++;
        $("#player1-wins").text(player1Wins);
        $("#player2-losses").text(player2Loses);
        $("#result").text("Player 1 Wins!");
    } else {
        player2Wins++;
        player1Loses++;
        $("#player2-wins").text(player2Wins);
        $("#player1-losses").text(player1Loses);
        $("#result").text("Player 2 Wins!");
    };
    
    player1Choice = "";
    player2Choice = "";
};

// database.ref().on("value", function (snapshot) {
//     console.log(snapshot.val());
// });

// let connectedRef = firebase.database().ref(".info/connected");
// let users = firebase.database().ref("users");
// // let userRef = firebase.database().ref("/presence/" + userid);

// connectedRef.on("value", function (snap) {

//     console.log(snap.val());

//     if (snap.val()) {
//         let user = snap.val();
//         user.onDisconnect().remove();
//         users.push(user);

//         // userRef.onDisconnect().remove();
//     };

//     // var adaRef = firebase.database().ref("https://<DATABASE_NAME>.firebaseio.com/users/ada");
//     // // The above is shorthand for the following operations:
//     // var rootRef = firebase.database().ref();
//     // var adaRef = rootRef.child("users/ada");
// }, function (errorObject) {

//     // In case of error this will print the error
//     console.log("The read failed: " + errorObject.code);
// });

// $("#player1").on("click", function () {
//     users.push({
//         name: player1,
//         choice: player1Choice,
//         win: player1Wins,
//         loss: player1Loses,
//         dateAdded: firebase.database.ServerValue.TIMESTAMP
//     });
// });

// $("#player2").on("click", function () {
//     users.push({
//         name: player2,
//         choice: player2Choice,
//         win: player2Wins,
//         loss: player2Loses,
//         dateAdded: firebase.database.ServerValue.TIMESTAMP
//     });
// });

$(".collection-item").on("click", function () {
    let player = this.parentElement.previousElementSibling.id;
    let choice = this.text;
    // database.ref().set({
    //     choice: this.text
    // });
    (player === "player1") ? player1Choice = choice : player2Choice = choice;

    if (player1Choice && player2Choice) {
        playTheGame();
    }
});