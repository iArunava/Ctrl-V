var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

// Global Variables
var loggedInSign = ``;
var LoggedIn = false;
var LoginBlock = `
<div id="loginBlock" class="row">
<div class="col-md-12 col-xs-12 col-sm-12 col-lg-12">
<div class="row">
<div class="col-md-12 col-xs-12 col-sm-12 col-lg-12">
      <div class="the_footer_login_box">
        <div class="justBoxIt">

          <div class="row">
            <div class="col-md-12 col-xs-12 col-sm-12 col-lg-12">
            <img id="theBlankProPic" class="img-circle img-responsive" src="/ui/blank-profile-picture.png" alt="Blank Profile Picture" height="100" width="100" />
          </div>
          </div>

          <div class="row">
            <div class="col-md-12 col-xs-12 col-sm-12 col-lg-12">
            <h4>Hello Guest</h4>
          </div>
          </div>

          <div class="row">
            <div class="col-md-12 col-xs-12 col-sm-12 col-lg-12">
              <button class="btn btn-primary ctrlvButton" type="button" data-toggle="modal" data-target="#create_account_form">Sign Up</button>
            </div>
            </div>

            <div class="row">
              <div class="col-md-12 col-xs-12 col-sm-12 col-lg-12">
              <button class="btn btn-primary ctrlvButton" type="button" data-toggle="modal" data-target="#login_form">Sign In</button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>

    <!-- The Create Account form -->
    <div id="create_account_form" class="modal fade">
      <div class="modal-dialog modal-lg">
        <div class="modal_content">

          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h4 class="modal-title">Create Account</h4>
          </div>

          <div class="modal-body">

          <div class="">
            <form class="form">

              <div class="form-group">
                <label for="fname_create"><b>First Name<sup>*</sup></b></label>
                <input class="form-control" type="text" id="fname_create" placeholder="First Name" name="fname"
                 required autofocus>
             </div>
            <div class="form-group">
              <label for="lname_create"><b>Last Name</b></label>
              <input class="form-control" type="text" id="lname_create" placeholder="Last Name" name="lname">
            </div>
            <br/><br/>

            <div class="form-group">
              <label for="email_create"><b>Email<sup>*</sup></b></label>
              <input class="form-control" type="email" id="email_create" placeholder="Email" name="elec-mail" required>
            </div>

            <div class="form-group">
              <label for="uname"><b>Username<sup>*</sup></b></label>
              <input class="form-control" type="text" id="uname" placeholder="Username" name="u_name" required>
            </div>
            <br/><br/>

            <div class="form-group">
              <label for="pwd_create"><b>Password<sup>*</sup></b></label>
              <input class="form-control" type="password" id="pwd_create" placeholder="Password" name="passwd" required>
            </div>

            <div class="form-group">
              <label><b>Confirm Password<sup>*</sup></b></label>
              <input class="form-control" type="password" placeholder="Re-Type Password" name="c_passwd" required>
            </div>
            <br/>

           </form>

            <hr/>
            <div class="loader"></div>
            <button class="ctrlvButton" id="create_account_form_submit" type="submit">Create New Account</button>
          </div>
          </div>

        </div>
      </div>

      </div>
    </div>


    <!-- The Login form -->
    <div id="login_form" class="modal fade">
      <div class="modal-dialog modal-lg">
        <div class="modal_content">

          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h4 class="modal-title">Login</h4>
          </div>

          <div class="modal-body">
        <div class="">

          <div class="create_account_box">
            <form class="form">

            <div class="form-group">
            <label for="the_uname_login"><b>Username</b></label>
            <input class="form-control" type="text" placeholder="Username" name="uname" id="the_uname_login" required>
            <br/><br/>
            </div>

            <div class="form-group">
            <label for="the_passwd_login"><b>Password</b></label>
            <input class="form-control" type="password" placeholder="Password" name="p_asswd" id="the_passwd_login" required>
            <br/><br/>
            </div>

          </form>

            <hr/>
            <div class="loader"></div>
            <button class="ctrlvButton" id="login_btn" type="submit">Login</button>
          </div>
        </div>
      </div>

      </div>
    </div>
  </div>
`;

