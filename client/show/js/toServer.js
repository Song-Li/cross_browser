var ven, ren;
var canvas_number = 12;
var urls = [];
var finished = 0;
var ip_address = "184.73.16.65";
var error_page = "http://www.songli.us/error.html"
// var ip_address = "128.180.123.19";
// var ip_address = "52.90.197.136";

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
    var WebGL = true;

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
    else if(canvasName == 'transparent_susan')
        toServer(WebGL, ven, ren, hash, 7, pixels);
    else if(canvasName == 'cube')
        toServer(WebGL, ven, ren, hash, 8, pixels);
    else if(canvasName == 'line')
        toServer(WebGL, ven, ren, hash, 9, pixels);
    else if (canvasName == 'three_lighting')
        toServer(WebGL, ven, ren, hash, 10, pixels);
    else if (canvasName == 'three_shadow')
        toServer(WebGL, ven, ren, hash, 11, pixels);
    else if (canvasName.indexOf("vid_can_gl_") >= 0) {
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
    progress(finished / canvas_number * 98);
    if(finished < canvas_number) return;

    console.log("Sent " + canvas_number + " images");

    var pixels = "";
    for(var i = 0; i < canvas_number; ++i){
        if (i != 0) pixels += ' ';
        pixels += stringify(urls[i]);
    }

    var url = document.URL;
    var hasCommand = url.indexOf('?') >= 0;

    var requests = {};
    if (hasCommand) {
        var commands = url.split('?')[1].split('&');
        for (var i = 0; i < commands.length; i++) {
            var seq = commands[i].split('=');
            requests[seq[0]] = seq[1];
        }
    }

    if (!requests.hasOwnProperty('user_id')) {
        window.location.href = error_page;
    }
    var user_id = parseInt(requests['user_id']);

    var postData = {WebGL: WebGL, inc: inc, gpu: gpu, hash: hash, user_id: user_id, pixels: pixels};


    /*
    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://" + ip_address + "/collect.py");
    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',JSON.stringify(postData));
    f.appendChild(i);
    f.submit();

    return ;
*/

    $.ajax({
        url:"http://" + ip_address + "/collect.py",
        dataType:"html",
        type: 'POST',
        data: JSON.stringify(postData),
        success:function(data) {
            console.log(data);
            num = data.split(',')[0];
            code = data.split(',')[1];
            if(num != '3'){
                $('#instruction').append('You have finished <strong>' + num + '</strong> browsers<br>Now open the link:<br><a href="' + url + '">' + url + '</a><br>with another browser');
                $('#instruction').append('<div id= "browsers">(Firefox, chrome, safair or edge)</div>');
            }else{
                $('#instruction').append('You have finished <strong>' + num + '</strong> browsers<br>Your code is ' + code + '<br> <strong>Thank you!</strong>');

            }
            progress(100);
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
    for (var i = 0, len = array.length; i < len; i += 4) {
        str += String.fromCharCode(array[i + 0]);
        str += String.fromCharCode(array[i + 1]);
        str += String.fromCharCode(array[i + 2]);
    }

    // NB: AJAX requires that base64 strings are in their URL safe
    // form and don't have any padding
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
