var package = require('./package.json');

console.log('=======================');
console.log('=', 'SAVETIFY', package.version);
console.log('=', 'savetify.codekiem.com');
console.log('=======================', '\n');

var fs = require('fs');
var path = require('path');
var crypto = require('./lib/crypto');
var PassThrough = require('stream').PassThrough;
var glob = require('glob');

var MP3_PATH = path.resolve(__dirname, '../mp3');
var ENCRYPTED_PATH = path.resolve(MP3_PATH, './encrypted');
var DECRYPTED_PATH = path.resolve(MP3_PATH, './decrypted');
var DONE_PATH = path.resolve(MP3_PATH, './done');

function runCmd(cmd, args, callback) {
  var spawn = require('child_process').spawn;
  var child = spawn(cmd, args);
  var resp = '';

  child.stdout.on('data', function(buffer) {
    console.log(buffer.toString());
    resp += buffer.toString();
  });
  child.stdout.on('end', function() {
    callback(resp);
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}

function decrypt(files, callback) {
  if (files.length == 0) {
    callback();
    return;
  }

  var filePath = path.resolve(__dirname, files.shift());

  var dir = path.dirname(filePath);
  var songKey = path.basename(filePath, '.enc');
  var songName = dir.split('/').pop();

  var outputFilePath = DECRYPTED_PATH + '/' + songName + '.mp3';

  var readStream = fs.createReadStream(filePath);
  var writeStream = fs.createWriteStream(outputFilePath);
  var decryptStream = new crypto.EncryptedStream(songKey);
  var passThroughStream = new PassThrough();

  console.log('[DECRYPTING]', songName);
  readStream.pipe(decryptStream)
      .pipe(passThroughStream)
      .pipe(writeStream)
      .on('finish', function() {
        fs.unlinkSync(filePath);
        fs.rmdirSync(dir);
        decrypt(files, callback);
      });;
}

ensureDir(MP3_PATH);
ensureDir(ENCRYPTED_PATH);
ensureDir(DECRYPTED_PATH);
ensureDir(DONE_PATH);

var globOptions = {};
glob(ENCRYPTED_PATH + '/**/*.enc', globOptions, function (err, files) {
  decrypt(files, function() {
    console.log('DECRYPTED SUCCESSFULLY.\n');
    console.log('UPDATING SONGS\' METADATA... This may take a while...\n');

    runCmd('python', [path.resolve(__dirname, 'renamer/renamer.py')], function(output) {
      console.log('FINISHED!!!');
    });
  });

});