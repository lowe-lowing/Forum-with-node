const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mysql = require("mysql");
const crypto = require('crypto');
const validator = require("email-validator");
const { json } = require('express/lib/response');
const res = require('express/lib/response');

app.use(express.static('public'))

app.post('/change',function(req,res){
  // the message being sent back will be saved in a localSession variable
  // send back a couple list items to be added to the DOM
  get_all_posts(res);
});

// final catch-all route to '/' 
app.get('/*', (req, res) => {
  res.redirect('/');
})
server.listen(3000, () => {
  console.log('listening on *:3000');
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
  let id = req.body.id
  // console.log(search);
  searchUsers(res, search, id)
})
app.post("/send_friendRqst", function(req,res) {
  let body = req.body
  send_friendRqst(body.id, body.userId, res)
})
app.post("/getFriends", function(req,res) {
  let id = req.body.loggedinId
  getFriends(id, res)
})
app.post("/getAllUsers", function(req,res) {
  getAllUsers(res)
})
app.post("/acceptFriendRequest", function(req,res) {
  body = req.body
  acceptFriendRequest(body.user1, body.user2, res)
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
let loggingIn = false
function LoginUser(req, res, username, password) {
  loggingIn = true
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
      console.log(result);
      
      if (result.length === 1) {
        // login success
        var username = result[0].usersUid
        var usersName = result[0].usersName
        var id = result[0].usersId
        console.log(`user: ${username} logged in`);
        io.on('connection', (socket) => {
          socket.on('logout',function (data) {
            loggingIn = false
            console.log(`user with id: '${data}' logged out`)
          });
          if (loggingIn) {
            socket.emit('login', username, id, usersName);
          }
        });
        return res.redirect("login.html");
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
      console.log(result);
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

  // console.log("getting all posts");
  con.connect(function(err) {
    if (err) throw err;
    // $id, $title, $subject, $content
    sql = "SELECT * FROM `forums`";
    con.query(sql, function (err, result) {
      if (err) throw err;
      // console.log(result);
      let html = "";
      result.forEach(element => {
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

  // console.log("getting all posts");
  con.connect(function(err) {
    if (err) throw err;
    // $id, $title, $subject, $content
    sql = `SELECT * FROM users WHERE (usersUid = '${search}');`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      // console.log(result);
      let html = "";
      if (result.length > 0) {
        result.forEach(element => {
          if (id != element.usersId) {
            html += `
              <div>${element.usersUid}</div>
              <form action="send_friendRqst" method="POST">
                <input type="hidden" name="id" value="${element.usersId}">
                <input type="hidden" name="userId" value="${id}">
                <input type="submit" value="Send friend request" >
              </form><br>`
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

    sql = `
    UPDATE users SET friendRqstsSentTo = '${id}' WHERE (usersId = ${userId}) AND (NOT friendRqstsSentTo LIKE '%${id}%');
    UPDATE users SET friendRqstsRecievedFrom = '${userId}' WHERE (usersId = ${id}) AND (NOT friendRqstsRecievedFrom LIKE '%${userId}%');`

    con.query(sql, function (err, result) {
      if (err) throw err;
      res.redirect("/addfriend.html")
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

    sql = `SELECT friends, friendRqstsSentTo, friendRqstsRecievedFrom FROM users WHERE (usersId = ${id})`

    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send({success: true, message: result})
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

    sql1 = `
    SELECT friends, friendRqstsSentTo, friendRqstsRecievedFrom FROM users WHERE (usersId = ${user1}) OR (usersId = ${user2});`

    con.query(sql1, function (err, result) {
      if (err) throw err;
      user1Friends = result[0].friends + user2
      user2Friends = result[1].friends + user1
      user1Sent = result[0].friendRqstsSentTo.replace(user2, "")
      user2Sent = result[1].friendRqstsSentTo.replace(user1, "")
      user1Recieved = result[0].friendRqstsRecievedFrom.replace(user2, "")
      user2Recieved = result[1].friendRqstsRecievedFrom.replace(user1, "")
      sql2 = `
        UPDATE users SET friends = '${user1Friends}' WHERE (usersId = ${user1});
        UPDATE users SET friends = '${user2Friends}' WHERE (usersId = ${user2});
        UPDATE users SET friendRqstsSentTo = '${user1Sent}' WHERE (usersId = ${user1});
        UPDATE users SET friendRqstsSentTo = '${user2Sent}' WHERE (usersId = ${user2});
        UPDATE users SET friendRqstsRecievedFrom = '${user1Recieved}' WHERE (usersId = ${user1});
        UPDATE users SET friendRqstsRecievedFrom = '${user2Recieved}' WHERE (usersId = ${user2});`
      
        con.query(sql2, function (err, result) {
          if (err) throw err;
          res.redirect("/friends.html")
        });
    });
  });
}