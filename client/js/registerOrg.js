function registerOrg() {
  var rbs = document.querySelectorAll("input[name=\"category\"]");
  for (const rb of rbs) {
    if (rb.checked) {
      selectedValue = rb.value;
      break;
    }
  }


  $.ajax({
    url: HOST + "/organisation",
    type: "POST",
    data: JSON.stringify({ orgName: $("#org-name").val(), orgSelectorName: $("#org-name").val().replace(" ", "-"), orgLogo: $("#org-logo").val(), orgInfoShort: $("#org-info-short").val(), orgInfoLong: $("#org-info-long").val(), orgUrl: $("#org-url").val(), category: selectedValue }),
    contentType: "application/json",
    success: function (response) {
      if (response.succ) {
        sitesMap["sites/organisations.html"]();
      } else {
        alert("Organisationen finns redan registrerad");
      }
    }
  });
}

function activateRegisterOrg(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#register-org-link").addClass("site-active");
  link("sites/registerOrg.html", addToHistoryStack).then(function() {
    $("#register-org-submit").click(function (e) {
      e.preventDefault();
      registerOrg();
    });
  });

  
}