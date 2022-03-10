var socket = io();

changeDom()

var username = localStorage.getItem("username")
if (username === null) {
    logout()
}
else {
    toggleLoggedIn(true)
    document.querySelector(".username").innerHTML = `${username}`
}
// if(window.localStorage.permanentData){
//     document.querySelector(".posts").innerHTML = window.localStorage.permanentData;
// }

function toggleLoggedIn(login) {
    var loggedin = document.querySelector(".loggedin");
    var notloggedin = document.querySelector(".notloggedin");
    var hiddeninput = document.querySelector("#usersName");
    document.querySelector(".btnDiv").innerHTML = login ? '<button id="myBtn">make post</button>' : '<p style="color: red;">Log in to make a post</p>'
    if (login == true) {
        loggedin.style.display = "block";
        notloggedin.style.display = "none";
        hiddeninput.value = localStorage.getItem("usersName");
    } else {
        loggedin.style.display = "none";
        notloggedin.style.display = "block";
        hiddeninput.value = "";
        localStorage.removeItem("username")
        localStorage.removeItem("id")
        localStorage.removeItem("usersName")
    }
}

function logout() {
    toggleLoggedIn(false)
    console.log("logged out");
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

//change DOM function
function changeDom(){
    //ajax call
    $.ajax({
            url: 'http://localhost:3000/change',
            method:'POST',
            data: {list: "some info"}
        }).done(function(data){
            //if we have a successful post request ... 
            if(data.success){
                //change the DOM &
                //set the data in local storage to persist upon page request
                localStorage.setItem("permanentData", data.message);
                var savedText = localStorage.getItem("permanentData");
                document.querySelector(".posts").innerHTML = savedText

                return;
            }
        }).fail(function(){
            //do nothing ....
            console.log('failed...');
            return;
        });
};