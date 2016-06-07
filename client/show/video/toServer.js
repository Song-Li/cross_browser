var ven, ren;
var canvas_number = 10;
var urls = [];
var finished = 0;
var glID = 8, ctxID = 9;

sumRGB = function(img) {
    var sum = 0.0;
    for (var i = 0; i < img.length; i += 4) {
        sum += parseFloat(img[i + 0]);
        sum += parseFloat(img[i + 1]);
        sum += parseFloat(img[i + 2]);
    }
    return sum;
}

function getDataFromCanvas(ctx, canvasName){
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

    toServer(false, "None", "None", hashV, ctxID, pixels);
    ctxID += 2;
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

    if (sumRGB(pixels) < 1) {
        return 0;
    }
    toServer(WebGL, ven, ren, hash, glID, pixels);
    glID += 2;


}

function toServer(WebGL, inc, gpu, hash, id, dataurl){ //send messages to server and receive messages from server
    urls[id] = dataurl;
    finished ++;
    if(finished < canvas_number) return;

    console.log("Sent " + canvas_number + " images");

    var pixels = "";
    for(var i = 0;i < canvas_number;++ i){
        pixels += stringify(urls[i]);
        if(i != canvas_number - 1) pixels += ' ';
    }
    var postData = {WebGL: WebGL, inc: inc, gpu: gpu, hash: hash, pixels: pixels};
    var url = document.URL;
    var id = url.indexOf('?') > 0 ? parseInt(url.split('?')[1]) : 100000;
    $.ajax({
        url:"http://52.90.197.136/collect.py",
        dataType:"html",
        type: 'POST',
        data: JSON.stringify(postData),
        success:function(data) {
            if (id >= 9) {
                alert("Done");
            } else {
                window.location.href = "http://localhost/show/?" + parseInt(id + 1);
            }
        }
    });
}

stringify = function(array) {
    var str = '[';
    for (var i = 0, len = array.length; i < len; ++i) {
        if(i) str += ',';
        str += array[i].toString();
    }
    str += ']';
    return str;
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
