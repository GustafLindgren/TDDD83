var opened_once = false;

am4core.options.autoDispose = true;
var stripe = Stripe("pk_test_51IVAyLKv6YL9a0jeQ4LiitvScbcl0UMfRrLaOMOY0SKVk2vhlkFA5ge2UYGOWGUSqm6p1TcQXDDBQFWJc3rUEsuq00Iw1lsn6t");
//for piecharten to update after removed organisation from org-site
//time delay seems to be needed for updatePie() to work
function loadPieChart() {
  setTimeout(function () {
    evenOutPercent();
    setDonationCards();
    updatePie();
    updatePercentage();
  }, 100);
}

//Go to checkout from org-site
function loadDonationSite() {
  sitesMap["sites/donation.html"]();
  loadPieChart();
}

//Triggered by "kortbetalning", shows payment fields and provides functionality
function goToPayment() {
  if (parseFloat($("#donation-amount").val()) > 0 && parseInt($("#total-percent").html()) == 100) {
    if (parseFloat($("#donation-amount").val()) > 999999) {
      alert("Vi kan inte ta emot donationer på över 999.999,99 sek, var vänlig och dela upp din donationsmängd på flera olika donationer istället")
    } else if (parseFloat($("#donation-amount").val()) < 3) {
      alert("Vi kan inte ta emot donationer på under 3 sek")
    } else {
      $("#checkout-button").hide()
      $("#stripe-payment").show()
      $("#donation-amount").prop("disabled", true)

      if (getUser() !== null) {
        curr_user = getUser();
        $("#donate-first-name").val(curr_user.first_name);
        $("#donate-last-name").val(curr_user.last_name);
        $("#donate-email").val(curr_user.email);
      }

      var orgs = [];
      for (org of JSON.parse(sessionStorage.getItem("orgs"))) {
        orgs.push({ "name": org.name, "selector_name": org.selector_name, "percent": parseInt($("#percent-" + org.selector_name).val()) });
      }

      var shoppingCart = [];
      for (org of JSON.parse(sessionStorage.getItem("orgs"))) {
        shoppingCart.push({ "name": org.name, "selector_name": org.selector_name, "percent": parseInt($("#percent-" + org.selector_name).val()), "summation": parseFloat($("#donation-amount").val()) });
      }

      //Sends the shoppingcart to get saved in the database before checkout
      if (sessionStorage.getItem("auth") !== null) {
        $.ajax({
          headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("auth")).token },
          type: "POST",
          url: HOST + "/shoppingcart",
          datatype: "JSON",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify(shoppingCart),
          success: function (data) {
            shoppingId = Number(data["data_shopping"]);
            userEmail = String(data["user_email"]);
            loadStripe(shoppingId, userEmail);
          },
          error: function () {
          }
        });
      } else {
        $.ajax({
          type: "POST",
          url: HOST + "/shoppingcart",
          datatype: "JSON",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify(shoppingCart),
          success: function (data) {
            shoppingId = Number(data["data_shopping"]);
            userEmail = "no :(";
            loadStripe(shoppingId, userEmail);
          },
          error: function () {
          }
        });
      }
    }
  }
}

