'use strict';

var HOMEPAGE = 'http://savetify.codekiem.com';

var _gaq = _gaq || [];
var ZAnalytics = new function() {
  var TRACKING_CODE = 'UA-28996035-17';

  var init = function() {
    _gaq.push(['_setAccount', TRACKING_CODE]);
    _gaq.push(['_trackPageview']);

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
  };

  var trackEvent = function(evt) {
    _gaq.push(['_trackEvent'].concat(evt));
  };
  this.trackEvent = trackEvent;
  this.init = init;
};

ZAnalytics.init();

(function() {
  var SAVETIFY_ENABLED = false;
  var CURRENT_SONG = {
    title: '',
    artist: '',
    trackId: ''
  };
  var CURRENT_SONG_KEY = '';

  function checkForUpdate() {
    var currentVersion = chrome.app.getDetails().version;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://savetify.codekiem.com/api/version.json?t=' + (+new Date()), true);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var data = JSON.parse(xhr.responseText);

        var latestVersion = data.latest_version;

        if (currentVersion < latestVersion) {
          chrome.tabs.create({
            url: HOMEPAGE + '/new-version.html',
            active: false
          });
        }
      }
    };

    xhr.send();
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.cmd === 'currentSong') {
      CURRENT_SONG = request.data;
      console.log('CURRENT_SONG', CURRENT_SONG);
    } else if (request.cmd === 'toggleSavetify') {
      SAVETIFY_ENABLED = request.enable;
    }
  });

  chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    if (request.cmd === 'songKey') {
      CURRENT_SONG_KEY = request.data;
      console.log('SONG_KEY', CURRENT_SONG_KEY);
    }
  });

  chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (SAVETIFY_ENABLED && details.type === 'object' && details.url.indexOf('#savetify') === -1) {
      setTimeout(function() {
        if (!CURRENT_SONG.title || !CURRENT_SONG.artist || !CURRENT_SONG_KEY) {
          return;
        }

        var fileName = CURRENT_SONG_KEY + '.enc';
        var folder = CURRENT_SONG.artist + ' - ' + CURRENT_SONG.title + ' [' + CURRENT_SONG.trackId + ']';
        var dir = 'savetify/mp3/encrypted/' + folder + '/';
        BrowserDownloads.download(details.url + '#savetify', fileName, dir);

        CURRENT_SONG = {
          title: '',
          artist: '',
          trackId: ''
        };
        CURRENT_SONG_KEY = '';

        ZAnalytics.trackEvent(['download', 'song', CURRENT_SONG.trackId]);
      }, 3000);
    }
  }, {
    urls: ['*://*.cloudfront.net/mp3enc/*', '*://audio-mp3-fa.spotify.com/mp3enc/*']
  });
  checkForUpdate();
})();

chrome.runtime.onInstalled.addListener(function(details) {
  ZAnalytics.trackEvent(['install', details.reason, chrome.app.getDetails().version]);
});