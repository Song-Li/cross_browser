'use strict';

var sha256File = require('./index');
var assert = require('assert');
var filename = 'LICENSE.md';
var preCheckedSum = '345eec8796c03e90b9185e4ae3fc12c1e8ebafa540f7c7821fb5da7a54edc704';

sha256File(filename, function (error, sum) {
  console.log('sum = ' + sum);
  assert(error === null);
  assert(sum === preCheckedSum);
  console.log('Pass 2/2')
});

var syncSum = sha256File(filename);

assert(syncSum === preCheckedSum);
console.log('sum = ' + syncSum);
console.log('Pass 1/2');

// errors

sha256File('does not exist', function (error, sum) {
  assert(error);
  assert(!sum)
});
