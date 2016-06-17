// Load a text resource from a file over the network

getGL = function(canvasSelector) {
  var canvas = $(canvasSelector)[0];
  var gl = null;
  for (var i = 0; i < 4; ++i) {
    gl = canvas.getContext(
        [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ][i], {
          antialias : false,
          preserveDrawingBuffer : true,
          willReadFrequently : false,
          depth: true
        });
    if (gl)
      break;
  }

  if (!gl) {
    alert('Your browser does not support WebGL');
  }
  return gl;
}

computeKernelWeight = function(kernel) {
  var weight = kernel.reduce(function(prev, curr) { return prev + curr; });
  return weight <= 0 ? 1 : weight;
}

var loadTextResource = function(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url + '?please-dont-cache=' + Math.random(), true);
  request.onload = function() {
    if (request.status < 200 || request.status > 299) {
      callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
    } else {
      callback(null, request.responseText);
    }
  };
  request.send();
};

var loadImage = function(url, callback) {
  var image = new Image();
  image.onload = function() { callback(null, image); };
  image.src = url;
};

var loadJSONResource = function(url, callback) {
  loadTextResource(url, function(err, result) {
    if (err) {
      callback(err);
    } else {
      try {
        callback(null, JSON.parse(result));
      } catch (e) {
        callback(e);
      }
    }
  });
};
