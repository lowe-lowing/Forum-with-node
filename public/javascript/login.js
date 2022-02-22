var errordiv = document.querySelector("#errormessage")

if (location.href.includes("wronglogin")) {
    errordiv.innerHTML = "Invalid username or password, try again"
}
if (location.href.includes("success")) {
    errordiv.innerHTML = "Account registered successfully"
}
var socket = io();

socket.on('login', function(username) {
    console.log(username);
    errordiv.innerHTML = "user logged in successfully";
});
socket.on('testfromserver', function(bruh) {
    console.log(bruh);
})
function test() {
    console.log("btn pressed");
    socket.emit('test', "io test")
}