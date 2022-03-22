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
getFriendRequests()
function getFriendRequests() {
    var id = localStorage.getItem("id")
    var jsonObj = { 
        loggedinId: id,
    }
    $.ajax({
        url: 'http://localhost:3000/getFriends',
        method: 'POST',
        data: jsonObj
    }).done(function(data){
        //if we have a successful post request ... 
        if(data.success){
            console.log("succes");
            console.log(data.message[0].friendRqstsSentTo);
            friendRequestsTable = document.querySelector(".table-friendRequests")
            console.log(friendRequestsTable);
            // console.log("Sent");
            // for (var i = 1, row; row = friendRequestsTable.rows[i]; i++) {
            //     console.log(row.cells[0].textContent);
            //  }
            // console.log("Recieved");
            // for (var i = 1, row; row = friendRequestsTable.rows[i]; i++) {
            //     console.log(row.cells[1].textContent);
            // }
            return;
        }
    }).fail(function(){
        //do nothing ....
        console.log('failed...');
        return;
    });
}