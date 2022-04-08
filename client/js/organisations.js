var organisations = [];
var orgExpanded = [];
var activeCategories = [];
var pageNumber = 1;


/*      
 *      
 *      Functions for handling organisations      
 * 
 * */

// Adds org to cart/portfolio
async function addOrg(id) {
  await $.ajax({
    url: HOST + "/organisation/" + id,
    type: "GET",
    success: function (res) {
      var org = res;

      var currOrgs = JSON.parse(sessionStorage.getItem("orgs"));
      sessionStorage.removeItem("orgs");
      //$("#donateButton" + org.organisation_id).prop("disabled", true);
      $("#donateButton" + org.organisation_id).hide();
      $("#removeButton" + org.organisation_id).show();
      var list = [];
      if (currOrgs != null) {
        for (currOrg of currOrgs) {
          if (org.name != currOrg.name) {
            list.push(currOrg);
          }
        }
      }
      list.push({"organisation_id": org.organisation_id, "name": org.name, "selector_name": org.selector_name, "logo": org.logo, "percent": 0, "changed": false });
      sessionStorage.setItem("orgs", JSON.stringify(list));
      evenOutPercent();
    }, 
    error: function () {
      alert("Nu gick det fel");
    }
  });
}

// Sets up the edit org modal
function editOrg(id) {
  var org = organisations.find(function (org) { return org.organisation_id == id });
  $("#edit-org-modal").modal("show");
  $(".modal-header #edit-org-id").val(id);
  $(".modal-body #change-name").val(org.name);
  $(".modal-body #change-url").val(org.url);
  $(".modal-body #change-logo").val(org.logo);
  $(".modal-body #change-short-info").val(org.short_info);
  $(".modal-body #change-long-info").val(org.long_info);
  $(".radio-input").each(function () {
    $(this).attr("checked", org.category == $(this).val());
  });

  $("#save-org-change").click(function (e) {
    e.preventDefault();
    updateOrg();
  });
}

// Updates the organisation information when edit modal closes
function updateOrg() {
  var rbs = document.querySelectorAll("input[name=\"category\"]");
  for (const rb of rbs) {
    if (rb.checked) {
      selectedValue = rb.value;
      break;
    }
  }
  var data;
  data = {
    id: parseInt($("#edit-org-id").val()),
    changeName: $("#change-name").val(),
    orgSelectorName: $("#change-name").val().replace(" ", "-"),
    orgLogo: $("#change-logo").val(),
    orgInfoShort: $("#change-short-info").val(),
    orgInfoLong: $("#change-long-info").val(),
    orgUrl: $("#change-url").val(),
    category: selectedValue
  };
  $.ajax({
    url: HOST + "/organisation/" + data.id.toString(),
    type: "PUT",
    data: JSON.stringify(data),
    headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("auth")).token },
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (org) {
      $("#edit-org-modal").modal("hide");
      sitesMap["sites/organisations.html"]();
      return org;
    }
  });
}
//adds info at the top of the page
function loadOrgInstruction() {
  $("#close-org-instructions").click(function (e) {
    e.preventDefault();
    $("#org-instructions").fadeOut();
  });
  loadSiteLinks();
}


// Deactivates an organisation so it doesn"t show up in the organisation list
function deactivate(id) {
  $.ajax({
    url: HOST + "/organisation/" + id.toString(),
    type: "DELETE",
    // data: JSON.stringify(data),  
    headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("auth")).token },
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (org) {
      loadOrgs();
      return org;
    }
  });
}

/*      
 *      
 *      Functions for setting up the organisation cards     
 * 
 * */