var NavigationBar = `
<div id="theNavigationBar" class="navbar navbar-default">
  <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#mynavbar-content">
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="/">Ctrl+V</a>
    </div>
    <div class="collapse navbar-collapse" id="mynavbar-content">
      <ul class="nav navbar-nav">
      <li><a href="/">Main</a></li>
      <li><a href="/NewPaste">New Paste</a></li>
      <li><a href="/browse">Browse</a></li>
      ${loggedInSign}
      </ul>
    </div>
  </div>
</div>
`;

var TheFooter = `
<div class="container-fluid makeTheBackWhite theFooter">
<div class="row">
<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
<footer>
  <ul>
    <li><a class="footerOptions" href="">Created with &#10084; by Arunava</a><li>
  </ul>
  </footer>
</div>
</div>
</div>
`;

var EditDelete = `
<div class="row">
<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center">
<button type="button" class="btn btn-default btn-circle btn-lg" id="saveEditBtn"><i class="glyphicon glyphicon-floppy-save"></i></button>
<button type="button" class="btn btn-default btn-circle btn-lg" id="deletePasteBtn"><i class="glyphicon glyphicon-trash"></i></button>
</div>
</div>
`;

var config = {
    user: 'lqrjqvrbvvigaw',
    database: 'd5hsecam0tgn0c',
    host: 'ec2-54-243-185-132.compute-1.amazonaws.com',
    port: '5432',
    password: process.env.DATABASE_PASS
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30},
    resave: true,
    saveUninitialized:true
}));

app.set("views", path.resolve(__dirname, "/ui/views"));
app.set("view engine", "ejs");

var pool = new Pool(config);

app.use(function(req, res, next) {
    if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       LoggedIn = true;
   }
   next();
});

function checkLogin(req, res){
    if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       return true;
    }
    return false;
}

app.get('/ctrlVUsers-db', function (req, res) {

  pool.query('SELECT * FROM ctrlvusers', function(err, result){
      if (err) {res.status(500).send(err.toString());}
      else {res.send(result);}
  });

});

app.get('/', function (req, res) {

    if (checkLogin(req, res)) {
       res.redirect('/users/'+req.session.auth.userName);
   } else {
       res.sendFile(path.join(__dirname, 'ui', 'index.html'));
   }

});

app.get('/users/:username', function(req, res){
    if(checkLogin(req, res)){
        pool.query('SELECT * FROM "ctrlvusers" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err && result.rows.length === 0) {
              res.status(500).send(err.toString());
           } else {

              pool.query('SELECT * FROM "pastes" WHERE paste_username = $1 ORDER BY id DESC', [req.session.auth.userName], function(err, result2) {
                if (err && result2.rows.length === 0){
                    ctrlvHits = 0;
                } else {
                    ctrlvHits = result2.rows.length;
                    if(ctrlvHits > 5){
                        limit = 5;
                    } else {
                        limit = ctrlvHits;
                    }
                }
                res.end(createProfileTemplate(result.rows[0], result2, ctrlvHits));
    });
           }
       });
    } else {
        res.end(errorTemplate("Kindly, Login First!", checkLogin(req, res), returnUserDpLink(req, res)));
    }
});

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});

app.get('/ui/:dirname/:fileName', function (req, res) {

  if (req.params.dirname !== "js" &&
      req.params.dirname !== "css" &&
      req.params.dirname !== "fonts") {

    res.status(404).send(errorTemplate("Page Not Found!"));
  } else {
  res.sendFile(path.join(__dirname, 'ui', req.params.dirname, req.params.fileName));
  }
});

app.get('/EditProfile', function(req, res){
      if(checkLogin(req, res)){
          pool.query('SELECT * FROM "ctrlvusers" WHERE username = $1', [req.session.auth.userName], function(err, result){
              if(err){
                  res.status(500).send(errorTemplate("Unknown Error!", checkLogin(req, res), returnUserDpLink(req, res)));
              } else {
                  if(result.rows.length === 0){
                      res.status(500).send(errorTemplate("Unknown Error!", checkLogin(req, res), returnUserDpLink(req, res)));
                  } else {
                      res.send(editProfilePage(result.rows[0]));
                  }
              }
          });
      } else{
          res.end(errorTemplate("Sorry, You are not Authorized!"), checkLogin(req, res), returnUserDpLink(req, res));
      }
});

