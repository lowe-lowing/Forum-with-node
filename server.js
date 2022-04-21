const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mysql = require("mysql");
const crypto = require('crypto');
const validator = require("email-validator");
const cors = require('cors');
const session = require('express-session');

app.use(express.static('public'))
app.use(cors());
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.post('/change',function(req,res){
  get_all_posts(res);
});

// final catch-all route to '/' 
app.get('/*', (req, res) => {
  res.redirect('/');
})
server.listen(3000, () => {
  console.log('listening on *:3000');
});
io.on("connection", (socket) => {
  // receive a message from the client
  socket.on("message", (data) => {
    // send to all users 
    // which then checks if it belongs to their conversation
    io.emit('new message',{
      from: data.sender,
      to: data.reciever,
      message: data.message
    });
  });
});

app.use(express.urlencoded({extended: true})); 
app.post("/register", function(req, res) {
  let body = req.body;
  CreateUser(res, body.name, body.email, body.username, body.password)
});

app.post("/login_user", function(req, res) {
  let body = req.body;
  LoginUser(req, res, body.username, body.password)
});
app.post("/create_post", function(req, res) {
  let body = req.body;
  create_post(body.creator, body.title, body.subject, body.content, res)
});
app.post("/searchUsers", function(req,res) {
  let search = req.body.search
  let id = req.session.usersId
  searchUsers(res, search, id)
})
app.post("/send_friendRqst", function(req,res) {
  let body = req.body
  send_friendRqst(body.id, body.userId, res)
})
app.post("/getFriends", function(req,res) {
  getFriends(req.session.usersId, res)
})
app.post("/getAllUsers", function(req,res) {
  getAllUsers(res)
})
app.post("/getUser", function(req, res) {
  getUser(req.body.id, res)
})
app.post("/acceptFriendRequest", function(req,res) {
  user1 = req.body.user1
  user2 = req.session.usersId
  acceptFriendRequest(user1, user2, res)
})
app.post("/check_loggedIn", function(req,res) {
  if (req.session.loggedIn) {
    json = {
        userId: req.session.usersId,
        username: req.session.username,
        usersName: req.session.usersName
    }
    res.send({isloggedIn: true, user: json});
  }
  else {
    res.send({isloggedIn: false})
  }
})
app.post("/logout_user", function(req,res) {
  req.session.loggedIn = false
})
app.post("/getConversation", function(req,res) {
  getConversation(req, req.body.id, res)
})
app.post("/sendMsg", function(req,res) {
  sendMessage(req, req.body.id, res)
})

function CreateUser(res, usersName, usersEmail, usersUid, usersPwd) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2"
  });

  con.connect(function(err) {
    if (err) throw err;

    // Felhantering
    let errors = false;
    // check mail
    if (validator.validate(usersEmail) == false) {
      errors = true;
      res.redirect("register.html?invalidemail")
    }
    // check passwords
    if (usersPwd[0] != usersPwd[1]) {
      errors = true;
      res.redirect("register.html?passwordsdontmatch")
    }
    // check password length
    if (usersPwd[0].length < 3) {
      errors = true;
      res.redirect("register.html?passwordtoshort")
    }
    // check user exists
    con.query(`SELECT * FROM users WHERE usersUid = '${usersUid}' OR usersEmail = '${usersEmail}';`, function (err, result) {
      if (err) throw err;
      
      if (result.length > 0) {
        errors = true;
        res.redirect("register.html?usernametaken");
      } else {
        // Create user
        if (!errors) {
          var hashedPwd = crypto.createHash('md5').update(usersPwd[0]).digest('hex');
          con.query(`INSERT INTO users (usersName, usersEmail, usersUid, usersPwd) VALUES ('${usersName}', '${usersEmail}', '${usersUid}', '${hashedPwd}');`, function(err, result, fields) {
            if (err) throw err;
            con.end(function(err) {
              if (err) throw err;
            });
            return res.redirect("login.html?success");
          }); 
        }
      }
    });
  }); 
}
function LoginUser(req, res, username, password) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2"
  });
  con.connect(function(err) {
    if (err) throw err;

    var hashedPwd = crypto.createHash('md5').update(password).digest('hex');
    con.query(`SELECT * FROM users WHERE (usersUid = '${username}' AND usersPwd = '${hashedPwd}') OR (usersEmail = '${username}' AND usersPwd = '${hashedPwd}');`, function (err, result) {
      if (err) throw err;
      
      if (result.length === 1) {
        // login success
        var username = result[0].usersUid
        var usersName = result[0].usersName
        var id = result[0].usersId
        console.log(`user: ${username} logged in`);
        req.session.loggedIn = true;
        req.session.usersId = id;
        req.session.username = username;
        req.session.usersName = usersName;
        console.log(req.session);
        return res.redirect("index.html");
      }
      else {
        // login failed
        return res.redirect("login.html?wronglogin");
      }
    });
  }); 
}

function create_post(usersName, title, subject, content, res) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2"
  });

  con.connect(function(err) {
    if (err) throw err;
    // $id, $title, $subject, $content
    sql = `INSERT INTO forums (publisher, title, subject, content) VALUES ('${usersName}', '${title}', '${subject}', '${content}');`
    con.query(sql, function (err, result) {
      if (err) throw err;
      return res.redirect("/")
    });
  }); 
}
function get_all_posts(res) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2"
  });

  con.connect(function(err) {
    if (err) throw err;
    // $id, $title, $subject, $content
    sql = "SELECT * FROM `forums`";
    con.query(sql, function (err, result) {
      if (err) throw err;
      let html = "";
      result.reverse().forEach(element => {
        html += `
        <div class="post">
          <div class="post-title">Title: ${element.title}</div>
          <div class="post-subject">Subject: ${element.subject}</div>
          <div class="post-content">Content: ${element.content}</div>
          <div class="post-creator">Creator: ${element.publisher}</div>
        </div><br>`
      });
      res.send({success: true, message: html});
    });
  }); 
}

