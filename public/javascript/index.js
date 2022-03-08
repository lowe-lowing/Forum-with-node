var socket = io();

var username = localStorage.getItem("username")
if (username === null) {
    logout()
}
else {
    toggleLoggedIn(true)
    document.querySelector(".username").innerHTML = `${username}`
}
if(window.localStorage.permanentData){
    console.log("bruh");
    document.querySelector(".posts").innerHTML = window.localStorage.permanentData;
}

function toggleLoggedIn(login) {
    var loggedin = document.querySelector(".loggedin");
    var notloggedin = document.querySelector(".notloggedin");
    var hiddeninput = document.querySelector("#usersId")
    console.log(hiddeninput);
    if (login == true) {
        loggedin.style.display = "block";
        notloggedin.style.display = "none";
        hiddeninput.value = localStorage.getItem("id");
        console.log(localStorage.getItem("id"));
    } else {
        loggedin.style.display = "none";
        notloggedin.style.display = "block";
        // hiddeninput.value = "";
    }
}

function logout() {
    toggleLoggedIn(false)
    console.log("logged out");
    localStorage.removeItem("username")
    localStorage.removeItem("id")
}

var modal = document.getElementById("myModal");

var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}