app.get('/pastes/:pasteLink', function (req, res) {
  pool.query('SELECT * FROM "pastes" WHERE paste_link = $1', [req.params.pasteLink], function(err, result){

      if (err) {
          res.status(500).send(err.toString());
        } else {
              if (result.rows.length === 0) {
                  res.status(403).send(errorTemplate("Paste Link Invalid!", checkLogin(req, res), returnUserDpLink(req, res)));
              } else {
                  if (checkLogin(req, res)) {
                    loggedInUserId = req.session.auth.userId;
                } else {
                  loggedInUserId = null;
                }
                  res.end(createPasteTemplate(result.rows[0], checkLogin(req, res), returnUserDpLink(req, res), loggedInUserId));
              }
              }

  });
});

app.get('/NewPaste', function(req, res) {
   res.send(thePastePage(checkLogin(req, res), returnUserDpLink(req, res)));
});

app.get('/browse', function(req, res){
   pool.query('SELECT * FROM "pastes" ORDER BY id DESC', function(err, response){
      if(err){
          res.status(500).end(err.toString());
      } else {
          if (response.rows.length === 0) {
            res.status(403).end(errorTemplate("No Pastes Made!", checkLogin(req, res)));
            } else {
                res.end(createBrowsePage(response, checkLogin(req, res), returnUserDpLink(req, res)));
            }
      }
   });
});

app.get('pastes/bower_components/css-ripple-effect/dist/ripple.min.css', function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'bower_components', 'css-ripple-effect', 'dist', 'ripple.min.css'));
});

app.get('bower_components/css-ripple-effect/dist/ripple.min.css', function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'bower_components', 'css-ripple-effect', 'dist', 'ripple.min.css'));
});

app.post('/login', function(req, res){

    var username = req.body.username;
    var password = req.body.password;

    pool.query('SELECT * FROM "ctrlvusers" WHERE "username" = $1', [username], function(err, result) {

        if (err) {
          res.status(500).send(err.toString());
        } else {
              if (result.rows.length === 0) {
                  res.status(403).send('username/password is invalid');
              } else {
                  // Match the password
                  var dbString = result.rows[0].password;
                  var salt = dbString.split('$')[2];
                  var hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
                  if (hashedPassword === dbString) {

                    // Set the session
                    req.session.auth = {userId: result.rows[0].id, userName: result.rows[0].username, userProPicLink: result.rows[0].dp_link};
                    // set cookie with a session id
                    // internally, on the server side, it maps the session id to an object
                    // { auth: {userId }}

                    res.send('Logging In');

                  } else {
                      res.end(errorTemplate("Username/Password Invalid!", checkLogin(req, res), returnUserDpLink(req, res)));
                  }
              }
        }
});
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   LoggedIn = false;
   res.end(errorTemplate("You are now Logged out!\nHope to See you Soon!", checkLogin(req, res), returnUserDpLink(req, res)));
});


app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       pool.query('SELECT * FROM "ctrlvusers" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});

app.post('/create-paste', function(req, res){

    var pasteBody = req.body.PasteBody;
    var pasteTitle = req.body.PasteTitle;
    var pasteAuthor = req.body.PasteAuthor;
    var pasteTime = req.body.PasteTime;
    var PasteAnon = req.body.AnonPaste;
    var pasteAuthorLink = req.body.PasteAuthorLink;
    var pasteLink = crypto.randomBytes(8).toString('hex');
    var pasteUsername = null;
    var pasteUsernameID = null;
    if(LoggedIn && !PasteAnon) {
        pasteUsername = req.session.auth.userName;
        pasteUsernameID = req.session.auth.userId;
    }

    pool.query('INSERT INTO "pastes" (paste_author, paste_title, paste_time, paste_link, paste_body, paste_username, paste_user_dp_link, paste_username_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [pasteAuthor, pasteTitle, pasteTime, pasteLink, pasteBody, pasteUsername, pasteAuthorLink, pasteUsernameID], function(err, result) {

        if(err){
            res.status(500).send(errorTemplate(err.toString(), checkLogin(req, res), returnUserDpLink(req, res)));
        } else {
            res.send(pasteLink);
        }
        });

});

