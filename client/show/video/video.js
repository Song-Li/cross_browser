/**
  Shows a video on screen, request it to be redrawn on a canvas and
  then collects those pixels from the canvas
*/


var VideoCollector = function(webmVid, mp4Vid, id) {
  var videoStartId = canvas_number;
  var numImages = 5;

  this.startID = parseInt(videoStartId + 2 * numImages * id);
  this.ctxID = this.startID;
  this.glID = this.startID + 1;
  this.ctxCanName = "vid_can_ctx_" + id;
  this.glCanName = "vid_can_gl_" + id;
  var canvas =
      $('<canvas id="' + this.ctxCanName + '" width="256" height="256">' +
        'Your browser does not support HTML5' +
        '</canvas>')
          .appendTo($('#test_canvas'))[0];
  $('<canvas id="' + this.glCanName + '" width="256" height="256">' +
    'Your browser does not support HTML5' +
    '</canvas>')
      .appendTo($('#test_canvas'));
  this.counterName = "counter_" + id;
  this.ctx = canvas.getContext('2d');
  this.gl = getGL("#" + this.glCanName);

  this.gl.enable(this.gl.BLEND);
  this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

  var vs = this.gl.createShader(this.gl.VERTEX_SHADER);
  this.gl.shaderSource(
      vs,
      "attribute vec2 vx;varying vec2 tx;void main(){gl_Position=vec4(vx.x*2.0-1.0,1.0-vx.y*2.0,0,1);tx=vx;}");
  this.gl.compileShader(vs);

  var ps = this.gl.createShader(this.gl.FRAGMENT_SHADER);
  this.gl.shaderSource(
      ps,
      "precision mediump float;uniform sampler2D sm;varying vec2 tx;void main(){gl_FragColor=texture2D(sm,tx);}");
  this.gl.compileShader(ps);

  var shader = this.gl.createProgram();
  this.gl.attachShader(shader, vs);
  this.gl.attachShader(shader, ps);
  this.gl.linkProgram(shader);
  this.gl.useProgram(shader);

  var vx_ptr = this.gl.getAttribLocation(shader, "vx");
  this.gl.enableVertexAttribArray(vx_ptr);
  this.gl.uniform1i(this.gl.getUniformLocation(shader, "sm"), 0);

  var vx = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vx);
  this.gl.bufferData(this.gl.ARRAY_BUFFER,
                     new Float32Array([ 0, 0, 1, 0, 1, 1, 0, 1 ]),
                     this.gl.STATIC_DRAW);

  var ix = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ix);
  this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
                     new Uint16Array([ 0, 1, 2, 0, 2, 3 ]),
                     this.gl.STATIC_DRAW);

  var tex = this.gl.createTexture();
  this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T,
                        this.gl.CLAMP_TO_EDGE);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S,
                        this.gl.CLAMP_TO_EDGE);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER,
                        this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER,
                        this.gl.LINEAR);

  var video = $('<video width="256" height="256"/>').appendTo($('body'));
  $('<source src="' + webmVid + '" type="video/webm"/>').appendTo(video);
  $('<source src="' + mp4Vid + '" type="video/mp4"/>').appendTo(video);
  video.prop('loop', true);
  video.prop('style', 'display: none;');
  video.on('play', {self : this}, function(event) {
    canvas_number += 2;
    var self = event.data.self;
    drawVid(canvas.width, canvas.height, this, self);
  });
  video.prop('muted', true);
  this.level = 0, this.collected = [ 0, 0 ];
  video.on('timeupdate', {self : this}, function(event) {
    var self = event.data.self;
    if (++self.level > 2) {
      if (self.level % 2 == 0) {
        if (self.collected[0] + 1 < numImages) {
          ++canvas_number;
          var status = getDataFromCanvas(self.ctx, self.ctxID);
          if (status) {
            ++self.collected[0]
            self.ctxID += 2;
          } else {
            --canvas_number;
          }
        } else if (self.collected[0] + 1 == numImages) {
          var status = getDataFromCanvas(self.ctx, self.ctxID);
          if (status) {
            ++self.collected[0];
          }
        }
      } else {
        if (self.collected[1] + 1 < numImages) {
          ++canvas_number;
          var status = getData(self.gl, self.glCanName, self.glID);
          if (status) {
            ++self.collected[1]
            self.glID += 2;
          } else {
            --canvas_number;
          }
        } else if (self.collected[1] + 1 == numImages) {
          var status = getData(self.gl, self.glCanName, self.glID);
          if (status) {
            ++self.collected[1];
          }
        }
      }
    }
    // $("#" + self.counterName).text(self.level);
  });
  video.load();
  video[0].play();

  // Render loop
  function drawVid(w, h, vid, self) {
    var vidH = 9 / 16 * w;
    var offset = (h - vidH) / 2.0;
    self.ctx.drawImage(vid, 0, offset, w, vidH);

    self.gl.viewport(0, offset, w, vidH);
    self.gl.clear(self.gl.COLOR_BUFFER_BIT);
    self.gl.activeTexture(self.gl.TEXTURE0);
    self.gl.bindTexture(self.gl.TEXTURE_2D, tex);
    self.gl.texImage2D(self.gl.TEXTURE_2D, 0, self.gl.RGB, self.gl.RGB,
                       self.gl.UNSIGNED_BYTE, vid);
    self.gl.bindBuffer(self.gl.ARRAY_BUFFER, vx);
    self.gl.vertexAttribPointer(vx_ptr, 2, self.gl.FLOAT, false, 0, 0);

    self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, ix);
    self.gl.drawElements(self.gl.TRIANGLES, 6, self.gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(function() { drawVid(w, h, vid, self); });
  }
}

// Document on ready jquery shortcut
$(function() {
  var vidCollector =
      new VideoCollector("./video/rainbow.webm", "./video/rainbow.mp4", 0);
});
