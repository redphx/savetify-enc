'use strict';

var BrowserMessage = new function() { // jshint ignore:line
  var sendMessage = function(message, callback) {
    chrome.runtime.sendMessage(message, callback);
  };

  this.sendMessage = sendMessage;
};

var BrowserDownloads = new function() { // jshint ignore:line
  var escapeFilename = function(filename) {
    filename = filename.replace(/[\/\\:]+/g, '-');
    filename = filename.replace(/[\*\?"<>\|]+/g, '');
    filename = filename.trim();
    return filename;
  };

  var download = function(url, filename, dir) {
    filename = escapeFilename(filename);
    chrome.downloads.download({
      url: url,
      filename: dir + filename
    });
  };

  this.download = download;
};