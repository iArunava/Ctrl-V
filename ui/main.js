var create_account_btn = document.getElementById('create_account_form_submit');
var login_btn = document.getElementById('login_btn');
var loader = document.getElementsByClassName('loader');

login_btn.onclick = function() {
    
    loader[1].style.display = "inline-block";
    login_btn.innerHTML = "Logging You In...";
    
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
    
    if(request.readyState === XMLHttpRequest.DONE){
        if(request.status === 200){
            loader[1].style.display = "none";
            login_btn.innerHTML = "Log In";
            location.reload();
        } else {
            alert("Some Internal Error Occured!\nPlease Try Again Later!");
            login_btn.innerHTML = "Log In";
        }
    }
    };

  var username = document.getElementById('the_uname_login').value;
  var password  = document.getElementById('the_passwd_login').value;

  request.open('POST', '/login', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({username: username,
                              password: password}));
};


create_account_btn.onclick = function() {
  
  loader[0].style.display = "inline-block";
  create_account_btn.innerHTML = "Creating Your Account...";
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {

    if(request.readyState === XMLHttpRequest.DONE){
      if(request.status === 200){
          loader[0].style.display = "none";
          create_account_btn.innerHTML = "Create New Account";
          alert("Account Created Successfully!\nLogin to Continue!");
      } else {
        alert("Some Internal Error Occured!\nPlease Try Again Later!");
        create_account_btn.innerHTML = "Create New Account";
      }
    }
  };

  var firstName = document.getElementById('fname_create').value;
  var lastName  = document.getElementById('lname_create').value;
  var mailAddr  = document.getElementById('email_create').value;
  var password  = document.getElementById('pwd_create').value;
  var userName  = document.getElementById('uname').value;

  request.open('POST', 'http://arunavadw.imad.hasura-app.io/create_account', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({username: userName,
                              firstname: firstName,
                              lastname: lastName,
                              email: mailAddr,
                              password: password}));
};
