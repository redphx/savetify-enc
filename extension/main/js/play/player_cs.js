'use strict';

(function() {
  function toggleSavetify(enable) {
    BrowserMessage.sendMessage({
      cmd: 'toggleSavetify',
      enable: enable
    });
  }

  function sendCurrentSong(title, artist, trackId) {
    artist = artist.replace(/\s{2,}/g, ' ').trim();
    BrowserMessage.sendMessage({
      cmd: 'currentSong',
      data: {
        title: title,
        artist: artist,
        trackId: trackId
      }
    });
  }

  function createObserver(target, onChange) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(onChange);
    });

    var config = { attributes: false, childList: true, characterData: false, subtree: true };
    observer.observe(target, config);

    return observer;
  }

  toggleSavetify(false);

  var player = document.getElementById('player');
  if (!player) {
    console.log('#player not found');
    return;
  }

  var controlsWrapper = document.getElementById('controls');
  if (!controlsWrapper) {
    console.log('#controls not found');
    return;
  }

  createObserver(player, function(mutation) {
    if (mutation.type === 'childList') {
      var target = mutation.target;
      if (target.id === 'track-artist' && mutation.addedNodes.length > 0) {
        var child = target.querySelector('a');
        if (child.hasAttribute('savetify')) {
          return;
        }

        var artist = target.textContent.trim();
        var title = document.getElementById('track-name').textContent.trim();

        var trackId = document.querySelector('#track-name a').href.split('/').pop();
        sendCurrentSong(title, artist, trackId);

        child.setAttribute('savetify', '1');
      }
    }
  });

  var elmTrackName = document.getElementById('track-name');
  var elmTrackArtist = document.getElementById('track-artist');
  if (elmTrackName && elmTrackArtist) {
    var title = elmTrackName.textContent.trim();
    var artist = elmTrackArtist.textContent.trim();
    if (title.length > 0 && artist.length > 0) {
      sendCurrentSong(title, artist);
    }
  }

  var savetifyControl = document.createElement('div');
  savetifyControl.id = 'savetify-control';

  var savetifyButton = document.createElement('a');
  savetifyButton.textContent = 'Savetify';
  savetifyButton.classList.add('disabled');
  savetifyButton.addEventListener('click', function(e) {
    e.preventDefault();
    this.classList.toggle('disabled');
    toggleSavetify(!this.classList.contains('disabled'));
  });

  savetifyControl.appendChild(savetifyButton);
  controlsWrapper.appendChild(savetifyControl);
})();