app.post('/create_account', function(req, res){

  var username = req.body.username;
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var unEncryptedPassword = req.body.password;

  var salt = crypto.randomBytes(128).toString('hex');
  var password = hash(unEncryptedPassword, salt);

  pool.query('INSERT INTO "ctrlvusers" (username, email, firstname, lastname, password) VALUES ($1, $2, $3, $4, $5)',
            [username, email, firstName, lastName, password],
            function(err, result) {

                    if (err){
                      res.status(500).send(err.toString());
                    } else {
                      //res.send("Successfully Created User!");
                      res.send("Account Created Successfully!");
                    }
                  });
});

app.post('/edit-profile-save', function(req, res) {
    var dpLink = req.body.DpLink;
    var bio = req.body.Bio;

    pool.query('UPDATE "ctrlvusers" SET "bio" = $1, "dp_link" = $2 WHERE (("username" = $3))', [bio, dpLink, req.session.auth.userName], function(err, result) {
       if(err){
           res.status(500).send(errorTemplate("Something Went Wrong!\nPlease try Again!", checkLogin(req, res), returnUserDpLink(req, res)));
       } else {
           req.session.auth.userProPicLink = dpLink;
           res.send("Changes Saved!");
       }
    });
});

app.post('/edit-paste', function(req, res) {

  var pasteBody = req.body.PasteBody;
  var pasteLink = req.body.PasteLink;

  if (checkLogin(req, res)) {

    pool.query('SELECT "paste_username_id" FROM "pastes" WHERE "paste_link" = $1', [pasteLink], function(err, result) {
      if (err) {
        res.status(500).send(errorTemplate("Paste Link Invalid!!", checkLogin(req, res), returnUserDpLink(req, res)));
      } else {
        if (result.rows[0].paste_username_id == req.session.auth.userId) {
          pool.query('UPDATE "pastes" SET "paste_body" = $1 WHERE "paste_link" = $2', [pasteBody, pasteLink], function(err, result) {
             if(err){
                 res.status(500).send(errorTemplate("Something Went Wrong!\nPlease try Again!", checkLogin(req, res), returnUserDpLink(req, res)));
             } else {
                 res.send("Changes Saved!");
             }
          });
        } else {
          console.log("errorTemplate");
          res.redirect(errorTemplate("You are not Authorized!", false, returnUserDpLink(req, res)));
        }
      }

    });

  } else {
    res.end(errorTemplate("You are not Authorized!", false, returnUserDpLink(req, res)));
  }
});

app.post('/delete-paste', function(req, res) {

  var pasteLink = req.body.PasteLink;

  if (checkLogin(req, res)) {

    pool.query('SELECT "paste_username_id" FROM "pastes" WHERE "paste_link" = $1', [pasteLink], function(err, result) {
      if (err) {
        res.status(500).send(errorTemplate("Paste Link Invalid!!", checkLogin(req, res), returnUserDpLink(req, res)));
      } else {
        if (result.rows[0].paste_username_id == req.session.auth.userId) {
          pool.query('DELETE FROM "pastes" WHERE "paste_link" = $1', [pasteLink], function(err, result) {
             if(err){
                 res.status(500).send(errorTemplate("Something Went Wrong!\nPlease try Again!", checkLogin(req, res), returnUserDpLink(req, res)));
             } else {
                 res.send("Changes Saved!");
             }
          });
        } else {
          console.log("errorTemplate");
          res.redirect(errorTemplate("You are not Authorized!", false, returnUserDpLink(req, res)));
        }
      }

    });

  } else {
    res.end(errorTemplate("You are not Authorized!", false, returnUserDpLink(req, res)));
  }
});

app.use(function(req, res){
    res.end(errorTemplate("Page Not Found!", checkLogin(req, res), returnUserDpLink(req, res)));
});

