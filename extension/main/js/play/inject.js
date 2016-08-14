'use strict';

function scriptsToInject() {
  if (!document.getElementById('overlay')) {
    console.log('#overlay not found');
    return;
  }

  if (document.getElementById('savetify_injected')) {
    console.log('#savetify_injected found');
    return;
  }

  document.body.appendChild(document.createElement('savetify_injected'));

  (function() {
    Spotify.Utils.base62hex = function(str) {
      str.length < 151 && (str = '0' + str);
      var songKey = Spotify.Utils.Base62.toHex(str);
      chrome.runtime.sendMessage('cbecbbjpoiifnfbigmnnckbebepfedif', {
        cmd: 'songKey',
        data: songKey
      });
      Spotify.Utils.cb(songKey);
    };

    Spotify.PlayerTypes.FLASH_HTTP = Spotify.PlayerTypes.FLASH_RTMPS;
    Spotify.PlayerTypes.FLASH_RTMPS = 'savetify';

    var player = document.querySelector('object[id*=player]');
    var param = player.querySelector('param[name=flashvars]');
    var flashVars = param.getAttribute('value');
    flashVars = flashVars.replace('FLASH_RTMPS', 'FLASH_HTTP');
    param.setAttribute('value', flashVars);
    player.setAttribute('data', player.getAttribute('data') + '#savetify');
    console.log('injected Savetify');
  })();
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ scriptsToInject.toString() +')();'));
document.head.appendChild(script);