function searchUsers(res, search, id) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2"
  });

  con.connect(function(err) {
    if (err) throw err;
    // $id, $title, $subject, $content
    sql = `SELECT * FROM users WHERE (usersUid = '${search}');`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      let html = "";
      if (result.length > 0) {
        result.forEach(element => {
          if (id != element.usersId) {
            html += `<div>${element.usersUid}</div>`
            if (!result[0].friends.includes(id) && !result[0].friendRqstsSentTo.includes(id) && !result[0].friendRqstsRecievedFrom.includes(id)) {
              html += 
                `<form action="send_friendRqst" method="POST">
                  <input type="hidden" name="id" value="${element.usersId}">
                  <input type="hidden" name="userId" value="${id}">
                  <input type="submit" value="Send friend request" >
                </form><br>` 
            }
          }
        });
      }
      else {
        html="no user found"
      }
      res.send({success: true, message: html});
    });
  }); 
}

function send_friendRqst(id, userId, res) {
  // id = logged in user
  // userId = the user to send friend request to
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2",
    multipleStatements: true
  });

  con.connect(function(err) {
    if (err) throw err;

    sql1 = `
    SELECT * FROM users WHERE (usersId = ${userId});
    SELECT * FROM users WHERE (usersId = ${id})`;

    con.query(sql1, function (err, result) {
      res1 = JSON.parse(JSON.stringify(result[0]))[0]
      res2 = JSON.parse(JSON.stringify(result[1]))[0]
      if (err) throw err;
      sql2 = `
      UPDATE users SET friendRqstsSentTo = '${res1.friendRqstsSentTo + id}' WHERE (usersId = ${userId}) AND (NOT friendRqstsSentTo LIKE '%${id}%');
      UPDATE users SET friendRqstsRecievedFrom = '${res2.friendRqstsRecievedFrom + userId}' WHERE (usersId = ${id}) AND (NOT friendRqstsRecievedFrom LIKE '%${userId}%');`

      con.query(sql2, function (err, result) {
        if (err) throw err;
        res.redirect("/addfriend.html")
      });
    });
  });
}

function getFriends(id, res) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2",
  });

  con.connect(function(err) {
    if (err) throw err;

    var sql = `SELECT friends, friendRqstsSentTo, friendRqstsRecievedFrom FROM users WHERE (usersId = ${id});`

    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({success: true, message: result})
    });
  });
}
function getUser(id, res) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2",
  });

  con.connect(function(err) {
    if (err) throw err;

    sql = `SELECT * FROM users where usersId = ${id}`
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result)
    });
  });
}
function getAllUsers(res) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2",
  });

  con.connect(function(err) {
    if (err) throw err;

    sql = `SELECT * FROM users`

    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({success: true, message: result})
    });
  });
}
function acceptFriendRequest(user1, user2, res) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2",
    multipleStatements: true
  });

  con.connect(function(err) {
    if (err) throw err;

    sql1 = `SELECT usersId, friends, friendRqstsSentTo, friendRqstsRecievedFrom FROM users WHERE (usersId = ${user1}) OR (usersId = ${user2});`

    con.query(sql1, function (err, result) {
      if (err) throw err;
      user1Friends = result[0].friends + result[1].usersId
      user2Friends = result[1].friends + result[0].usersId
      user1Sent = result[0].friendRqstsSentTo.replace(result[1].usersId, "")
      user2Sent = result[1].friendRqstsSentTo.replace(result[0].usersId, "")
      user1Recieved = result[0].friendRqstsRecievedFrom.replace(result[1].usersId, "")
      user2Recieved = result[1].friendRqstsRecievedFrom.replace(result[0].usersId, "")
      sql2 = `
        UPDATE users SET friends = '${user1Friends}' WHERE (usersId = ${result[0].usersId});
        UPDATE users SET friends = '${user2Friends}' WHERE (usersId = ${result[1].usersId});
        UPDATE users SET friendRqstsSentTo = '${user1Sent}' WHERE (usersId = ${result[0].usersId});
        UPDATE users SET friendRqstsSentTo = '${user2Sent}' WHERE (usersId = ${result[1].usersId});
        UPDATE users SET friendRqstsRecievedFrom = '${user1Recieved}' WHERE (usersId = ${result[0].usersId});
        UPDATE users SET friendRqstsRecievedFrom = '${user2Recieved}' WHERE (usersId = ${result[1].usersId});`
      
        con.query(sql2, function (err, result) {
          if (err) throw err;
          res.redirect("/friends.html")
        });
    });
  });
}
function getConversation(req, id, res) {
  loggedInUser = req.session.usersId;
  if (loggedInUser == undefined) { return; }
  user2 = id
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2",
  });

  con.connect(function(err) {
    if (err) throw err;

    sql = `SELECT * FROM storage WHERE (from_ = ${loggedInUser} OR from_ = ${user2}) AND (to_ = ${loggedInUser} OR to_ = ${user2})`

    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({success: true, loggedInUserId: loggedInUser, messages: result})
    });
  });
}
function sendMessage(req, id, res) {
  loggedInUser = req.session.usersId;
  user2 = id
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2",
    multipleStatements: true
  });

  con.connect(function(err) {
    if (err) throw err;

    sql = `INSERT INTO storage (message, from_, to_) VALUES ('${req.body.msg}', ${loggedInUser}, ${id});`

    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({success: true, message: result})
    });
  });
}