function errorTemplate(errorMessage, loggedIn, dpLink){

    var loginBlock = LoginBlock;
    var loggedInSign = "";
    var mainJsScript = `<script src="/ui/main.js"></script>`;

    if(loggedIn){
        loginBlock = ``;
        loggedInSign = smallProPic(dpLink);
        mainJsScript = "";

    }

    var errorTemplate = `
    <!DOCTYPE html>
    <html lang="en-US">

    <head>

      <title>Ctrl+V</title>
      <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />

      <meta charset="utf-8">
      <meta name="description" content="A place where one could paste documents and
      access it from any where in the web">
      <meta name="keywords" content="ctrl, v, paste, clipboard, online">
      <meta name="author" content="Arunava Chakraborty">
      <meta name="viewport" content="width=device-width initial-scale=1.0">

      <link rel="stylesheet" type="text/css" href="/ui/css/bootstrap.css">
      <link rel="stylesheet" href="/ui/style.css">
    </head>

    <body class="the_body">

    ${NavigationBar}

    <div class="container center_wrap">

      <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center">
          <h2>${errorMessage}</h2>
        </div>
      </div>

    <div class="row">
      <div class="col-md-8 col-xs-8 col-sm-8 col-lg-8 col-xs-offset-2
      col-sm-offset-2 col-md-offset-2 col-lg-offset-2">
        <div class="topMargin1">${loginBlock}</div>
      </div>
    </div>

    </div>

    <div class="paddBottom"></div>

    <div class="navbar-fixed-bottom">
    ${TheFooter}
    </div>

    ${mainJsScript}
    <script type="text/javascript" src="/ui/js/jquery.js"></script>
    <script type="text/javascript" src="/ui/js/bootstrap.js"></script>
    </body>
    </html>
`;

    return errorTemplate;
}

function createBrowsePage(pastesData, loggedIn, dpLink){
    var theTotalLayout = "";

    var author;
    var title;
    var time;
    var username;
    var link;
    var loggedInSign = "";

    if(loggedIn) {
        loggedInSign = smallProPic(dpLink);
    }

    for(i=0; i<pastesData.rows.length; i++){
        author = pastesData.rows[i].paste_author;
        title  = pastesData.rows[i].paste_title;
        time   = pastesData.rows[i].paste_time;
        username = pastesData.rows[i].paste_username;
        link   = "/pastes/"+pastesData.rows[i].paste_link;

        if(username === null || username === ''){
            username = `#`;
        }

        usernameLink = "/users/"+username;

        theTotalLayout += `
        <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">

        <div class="aShortPasteLayout the_box">

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <a class="dontDecorate paste_title_link" href="`+link+`">
              <h4>`+title+`</h4>
            </a>
          </div>
          </div>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <h5>`+author+`</h5>
          </div>
          </div>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <small class="goAsh">`+time+`</small>
          </div>
          </div>

          </div>
          </div>
          </div>
    `;
    }

    var browsePage = `
    <!DOCTYPE html>
    <html lang="en-US">

    <head>

      <title>Ctrl+V</title>
      <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />

      <meta charset="utf-8">
      <meta name="description" content="A place where one could paste documents and
      access it from any where in the web">
      <meta name="keywords" content="ctrl, v, paste, clipboard, online">
      <meta name="author" content="Arunava Chakraborty">
      <meta name="viewport" content="width=device-width initial-scale=1.0">

      <link rel="stylesheet" href="/ui/pastes/bower_components/css-ripple-effect/dist/ripple.min.css">

      <link rel="stylesheet" type="text/css" href="/ui/css/bootstrap.css">
      <link rel="stylesheet" href="/ui/style.css">
    </head>


    <body class="the_body">

      ${NavigationBar}

      <div class="container center_wrap">

      <div class="row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <div class="the_box paddTop">

        <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <h4>Recent Pastes:</h4>
          <hr/>
          </div>
          </div>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          ${theTotalLayout}
          </div>
          </div>

          </div>
          </div>
          </div>
          </div>

          ${TheFooter}

          <script type="text/javascript" src="/ui/js/jquery.js"></script>
          <script type="text/javascript" src="/ui/js/bootstrap.js"></script>
        </body>
        </html>
    `;
    return browsePage;
}

