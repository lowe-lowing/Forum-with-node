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
// const router = express.Router();
// const sessions = require('express-session');

app.use(express.static('public'))
app.use(cookieParser());
/* final catch-all route to index.html defined last */
app.get('/index.html', (req, res) => {
  console.log("iconv");
  res.send({success: true, message: '<li>New list item number 1</li><li>New list item number 2</li>'});
})
/* final catch-all route to index.html defined last */
app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})
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
app.post("/create_post", function(req, res) {
  let body = req.body;
  create_post(body.usersId, body.title, body.subject, body.content)
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

    var hashedPwd = crypto.createHash('md5').update(password).digest('hex');
    con.query(`SELECT * FROM users WHERE (usersUid = '${username}' AND usersPwd = '${hashedPwd}') OR (usersEmail = '${username}' AND usersPwd = '${hashedPwd}');`, function (err, result) {
      if (err) throw err;
      console.log(result);
      
      if (result.length === 1) {
        // login success
        username = result[0].usersUid
        id = result[0].usersId
        console.log(`user: ${username} logged in`);
        io.on('connection', (socket) => {
          socket.emit('login', username, id);
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

function create_post(id, title, subject, content) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatingV2"
  });

  con.connect(function(err) {
    if (err) throw err;
    // $id, $title, $subject, $content
    sql = `INSERT INTO forums (usersId, title, subject, content) VALUES (${id}, '${title}', '${subject}', '${content}');`
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);

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
      console.log(result);
      res.send(result);
    });
  }); 
}