//var ip_address = "54.221.117.15"
var ip_address = "139.129.203.226";
//var ip_address = "128.180.123.19";
var domain = "mfcn.songli.us"

function addUID(uid){
    var link = 'http://' + domain + '/phone/?user_id=' + uid + '&automated=false'
    window.location.replace(link);
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
        url:"http://" + ip_address + "/getid_cn.py",
        dataType:"text",
        type: 'POST',
        data: postData,
        success:function(uid) {
            Cookies.set('machine_fingerprinting_userid', uid,
                {expires: new Date(2020, 1, 1)});
            addUID(uid);
            console.log(uid);
        }
    });
}
