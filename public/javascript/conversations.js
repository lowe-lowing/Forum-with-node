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
        // getConv()
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
$(document).ready(function() {
    document.querySelector(".sendBtn").addEventListener("click", sendMsg)
    document.querySelector(".msgInput").addEventListener("keyup", function(event){
        if (event.keyCode == 13) {
            sendMsg()
        }
    })
    getConv()
});
var socket = io();

let user_loggedIn;
const recieverUserId = location.href.split('#')[1]

socket.on('new message', response => {
    if (response.from == user_loggedIn || response.to == user_loggedIn) {
        add_new_msg(response.message, response.from)
    }
})
// set h4
$.ajax({
    url: '/getUser',
    method:'POST',
    data: { id: recieverUserId }
}).done(function(data){
    $("h4").text(`${data[0].usersUid} AKA ${data[0].usersName}:`)
})

// Send message
function sendMsg() {
    var inputValue = document.querySelector(".msgInput").value;
    document.querySelector(".msgInput").value = ""
    if (inputValue === "") { return; }
    $.ajax({
        url: '/sendMsg',
        method:'POST',
        data: {
            id: recieverUserId,
            msg: inputValue
        }
    }).done(function(data){
        if(data.success){
            jsonObj = {
                sender: user_loggedIn,
                reciever: recieverUserId,
                message: inputValue
            }
            socket.emit('message', jsonObj)
            return;
        }
    }).fail(function(){
        console.log('failed...');
        return;
    });
}
// get messages
function getConv() {
    $.ajax({
        url: '/getConversation',
        method:'POST',
        data: {id: recieverUserId}
    }).done(function(data){
        if(data.success){
            user_loggedIn = data.loggedInUserId
            move_msg(data)
            return;
        }
    }).fail(function(){
        console.log('failed...');
        return;
    });
}
function move_msg(response) {
    messages = response.messages
    reciever = recieverUserId
    loggedInUser = response.loggedInUserId
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      msg = message.message
      from = message.from_
      to = message.to_
      if (from == loggedInUser) {
          var u = document.querySelector("#chat")
          var p = document.createElement("li");
          p.className = "me";
          u.appendChild(p)
          var textnode = document.createTextNode(msg);
          p.appendChild(textnode)
      }
      else if (from == reciever) {
          var u = document.querySelector("#chat")
          var p = document.createElement("li");
          p.className = "him";
          u.appendChild(p)
          var textnode = document.createTextNode(msg);
          p.appendChild(textnode)
      }
    }
    scrollToBottom(false)
}
function add_new_msg(msg, from) {
    if (from == user_loggedIn) {
        var u = document.querySelector("#chat")
        var p = document.createElement("li");
        p.className = "me";
        u.appendChild(p)
        var textnode = document.createTextNode(msg);
        p.appendChild(textnode)
    }
    else if (from == recieverUserId) {
        var u = document.querySelector("#chat")
        var p = document.createElement("li");
        p.className = "him";
        u.appendChild(p)
        var textnode = document.createTextNode(msg);
        p.appendChild(textnode)
    }
    scrollToBottom(true)
}
function scrollToBottom(smooth) {
    var scrollDiv = document.querySelector(".Scroll")
    const behavior = smooth ? "smooth" : "auto"
    scrollDiv.scrollTo({
        top: scrollDiv.scrollHeight,
        left: 0,
        behavior: behavior
      });
}