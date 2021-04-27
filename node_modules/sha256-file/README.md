# sha256-file

> Simply return an `sha256` sum of a given file. If using async version (by including callback), it will stream; successfully tested on files 4 GB+.

### Installation

```
$ npm install sha256-file
```

__Test:__

```
$ npm test
```

### API

__sha1File(path, [callback])__

```javascript
var sha256File = require('sha256-file');

// sync (no callback)

sha256File('./path/to/a_file'); // '345eec8796c03e90b9185e4ae3fc12c1e8ebafa540f7c7821fb5da7a54edc704'

// async/streamed (if using callback)

sha256File('./path/to/a_file', function (error, sum) {
  if (error) return console.log(error);
  console.log(sum) // '345eec8796c03e90b9185e4ae3fc12c1e8ebafa540f7c7821fb5da7a54edc704'
})
```

### License

MIT  

### Thanks
sha256-file is based on [sha1-file](https://github.com/roryrjb/sha1-file)