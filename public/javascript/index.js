var socket = io();

socket.on('userloggedin', function(username) {
    var userdiv = document.querySelector(".userdiv");
    userdiv.innerHTML = "logged in as: " + username;
    console.log("bruh");
});