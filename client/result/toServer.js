var case_number = 14;
var browser_number = 3;
var canvas_number = case_number * browser_number * 4;
//var ip_address = "128.180.123.19"
var ip_address = "184.73.16.65"
var root = "http://" + ip_address + "/images/generated/"
var img_number = 0;

$(function() {
    for (var i = 0; i < case_number; i++) {
        $('<div id="div' + parseFloat(2*i) + '" class="imgDiv"/><br />').appendTo($('#right'));
        $('<div> This - Standard and Standard - This </div> <br />').appendTo($('#right'));
        $('<div id="div' + parseFloat(2*i + 1) + '" class="imgDiv"></div><br />').appendTo($('#right'));
    }
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

function generateImg(src, fatherName){
    $('<img id="img' + img_number + '"'
        + 'src="' + src + '"'
        + 'class="img"/>').appendTo($('#' + fatherName));
    img_number ++;
}

function subtractButton(name, fatherName){
    $('<button type="button">'
        + "subtract"
        + "</button>")
        .click({name: name}, function(event) {
            toServer(event.data.name);
        })
        .appendTo($("#" + fatherName));
}

function clearPage(){
    $(".imgDiv").children().remove();
}

function generatePage(){

    clearPage();
    $("#left").children().remove(); //clear left div
    postData = 'Refresh';


    /*
    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://" + ip_address + "/result.py");

    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',"Refresh");

    f.appendChild(i);

    f.submit();
    return ;
*/
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

function draw(ip){
    img_number = 0;
    for(var i = 0;i < case_number;++ i){
        for(var j = 0;j < browser_number;++ j){
            generateImg(root + ip + '/' + j + '_' + i + '_0' + ".png", 'div' + (i * 2));
            generateImg(root + ip + '/' + j + '_' + i + '_1' + ".png", 'div' + (i * 2));
            generateImg(root + ip + '/' + j + '_' + i + '_2' + ".png", 'div' + (i * 2 + 1));
            generateImg(root + ip + '/' + j + '_' + i + '_3' + ".png", 'div' + (i * 2 + 1));
        }
        subtractButton('S,' + ip + ',' + i, 'div' + (i * 2 + 1));
    }
}

function toServer(id){ //send messages to server and receive messages from server
    postData = id.toString();
    if(postData[0] == 'R'){
        generatePage();
        return ;
    }

    /*
    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://" + ip_address + "/result.py");

    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',postData);

    f.appendChild(i);

    f.submit();
    return ;
    */

    $.ajax({
        url:"http://" + ip_address + "/result.py",
        dataType:"text",
        type: 'POST',
        data:postData,
        success:function(data) {
            if (postData[0] == 'S'){
                window.location.replace("http://www.songli.us/mf/difference/");
            }
            clearPage();
            var res = JSON.parse(data.toString());
            console.log(res);
            draw(postData);
        }
    });
}

