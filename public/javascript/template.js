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
    var hiddeninput = document.querySelector("#usersName");
    // var btnDiv = document.querySelector(".btnDiv")
    if (login == true) {
        loggedin.style.display = "block";
        notloggedin.style.display = "none";
        document.querySelector(".username").innerHTML = user.username
        hiddeninput.innerHTML = user.usersName
    } else {
        loggedin.style.display = "none";
        notloggedin.style.display = "block";
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