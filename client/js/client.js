const HOST = "http://localHOST:5006";
var stripe = Stripe("pk_test_51IVAyLKv6YL9a0jeQ4LiitvScbcl0UMfRrLaOMOY0SKVk2vhlkFA5ge2UYGOWGUSqm6p1TcQXDDBQFWJc3rUEsuq00Iw1lsn6t");
var sitesMap = new Map();

// retrieves information about the user from sessionStorage (shorter to write)
function getUser() {
  if (sessionStorage.getItem("auth") != null) {
    return JSON.parse(sessionStorage.getItem("auth")).user;
  } else {
    return null;
  }
}

// link changes the current page to the data from doc (html-document) 
// if history then the page is added to the history (back button functionality)
async function link(from, history = true, to = "main-container") {
  await fetch(from).then(response => {
    return response.arrayBuffer();
  }).then(buffer => {
    //let decoder = new TextDecoder("iso-8859-1");
    let decoder = new TextDecoder("utf-8");
    let text = decoder.decode(buffer);
    $("#" + to).html(text);
    window.scrollTo(0, 0);
    if (history) {
      // adds information about the page to the history stack
      window.history.pushState({ page: from }, "", "");
    }
  });
}

// activates functionality of any site-link
function loadSiteLinks() {
  $(".site-link").unbind("click");
  $(".site-link").click(function (e) {
    e.preventDefault();
    sitesMap[$(this).data("site")]();
  });
}

// generates content in sitesMap
function loadMap() {
  // the key "sites/about.html" has the function as the value so the
  // function can be called with the map and the key
  sitesMap["sites/about.html"] =          (a = true) => activateAbout(a);
  sitesMap["sites/account.html"] =        (a = true) => activateAccount(a);
  sitesMap["sites/contact.html"] =        (a = true) => activateContact(a);
  sitesMap["sites/donation.html"] =       (a = true) => activateDonate(a);
  sitesMap["sites/faq.html"] =            (a = true) => activateFaq(a);
  sitesMap["sites/home.html"] =           (a = true) => activateHome(a);
  sitesMap["sites/organisations.html"] =  (a = true) => activateOrgs(a);
  sitesMap["sites/register.html"] =       (a = true) => activateRegister(a);
  sitesMap["sites/registerOrg.html"] =    (a = true) => activateRegisterOrg(a);
  sitesMap["sites/portfolio.html"] =      (a = true) => activatePortfolio(a);
}

$(document).ready(function () {
  loadMap();
  // onpopstate activates when the back button is pressed
  window.onpopstate = function (e) {
    if (e.state != null) {
      // false because the page go to should not be added to
      // the history as it"s already there
      sitesMap[e.state.page](false);
    }
  };
  link("header.html", false, "header").then(function () {
    activateHeader();
    sitesMap["sites/home.html"]();
    link("footer.html", false, "footer").then(function () {
      loadSiteLinks();
      loadHeaderLinks();
    });
  });
});
