var ven, ren;
var urls = [];
var canvas_number = 9;
var finished = 0;

function getDataFromCanvas(ctx, canvasName){
    var w = 256, h = 256;
    pixels = ctx.getImageData(0, 0, w, h).data;
    // Send pixels to server
    toServer(false, "None", "None", pixels.hashCode(), 8, pixels);

    console.log("CTX: " + pixels.hashCode());
}

function getData(gl, canvasName, id){
    var canvas = document.getElementById(canvasName);
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
    if(canvasName == 'cube_no_texture')
        toServer(WebGL, ven, ren, pixels.hashCode(), 0, pixels);
    else if(canvasName == 'line')
        toServer(WebGL, ven, ren, pixels.hashCode(), 1, pixels);
    else if(canvasName == 'curve')
        toServer(WebGL, ven, ren, pixels.hashCode(), 2, pixels);
    else if(canvasName == 'model_tiles')
        toServer(WebGL, ven, ren, pixels.hashCode(), 3, pixels);
    else if(canvasName == 'model_wood')
        toServer(WebGL, ven, ren, pixels.hashCode(), 4, pixels);
    else if(canvasName == 'simple_color')
        toServer(WebGL, ven, ren, pixels.hashCode(), 5, pixels);
    else if(canvasName == 'simple_wood')
        toServer(WebGL, ven, ren, pixels.hashCode(), 6, pixels);
    else if (canvasName == 'vid_can_gl')
        toServer(WebGL, ven, ren, pixels.hashCode(), 7, pixels);

    console.log(canvasName + ": " + pixels.hashCode());
}


function toServer(WebGL, inc, gpu, hash, id, dataurl){ //send messages to server and receive messages from server
    urls[id] = dataurl;
    finished ++;
    if(finished < canvas_number) return ;

    /*var pixels = "";
    for(var i = 0;i < canvas_number;++ i){
        pixels += urls[i].stringify();
        if(i != canvas_number - 1) pixels += ' ';
    }*/
    postData = {WebGL: WebGL, inc: inc, gpu: gpu, hash: hash, images: urls};

    $.ajax({
        url:"http://54.85.74.36/collect.py",
        dataType:"json",
        type: 'POST',
        data: JSON.stringify(postData),
        success:function(data) {
            alert(data);
        }
    });
}

Uint8Array.prototype.stringify = function() {
    var str = '[';
    for (var i = 0, len = this.length; i < len; ++i) {
        if(i) str += ',';
        str += this[i].toString();
    }
    str += ']';
    return str;
}

Uint8Array.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this[i];
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