// Creates HTML code for one org card
function createCard(index, org) {
  return "<div class=\"card card-background\" id=\"card" + org.organisation_id + "\">" +
    "<div class=\"card-body\">" +
    "<div class=\"row\">" +
    "<div class=\"col-sm-4 card-image-div\">" +
    "<img alt=\"" + org.name + "\" class=\"card-image\" src=\"" + org.logo + "\">" +
    "</div>" +
    "<div class=\"col-sm-5 card-text-org\">" +
    "<h4 class=\"card-header\">" + org.name + "</h4>" +
    "<p class=\"card-short-info\" id=\"shortInfo" + org.organisation_id + "\">" + org.short_info + "</p>" +
    "</div>" +
    "<div class=\"col-sm-3 card-buttons-div\">" +
    "<button class=\"btn btn-default collapsed collapse-button\" id=\"" + index + "-btn\" type=\"button\" data-index=\"" + index + "\" data-toggle=\"collapse\" data-target=\"#collapse" +
    org.organisation_id + "\" aria-expanded=\"false\" aria-controls=\"collapse" + org.organisation_id + "\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Se mer info om organisationen\">" +
    "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"arrow-down\" id=\"" + index +
    "-down\" width=\"25\" height=\"25\" fill=\"currentColor\" class=\"bi bi-caret-down-fill\" viewBox=\"0 0 16 16\">" +
    "<path d=\"M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\"/></svg>" +
    "<svg xmlns=\"http://www.w3.org/2000/svg\" style=\"display: none\" class=\"arrow-up\" id=\"" + index +
    "-up\" width=\"25\" height=\"25\" fill=\"currentColor\" class=\"bi bi-caret-up-fill\" viewBox=\"0 0 16 16\">" +
    "<path d=\"m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z\"/>" +
    "</svg>" +
    "</button>" +
    "<button type=\"button\" data-org=\"" + org.organisation_id.toString() + "\" id=\"donateButton" + org.organisation_id.toString() +
    "\" class=\"btn btn-default donate-to\">Lägg till i portfölj</button>" +
    "<button type=\"button\" data-name=\"" + org.name + "\" data-org=\"" + org.organisation_id.toString() + "\" id=\"removeButton" + org.organisation_id.toString() +
    "\" class=\"btn btn-danger remove-button\" style=\"display: none\">Ta bort från portfölj</button>" +
   
    "</div>" +
    "</div>" +
    "</div>" +
    "<div class=\"collapse\" id=\"collapse" + org.organisation_id + "\" data-parent=\"#org-accordion\">" +
    "<div class=\"row\">" +
    "<div class=\"col-sm-4\">" +
    "<a class=\"card-url\" href= \"" + org.url + "\" target=\"_blank\"><i class=\"fas fa-external-link-alt\"></i> Ta dig till " + org.name + "s hemsida </a>" +
    "</div>" +
    "<div class=\"col-sm-5 card-long-info\">" +
    "<p class=\"card-title\" id=\"longInfo" + org.organisation_id + "\">" + org.long_info + "</p>" +
    "<button type=\"button\" data-org=\"" + org.organisation_id.toString() + "\" id=\"edit-button" + org.organisation_id.toString() + "\" class=\"btn btn-default edit-org\">Redigera</button>" +
    "<button type=\"button\" data-org=\"" + org.organisation_id.toString() + "\" id=\"deactivate-button" + org.organisation_id.toString() + "\" class=\"btn btn-default deactivate-org\">Ta bort</button>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";
}

// Adds all information to organisations page
function setOrgs() {
  $("#org-list").empty();
  for ([index, org] of organisations.entries()) {
    orgExpanded[index] = false;
    $("#org-list").append(createCard(index, org));
    if (getUser() == null || !getUser().is_admin) {
      $("#edit-button" + org.organisation_id).hide();
      $("#deactivate-button" + org.organisation_id).hide();
    }
  }
  $(".donate-to").click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    addOrg($(this).data("org")).then(function () {
      dropdownCurrentCart();
    });
    if ($(".dropdown").find(".dropdown-menu-lg-right").is(":hidden")) {
        $(".dropdown-toggle").dropdown("toggle");
    }
  });
  $(".remove-button").click(function (e) {
    toggleOrgBtn($(this));
  });
  $(".collapse-button").click(function (e) {
    arrow($(this));
  });
  $(".edit-org").click(function (e) {
    e.preventDefault();
    editOrg($(this).data("org"));
  });
  $(".deactivate-org").click(function (e) {
    e.preventDefault();
    deactivate($(this).data("org"));
  });
  disableButtons();
}