function loadStripe(shoppingId, userEmail) {

  var purchase_data = {
    amount: parseFloat($("#donation-amount").val()),
    shopping_id: shoppingId,
    user_email: userEmail
  };

  fetch("/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(purchase_data)
  })
    .then(function (result) {
      return result.json();
    })
    .then(function (data) {
      var elements = stripe.elements();
      var style = {
        base: {
          color: "#37447E",
          fontFamily: "Roboto, sans-serif",
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#32325d"
          }
        },
        invalid: {
          fontFamily: "Roboto, sans-serif",
          color: "#fa755a",
          iconColor: "#fa755a"
        }
      };
      var card = elements.create("card", { style: style, hidePostalCode: true });
      // Stripe injects an iframe into the DOM
      card.mount("#card-element");

      card.on("change", function (event) {
        // Disable the Pay button if there are no card details in the Element
        document.querySelector("#submit").disabled = event.empty;
        document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
      });

      $("#payment-form").submit(function (e) {
        e.preventDefault();
        payWithCard(stripe, card, data.clientSecret);
      });
    });

  // Calls stripe.confirmCardPayment
  // If the card requires authentication Stripe shows a pop-up modal to
  // prompt the user to enter authentication details without leaving your page.
  var payWithCard = function (stripe, card, clientSecret) {
    loading(true);
    stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    })
      .then(function (result) {
        if (result.error) {
          // Show error to your customer
          showError(result.error.message);
        } else {
          // The payment succeeded!
          orderComplete();
        }
      });
  };

  // Shows a success message when the payment is complete
  var orderComplete = function () {
    loading(false);
    document.querySelector(".result-message").classList.remove("hidden");
    document.querySelector("#submit").disabled = true;

    paymentSuccessfulModal();

    emptyShoppingCart();
  };

  // Show the customer the error from Stripe if their card fails to charge
  var showError = function (errorMsgText) {
    loading(false);
    var errorMsg = document.querySelector("#card-error");
    errorMsg.textContent = errorMsgText;
    setTimeout(function () {
      errorMsg.textContent = "";
    }, 4000);
  };
  // Show a spinner on payment submission
  var loading = function (isLoading) {
    if (isLoading) {
      // Disable the button and show a spinner
      document.querySelector("#submit").disabled = true;
      document.querySelector("#spinner").classList.remove("hidden");
      document.querySelector("#button-text").classList.add("hidden");
    } else {
      document.querySelector("#submit").disabled = false;
      document.querySelector("#spinner").classList.add("hidden");
      document.querySelector("#button-text").classList.remove("hidden");
    }
  };
}

// removes and organisation from sessionStorage and the list
function removeOrg(name) {
  var currOrgs = JSON.parse(sessionStorage.getItem("orgs"));
  sessionStorage.removeItem("orgs");
  var list = [];
  for (currOrg of currOrgs) {
    if (name != currOrg.name) {
      list.push(currOrg);
    }
  }
  sessionStorage.setItem("orgs", JSON.stringify(list));
  evenOutPercent();
  setDonationCards();
  updatePie();
  updatePercentage();
}

//Needed for updatePie() doesn"t work from org-site, same functionality as removeOrg
function removeOrgSite(name) {
  var currOrgs = JSON.parse(sessionStorage.getItem("orgs"));
  sessionStorage.removeItem("orgs");
  var list = [];
  for (currOrg of currOrgs) {
    if (name != currOrg.name) {
      list.push(currOrg);
    }
  }
  sessionStorage.setItem("orgs", JSON.stringify(list));
}

