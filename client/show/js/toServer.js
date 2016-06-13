var ven, ren;
var canvas_number = 8;
var urls = [];
var finished = 0;

sumRGB = function(img) {
    var sum = 0.0;
    for (var i = 0; i < img.length; i += 4) {
        sum += parseFloat(img[i + 0]);
        sum += parseFloat(img[i + 1]);
        sum += parseFloat(img[i + 2]);
    }
    return sum;
}

function getDataFromCanvas(ctx, id){
    function hash (array) {
        var hash = 0, i, chr, len;
        if (array.length === 0) return hash;
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

    toServer(false, "None", "None", hashV, id, pixels);
    return 1;
}

function getData(gl, canvasName, id){
    var canvas = document.getElementById(canvasName);
    var WebGL;
    if(canvas.getContext('webgl'))
        WebGL = true;
    else
        WebGL = false;

    var pixels = new Uint8Array(256*256*4);
    gl.readPixels(0,0,256,256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if(debugInfo){
        ven = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        ren = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }else{
        console.log("debugInfo is not accessable");
        ven = 'No debug Info';
        ren = 'No debug Info';
    }
    var hash = pixels.hashCode();
    console.log(canvasName + ": " + hash);

    if(canvasName == 'texture_simple')
        toServer(WebGL, ven, ren, hash, 0, pixels);
    else if(canvasName == 'texture_susan')
        toServer(WebGL, ven, ren, hash, 1, pixels);
    else if(canvasName == 'simple_light_simple')
        toServer(WebGL, ven, ren, hash, 2, pixels);
    else if(canvasName == 'simple_light_susan')
        toServer(WebGL, ven, ren, hash, 3, pixels);
    else if(canvasName == 'more_light_simple')
        toServer(WebGL, ven, ren, hash, 4, pixels);
    else if(canvasName == 'more_light_susan')
        toServer(WebGL, ven, ren, hash, 5, pixels);
    else if(canvasName == 'transparent_simple')
        toServer(WebGL, ven, ren, hash, 6, pixels);
    else if(canvasName == 'transparent_susan') {
        toServer(WebGL, ven, ren, hash, 7, pixels);
    } else {
        if (sumRGB(pixels) < 1) {
            return 0;
        }
        toServer(WebGL, ven, ren, hash, id, pixels);
    }
    return 1;
}

function toServer(WebGL, inc, gpu, hash, id, dataurl){ //send messages to server and receive messages from server
    urls[id] = dataurl;
    finished++;
    if(finished < canvas_number) return;

    console.log("Sent " + canvas_number + " images");

    var pixels = "";
    for(var i = 0; i < canvas_number; ++i){
        if (i != 0) pixels += ' ';
        pixels += stringify(urls[i]);
    }
    var postData = {WebGL: WebGL, inc: inc, gpu: gpu, hash: hash, pixels: pixels};
    var url = document.URL;
    var hasCommand = url.indexOf('?') > 0;
    var id, stop;
    if (hasCommand) {
        var command = url.split('?')[1];
        var id = parseInt(command.split('-')[0]);
        var stop = parseInt(command.split('-')[1]);
    }

    $.ajax({
        url:"http://52.90.197.136/collect.py",
        dataType:"html",
        type: 'POST',
        data: JSON.stringify(postData),
        success:function(data) {
            if (!hasCommand || id >= stop) {
                alert(data);
            } else {
                window.location.href = "http://localhost/show/?" + parseInt(id + 1) + "-" + stop;
            }
        }
    });
}


/* Converts the charachters that aren't UrlSafe to ones that are and
  removes the padding so the base64 string can be sent as is
*/
Base64EncodeUrlSafe = function(str){
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

stringify = function(array) {
    var str = "";
    for (var i = 0, len = array.length; i < len; ++i) {
        str += String.fromCharCode(array[i]);
    }
    // NB: JSON doesn't support sending b64 padding so it needs to be
    // removed
    var b64 = window.btoa(str);
    return Base64EncodeUrlSafe(b64);
}

Uint8Array.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this[i];
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
