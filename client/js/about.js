/*
*
*     Activating the page with its links
*
*/


function activateAbout(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#about-link").addClass("site-active");
  $("#about-footer").addClass("site-active");
  link("sites/about.html", addToHistoryStack).then(function () {
    $("#about-faq-link").click(function (e) {
      e.preventDefault();
      sitesMap["sites/faq.html"]();
    });
    $("#about-contact-link").click(function (e) {
      e.preventDefault();
      sitesMap["sites/contact.html"]();
    });
  });
}