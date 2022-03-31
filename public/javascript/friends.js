$.ajax({
    url: '/check_loggedIn',
    method:'POST',
    data: {list: "som"}
}).done(function(data){
    if(data.isloggedIn){
        // log in
        toggleLoggedIn(true, data.user)
    }
    else {
        toggleLoggedIn(false, data.user)
    }
}).fail(function(){
    console.log('failed...');
    return;
});

function toggleLoggedIn(login, user) {
    var loggedin = document.querySelector(".loggedin");
    var notloggedin = document.querySelector(".notloggedin");
    if (login == true) {
        getAllUsers()
        loggedin.style.display = "block";
        notloggedin.style.display = "none";
        document.querySelector(".username").innerHTML = user.username
    } else {
        loggedin.style.display = "none";
        notloggedin.style.display = "block";
        document.querySelector("#container").innerHTML = "Login to view this page";
    }
}

function logout() {
    toggleLoggedIn(false)
    // log out user on the server side
    $.ajax({
        url: '/logout_user',
        method:'POST',
    }).done(function(data){
        if(data.success){
            console.log("logged out successfully");
            return;
        }
    }).fail(function(){
        console.log('failed...');
        return;
    });

}
// end of template
let users;
async function getFriends() {
    $.ajax({
        url: '/getFriends',
        method: 'POST',
    }).done(function(data){
        if(data.success){
            var sentTable = document.querySelector(".table-friendRequestsSent")
            var fromTable = document.querySelector(".table-friendRequestsFrom")
            var friendsTable = document.querySelector(".table-friends")

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
        url: '/getAllUsers',
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