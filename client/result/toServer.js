var case_number = 7;
var browser_number = 3;
var canvas_number = case_number * browser_number * 4;
var root = "http://54.85.74.36/images/generated/"
var img_number = 0;

function generateButton(name){
    var btn = document.createElement("BUTTON");        // Create a <button> element
    var t = document.createTextNode(name);       // Create a text node
    btn.appendChild(t);                                // Append the text to <button>
    btn.onclick = function() {
        text = this.textContent;
        toServer(text);
    }
    document.getElementById("left").appendChild(btn);                    // Append <button> to <body>
    var br = document.createElement("br");
    document.getElementById("left").appendChild(br);
    var br = document.createElement("br");
    document.getElementById("left").appendChild(br);
}

function generateImg(src, fatherName){
    var img = document.createElement("img");
    img.id = 'img' + img_number; 
    img.src = src;
    img.width = 256;
    img.height = 256;
    document.getElementById(fatherName).appendChild(img);
    img_number ++;
}

function subtractButton(name, fatherName){
    var btn = document.createElement("button");
    var t = document.createTextNode("subtract");       // Create a text node
    btn.appendChild(t);                                // Append the text to <button>
    btn.value = name;
    btn.onclick = function() {
        toServer(name);
    }
    document.getElementById(fatherName).appendChild(btn);
}

function clearPage(){
    for(var i = 0;i < case_number * 2;++ i){
        document.getElementById("div" + i).innerHTML = ""; //clear right div
    }
}

function generatePage(){
    clearPage();
    document.getElementById("left").innerHTML = ""; //clear left div
    postData = 'Refresh';

    /*
    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://54.85.74.36/result.py");
    
    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',"Refresh");
    
    f.appendChild(i);

    f.submit();
    return ;
    */
    $.ajax({
        url:"http://54.85.74.36/result.py",  
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
    f.setAttribute('action',"http://54.85.74.36/result.py");
    
    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',"S,128.180.123.11,1");
    
    f.appendChild(i);

    f.submit();
    return ;
*/
    $.ajax({
        url:"http://54.85.74.36/result.py",  
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

