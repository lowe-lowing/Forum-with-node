var errordiv = document.querySelector("#errormessage")

if (location.href.includes("wronglogin")) {
    errordiv.innerHTML = "Invalid username or password, try again"
}
if (location.href.includes("success")) {
    errordiv.innerHTML = "Account registered successfully"
}

var socket = io();

document.querySelector('input[type="submit"]').onclick = function() {
    console.log("bruh");
    // socket.emit("loggingIn")
}

// socket.on('login', function(username, id, name) {
//     console.log(username);
//     localStorage.setItem("username", username)
//     localStorage.setItem("id", id)
//     localStorage.setItem("usersName", name)
//     window.location.href = "index.html"
// });