function createPasteTemplate(pasteData, loggedIn, dpLink, loggedInUserId){
    var author = pasteData.paste_author;
    var time = pasteData.paste_time;
    var body = pasteData.paste_body;
    var link = pasteData.paste_link;
    var title = pasteData.paste_title;
    var pasteUserID = pasteData.paste_username_id;
    var completeLink = "http://arunavadw.imad.hasura-app.io/pastes/"+link;
    var loggedInSign = "";
    var editDelete = "";

    if(loggedIn){
        loggedInSign = smallProPic(dpLink);

        if (loggedInUserId === pasteUserID) {
          editDelete = EditDelete;
        }
    }

    var pasteTemplate = `
    <!DOCTYPE html>
    <html lang="en-US">

    <head>

      <title>Ctrl+V</title>
      <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />

      <meta charset="utf-8">
      <meta name="description" content="A place where one could paste documents and
      access it from any where in the web">
      <meta name="keywords" content="ctrl, v, paste, clipboard, online">
      <meta name="author" content="Arunava Chakraborty">
      <meta name="viewport" content="width=device-width initial-scale=1.0">

      <script src='https://wzrd.in/standalone/copy-button@latest'></script>
      <link rel="stylesheet" href="bower_components/css-ripple-effect/dist/ripple.min.css">

      <link rel="stylesheet" type="text/css" href="/ui/css/bootstrap.css">
      <link rel="stylesheet" href="/ui/style.css">
    </head>

    <body class="the_body">

    ${NavigationBar}

      <div class="container topPadd">

      <div class="row">
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
      <h2>${title}</h2>
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
      ${editDelete}
      </div>
      </div>

      <div class="row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <h5>${author}</h5>
      </div>
      </div>

      <div class="row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <h6>${time}</h6>
      </div>
      </div>

      <div class="row">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <span class="makeItBold">Paste Live At:</span> <input id="theExtraOrdinaryText" type="text" value=${completeLink}>
      <copy-button id="addCopyImage" target-element="#theExtraOrdinaryText"><img src="/ui/Copy-50.png" title="Copy" width="40" height="40"></copy-button>
      <hr/>
      </div>
      </div>

      <div class="row getComfortable">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
      <p class="showAsFormatted">
      <div class="form-group">
        <textarea id="pasteShownArea" class="form-control ctrlvTextArea pasteCreatorArea">${body}</textarea>
      </div>
      </p>
      </div>
      </div>

      </div>
      <script text="text/javascript" src="/ui/pasteEdit.js"></script>
      <script type="text/javascript" src="/ui/js/jquery.js"></script>
      <script type="text/javascript" src="/ui/js/bootstrap.js"></script>
    </body>
    </html>

    `;

    return pasteTemplate;
}


function createProfileTemplate(userData, pastesData, ctrlvHits) {
    var firstName = userData.firstname;
    var userBio = userData.bio;
    var proPic = userData.dp_link;
    var limit = ctrlvHits;

    if(ctrlvHits > 5){
        limit = 5;
    } else {
        limit = ctrlvHits;
    }

    var ctrlvRecents = "";

    for(i=0; i<limit; i++){
        var author   = pastesData.rows[i].paste_author;
        var title    = pastesData.rows[i].paste_title;
        var time     = pastesData.rows[i].paste_time;
        var username = pastesData.rows[i].paste_username;
        var link     = "/pastes/"+pastesData.rows[i].paste_link;

        if(username === null || username === ''){
            username = `#`;
        }

        usernameLink = "/users/"+username;

        ctrlvRecents += `
        <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">

        <div class="aShortPasteLayout the_box">

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <a class="dontDecorate" href="`+link+`">
              <h4>`+title+`</h4>
            </a>
          </div>
          </div>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <h5>`+author+`</h5>
          </div>
          </div>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <small class="goAsh">`+time+`</small>
          </div>
          </div>

          </div>
          </div>
          </div>
        `;
        }


    if(proPic === null){
        proPic = '/ui/blank-profile-picture.png';
    }

    if(userBio === null){
        userBio = "This user has no Bio";
    }

    var profileTemplate = `
        <!DOCTYPE html>
        <html lang="en-US">
        <head>
          <title>Ctrl+V</title>
          <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />
          <meta charset="utf-8">
          <meta name="description" content="A place where one could paste documents and
          access it from any where in the web">
          <meta name="keywords" content="ctrl, v, paste, clipboard, online">
          <meta name="author" content="Arunava Chakraborty">
          <meta name="viewport" content="width=device-width initial-scale=1.0">

          <link rel="stylesheet" type="text/css" href="/ui/css/bootstrap.css">
          <link rel="stylesheet" href="/ui/style.css">
        </head>

        <body class="the_body">

        <div id="theNavigationBar" class="navbar navbar-default">
          <div class="container-fluid">
            <div class="navbar-header">
              <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#mynavbar-content">
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="/">Ctrl+V</a>
            </div>
            <div class="collapse navbar-collapse" id="mynavbar-content">
              <ul class="nav navbar-nav">
              <li><a href="/">Main</a></li>
              <li><a href="/NewPaste">New Paste</a></li>
              <li><a href="/EditProfile">Edit Profile</a></li>
              <li><a href="/browse">Browse</a></li>
              <li class="goRight"><a href="/logout">Log Out</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="container center_wrap">

        <div class="row">
        <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
              <img class="img-responsive img-circle profile_picture" id="theProfilePicture" src=${proPic} alt="Profile Picture"
              width="130" height="130" />
            </div>

            <div class="col-xs-8 col-sm-8 col-md-8 col-lg-8">

            <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <h3 id="theFName">${firstName}</h3>
            </div>
            </div>

            <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <p id="theUserBio">${userBio}</p>
            </div>
            </div>
          </div>
          <hr/>
          </div>

          <br/><br/>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div>
          <h5 id="ctrlvHitsHeader">Ctrl+V Hits:&nbsp;&nbsp;&nbsp;<span id="ctrlvHits">${ctrlvHits}<span></h5>
          </div>
          </div>
          </div>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
              <h5>Recent Ctrl+V by you:</h5>
          </div>
          </div>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div id="ctrlvhitsbox">
            ${ctrlvRecents}
          </div>
          </div>
          </div>
        <div class="paddBottom"></div>
        </div>
        </div>
        </div>

          <script src="/ui/main.js"></script>
          <script type="text/javascript" src="/ui/js/jquery.js"></script>
          <script type="text/javascript" src="/ui/js/bootstrap.js"></script>
        </body>

        </html>`;

        return profileTemplate;
    }