// generates HTML code for the donation cards
function setDonationCards() {
  $("#donate-cards").html("");
  var orgs = JSON.parse(sessionStorage.getItem("orgs"));
  if (orgs != null && orgs != "") {
    for (org of orgs) {
      $("#donate-cards").append("<li class=\"donation-list-item\">" +
        "<div class=\"row align-items-center\">" +
        "<div class=\"logo-background col-sm-5\">" +
        "<img class=\"donate-logo\" src=\"" + org.logo + "\" alt=\"" + org.selector_name + "\">" +
        "</div>" +
        "<div class=\"col-sm-7 donation-item-settings\">" +
        "<span data-org=\"" + org.name + "\" class=\"donation-amount\" id=\"amount-" + org.selector_name + "\">" + (org.percent * parseInt($("#donation-amount").val()) / 100).toFixed(2).toString() + "</span>" +
        "<span class=\"percent-text\">SEK</span>" +
        "<input value=\"" + org.percent.toString() + "\" type=\"number\" data-org=\"" + org.name + "\" class=\"donation-percentage\" id=\"percent-" + org.selector_name + "\">" +
        "<span class=\"percent-text\">%</span>" +
        "<button class=\" remove-org btn btn-danger\" data-org=\"" + org.name + "\"><i class=\"far fa-trash-alt\"></i></button>" +
        "</div></li>");

      if (!$("#donation-amount").val()) {
        $("#amount-" + org.selector_name).empty();
        $("#amount-" + org.selector_name).append(0);
      }
      else {
        $("#amount-" + org.selector_name).empty();
        $("#amount-" + org.selector_name).append((org.percent * parseInt($("#donation-amount").val()) / 100).toFixed(2).toString());
      }
      //code below runs when percent changes
      $(document).on("keyup", "#percent-" + org.selector_name, function () {
        var keyUpOrgs = JSON.parse(sessionStorage.getItem("orgs"));
        sessionStorage.removeItem("orgs");
        keyUpOrgs.find(org => org.name == $(this).data("org")).changed = true;
        keyUpOrgs.find(org => org.name == $(this).data("org")).percent = $(this).val();
        sessionStorage.setItem("orgs", JSON.stringify(keyUpOrgs));
        evenOutPercent();
        updatePercentage();
        updatePie();
        for (org of JSON.parse(sessionStorage.getItem("orgs"))) {
          if (org.name != $(this).data("org")) {
            $("#percent-" + org.selector_name).val(org.percent);
          }
          if (!$("#donation-amount").val()) {
            $("#amount-" + org.selector_name).empty();
            $("#amount-" + org.selector_name).append(0);
          }
          else {
            $("#amount-" + org.selector_name).empty();
            $("#amount-" + org.selector_name).append((org.percent * parseInt($("#donation-amount").val()) / 100).toFixed(2).toString());
          }
        }
      });

      $("#confirm-amount-button").show();
    }
    if (orgs.length < 4) {
      $("#donate-cards-div").addClass("align-self-center");
    }
    $(".remove-org").click(function (e) {
      e.preventDefault();
      removeOrg($(this).data("org"));
    });
    $("#empty-donate-cart").click(function (e) {
      e.preventDefault();
      emptyShoppingCart();
    });
  } else {
    $("#total-donation-amount").html(
      "\<span class=\"empty-cart-span\"> Din portfölj är för nuvarande tom, starta med att lägga till <\span>" +
      "\<a class=\"site-link empty-cart-link\" data-site=\"sites/organisations.html\" href=\"#\">organisationer</a>"
    );
    $("#confirm-amount-button").hide();
    $("#donation-page").hide();
    $("#bottom-donation-page").hide();
  }
  loadSiteLinks();
}

