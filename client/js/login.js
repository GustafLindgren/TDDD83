function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem("auth"));
}

function getEmail() {
  if (getCurrentUser() != null) {
    var email = getCurrentUser().user.email;
    $("#success-email").append(email);
  }

}

function showLogin() {
  $("#failed-login-message").hide();
  $("#loginModal").keypress(function(e) {
    if ($("#loginModal").hasClass("show") && (e.keycode == 13 || e.which == 13)) {
      $(".login-button").click();
    }
  });
  loadSiteLinks();
}

//Tar bort/visar login respektive logga ut knapparna
function toggleButtons() {
  var signedIn = getUser() != null;
  getEmail();
  $("#show-login").toggleClass("d-none", signedIn);
  $("#show-login-footer").toggleClass("d-none", signedIn);
  $("#logout").toggleClass("d-none", !signedIn);

  // $(".nav-item-register-org-link").toggleClass("d-none", getUser() != null && getUser().is_admin)

  if (getUser() != null && getUser().is_admin) {
    $("#register-org-link").css("display", "block");
  }
  $("#account-link").toggleClass("d-none", !signedIn);
  $(".login-button").toggleClass("d-none", signedIn);
  $("#register-link").toggleClass("d-none", signedIn);
  $(".login-button-footer").toggleClass("d-none", signedIn);
  $(".login-button-register").toggleClass("d-none", signedIn);
}

function login() {

  var email = $("#inputEmailLogin").val();
  var password = $("#inputPasswordLogin").val();

  $.ajax({
    type: "POST",
    url: HOST + "/login",
    datatype: "JSON",
    contentType: "application/json; charset=utf-8",

    data: JSON.stringify({
      email: email,
      password: password,
    }),
    success: function (loginResponse) {
      sessionStorage.setItem("auth", JSON.stringify(loginResponse));
      //var signedIn = sessionStorage.getItem("auth").length > 0;
      $("#loginModal").modal("hide")
      sitesMap["sites/account.html"]();
      $("#navbarSupportedContent").find(".active").removeClass("active");
      $("#account-link").addClass("active");
      loadAccount();
      loadReceipts();
      SignedIn = true;
      toggleButtons();


    },
    error: function () {
      $("#failed-login-message").show();
    }
  })

}

function logout() {
  sessionStorage.removeItem("auth");
  toggleButtons();
  emptyShoppingCart();
  $("#register-org-link").hide();
  sitesMap["sites/home.html"]();
}