function thePastePage(loggedIn, dpLink) {

    var loginBlock = LoginBlock;
    var loadMainScriptHtml = `<script src="/ui/main.js"></script>`;
    var loggedInSign = "";

    if(loggedIn) {
        loginBlock = ``;
        loadMainScriptHtml = ``;
        loggedInSign = smallProPic(dpLink);
    }

    var pasteHtml = `
    <!DOCTYPE html>
    <html lang="en-US">

    <head>

      <title>Ctrl+V</title>
      <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />

      <meta charset="utf-8">
      <meta name="description" content="A place where one could paste documents and
      access it from any where in the web">
      <meta name="keywords" content="ctrl, v, paste, clipboard, online">
      <meta name="author" content="Arunava Chakraborty">
      <meta name="viewport" content="width=device-width initial-scale=1.0">

      <link rel="stylesheet" type="text/css" href="/ui/css/bootstrap.css">
      <link rel="stylesheet" href="/ui/style.css">
    </head>

    <body class="the_body">

      ${NavigationBar}

      <div class="container topPadd">

        <div class="row">
        <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
          <h3>Paste here:</h3>
        </div>
        </div>

        <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div class="form-group">
            <textarea class="form-control ctrlvTextArea pasteCreatorArea" id="main_paste"></textarea>
          </div>
          </div>
          </div>

          <br/>

          <div class="row">
            <div id="footerOptionsNewPaste">

            <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
              <div class="" id="footerOptionsNewPaste1">
                <label for="paste_as"><h4>Paste As:</h4></label>
                <input type="text" class="newPstInputs" id="paste_as" placeholder="Anonymous" name="p_as" onblur="aRedMessageToggler()">
              </div>
              </div>

              <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
              <div  class="" id="footerOptionsNewPaste2">
                <label for="paste_title"><h4>Title:</h4></label>
                <input type="text" class="newPstInputs" id="paste_title" placeholder="Untitled" name="title_of">
              </div>
              </div>

              <div class="row">
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center">
              <br/>
              <p id="aRedMessage" class="warningText">BY DEFAULT, WHEN ANONYMOUS, YOU WILL NOT BE ABLE TO EDIT OR DELETE YOUR PASTE</h5>
              <hr/>
              </div>
              </div>

          </div>
        </div>

        <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center">
        <div id="newPasteDiv">
          <button class="btn btn-success btn-lg ctrlvButton newPasteButton" id="create_paste_submit" type="button">Create New Paste</button>
        </div>
        </div>
        </div>

        <div>${loginBlock}</div>

        </div>

      ${TheFooter}

      <script src="/ui/pasteBrain.js"></script>
      ${loadMainScriptHtml}
      <script type="text/javascript" src="/ui/js/jquery.js"></script>
      <script type="text/javascript" src="/ui/js/bootstrap.js"></script>
    </body>

    </html>
    `;

    return pasteHtml;
}

