var recs = [];

// The class for the receipt card. It is responsible for expanding ifself and to generate HTML code for itself
class ReceiptCard {
  constructor(index, json) {
    this.index = index;
    this.time = json.time;
    this.cost = json.cost;
    this.orgs = json.orgs;
    this.expanded = false;
  }

  // Changes its state
  switchExpanded() {
    // If this expands, any other expanded card must close
    if (!this.expanded) {
      // Closes the expanded card if such exists
      for (rec of recs) {
        rec.close();
      }
    }
    this.expanded = !this.expanded;
    this.print();
  }

  // Closes card if expanded
  close() {
    if (this.expanded) {
      this.expanded = false;
      this.print();
    }
  }

  getOrgs() {
    return this.orgs;
  }

  // Generates HTML code and inserts it at the relevant id
  print() {
    var text = "<div class=\"row\"><div class=\"col-sm-4\">" +
      "<p><b>Vilka organisationer gav du till?</b></p>";
    var donationDate = "<p><b>Donationsdatum:</b></p>" +
      "<p>" + this.time.split(" ")[3] + "-" + this.time.split(" ")[2] + "-" + this.time.split(" ")[1] + "</p>";
    var donationAmount = "<p><b>Donationsmängd:</b></p>" +
      "<p>" + this.cost + " kr</p>";

    // Different HTML code if expanded or not
    if (this.expanded) {
      for (var org of this.orgs) {
        text += "<p>" + org.name + "</p>";
      }
      text += "</div>" +
        "<div class=\"col-sm-4\" id=\"chartdiv\"></div>" +
        "<div class=\"col-sm-4\">" +
        "<div class=\"right-align-receipt expand-right-align-receipt\">" +
        "<div class=\"row\">" +
        "<div class=\"col-sm-10\">" +
        donationDate +
        donationAmount +
        "</div>" +
        "<div class=\"col-sm-2\">" +
        "<i class=\"fas fa-sort-up arrow-button\" data-rec=\"" + this.index + "\" id=\"open-receipt-" + this.index + "\"></i>" +
        "</div></div></div>";
    } else {
      text += "<p>" + this.orgs[0].name;
      if (this.orgs.length > 1) {
        text += " + " + (this.orgs.length - 1).toString();
      }
      text += "</p>" +
        "</div>" +
        "<div class=\"col-sm-8\">" +
        "<div class=\"right-align-receipt small-right-align-receipt\">" +
        "<div class=\"row\">" +
        "<div class=\"col-sm-5\">" +
        donationDate +
        "</div>" +
        "<div class=\"col-sm-5\">" +
        donationAmount +
        "</div>" +
        "<div class=\"col-sm-2\">" +
        "<i class=\"fas fa-sort-down arrow-button\" data-rec=\"" + this.index + "\" id=\"open-receipt-" + this.index + "\"></i></div>" +
        "</div></div></div>";
    }
    $("#receipt-" + this.index).html(text);

    // Operates the open/close button
    $("#open-receipt-" + this.index).click(function (e) {
      e.preventDefault();
      recs[parseInt($(this).data("rec"))].switchExpanded();
    });
    if (this.expanded) {
      this.updatePie(this.index, this.cost);
    }
  }

  // Updates the pie chart with the orgs from the given id
  updatePie(id, cost) {
    am4core.ready(function () {
      am4core.useTheme(am4themes_dark);
      am4core.useTheme(am4themes_animated);

      var chart = am4core.create("chartdiv", am4charts.PieChart);

      // Add data
      chart.data = [];
      var orgs = recs[id].getOrgs();
      for (var org of orgs) {
        chart.data.push({
          "organisation": org.name,
          "percent": org.percent * cost
        });
      }

      // Changes relevant attributes
      $("#chartdiv").attr("style", "width: 30%;");

      var pieSeries = chart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = "percent";
      pieSeries.dataFields.category = "organisation";
      pieSeries.slices.template.stroke = am4core.color("#fff");
      pieSeries.slices.template.strokeWidth = 2;
      pieSeries.slices.template.strokeOpacity = 1;

      // Initial animation
      pieSeries.hiddenState.properties.opacity = 1;
      pieSeries.hiddenState.properties.endAngle = -90;
      pieSeries.hiddenState.properties.startAngle = -90;

    });
  }
}


// sets information about the logged in user in the account HTML file
function setAccountAttributes() {
  var user = getUser();
  $("#account-name").html(user.first_name + " " + user.last_name);
  $("#account-email").html(user.email);
  $("#profile-pic").attr("src", user.picture);
}


// loads account information and stores it in sessionStorage
async function loadAccount() {
  var user = getCurrentUser().user;
  await $.ajax({
    url: HOST + "/user/" + user.email,
    type: "GET",
    dataType: "json",
    headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("auth")).token },
    success: function (response) {
      user = getCurrentUser();
      user.user = response;
      sessionStorage.setItem("auth", JSON.stringify(user));
      setAccountAttributes();
    },
    error: function (response) {
      alert("Nu gick det fel");
    }
  });
}


// sets information about receipts in html element
function setReceipts(receipts) {
  var index = 0;
  recs = [];
  $("#list-receipts").html("");
  for (rec of receipts) {
    $("#list-receipts").append("<li class=\"receipt-card\" id=\"receipt-" + index.toString() + "\"></li>");
    var receipt = new ReceiptCard(index, rec);
    receipt.print();
    recs.push(receipt);
    index++;
  }
}

