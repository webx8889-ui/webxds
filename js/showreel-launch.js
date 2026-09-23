(function () {
  var destination = '/video-intro.html?from=showreel';
  var isLaunching = false;

  function launchShowreel() {
    if (isLaunching) return;
    isLaunching = true;
    window.location.assign(destination);
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('#heroMockup, #homeShowreelPlay, #playPauseBtn');
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    launchShowreel();
  }, true);

  document.addEventListener('keydown', function (event) {
    var trigger = event.target.closest && event.target.closest('#playPauseBtn');
    if (!trigger || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    launchShowreel();
  }, true);
}());