// Loads 10 organisations from the chosen categories from server
function loadOrgs() {
  $("#org-list").html("<div class=\"loader\"></div>");
  $.ajax({
    url: "./organisation/page/" + pageNumber.toString(),
    data: JSON.stringify({ category: activeCategories }),
    contentType: "application/json",
    type: "POST",
    success: function (response) {
      $(".pagination").empty();
      for (var i = 1; i <= response.total_amount / 10 + 1; i++) {
        if (i == pageNumber) {
          $(".pagination").append("<li class=\"page-item active\"><a class=\"page-link\" data-page=\"" + i.toString() + "\" href=\"#\">" + i + "</a></li>");
        } else {
          $(".pagination").append("<li class=\"page-item\"><a class=\"page-link\" data-page=\"" + i.toString() + "\" href=\"#\">" + i + "</a></li>");
        }
      }
      organisations = response.orgs;
      setOrgs();
    }
  }).then(function () {
    $(".page-link").click(function (e) {
      e.preventDefault();
      if (pageNumber != parseInt($(this).data("page"))) {
        pageNumber = parseInt($(this).data("page"));
        loadOrgs();
        window.scrollTo(0, 0);
      }
    })
  });
}

/*
 * 
 *      Functions for loading filters
 * 
 * */

// Fixes filter when every filter is unchecked
function checkFilter() {
  var checked = [];
  var i = 0;
  $(".filter-checkbox").each(function () {
    checked[i] = this.checked;
    i++
  });

  if (checked.every(elem => elem == false)) {
    $("#all-org").show();
    $("#show-all").removeClass("show-all-filters");
    $("#show-all").addClass("show-all-filters-active");
  }
}

function filters(categories) {
  // Sets up ordering and information for the filters
  $("#filter-div").empty();
  $("#current-filter-div").html("<span id=\"all-org\">Alla organisationer</span>");
  categories.sort(function (a, b) { return a.amount < b.amount });
  for ([index, category] of categories.entries()) {
    $("#filter-div").append("<div class=\"form-check filter-order\">" +
      "<input class=\"form-check-input filter-checkbox\" type=\"checkbox\" id=\"filter" + category.index + "\"/>" +
      "<label class=\"form-check-label filter-label\" for=\"filter" + category.index + "\" id=\"filter" + category.index + "-label\">" + category.name + " (" + category.amount + ")</label>" +
      "</div>"
    );
    $("#current-filter-div").append("<span id=\"filter" + category.index + "-span\" class=\"active-filter\">" + category.name + "</span>");
  }
  $("#filter-div").append("<button id=\"show-all\" class=\"show-all-filters-active\">Visa alla</button>");

  // Changes active categories for loading organisations
  $(".filter-checkbox").click(function (e) {
    var id = parseInt($(this).attr("id")[6]);
    if (activeCategories.every(bo => bo)) {
      activeCategories = [false, false, false, false, false, false];
      activeCategories[id - 1] = !activeCategories[id - 1];
    } else {
      activeCategories[id - 1] = !activeCategories[id - 1];
      if (activeCategories.every(bo => !bo)) {
        activeCategories = [true, true, true, true, true, true];
      }
    }
    pageNumber = 1;
    loadOrgs();
  });

  // Filter button functionality
  $(".filter-checkbox").change(function () {
    var numericalId = this.id.match(/\d+/)[0]
    var checked = document.querySelectorAll("input:checked");
    for (org of organisations) {
      if (this.checked == true && org.category == numericalId) {
        $("#card" + org.organisation_id).show();
      } else if ($("#filter" + org.category)[0].checked) {
        $("#card" + org.organisation_id).show();
      } else if (checked.length == 0) {
        $("#card" + org.organisation_id).show();
      } else {
        $("#card" + org.organisation_id).hide();
      }
    }
  });

  $(".filter-checkbox").change(function () {
    var id = $(this).attr("id");
    if (this.checked) {
      $("#" + id + "-label").addClass("filter-label-active");
      $("#" + id + "-label").removeClass("filter-label");
      $("#all-org").hide();
      $("#" + id + "-span").show();
      $("#show-all").removeClass("show-all-filters-active");
      $("#show-all").addClass("show-all-filters");
    } else {
      $("#" + id + "-label").addClass("filter-label");
      $("#" + id + "-label").removeClass("filter-label-active");
      $("#" + id + "-span").hide();
      checkFilter();
    }
  });

  // Removes all filters
  $("#show-all").click(function () {
    activeCategories = [true, true, true, true, true, true];
    $("#all-org").show();
    $("#show-all").removeClass("show-all-filters");
    $("#show-all").addClass("show-all-filters-active");

    $(".filter-checkbox").each(function () {
      this.checked = false;
      var id = $(this).attr("id");
      $("#" + id + "-label").addClass("filter-label");
      $("#" + id + "-label").removeClass("filter-label-active");
      $("#" + id + "-span").hide();

      var numericalId = this.id.match(/\d+/)[0]
      var checked = document.querySelectorAll("input:checked");
      for (org of organisations) {
        if (this.checked == true && org.category == numericalId) {
          $("#card" + org.organisation_id).show();
        } else if ($("#filter" + org.category)[0].checked) {
          $("#card" + org.organisation_id).show();
        } else if (checked.length == 0) {
          $("#card" + org.organisation_id).show();
        } else {
          $("#card" + org.organisation_id).hide();
        }
      }
    });
    pageNumber = 1;
    loadOrgs();
  });
}

