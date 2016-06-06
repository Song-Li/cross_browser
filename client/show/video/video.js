/**
  Shows a video on screen, request it to be redrawn on a canvas and
  then collects those pixels from the canvas
*/
// Document on ready jquery shortcut
$(function() {
  // [0] after jquery selector gets the pure dom element instead of
  // the jquery extended object

  $('<canvas id="vid_can_ctx" width="256" height="256">'
    + 'Your browser does not support HTML5'
    + '</canvas>')
    .appendTo($('body'));

  $('<canvas id="vid_can_gl" width="256" height="256">'
    + 'Your browser does not support HTML5'
    + '</canvas>')
    .appendTo($('body'));

  $('<div id="counter"/>')
    .appendTo($("body"));

  var canvas = $('#vid_can_ctx')[0];
  var ctx = canvas.getContext('2d');
  var gl = getGL("#vid_can_gl");

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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  var video = $('<video width="256" height="256"/>').appendTo($('body'));
  var src1 = "./video/5frame.webm";
  var src2 = "./video/5frame.mp4";
  video.prop('loop', true);
  video.prop('style', 'display: none;');
  video.on('error', {src2: src2}, function(event) {
    var src2 = event.data.src2;
    if (this.src != src2) {
      this.src = src2;
      this.load();
    }
  });
  video.prop('src', src1);
  video.load();
  video.on('play', function() {
    drawVid(canvas.width, canvas.height, this);
  });
  video.prop('muted', true);
  var done = false;
  var level = 0;
  video.on('timeupdate', function() {
    if (++level == 12) {
      getDataFromCanvas(ctx, 'vid_can_ctx');
      getData(gl, 'vid_can_gl', 0);
    } else if (level < 12 && level > 2) {
      canvas_number += 2;
      getDataFromCanvas(ctx, 'vid_can_ctx');
      getData(gl, 'vid_can_gl', 0);
    }
    $("#counter").text(level);
  });
  video[0].play();

  var image = new Image();
  image.onload = function() {
    drawImg(canvas.width, canvas.height, this, 0);
  };
  // image.src = 'video/image.png';

  // Render loop
  function drawVid(w, h, vid) {
    var frame = null;
    if (!done) {
      frame = requestAnimationFrame(function() {
        drawVid(w, h, vid);
      });

      var vidH = 9/16*w;
      var offset = (h - vidH)/2.0;
      ctx.drawImage(vid, 0, offset, w, vidH);

      gl.viewport(0, offset, w, vidH);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, vid);
      if (gl.getError() != 0) {
        console.log("texImage2D error!");
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, vx);
      gl.vertexAttribPointer(vx_ptr, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ix);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      // Here is where the pixel data will be sent
    } else if (frame) {
      cancelAnimationFrame(frame);
    }
  }

  function drawImg(w, h, img, level) {
    var frame = null;
    frame = requestAnimationFrame(function() {
      drawImg(w, h, img, level + 1);
    });

    var vidH = 9/16*w;
    var offset = (h - vidH)/2.0;
    ctx.drawImage(img, 0, offset, w, vidH);

    gl.viewport(0, offset, w, vidH);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.bindBuffer(gl.ARRAY_BUFFER, vx);
    gl.vertexAttribPointer(vx_ptr, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ix);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    // Here is where the pixel data will be sent
    if (level == 10) {
      cancelAnimationFrame(frame);
      getDataFromCanvas(ctx, 'vid_can_ctx');
      getData(gl, 'vid_can_gl', 0);
    }
  }
});