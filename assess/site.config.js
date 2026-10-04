// The ONE place the product name and contact address live.
// Renaming the product = change `name` here. Nothing else.
window.SITE = {
  name: "Assess",
  // TODO: placeholder — replace with the real team address.
  email: "hello@example.com",
};

// Fill every [data-name] / [data-email] / [data-mailto] element from SITE.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-name]").forEach(function (el) { el.textContent = SITE.name; });
  document.querySelectorAll("[data-email]").forEach(function (el) { el.textContent = SITE.email; });
  document.querySelectorAll("[data-mailto]").forEach(function (el) {
    el.href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent("Hello, " + SITE.name);
  });
  document.title = document.title.replace("{name}", SITE.name);
});
