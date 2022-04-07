var errordiv = document.querySelector("#errormessage")

if (location.href.includes("wronglogin")) {
    errordiv.innerHTML = "Invalid username or password, try again"
}
if (location.href.includes("success")) {
    errordiv.innerHTML = "Account registered successfully"
    errordiv.style.color = "green"
}

var socket = io();

document.querySelector('input[type="submit"]').onclick = function() {
    console.log("bruh");
}