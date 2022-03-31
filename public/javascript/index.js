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
    var btnDiv = document.querySelector(".btnDiv")
    if (login == true) {
        loggedin.style.display = "block";
        notloggedin.style.display = "none";
        document.querySelector(".username").innerHTML = user.username
        hiddeninput.value = user.usersName
        btnDiv.innerHTML = '<button id="myBtn">make post</button>' 
        document.getElementById("myBtn").onclick = function() {
            modal.style.display = "block";
        };
    } else {
        loggedin.style.display = "none";
        notloggedin.style.display = "block";
        btnDiv.innerHTML = '<p style="color: red;">Log in to make a post</p>'
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

var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Get Posts
$.ajax({
        url: '/change',
        method:'POST',
        data: {list: "some info"}
}).done(function(data){
    if(data.success){
        document.querySelector(".posts").innerHTML = data.message
        return;
    }
}).fail(function(){
    //do nothing ....
    console.log('failed...');
    return;
});