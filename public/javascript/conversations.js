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
    getConv()
});

function sendMsg() {
    var inputValue = document.querySelector(".msgInput").value;
    if (inputValue === "") { return; }
    $.ajax({
        url: '/sendMsg',
        method:'POST',
        data: {
            id: location.href.split('#')[1],
            msg: inputValue
        }
    }).done(function(data){
        if(data.success){
            alert("message sent successfully!")
            return;
        }
    }).fail(function(){
        console.log('failed...');
        return;
    });
}

function getConv() {
    console.log("getting conversation...");
    $.ajax({
        url: '/getConversation',
        method:'POST',
        data: {id: location.href.split('#')[1]}
    }).done(function(data){
        if(data.success){
            console.log(data.message);
            move_msg(data.message)
            return;
        }
    }).fail(function(){
        console.log('failed...');
        return;
    });
}
// <!-- make ajax call to send the message on button press -->
function move_msg(response) {
    // get req.session.userid from the server
    messages = response
    for (let i = 0; i < messages.length; i++) {
      const element = messages[i];
      toArray = element
      msg = toArray[0]
      from = toArray[1]
      to = toArray[2]
      latest_loaded_message = toArray[3]
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
}