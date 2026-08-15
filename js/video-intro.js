document.addEventListener('DOMContentLoaded', function () {
  var card = document.querySelector('[data-inline-video]');
  var video = card && card.querySelector('.intro-inline-video');
  var playButton = card && card.querySelector('.intro-video-play-button');
  if (card && video && playButton) {
    playButton.addEventListener('click', function () {
      card.classList.add('is-playing');
      video.play().catch(function () { card.classList.remove('is-playing'); });
    });
  }
  document.querySelectorAll('.footer-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.closest('.footer-section-block');
      if (!group) return;
      var open = group.classList.toggle('active');
      button.setAttribute('aria-expanded', String(open));
    });
  });
});
