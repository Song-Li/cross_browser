var ip_address = "184.73.16.65";
var error_page = "http://mf.songli.us/error"
// var ip_address = "128.180.123.19";
// var ip_address = "52.90.197.136";
var sender = null;
var Sender = function() {
  this.finalized = false;
  this.postData = {};
  sumRGB = function(img) {
    var sum = 0.0;
    for (var i = 0; i < img.length; i += 4) {
      sum += parseFloat(img[i + 0]);
      sum += parseFloat(img[i + 1]);
      sum += parseFloat(img[i + 2]);
    }
    return sum;
  };
  this.nextID = 0;
  this.getID = function() {
    if (this.finalized) {
      throw "Can no longer generate ID's";
      return -1;
    }
    return this.nextID++;
  };
  this.getIDs = function(numIDs) {
    var idList = [];
    for (var i = 0; i < numIDs; i++) {
      idList.push(this.getID());
    }
    return idList;
  };

  this.getDataFromCanvas = function(ctx, id) {
    if (!this.finalized) {
      throw "Still generating ID's";
      return -1;
    }
    function hash(array) {
      var hash = 0, i, chr, len;
      if (array.length === 0)
        return hash;
      for (i = 0, len = array.length; i < len; i++) {
        chr = array[i];
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }
    var w = 256, h = 256;
    // Send pixels to server
    var pixels = ctx.getImageData(0, 0, w, h).data;
    var hashV = hash(pixels);
    console.log("CTX: " + hashV);

    this.toServer(false, "None", "None", hashV, id, pixels);
    return sumRGB(pixels) > 1.0;
  };

  this.getData = function(gl, id) {
    if (!this.finalized) {
      throw "Still generating ID's";
      return -1;
    }
    var WebGL = true;
    var pixels = new Uint8Array(256 * 256 * 4);
    gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    var ven, ren;
    var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      ven = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      ren = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } else {
      console.log("debugInfo is not accessable");
      ven = 'No debug Info';
      ren = 'No debug Info';
    }
    var hash = pixels.hashCode();
    console.log("gl: " + hash);

    this.toServer(WebGL, ven, ren, hash, id, pixels);
    return sumRGB(pixels) > 1.0;
  };

  this._fps = null;
  this.setFPS = function(fps) {
    this._fps = parseFloat(fps);
    this.postData['fps'] = this._fps;
    console.log("FPS: " + this._fps);
  };
  this.calcFPS = function(times) {
    var fpses = [];
    for (var i = 1; i < times.length; i++) {
      fpses.push(1000.0 / (times[i] - times[i - 1]));
    }
    var average = 0;
    for (var i = 0; i < fpses.length; i++) {
      average += fpses[i];
    }
    this.setFPS(average / fpses.length);
  };
  this.urls = [];
  this.finished = 0;

  $("manufacturer.modal").modal('hide');

  this.toServer = function(
      WebGL, inc, gpu, hash, id,
      dataurl) { // send messages to server and receive messages from server

    this.urls[id] = dataurl;

    if (WebGL) {
      this.postData['WebGL'] = WebGL;
      this.postData['inc'] = inc;
      this.postData['gpu'] = gpu;
      this.postData['hash'] = hash;
      this.postData['user_id'] = user_id;
    }

  };

  this.sendData =
      function() {
    /*var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://" + ip_address + "/collect.py");
    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',JSON.stringify(postData));
    f.appendChild(i);
    f.submit();

    return ;*/

    var pixels = "";
    for (var i = 0; i < this.nextID; ++i) {
      if (i != 0)
        pixels += ' ';
      pixels += stringify(this.urls[i]);
    }
    this.postData['pixels'] = pixels;
    this.fontsData = "";
    fonts = ["cursive", "monospace", "serif", "sans-serif", "fantasy", "default", "Arial", "Arial Black", "Arial Narrow", "Arial Rounded MT Bold", "Bookman Old Style", "Bradley Hand ITC", "Century", "Century Gothic", "Comic Sans MS", "Courier", "Courier New", "Georgia", "Gentium", "Impact", "King", "Lucida Console", "Lalit", "Modena", "Monotype Corsiva", "Papyrus", "Tahoma", "TeX", "Times", "Times New Roman", "Trebuchet MS", "Verdana", "Verona"];
    var detector = new fontDetector();
    for(i = 0, len = fonts.length; i < len;++ i) {
        if(detector.detect(fonts[i])) this.fontsData += '1';
        else this.fontsData += '0';
    }

    this.postData['fonts'] = this.fontsData;

    console.log("Sent " + this.urls.length + " images");
    $('#manufacturer.modal').modal('show');
    $('#submitBtn').prop('disabled', true);
    $('#manufacturer.selectpicker').on('changed.bs.select', function() {
      $('#submitBtn').prop('disabled', false);
    });
    $('#submitBtn').click({self : this}, function(event) {
      var self = event.data.self;
      self.postData['manufacturer'] = $("#manufacturer.selectpicker").val();
      $('#manufacturer.modal').modal('hide');

      $.ajax({
        url : "http://" + ip_address + "/collect.py",
        dataType : "html",
        type : 'POST',
        data : JSON.stringify(self.postData),
        success : function(data) {
          if (data === 'user_id error') {
            window.location.href = error_page;
          } else {
            console.log(data);
            num = data.split(',')[0];
            code = data.split(',')[1];
            if (num < '3') {
              $('#instruction')
                  .append('You have finished <strong>' + num +
                          '</strong> browsers<br>');

              if (!requests.hasOwnProperty('automated') ||
                  requests['automated'] === 'true') {
                $('#instruction')
                    .append(
                        'Please close this browser and check a different browser for your completion code');

              } else {
                $('#instruction')
                    .append('Now open the link:<br><a href="' + url + '">' +
                            url + '</a> <br>');
                $('<button type="button" class="btn btn-default">Copy</button>')
                    .appendTo($('#instruction'))
                    .click({text : url}, function(event) {
                      var text = event.data.text;
                      var textarea =
                          $('<textarea>' + text + '</textarea>')
                              .prop(
                                  'style',
                                  'position: absolute; left: -9999px; top: 0px;')
                              .appendTo($('body'))
                              .select();
                      var copySupported =
                          document.queryCommandSupported('copy');
                      if (copySupported) {
                        document.execCommand('copy');
                      } else {
                        window.alert("Copy to clipboard: Ctrl+C, Enter", text);
                      }
                      textarea.remove();
                    })
                    .prop('style', 'float: right; margin: 5px;');

                $('#instruction')
                    .append(
                        '<br><br>with another browser on <em>this</em> computer')
                    .append(
                        '<div id= "browsers" style="text-align: center;">(Firefox, chrome, safair or edge)</div>');
              }
            } else {
              $('#instruction')
                  .append('You have finished <strong>' + num +
                          '</strong> browsers<br>Your code is ' + code +
                          '<br> <strong>Thank you!</strong>');
            }
            $('.selectpicker').selectpicker('hide');
            progress(100);
            Cookies.set('machine_fingerprinting_userid', user_id);
          }
        }
      });
    });
  }

  /* Converts the charachters that aren't UrlSafe to ones that are and
    removes the padding so the base64 string can be sent
  */
  Base64EncodeUrlSafe = function(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
  };

  stringify = function(array) {
    var str = "";
    for (var i = 0, len = array.length; i < len; i += 4) {
      str += String.fromCharCode(array[i + 0]);
      str += String.fromCharCode(array[i + 1]);
      str += String.fromCharCode(array[i + 2]);
    }

    // NB: AJAX requires that base64 strings are in their URL safe
    // form and don't have any padding
    var b64 = window.btoa(str);
    return Base64EncodeUrlSafe(b64);
  };
};

Uint8Array.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0)
    return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this[i];
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
