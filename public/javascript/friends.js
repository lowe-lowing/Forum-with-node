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
var users;
getAllUsers()
async function getFriends() {
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
            var sentTable = document.querySelector(".table-friendRequestsSent")
            var fromTable = document.querySelector(".table-friendRequestsFrom")
            var friendsTable = document.querySelector(".table-friends")
            // get all ids in data.message[0] 
            // foreach id make ajax call to find username and add new tr
            for (let i = 1; i < sentTable.rows.length; i++) {
                const element = sentTable.rows[i];
                console.log(element);
            }
            data.message[0].friendRqstsSentTo.split("").forEach((id, i) => {
                var username;
                users.forEach(user => {
                    if (user.usersId == id) {
                        username = user.usersUid;
                    }
                });
                sentTable.insertRow(i+1).insertCell(0).innerHTML = username
            });
            data.message[0].friendRqstsRecievedFrom.split("").forEach((id, i) => {
                var username;
                users.forEach(user => {
                    if (user.usersId == id) {
                        username = user.usersUid;
                    }
                });
                fromTable.insertRow(i+1).insertCell(0).innerHTML = `${username} 
                <form action="/acceptFriendRequest" method="POST">
                    <input type="hidden" name="user1" value="${id}">
                    <input type="hidden" name="user2" value="${localStorage.getItem("id")}">
                    <button type="submit">Accept</button>
                </form>`
            });
            data.message[0].friends.split("").forEach((id, i) => {
                var username;
                users.forEach(user => {
                    if (user.usersId == id) {
                        username = user.usersUid;
                    }
                });
                friendsTable.insertRow(i+1).insertCell(0).innerHTML = username
            });
            return;
        }
    }).fail(function(){
        //do nothing ....
        console.log('failed...');
        return;
    });
}

function getAllUsers() {
    $.ajax({
        url: 'http://localhost:3000/getAllUsers',
        method: 'POST',
    }).done(function(data){
        //if we have a successful post request ... 
        if(data.success){
            users = data.message
            getFriends()
        }
    }).fail(function(){
        //do nothing ....
        console.log('failed...');
        return;
    });
}

function getUserFromId(id) {
    users.forEach(user => {
        if (user.usersId == id) {
            return user.usersUid;
        }
    });
}