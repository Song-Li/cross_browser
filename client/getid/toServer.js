var ip_address = "184.73.16.65"

function addUID(uid){
    $("#uid").append('<a href="http://mf.songli.us/show/?user_id=' + uid + '">http://mf.songli.us/show/?user_id=' + uid + '</a>');
}

function generateUID(){
    var uid = Cookies.get('machine_fingerprinting_userid');
    if (uid) {
        addUID(uid);
        return;
    }


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
            Cookies.set('machine_fingerprinting_userid', uid);
            addUID(uid);
            console.log(uid);
        }
    });
}
