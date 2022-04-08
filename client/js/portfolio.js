var portfolios = [];
var port_expanded = [];

/*
 * 
 *      Function used to load all portfolios
 * 
 * */

function loadPortfolios() {
  $.ajax({
    url: "./portfolio",
    type: "GET",
    success: function (res) {
      portfolios = res;
      setPortfolios();
    },
    error: function () {
      alert("Nu gick det fel");
    }
  });
}

/*
 * 
 *      Function used to print a card for every portfolio in the database 
 * 
 * */

function setPortfolios() {
  $("#port-list").empty();
  for ([index, port] of portfolios.entries()) {
    port_expanded[index] = false;
    $("#port-list").append(createCardPortfolio(index, port));
  }
  $(".donate-to-port").click(function (e) {
    e.preventDefault();
    addPort($(this).data("port"));
  });
}

/*
 * 
 *      Function used by setPortfolios() to print a single card for a portfolio
 * 
 * */

function createCardPortfolio(index, port) {
  var text = "<div class=\"card card-margin\" id=\"card" + port.ports.portfolio_id + "\">" +
    "<div class=\"card-body\">" +
    "<div class=\"row\">" +
    "<div class=\"col-sm-4 img-div\">" +
    "<img alt=\"" + port.ports.name + "\" class=\"card-image\" src=\"" + port.ports.logo + "\">" +
    "</div>" +
    "<div class=\"col-sm-5 card-text\">" +
    "<h4 class=\"card-header\">" + port.ports.name + "</h4>" +
    "<p class=\"card-short-info\" id=\"shortInfo" + port.ports.portfolio_id + "\">" + port.ports.short_info + "</p>" +
    "</div>" +
    "<div class=\"col-sm-3 btn-container\">" +
    "<button class=\"btn btn-default collapsed collapse-button\" id=\"" + index + "-btn\" type=\"button\" onclick=\"arrowPort(this.id)\" data-toggle=\"collapse\" data-target=\"#collapse" +
    port.ports.portfolio_id + "\" aria-expanded=\"false\" aria-controls=\"collapse" + port.ports.portfolio_id + "\" >" +
    "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"arrow-down\" id=\"" + index +
    "-down\" width=\"25\" height=\"25\" fill=\"currentColor\" class=\"bi bi-caret-down-fill\" viewBox=\"0 0 16 16\">" +
    "<path d=\"M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\"/></svg>" +
    "<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"display: none\" class=\"arrow-up\" id=\"" + index +
    "-up\" width=\"25\" height=\"25\" fill=\"currentColor\" class=\"bi bi-caret-up-fill\" viewBox=\"0 0 16 16\">" +
    "<path d=\"m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z\"/>" +
    "</svg>" +
    "</button>" +
    "<button type=\"button\" data-port=\"" + port.ports.portfolio_id + "\" id=\"donatePortButton" + port.ports.portfolio_id +
    "\" class=\"btn btn-default donate-to-port\">Lägg till portfölj</button>" +
    "<button type=\"button\" data-name=\"" + port.ports.name + "\" data-port=\"" + port.ports.portfolio_id + "\" id=\"removePortButton" + port.ports.portfolio_id +
    "\" class=\"btn btn-danger removeBtn\" style=\"display: none\" >Lagd i varukorg</button>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "<div class=\"collapse\" id=\"collapse" + port.ports.portfolio_id + "\" data-parent=\"#portAccordion\">" +
    "<div class=\"row\">";

  for (var i = 0; i < port.orgs.length; i++) {
    text +=
      "<div class=\"row\">" +
      "<div class=\"col-sm-4 img-div-orgs\">" +
      "<img alt=\"" + port.orgs[i].name + "\" class=\"card-image-orgs\" src=\"" + port.orgs[i].logo + "\">" +
      "</div>" +
      "<div class=\"col-sm-8 card-text\">" +
      "<h6 class=\"card-header\">" + port.orgs[i].name + "</h6>" +
      "<p class=\"card-short-info\" id=\"shortInfo" + port.orgs[i].organisation_id + "\">" + port.orgs[i].short_info + "</p>" + "</div>" + "</div>";
  }
  text +=
    "</div>" +
    "</div>" +
    "</div>";
  return text;
}

/*
 * 
 *      The function for the "show-more-arrows"
 * 
 * */

function arrowPort(clicked_id) {
  setTimeout(function () {
    if (clicked_id.length == 5) {
      temp = clicked_id.substr(0, 1);
    } else {
      temp = clicked_id.substr(0, 2);
    }
    i = parseInt(temp);
    if (port_expanded[i]) {
      $(".arrow-up").hide();
      $(".arrow-down").show();
      $("#" + i + "-up").hide();
      $("#" + i + "-down").show();
      port_expanded[i] = false;
    } else {
      $(".arrow-up").hide();
      $(".arrow-down").show();
      $("#" + i + "-down").hide();
      $("#" + i + "-up").show();
      port_expanded[i] = true;
      for (j = 0; j < port_expanded.length; j++) {
        if (j != i) {
          port_expanded[j] = false;
        }
      }
    }
  }, 200);
}

/*
 * 
 *      Function used to add a whole pre-made portfolio to the shopping cart
 * 
 * */

function addPort(id) {
  $("#portModal").modal();
  $("#submitPort").click(function (e) {
    e.preventDefault();
    emptyShoppingCart();
    id = id - 1;
    var i;
    for (i = 0; i < portfolios[id].orgs.length; i++) {
      addOrg(portfolios[id].orgs[i].id.toString());
    }
    $("#donatePortButton" + portfolios[id].ports.portfolio_id).hide();
    $("#removePortButton" + portfolios[id].ports.portfolio_id).show();
  });
}

/*
 * 
 *      Sets up the portfolio page
 * 
 * */

function activatePortfolio(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#portfolio-header-link").addClass("site-active");
  link("sites/portfolio.html", addToHistoryStack).then(function () {
    loadPortfolios();
  });
}
