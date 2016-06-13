var pixels = new Uint8Array(262144);
var ven, ren;

function getData(gl, canvasName, pic_id){
    var canvas = document.getElementById(canvasName);
    if(canvas.getContext('webgl'))
        WebGL = true;
    else
        WebGL = false;

    gl.readPixels(0,0,256,256,gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    var pi = stringify(pixels);
    toServer(pic_id, pi);
}


function toServer(pic_id, pi){ //send messages to server and receive messages from server
    postData = {pic_id: pic_id, pixels: pi};

/*
    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://128.180.123.19/gradient.py");
    
    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',JSON.stringify(postData));
    
    f.appendChild(i);

    f.submit();
    return ;

    */

    $.ajax({
        url:"http://128.180.123.19/gradient.py",  
        dataType:"html",
        type: 'POST',
        data: JSON.stringify(postData),
        success:function(data) {
            if(pic_id >= 255){
                alert("finished");
                return ;
            }
            window.location.href = "http://128.180.123.19/mf/gradient/?" + parseInt(pic_id + 1);
//            window.location.href = "http://54.85.74.36:9876/?" + parseInt(pic_id + 1);
        }
    }); 
}

Base64EncodeUrlSafe = function(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

stringify = function(array) {
    var str = "";
    for (var i = 0, len = array.length; i < len; ++i) {
        str += String.fromCharCode(array[i]);
    }

    // NB: AJAX requires that base64 strings are in their URL safe
    // forum and don't have any padding
    var b64 = window.btoa(str);
    return Base64EncodeUrlSafe(b64);
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
