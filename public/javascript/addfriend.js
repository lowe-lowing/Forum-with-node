// template
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
        socket.emit("logout", localStorage.getItem("id"))
        localStorage.removeItem("username")
        localStorage.removeItem("id")
        localStorage.removeItem("usersName")
    }
}

function logout() {
    toggleLoggedIn(false)
    console.log("logged out");
}
// end of template
document.querySelector(".searchBtn").addEventListener("click", searchForUser);

function searchForUser() {
    var input = document.querySelector(".searchInput").value
    var id = localStorage.getItem("id")
    console.log(input);
    // ajax call
    var jsonObj = { 
        search: input,
        id: id
    }
    $.ajax({
        url: '/searchUsers',
        method: 'POST',
        data: jsonObj
    }).done(function(data){
        //if we have a successful post request ... 
        if(data.success){
            console.log(data);
            document.querySelector(".resultDiv").innerHTML = data.message
            console.log("succes");
            return;
        }
    }).fail(function(){
        //do nothing ....
        console.log('failed...');
        return;
    });
}