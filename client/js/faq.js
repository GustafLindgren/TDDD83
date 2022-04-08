/*
 * 
 *      Sets up the FAQ page
 * 
 * */

function activateFaq(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#faq-footer").addClass("site-active");
  link("sites/faq.html", addToHistoryStack).then(function () {
    loadSiteLinks();
  });
}