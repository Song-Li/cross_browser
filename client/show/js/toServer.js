var ip_address = "184.73.16.65";
var error_page = "http://mf.songli.us/error"
// var ip_address = "128.180.123.19";
// var ip_address = "52.90.197.136";
var sender = null;
var Sender = function() {

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
  this.getID = function() { return this.nextID++; };
  this.getIDs = function(numIDs) {
    var idList = [];
    for (var i = 0; i < numIDs; i++) {
      idList.push(this.getID());
    }
    return idList;
  };

  this.getDataFromCanvas = function(ctx, id) {
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

    if (sumRGB(pixels) < 1.0)
      return 0;
    this.toServer(false, "None", "None", hashV, id, pixels);
    return 1;
  };

  this.getData = function(gl, id) {
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

    if (sumRGB(pixels) < 1) {
      return 0;
    }
    this.toServer(WebGL, ven, ren, hash, id, pixels);
    return 1;
  };

  this.urls = [];
  this.finished = 0;
  this.toServer = function (
      WebGL, inc, gpu, hash, id,
      dataurl) { // send messages to server and receive messages from server
    this.urls[id] = dataurl;
    this.finished++;
    progress(this.finished / this.nextID * 98.0);
    if (this.finished < this.nextID)
      return;

    console.log("Sent " + this.nextID + " images");

    var pixels = "";
    for (var i = 0; i < this.nextID; ++i) {
      if (i != 0)
        pixels += ' ';
      pixels += stringify(this.urls[i]);
    }

    var postData = {
      WebGL : WebGL,
      inc : inc,
      gpu : gpu,
      hash : hash,
      user_id : user_id,
      pixels : pixels
    };

    /*var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://" + ip_address + "/collect.py");
    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',JSON.stringify(postData));
    f.appendChild(i);
    f.submit();

    return ;*/

    $.ajax({
      url : "http://" + ip_address + "/collect.py",
      dataType : "html",
      type : 'POST',
      data : JSON.stringify(postData),
      success : function(data) {
        if (data === 'user_id error') {
          window.location.href = error_page;
        } else {
          num = data.split(',')[0];
          code = data.split(',')[1];
          if (num != '3') {
            $('#instruction')
                .append(
                    'You have finished <strong>' + num +
                    '</strong> browsers<br>Now open the link:<br><a href="' +
                    url + '">' + url +
                    '</a><br>with another browser on <em>this</em> computer');
            $('#instruction')
                .append(
                    '<div id= "browsers">(Firefox, chrome, safair or edge)</div>');
          } else {
            $('#instruction')
                .append('You have finished <strong>' + num +
                        '</strong> browsers<br>Your code is ' + code +
                        '<br> <strong>Thank you!</strong>');
          }
          progress(100);
          Cookies.set('machine_fingerprinting_userid', user_id);
        }
      }
    });
  };

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
