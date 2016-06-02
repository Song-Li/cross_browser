var pixels = new Uint8Array(262144);
var ven, ren;

function getData(gl, canvasName, pic_id){
    var canvas = document.getElementById(canvasName);
    if(canvas.getContext('webgl'))
        WebGL = true;
    else
        WebGL = false;

    gl.readPixels(0,0,256,256,gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    var pi = '[';
    var s = 256 * 256 * 4;
    for(var i = 0;i < s;++ i){
        if(i) pi += ',';
        pi += pixels[i].toString();
    }
    pi += ']';
    toServer(pic_id, pi);
}


function toServer(pic_id, pi){ //send messages to server and receive messages from server
    postData = {pic_id: pic_id, pixels: pi};

    /*
    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://54.85.74.36/gradient.py");
    
    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',JSON.stringify(postData));
    
    f.appendChild(i);

    f.submit();
    return ;
    */
    $.ajax({
        url:"http://52.90.197.136/gradient.py",  
        dataType:"html",
        type: 'POST',
        data: JSON.stringify(postData),
        success:function(data) {
            if(pic_id >= 255){
                alert("finished");
                return ;
            }
            window.location.href = "http://songli.us/mf/gradient/?" + parseInt(pic_id + 1);
//            window.location.href = "http://54.85.74.36:9876/?" + parseInt(pic_id + 1);
        }
    }); 
}
