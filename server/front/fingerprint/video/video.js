/***
* This test plays video in preferably a webm format and draws it to a
* canvas using a 2d context and a webgl context.  This is testing how
* the decompression of the video container is implemented.  This is more
* than likely something that is controlled by a browser.
* There are 3 videos that can be played depending on what the browser supports:
* webm video created from .png using ffmpeg:
*   ffmpeg -loop 1 -i rainbow.png -c:v libvpx -vframes 10 -r 30 -pix_fmt yuv422p
*-crf 4 rainbow.webm
* high quality mp4 created from .png using ffmpeg:
*   ffmpeg -loop 1 -i rainbow.png -c:v libx264 -vframes 10 -r 30 -pix_fmt
*yuv420p -crf 4 rainbow.mp4
* standard mp4 created using iMovie exported to high quality
***/

var VideoCollector =
    function(webmVid, mp4Vid, id) {
  var numFrames = 2;
  this.IDs = sender.getIDs(numFrames * 2);

  this.ctxID = 0;
  this.glID = 1;
  this.ctxHashes = new Set();
  this.glHashes = new Set();
  this.ctxMode = true;
  this.cb = null;
  this.ctx = null;
  this.gl = null;
  this.vx_ptr = null;
  this.vx = null;
  this.tex = null;
  this.ix = null;
  this.startGL = function() {
    var glCan = $('<canvas width="256" height="256"></canvas>')
                    .appendTo($('#test_canvases'))[0];
    this.gl = getGL(glCan);

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

    this.vx_ptr = this.gl.getAttribLocation(shader, "vx");
    this.gl.enableVertexAttribArray(this.vx_ptr);
    this.gl.uniform1i(this.gl.getUniformLocation(shader, "sm"), 0);

    this.vx = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vx);
    this.gl.bufferData(this.gl.ARRAY_BUFFER,
                       new Float32Array([ 0, 0, 1, 0, 1, 1, 0, 1 ]),
                       this.gl.STATIC_DRAW);

    this.ix = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ix);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
                       new Uint16Array([ 0, 1, 2, 0, 2, 3 ]),
                       this.gl.STATIC_DRAW);

    this.tex = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0,
                       this.gl.RGBA, this.gl.UNSIGNED_BYTE,
                       new Uint8Array([ 255, 0, 0, 255 ]));
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T,
                          this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S,
                          this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER,
                          this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER,
                          this.gl.LINEAR);
  };

  var ctxCanvas = $('<canvas width="256" height="256"></canvas>')
                      .appendTo($('#test_canvases'))[0];
  this.ctx = ctxCanvas.getContext('2d');
  this.startGL();

  this.collector = function() {
    if (++this.count % 3 == 2) {
      if (this.collected[0] < numFrames) {
        var status = sender.getDataFromCanvas(this.ctx, this.IDs[this.ctxID]);
        if (status) {
          this.ctxHashes.add(status);
          if (this.ctxHashes.length > this.collected[0]) {
            ++this.collected[0]
            this.ctxID += 2;
          }
        }
        if (this.count > 24) {
          ++this.collected[0]
          this.ctxID += 2;
        }
      }

      if (this.collected[1] < numFrames) {
        var status = sender.getData(this.gl, this.IDs[this.glID]);
        if (status) {
          this.glHashes.add(status);
          if (this.glHashes.length > this.collected[1]) {
            ++this.collected[1]
            this.glID += 2;
          }
        }
        if (this.count > 24) {
          ++this.collected[1]
          this.glID += 2;
        }
      }
      if (this.collected[1] == numFrames && this.collected[0] == numFrames) {
        this.video[0].pause();
        cancelAnimationFrame(this.frame);
        this.cb();
        ++this.collected[1];
      }
    }
  }

  this.begin = function(cb) {
    this.cb = cb;

    this.video = $('<video/>').appendTo($('body'));
    this.video.addClass("hidden-vid");
    $('<source src="' + webmVid + '" type="video/webm"/>').appendTo(this.video);
    $('<source src="' + mp4Vid + '" type="video/mp4"/>').appendTo(this.video);
    $('<source src="./video/backup.mp4" type="video/mp4"/>')
        .appendTo(this.video);
    this.video.prop('loop', true);
    this.video.prop('autoplay', true);
    this.video.on('play', {self : this}, function(event) {
      var self = event.data.self;
      drawVid(256, 256, this, self);
    });
    this.video.prop('muted', true);
    this.count = 0, this.collected = [ 0, 0 ];

    this.video.on('timeupdate', {self : this}, function(event) {
      var self = event.data.self;
      // self.collector();

      // $("#" + self.counterName).text(self.level);
    });

    // Render loop
    function drawVid(w, h, vid, self) {
      self.frame =
          requestAnimationFrame(function() { drawVid(w, h, vid, self); });
      var vidH = 9 / 16 * w;
      var offset = (h - vidH) / 2.0;
      self.ctx.drawImage(vid, 0, offset, w, vidH);

      self.gl.viewport(0, offset, w, vidH);
      self.gl.clear(self.gl.COLOR_BUFFER_BIT);
      self.gl.activeTexture(self.gl.TEXTURE0);
      self.gl.bindTexture(self.gl.TEXTURE_2D, self.tex);
      self.gl.texImage2D(self.gl.TEXTURE_2D, 0, self.gl.RGB, self.gl.RGB,
                         self.gl.UNSIGNED_BYTE, vid);
      self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.vx);
      self.gl.vertexAttribPointer(self.vx_ptr, 2, self.gl.FLOAT, false, 0, 0);

      self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.ix);
      self.gl.drawElements(self.gl.TRIANGLES, 6, self.gl.UNSIGNED_SHORT, 0);
      self.collector();
    }
  }
}

// Document on ready jquery shortcut
var VideoTest = function() {

  var vidCollector =
      new VideoCollector("./video/rainbow.webm", "./video/rainbow.mp4", 0);

  this.begin = function(cb) { vidCollector.begin(cb); }
};