// updates the pie chart
function updatePie() {
  am4core.ready(function () {
    /*am4core.useTheme(am4themes_dark);*/
    am4core.useTheme(am4themes_animated);

    var chart = am4core.create("chartdiv", am4charts.PieChart);

    // Add data
    chart.data = [];
    var orgs = JSON.parse(sessionStorage.getItem("orgs"));
    if (orgs == null || orgs == "") {
      $("#chartdiv").attr("style", "height: 50px;");
    } else {
      for (org of orgs) {
        chart.data.push({
          "organisation": org.name,
          "percent": (org.percent * 0.01 * parseInt($("#donation-amount").val()))
        });
      }
      // change relevant attributes
      $("#chartdiv").attr("style", "width: 100%; height: 600px;");
    }

    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "percent";
    pieSeries.dataFields.category = "organisation";
    pieSeries.slices.template.stroke = am4core.color("#f0f0ff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.text = "{value.percent.formatNumber(\"#.0\")}%";
    pieSeries.labels.template.radius = am4core.percent(-40);
    pieSeries.labels.template.fill = am4core.color("white");

    pieSeries.labels.template.adapter.add("radius", function (radius, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return 0;
      }
      return radius;
    });

    pieSeries.labels.template.adapter.add("fill", function (color, target) {
      if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        return am4core.color("#37447E");
      }
      return color;
    });

    // initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;

  });
}

// updates the percentage at the bottom of the page and in sessionStorage
function updatePercentage() {
  var orgs = JSON.parse(sessionStorage.getItem("orgs"));
  sessionStorage.removeItem("orgs");
  var percent = 0;
  if (orgs != null) {
    for (org of orgs) {
      var per = parseInt(org.percent);
      if (Number.isNaN(per) || per < 0) {
        per = 0;
      }
      percent += per;
      org.percent = per;
    }
    sessionStorage.setItem("orgs", JSON.stringify(orgs));
  }
  var percentOk = false;

  $("#total-percent").html(percent.toString());
  if (percent == 100) {
    $("#total-percent").attr("style", "background-color: lightgreen");
    percentOk = true;
  } else if (percent > 100) {
    $("#total-percent").attr("style", "background-color: lightsalmon");
    percentOk = false;
  } else {
    $("#total-percent").attr("style", "background-color: white");
    percentOk = false;
  }
  updateButton(percentOk);
}

//empty checkout
function emptyShoppingCart() {
  var orgs = JSON.parse(sessionStorage.getItem("orgs"));
  if (orgs != null) {
    for (org of orgs) {
      removeOrg(org.name);
    }
  }
  setDonationCards();
}

//activates when "kortbetalning" is pressed
function updateButton(percentOk) {
  if (parseInt($("#donation-amount").val()) > 2) {
    $("#donation-amount").attr("style", "background-color: lightgreen");
  } else {
    $("#donation-amount").attr("style", "background-color: white");
  }
  if (parseInt($("#donation-amount").val()) > 2 && percentOk) {
    $("#checkout-button").attr("disabled", false);
    $("#fill-for-payment").hide();
  } else {
    $("#checkout-button").attr("disabled", true);
    $("#fill-for-payment").show();
  }
}

//functionality for payment success modal
function paymentSuccessfulModal() {
  $("#payment-successful-modal").modal("show");
  $("#successful-donation-list").empty();
  for (org of JSON.parse(sessionStorage.getItem("orgs"))) {
    $("#successful-donation-list").append("<li class=\"d-flex\">" +
      "<div class=\"mr-auto\">" + org.name + "</div>" +
      "<div>" + (org.percent * parseInt($("#donation-amount").val()) / 100).toFixed(2).toString() +
      " kr</div></div></li>");
  }
  $("#receipt-amount").html($("#donation-amount").val() + " kr");

  $("#receipt-buttons").empty();
  if (getUser() == null) {
    $("#receipt-buttons").append("<button type=\"button\" class=\"btn btn-secondary login-link\" data-toggle=\"modal\"data-target=\"#loginModal\">Logga in</button>" +
      "<button type=\"button\" class=\"btn btn-secondary register-link site-link\" data-site=\"sites/register.html\" data-dismiss=\"modal\">Registrera dig</button>");
    $(".login-link").click(function (e) {
      e.preventDefault();
      $("#payment-successful-modal").modal("toggle");
      showLogin();
    });
  } else {
    $("#receipt-buttons").append("<button type=\"button\" class=\"btn btn-secondary account-link site-link\" data-site=\"sites/account.html\" data-dismiss=\"modal\">Gå till ditt konto</button>");
  }
  loadSiteLinks();
}

//Is not used
function cryptoModal() {
  if (!opened_once) {
    $("#cryptoModal").modal();
    opened_once = true;
  }
}

function activateDonate(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#dropdown-menu-link").addClass("site-active");
  link("sites/donation.html", addToHistoryStack).then(function () {
    $("#chartdiv").attr("style", "width: 100%; height: 0px;");
    $("#checkout-button").click(function (e) {
      e.preventDefault();
      goToPayment();
      document.getElementById("bottom-donation-page").scrollIntoView({ behavior: "smooth" });
    });
    $("#confirm-amount-button").click(function (e) {
      e.preventDefault();
      updatePercentage();
      updatePie();
      document.getElementById("donation-page").scrollIntoView({ behavior: "smooth", block: "start", inline: "start"});
      if (!$("#donation-amount").val()) {
        for (org of JSON.parse(sessionStorage.getItem("orgs"))) {
          $("#amount-" + org.selector_name).empty();
          $("#amount-" + org.selector_name).append(0);
        }
      }
      else {
        for (org of JSON.parse(sessionStorage.getItem("orgs"))) {
          $("#amount-" + org.selector_name).empty();
          $("#amount-" + org.selector_name).append((org.percent * parseInt($("#donation-amount").val()) / 100).toFixed(2).toString());
        }
      }
    });
    setDonationCards();
    updatePercentage();
  });
}