// loads receipts from server as json {time, cost, orgs: [{name, percent}]}
function loadReceipts() {
  var user = getCurrentUser().user;
  $.ajax({
    url: HOST + "/user/" + user.email + "/receipts",
    type: "GET",
    dataType: "json",
    headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("auth")).token },
    success: function (response) {
      if (response.length != 0) {
        setReceipts(response);
      } else {
        $("#list-receipts").html(
          "\<span id=\"empty-receipts\">Du har inte genomfört någon donation än, starta med att lägga till </span>" +
          "\<a class=\"site-link\" data-site=\"sites/organisations.html\" id=\"empty-receipt-link\" href=\"#\">organisationer</a>"
        );
        loadSiteLinks();
      }
    },
    error: function (response) {
      alert("Nu gick det fel");
    }
  });
}
//change account info like name, profile picture etc.
function changeInfo() {
  $("#first-name-message2").empty();
  $("#last-name-message2").empty();
  $("#current-password-message2").empty();
  var correctChange = true;
  if ($("#change-first-name").val() == "") {
    $("#first-name-message2").html("Skriv in ett förnamn!");
    correctChange = false;
  }
  if ($("#change-last-name").val() == "") {
    $("#last-name-message2").html("Skriv in ett efternamn!");
    correctChange = false;
  }

  if (correctChange) {
    var data = {
      first_name: $("#change-first-name").val(), 
      last_name: $("#change-last-name").val(),
      password: $("#current-password2").val()
    };
    if ($("#change-picture").val() != "") {
      data.picture = $("#change-picture").val();
    }
    $.ajax({
      url: HOST + "/user/" + getUser().email,
      type: "PUT",
      data: JSON.stringify(data),
      headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("auth")).token },
      contentType: "application/json",
      dataType: "json",
      complete: function (xhr, textStatus) {
        if (xhr.status == 200) {
          loadAccount();
          $("#info-modal").modal("hide");
        }
        else if (xhr.status == 401) {
          $("#current-password-message2").html("Felaktigt lösenord");
        }
        else {
          console.log("unknown error")
        }
      },
    });
  }
}

//Removes error-messades from "Ändra lösenord"-modal
function removeErrorMessages1() {
  $("#current-password").val("");
  $("#input-password-change1").val("");
  $("#input-password-change2").val("");
  $("#current-password-message").empty();
  $("#password-message1").empty();
  $("#password-message2").empty();
}

//Removes error-message from "Ändra uppgifter"-modal
function removeErrorMessages2() {
  $("#current-password2").val("");
  $("#first-name-message2").empty();
  $("#last-name-message2").empty();
  $("#current-password-message2").empty();
}

//Checks that the new passwords is valid
function changePassword() {
  $("#current-password-message").empty();
  $("#password-message1").empty();
  $("#password-message2").empty();

  var changeBoolean = true;
  var password1 = $("#input-password-change1").val();
  var password2 = $("#input-password-change2").val();

  if (password1.length < 6) {
    $("#password-message1").html("Lösenordet måste vara minst 6 tecken!");
    changeBoolean = false;
  }
  if (password1 != password2) {
    $("#password-message2").html("De nya lösenorden matchar inte!");
    changeBoolean = false;
  }
  if (changeBoolean) {
    registerChange();
  }
}

//Changes the password
function registerChange() {
  email = getCurrentUser().user.email;
  $.ajax({
    url: HOST + "/user/" + email + "/changepass",
    type: "PUT",
    data: JSON.stringify({
      password: $("#input-password-change1").val(),
      currentPassword: $("#current-password").val()
    }),
    headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("auth")).token },
    contentType: "application/json",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        $("#password-modal").modal("hide")

      } else {
        $("#current-password-message").html("Felaktigt lösenord");
      }
    }
  });
}

//loads organisations in current shoppingcart
function loadCurrentCart() {
  var orgs = JSON.parse(sessionStorage.getItem("orgs"));
  if (orgs == "" || orgs == null) {
    $("#current-cart").hide();
  } else {
    var index = 0;
    for (org of orgs) {
      if (index % 2 == 0) {
        $("#first-org-col").append("<p>" + org.name + "</p>");
      } else {
        $("#second-org-col").append("<p>" + org.name + "</p>");
      }
      index++;
    }
    $("#close-current-cart").click(function (e) {
      e.preventDefault();
      $("#current-cart").fadeOut();
    });
    loadSiteLinks();
  }
}

//loads the site and its links
function activateAccount(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#account-link").addClass("site-active");
  link("sites/account.html", addToHistoryStack).then(function () {
    loadCurrentCart();
    loadAccount().then(function () {
      loadReceipts();
      $("#open-info-modal").click(function (e) {
        e.preventDefault();
        $("#info-modal").modal("show");
        $("#info-modal").keypress(function (e) {
          if ($("#info-modal").hasClass("show") && (e.keycode == 13 || e.which == 13)) {
            $("#confirm-info-change").click();
          }
        });
        $("#current-profile-picture").attr("src", getUser().picture);
        $("#change-picture").empty();
        $("#change-first-name").val(getUser().first_name);
        $("#change-last-name").val(getUser().last_name);
      });
      $("#confirm-info-change").click(function (e) {
        e.preventDefault();
        changeInfo();
      });
      $("#open-password-modal").click(function (e) {
        e.preventDefault();
        $("#password-modal").modal("show");
        $("#password-modal").keypress(function (e) {
          if ($("#password-modal").hasClass("show") && (e.keycode == 13 || e.which == 13)) {
            $("#confirm-password-change").click();
          }
        });
      });
      $("#confirm-password-change").click(function (e) {
        e.preventDefault();
        changePassword();
      });
    });
  });
}
