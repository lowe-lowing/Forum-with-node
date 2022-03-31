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

document.querySelector(".searchBtn").addEventListener("click", searchForUser);

function searchForUser() {
    var input = document.querySelector(".searchInput").value
    // ajax call
    $.ajax({
        url: '/searchUsers',
        method: 'POST',
        data: {search: input}
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