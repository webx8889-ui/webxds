(function () {
  "use strict";

  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");
  var question = document.getElementById("chatQuestion");
  var suggestions = document.querySelectorAll("[data-answer]");
  var close = document.querySelector(".ai-chatbot__close");

  function continueChat(answer) {
    var value = String(answer || input.value).trim();
    if (!value) { input.focus(); return; }
    input.value = value;
    question.textContent = "Great choice. Tell us a little more about what you have in mind.";
    document.querySelector(".ai-chatbot__suggestions").hidden = true;
    input.placeholder = "Share your project idea...";
    input.value = "";
    input.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    continueChat();
  });

  suggestions.forEach(function (button) {
    button.addEventListener("click", function () { continueChat(button.dataset.answer); });
  });

  close.addEventListener("click", function () {
    if (window.history.length > 1) { window.history.back(); } else { window.location.assign("/"); }
  });
}());
