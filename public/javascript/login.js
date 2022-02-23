var errordiv = document.querySelector("#errormessage")

if (location.href.includes("wronglogin")) {
    errordiv.innerHTML = "Invalid username or password, try again"
}
if (location.href.includes("success")) {
    errordiv.innerHTML = "Account registered successfully"
}
var socket = io();

socket.on('login', function(username) {
    localStorage.setItem("username", username)
    window.location.href = "index.html"
});