function activateHome(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#home-link").addClass("site-active");
  link("sites/home.html", addToHistoryStack).then(function () {
    /*Link to contact-page from home screen*/
    $("#home-contact-link").click(function (e) {
      e.preventDefault();
      activateContact();
    });
  });
}