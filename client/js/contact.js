//Formspree API, do not touch!
async function handleSubmit(event) {
  var data = new FormData(event.target);
  fetch(event.target.action, {
    method: form.method,
    body: data,
    headers: {
      "Accept": "application/json"
    }
  }).then(response => {
    $("#contact-form-status").html("Tack för ditt meddelande! Vi hör av oss så fort vi kan!");
    form.reset();
  }).catch(error => {
    $("#contact-form-status").html("Meddelande skickades inte, något gick tokigt :(");
  });
}
//Automatic fill of contact info in the contact form if already logged in
function fillFields() {
  if (getCurrentUser() != null) {
    var user = getCurrentUser().user;
    $("#contact-name").val(user.first_name + " " + user.last_name);
    $("#contact-email").val(user.email);
  }
}
//Sitemap-code
function activateContact(addToHistoryStack = true) {
  $(".site-active").removeClass("site-active");
  $("#contact-footer").addClass("site-active");
  link("sites/contact.html", addToHistoryStack).then(function () {
    fillFields();
    $("contact-form").submit(function (e) {
      e.preventDefault();
      handleSubmit(e);
    })
  });
}