getGL = function(canvasSelector) {
  var canvas = $(canvasSelector)[0];
  var gl = null;
  for (var i = 0; i < 4; ++i) {
    gl = canvas.getContext(["webgl","experimental-webgl","moz-webgl","webkit-3d"][i], {antialias: false, preserveDrawingBuffer: true});
    if (gl) break;
  }

  if (!gl) {
    alert('Your browser does not support WebGL');
  }
  return gl;
}