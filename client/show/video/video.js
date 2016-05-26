/**
  Shows a video on screen, request it to be redrawn on a canvas and
  then collects those pixels from the canvas
*/

var vertexShader = [
  'attribute vec2 a_position;',
  'uniform vec2 u_resolution;',
  'void main() {',
     // convert the rectangle from pixels to 0.0 to 1.0
     'vec2 zeroToOne = a_position / u_resolution;',
     'vec2 zeroToTwo = zeroToOne * 2.0;',
     'vec2 clipSpace = zeroToTwo - 1.0;',
     'gl_Position = vec4(clipSpace, 0, 1);',
  '}'
].join('\n');

var fragmentShader = [
  'precision mediump float;',

  // our texture
  'uniform sampler2D u_image;',

  // the texCoords passed in from the vertex shader.
  'varying vec2 v_texCoord;',

  'void main() {',
     // Look up a color from the texture.
     'gl_FragColor = texture2D(u_image, v_texCoord);',
  '}'
].join('\n');

$(function() {
  var vid = $('#vid');
  var ctx = $('#vid_can_ctx')[0].getContext('2d');
  var canvas = $('#vid_can_gl')[0];
  var gl = null;
  for (var i=0; i<4; i++) {
    gl = canvas.getContext(["webgl","experimental-webgl","moz-webgl","webkit-3d"][i])
    if (gl)
      break;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, "attribute vec2 vx;varying vec2 tx;void main(){gl_Position=vec4(vx.x*2.0-1.0,1.0-vx.y*2.0,0,1);tx=vx;}");
  gl.compileShader(vs);

  var ps = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(ps, "precision mediump float;uniform sampler2D sm;varying vec2 tx;void main(){gl_FragColor=texture2D(sm,tx);}");
  gl.compileShader(ps);

  var shader  = gl.createProgram();
  gl.attachShader(shader, vs);
  gl.attachShader(shader, ps);
  gl.linkProgram(shader);
  gl.useProgram(shader);

  var vx_ptr = gl.getAttribLocation(shader, "vx");
  gl.enableVertexAttribArray(vx_ptr);
  gl.uniform1i(gl.getUniformLocation(shader, "sm"), 0);

  var vx = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vx);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 1,1, 0,1]), gl.STATIC_DRAW);

  var ix = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ix);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2, 0,2,3]), gl.STATIC_DRAW);

  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  vid.attr('src', 'video/video.mp4');
  vid.load();
  vid.on('play', function() {
    drawVid(256, 256, 0);
  });
  vid.prop('muted', true);
  vid[0].play();

  function drawVid(w, h, level) {
    var frame = requestAnimationFrame(function() {
      drawVid(w, h, level + 1);
    });
    var vidH = 9/16*h;
    var offset = (h - vidH)/2.0;
    ctx.drawImage(vid[0], 0, offset, w, vidH);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, vid[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vx);
    gl.vertexAttribPointer(vx_ptr, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ix);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    // Here is where the pixel data will be sent
    if (level == 200) {
      // Get data for the webgl canvas
      getData(gl, 'vid_can_gl', 7);

      var pixels = ctx.getImageData(0, 0, w, h).data;
      var pi = '[';
      var s = 256 * 256 * 4;
      for(var i = 0;i < s;++ i){
        if(i) pi += ',';
        pi += pixels[i].toString();
      }
      pi += ']';
      // Send pixels to server
      //toServer(false, "None", "None", pixels.hashCode(), 8, pi);
    }
    // Kills the render loop
    if (level == 300) {
      cancelAnimationFrame(frame);
    }
  }
});