function editProfilePage(userInfo) {

    var proLink = userInfo.dp_link;
    var proLinkValue = proLink;
    var proBio = userInfo.bio;

    if(proBio === null){
      proBio = "";
    }

    if(proLink === '/ui/blank-profile-picture.png') {
        proLinkValue = "Link&nbsp;to&nbsp;Your&nbsp;Profile&nbsp;Picture&nbsp;Here";
    }

    var editPage = `
    <!DOCTYPE html>
    <html lang="en-US">

    <head>

      <title>Ctrl+V</title>
      <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />

      <meta charset="utf-8">
      <meta name="description" content="A place where one could paste documents and
      access it from any where in the web">
      <meta name="keywords" content="ctrl, v, paste, clipboard, online">
      <meta name="author" content="Arunava Chakraborty">
      <meta name="viewport" content="width=device-width initial-scale=1.0">

      <link rel="stylesheet" type="text/css" href="/ui/css/bootstrap.css">
      <link rel="stylesheet" href="/ui/style.css">
    </head>


    <body class="the_body">

      <div id="theNavigationBar" class="navbar navbar-default">
        <div class="container-fluid">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#mynavbar-content">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="/">Ctrl+V</a>
          </div>
          <div class="collapse navbar-collapse" id="mynavbar-content">
            <ul class="nav navbar-nav">
            <li><a href="/">Main</a></li>
            <li><a href="/NewPaste">New Paste</a></li>
            <li><a href="#">Edit Profile</a></li>
            <li><a href="/browse">Browse</a></li>
            <li><a href="/logout">Log Out</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="container center_wrap">

        <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div class="justMargin">

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div class="topMargin1">
            <img id="theProfilePicture" class="img-responsive profile_picture" src=${proLink} alt="Profile Picture"
            width="130" height="130" />
            </div>
            </div>
            </div>

            <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center">
            <div class="marginsForDpLink">
            <input class="proLinkInput" type="text" id="dpLink" placeholder="Link to Your Profile Picture" value=${proLinkValue} name="dpLink" onblur="loadTheImage()">
            <hr/>
            </div>
            </div>
            </div>

          </div>
          </div>
          </div>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <h4><div style="display:flex;justify-content:center;align-items:center;">Edit Bio</div></h4>
            </div>
            </div>

            <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div class="form-group">
            <textarea id="theBioArea" class="form-control ctrlvTextArea" rows="10" maxLength="300">${proBio}</textarea>
            </div>
            <hr/>
          </div>
          </div>

          </div>
          </div>

          <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div class="text-center justMargin">
            <div class="loader"></div>
            <br/>
            <button class="btn btn-success btn-lg ctrlvButton" id="editProfileSave" type="submit">Save Changes</button>
          </div>
          </div>
          </div>

        </div>

      ${TheFooter}
      <script src="/ui/profileEdit.js"></script>
      <script type="text/javascript" src="/ui/js/jquery.js"></script>
      <script type="text/javascript" src="/ui/js/bootstrap.js"></script>
    </body>
    </html>

    `;

    return editPage;
}

function smallProPic(picLink){

    if(picLink == null){
        picLink = '/ui/blank-profile-picture.png';
    }
    var smallDpLiHtml = `
    <li class="goRight"><a class="fixPadd"><img id="theSmallProfilePicture" src=${picLink} alt="Profile Picture"
      width="40" height="40" class="small_profile_picture"/></a></li>
    `;

    return smallDpLiHtml;
}

function returnUserDpLink(req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       return req.session.auth.userProPicLink;
    }
    return '/ui/blank-profile-picture.png';
}

function hash (input, salt) {

    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

var port = process.env.PORT || 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(port, function () {
  console.log(`Listening on ${port}!\nWelcome to Ctrl+V`);
});
