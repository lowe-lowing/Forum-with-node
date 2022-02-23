var socket = io();

var username = localStorage.getItem("username")
if (username === null) {
    logout()
}
else {
    toggleLoggedIn(true)
    document.querySelector(".username").innerHTML = `${username}`
}

function toggleLoggedIn(login) {
    var loggedin = document.querySelector(".loggedin");
    var notloggedin = document.querySelector(".notloggedin");
    if (login == true) {
        loggedin.style.display = "block";
        notloggedin.style.display = "none";
    } else {
        loggedin.style.display = "none";
        notloggedin.style.display = "block";
    }
}

function logout() {
    toggleLoggedIn(false)
    console.log("logged out");
    localStorage.removeItem("username")
}