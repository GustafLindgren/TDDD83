// Fills the dropdown with no-orgs-message if no orgs in portfolio
// List all orgs in the current portfolio and shows a remove-button for each org if there are orgs in the portfolio
function dropdownCurrentCart() {
  var orgs = JSON.parse(sessionStorage.getItem("orgs"));
  if (orgs == null || orgs.length == 0) {
    $(".dropdown-portfolio-orgs").empty();
    $(".dropdown-portfolio-orgs").append("<li class=\"dropdown-list-org\">" +
      "<div>" +
      "<p id=\"no-orgs-message\">Du har inga organisationer i din portfölj. Välj en färdig portfölj eller bygg ihop en egen.</p>" +
      "</div></li>");
  } else {
    $(".dropdown-portfolio-orgs").empty();
    for (org of orgs) {
      $(".dropdown-portfolio-orgs").append("<li class=\"dropdown-list-org\">" +
        "<div class=\"row h-100\" id=\"org-row\">" +
        "<div class=\"col-sm-10 logo-col-dropdown\">" +
        "<img class=\"org-logo-dropdown\" id=\"cart-img\" src=\"" + org.logo + "\" alt=\"" + org.selector_name + "\">" +
        "</div>" +
        "<div class=\"col-sm-2 remove-col\">" +
        "<button class=\"btn btn-sm btn-danger side-btn\" type=\"button\" data-org=\"" + org.organisation_id + "\" data-name=\"" + org.name + "\" id=\"remove-org-dropdown\" href=\"#\"><i class=\"far fa-trash-alt\"></i></button>" +
        "</div></div></li>");
    }
    // Remove org button
    $(".side-btn").click(function (e) {
      e.stopPropagation();
      if ($(".dropdown").find(".dropdown-menu-lg-right").is(":hidden")) {
        $(".dropdown-toggle").dropdown("show");
      }
      var id = parseInt($(this).data("org"));
      $("#removeButton" + id).hide();
      $("#donateButton" + id).show();
     
      removeOrg($(this).data("name"));
      dropdownCurrentCart();
    });
  }
}

// Loads all the link in the header
function loadHeaderLinks() {
  $(".login-button").click(function (e) {
    e.preventDefault();
    login();
  });
  $("#show-login").click(function (e) {
    e.preventDefault();
    showLogin();
  });
  $("#show-login-footer").click(function (e) {
    e.preventDefault();
    showLogin();
  });
  $("#logout").click(function (e) {
    e.preventDefault();
    logout();
  });
  $(".dropdown-toggle").click(function (e) {
    e.preventDefault();
    dropdownCurrentCart();
  });
}

function activateHeader() {
  dropdownCurrentCart();
  toggleButtons();
}