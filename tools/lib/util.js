/**
 * Encodes a binary string into a hex string.
 * Based off of Spotify.Utils.str2hex().
 */

exports.bin2hex = function (bin) {
  for (var b = '', c = 0, a = bin.length; c < a; ++c) {
    b += (bin.charCodeAt(c) + 256).toString(16).slice(-2);
  }
  return b;
};

/**
 * Decodes a hex string into a binary string.
 * Based off of Spotify.Utils.hex2str().
 */

exports.hex2bin = function (hex) {
  for (var str = [], i = 0, len = hex.length; len - 1 > i; i += 2) {
    str.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
  }
  return str.join("");
}