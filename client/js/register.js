//Register an user from register.html
function registerUser() {
  $.ajax({
    url: HOST + "/user",
    type: "POST",
    data: JSON.stringify({ first_name: $("#first-name").val(), last_name: $("#last-name").val(), email: $("#email").val(), password: $("#password1").val() }),
    contentType: "application/json",
    success: function (response) {
      if (response.succ) {
        $.ajax({
          type: "POST",
          url: HOST + "/login",
          datatype: "JSON",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify({
            email: $("#email").val(),
            password: $("#password1").val(),
          }),
          success: function (loginResponse) {
            sessionStorage.setItem("auth", JSON.stringify(loginResponse));
            //var signedIn = sessionStorage.getItem("auth").length > 0;
            $("#loginModal").modal("hide");
            SignedIn = true;
            toggleButtons();
            sitesMap["sites/account.html"]();
            if (JSON.parse(sessionStorage.getItem("auth")).user.is_admin) {
              $("#register-org-link").show();
            }
          },
          error: function () {
            $("#failed-login-message").show();
          }
        });
      } else {
        alert("Eposten finns redan registrerad");
      }
    }
  });
}

function emptyFields() {
  $("#first-name-message").empty();
  $("#last-name-message").empty();
  $("#email-message").empty();
  $("#password-message").empty();
  $("#password-message").empty();
}

function validateUser() {

  var regBoolean = true

  emptyFields();

  var pw1 = $("#password1").val();
  var pw2 = $("#password2").val();
  var firstName = $("#first-name").val();
  var lastName = $("#last-name").val();
  var email = $("#email").val();



  if (firstName == "") {
    $("#first-name-message").html("Skriv in ditt förnamn");
    regBoolean = false;
  }

  if (lastName == "") {
    $("#last-name-message").html("Skriv in ditt efternamn");
    regBoolean = false;
  }

  if (email == "") {
    $("#email-message").html("Skriv in en e-post");
    regBoolean = false;
  }

  if (pw1.length < 6) {
    $("#password-message").html("Lösenordet måste minst vara 6 karaktärer");
    regBoolean = false;
  }

  else if (pw1 != pw2) {
    $("#password-message").html("Lösenorden matchar inte");
    regBoolean = false;
  }



  if (pw1 != pw2) {
    $("#password-message").html("Lösenorden matchar inte");
    regBoolean = false;
  }

  if (regBoolean) {
    registerUser();
  } else {
    return regBoolean;
  }

}

function activateRegister(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#register-link").addClass("site-active");
  $("#register-login-link").addClass("site-active");
  link("sites/register.html", addToHistoryStack).then(function(){
    $("#register-submit").click(function (e) {
      e.preventDefault();
      validateUser();
    });
  
    $("#reset-formula").click(function (e) {
      emptyFields();
    });
    $("#register-show-login").click(function(e) {
      e.preventDefault();
      showLogin();
    });
    
  });
   
}

