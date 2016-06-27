// var ip_address = "128.180.123.19"
var ip_address = "184.73.16.65"
var root = "http://" + ip_address + "/images/generated/"

$(function() {
    generatePage();
});

function generateButton(name){
    $('<button type="button" class="btn">'
        + name
        + "</button>")
        .click(function() {
            text = this.textContent;
            toServer(text);
        })
        .appendTo($("#left"));
    $('<br/>').appendTo($("#left"));
}

function generateImg(src, parent){
    $('<img src="' + src + '"'
        + 'class="img"/>').appendTo(parent);
}

function subtractButton(name, parent){
    $('<button type="button" style="float: right;">'
        + "subtract"
        + "</button>")
        .click({name: name}, function(event) {
            toServer(event.data.name);
        })
        .appendTo(parent);
}

function clearPage(){
    $("#right").children().remove();
}

function generatePage(){

    clearPage();
    $("#left").children().remove(); //clear left div
    postData = 'Refresh';

    /*var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://" + ip_address + "/result.py");

    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',"Refresh");

    f.appendChild(i);

    f.submit();
    return ;*/

    $.ajax({
        url:"http://" + ip_address + "/result.py",
        dataType:"text",
        type: 'POST',
        data: postData,
        success:function(data) {
            console.log(data);
            var res = JSON.parse(data.toString());
            var len = res.length;
            generateButton('Refresh');
            for(var i = 0;i < len;++ i){
                generateButton(res[i]);
            }
        }
    });

}

function Base64DecodeUrl(str){
    return str.replace(/-/g, '+').replace(/_/g, '/');
}

function draw(ip, hashCodes){
    var numImages;
    for (browser in hashCodes) {
        numImages = hashCodes[browser].length;
        break;
    }
    var canSubtract = Object.keys(hashCodes).length == 3;
    for (var i = 0; i < numImages; i++) {
        var div1 = $('<div class="imgDiv"/>').appendTo($('#right'));
        $('<br/><div> This - Standard and Standard - This </div> <br/>').appendTo($('#right'));
        var div2 = $('<div class="imgDiv"/>').appendTo($('#right'));
        for (browser in hashCodes) {
            var innerDiv = $('<div class="innerDiv"/>').appendTo(div1);
            generateImg(root + ip + '/' + browser + '_' + i + '_0' + ".png", innerDiv);
            generateImg(root + ip + '/' + browser + '_' + i + '_1' + ".png", innerDiv);
            $('<p>Hashcode: ' + Base64DecodeUrl(hashCodes[browser][i]) + '</p>').appendTo(innerDiv);
            innerDiv = $('<div class="innerDiv"/>').appendTo(div2);
            generateImg(root + ip + '/' + browser + '_' + i + '_2' + ".png", innerDiv);
            generateImg(root + ip + '/' + browser + '_' + i + '_3' + ".png", innerDiv);
        }
        if (canSubtract) {
            subtractButton('S,' + ip + ',' + i, $('#right'));
        }
        $('<br/><br/>').appendTo($('#right'));
    }
}

function toServer(id){ //send messages to server and receive messages from server
    postData = id.toString();
    if(postData[0] == 'R'){
        generatePage();
        return ;
    }

    /*var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://" + ip_address + "/result.py");

    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',postData);

    f.appendChild(i);

    f.submit();
    return ;*/


    $.ajax({
        url:"http://" + ip_address + "/result.py",
        dataType:"text",
        type: 'POST',
        data:postData,
        success:function(data) {
            if (postData[0] == 'S'){
                window.location.replace("http://mf.songli.us/difference/");
            }
            clearPage();
            var hashCodes = JSON.parse(data.toString());
            draw(postData, hashCodes);
        }
    });
}

