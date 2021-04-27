
HasBin
======

Check whether a binary exists in the `PATH` environment variable.

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![MIT licensed][shield-license]][info-license]

```js
var hasbin = require('hasbin');

// Check if a binary exists
hasbin('node', function (result) {
    // result === true
});
hasbin('wtf', function (result) {
    // result === false
});

// Check if all binaries exist
hasbin.all(['node', 'npm'], function (result) {
    // result === true
});

// Check if at least one binary exists
hasbin.some(['node', 'wtf'], function (result) {
    // result === true
});

// Find the first available binary
hasbin.first(['node', 'npm'], function (result) {
    // result === 'node'
});
```


Table Of Contents
-----------------

- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)


Install
-------

Install HasBin with [npm][npm]:

```sh
npm install hasbin
```


Usage
-----

### `hasbin(binaryName, callback)`

Check whether a binary exists on one of the paths in `process.env.PATH`. Calls back with `true` if it does.

```js
// Arguments
binaryName = String
callback = Function(Boolean)
```

```js
// Example
hasbin('node', function (result) {
    // result === true
});
```

### `hasbin.sync(binaryName)`

Synchronous `hasbin`.

```js
// Arguments
binaryName = String
return Boolean
```

```js
// Example
result = hasbin.sync('node');
```

### `hasbin.all(binaryNames, callback)`

Check whether all of a set of binaries exist on one of the paths in `process.env.PATH`. Calls back with `true` if all of the binaries do. Aliased as `hasbin.every`.

```js
// Arguments
binaryNames = Array(String)
callback = Function(Boolean)
```

```js
// Example
hasbin.all(['node', 'npm'], function (result) {
    // result === true
});
```

### `hasbin.all.sync(binaryNames)`

Synchronous `hasbin.all`. Aliased as `hasbin.every.sync`.

```js
// Arguments
binaryNames = Array(String)
return Boolean
```

```js
// Example
result = hasbin.all.sync(['node', 'npm']);
```

### `hasbin.some(binaryNames, callback)`

Check whether at least one of a set of binaries exists on one of the paths in `process.env.PATH`. Calls back with `true` if at least one of the binaries does. Aliased as `hasbin.any`.

```js
// Arguments
binaryNames = Array(String)
callback = Function(Boolean)
```

```js
// Example
hasbin.some(['node', 'npm'], function (result) {
    // result === true
});
```

### `hasbin.some.sync(binaryNames)`

Synchronous `hasbin.some`. Aliased as `hasbin.any.sync`.

```js
// Arguments
binaryNames = Array(String)
return Boolean
```

```js
// Example
result = hasbin.some.sync(['node', 'npm']);
```

### `hasbin.first(binaryNames, callback)`

Checks the list of `binaryNames` to find the first binary that exists on one of the paths in `process.env.PATH`. Calls back with the name of the first matched binary if one exists and `false` otherwise.

```js
// Arguments
binaryNames = Array(String)
callback = Function(String|false)
```

```js
// Example
hasbin.first(['node', 'npm'], function (result) {
    // result === 'node'
});
```

### `hasbin.first.sync(binaryNames)`

Synchronous `hasbin.first`.

```js
// Arguments
binaryNames = Array(String)
return String|false
```

```js
// Example
result = hasbin.first.sync(['node', 'npm']);
```


Contributing
------------

To contribute to HasBin, clone this repo locally and commit your code on a separate branch.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

```sh
make ci
```


License
-------

HasBin is licensed under the [MIT][info-license] license.  
Copyright &copy; 2015, Springer Nature



[npm]: https://npmjs.org/
[info-coverage]: https://coveralls.io/github/springernature/hasbin
[info-dependencies]: https://gemnasium.com/springernature/hasbin
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/hasbin
[info-build]: https://travis-ci.org/springernature/hasbin
[shield-coverage]: https://img.shields.io/coveralls/springernature/hasbin.svg
[shield-dependencies]: https://img.shields.io/gemnasium/springernature/hasbin.svg
[shield-license]: https://img.shields.io/badge/license-MIT-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-0.10–6-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/hasbin.svg
[shield-build]: https://img.shields.io/travis/springernature/hasbin/master.svg