// Load information about category occurrence
function loadOrgInfo() {
  $.ajax({
    url: "./organisation",
    type: "GET",
    success: function (response) {
      var categories = response.categories;
      filters(categories);
    }
  });
}

/*
 * 
 *      Utility functions
 * 
 * */

function evenOutPercent() {
  var orgs = JSON.parse(sessionStorage.getItem("orgs"));
  if (orgs != null && orgs != "" && orgs.some((org) => !org.changed)) {
    sessionStorage.removeItem("orgs");
    var totalPercent = 0;
    var remainingPercent = 100;
    var remainingOrgs = orgs.length;
    var list = [];
    for (org of orgs) {
      if (org.changed) {
        remainingPercent -= org.percent;
        remainingOrgs--;
      }
    }
    for (org of orgs) {
      if (!org.changed) {
        org.percent = Math.round(remainingPercent / remainingOrgs);
        totalPercent += org.percent;
      }
      list.push(org);
    }
    var org = list.find((org) => !org.changed);
    org.percent = remainingPercent - totalPercent + Math.round(remainingPercent / remainingOrgs);
    sessionStorage.setItem("orgs", JSON.stringify(list));
  }
}

// Add to portfolio button
function toggleOrgBtn(selectedBtn) {
  var id = $(selectedBtn).data("org");
  $("#removeButton" + id).hide();
  $("#donateButton" + id).show();
  removeOrgSite($(selectedBtn).data("name"));
}

// Function for open/close button
function arrow(button) {
  setTimeout(function () {
    var i = parseInt(button.data("index"));

    if (orgExpanded[i]) {
      $(".arrow-up").hide();
      $(".arrow-down").show();
      $("#" + i + "-up").hide();
      $("#" + i + "-down").show();
      orgExpanded[i] = false;
    } else {
      $(".arrow-up").hide();
      $(".arrow-down").show();
      $("#" + i + "-down").hide();
      $("#" + i + "-up").show();
      orgExpanded[i] = true;
      for (j = 0; j < orgExpanded.length; j++) {
        if (j != i) {
          orgExpanded[j] = false;
        }
      }
    }
  }, 200);
}

//This function waits 0,01 seconds to execute, might be better to solve it with a promise or await instead, but it is working properly in it"s current implementation visually.
function disableButtons() {
  var disabledOrgs = JSON.parse(sessionStorage.getItem("orgs"));
  if (disabledOrgs != null) {
    for (org of organisations) {
      for (let step = 0; step < disabledOrgs.length; step++) {
        if (org.name.valueOf() === disabledOrgs[step].name.valueOf()) {
          $("#donateButton" + org.organisation_id).hide();
          $("#removeButton" + org.organisation_id).show();
        }
      }
    }
  }
}

// Functionality for the scroll-to-the-top-button
function scrollButton() {
  $("#scroll-button").hide();
  $(window).scroll(function () {
    if ($(this).scrollTop() > 20) {
      $("#scroll-button").fadeIn();
    } else {
      $("#scroll-button").fadeOut();
    }
  });

  $("#scroll-button").click(function () {
    $("html, body").animate({
      scrollTop: 0
    }, 1000);
    return false;
  });
}

/*
 * 
 *      Sets up the organisation page
 * 
 * */
function activateOrgs(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#org-link").addClass("site-active");
  $("#org-footer-link").addClass("site-active");
  pageNumber = 1;
  activeCategories = [true, true, true, true, true, true];
  link("sites/organisations.html", addToHistoryStack).then(function () {
    loadOrgInfo();
    loadOrgs();
    scrollButton();
    loadOrgInstruction();
    loadSiteLinks();
  });
}