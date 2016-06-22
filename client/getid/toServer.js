var ip_address = "184.73.16.65"

function addUID(uid){
    $("#uid").append('<a href="http://www.songli.us/mf/show/?' + uid + '">http://www.songli.us/mf/show/?' + uid + '</a>');
}

function generateUID(){
    postData = 'GetUID';

    /*
    var f = document.createElement("form");
    f.setAttribute('method',"post");
    f.setAttribute('action',"http://" + ip_address + "/getid.py");

    var i = document.createElement("input"); //input element, text
    i.setAttribute('type',"text");
    i.setAttribute('name',"Refresh");

    f.appendChild(i);

    f.submit();
    return ;
*/

    $.ajax({
        url:"http://" + ip_address + "/getid.py",
        dataType:"text",
        type: 'POST',
        data: postData,
        success:function(uid) {
            addUID(uid);
            console.log(uid);
        }
    });
}
