const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mysql = require("mysql");
const crypto = require('crypto');
const validator = require("email-validator");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

app.use(express.static('public'))
app.use(cookieParser());

io.on('connection', (socket) => {
  socket.on('test', (msg) => {
    console.log(msg);
    io.emit('testfromserver', "test logged in server");
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.urlencoded({extended: true})); 
app.post("/register", function(req, res) {
  let body = req.body;
  CreateUser(res, body.name, body.email, body.username, body.password)
});

app.post("/login", function(req, res) {
  let body = req.body;
  LoginUser(req, res, body.username, body.password)
});

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

function LoginUser(req, res, username, password) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2"
  });
  con.connect(function(err) {
    if (err) throw err;
    console.log(password);
    var hashedPwd = crypto.createHash('md5').update(password).digest('hex');
    con.query(`SELECT * FROM users WHERE (usersUid = '${username}' AND usersPwd = '${hashedPwd}') OR (usersEmail = '${username}' AND usersPwd = '${hashedPwd}');`, function (err, result) {
      if (err) throw err;
      console.log(result);
      con.end(function(err) {
        if (err) throw err;
      });
      console.log(result.length);
      if (result.length === 1) {
        // login user
        io.on('connection', (socket) => {
          // console.log(socket);
          socket.emit('login', "testUser");
        });
      }
      else{
        // login failed
        return res.redirect("login.html?wronglogin");
      }
    });
  }); 
}
// nästa gång: get cockie on client