var ip_address = "184.73.16.65"

function killCookie() {
    Cookies.set('machine_fingerprinting_userid', 1,
        { expires: new Date(2000, 01, 01) });
}

function addUID(uid){
    var link = 'http://mf.songli.us/show/?user_id=' + uid + '&automated=false'
    $('<a href=' + link + '>' + link + '</a>').appendTo($('#uid'));
    $('<button type="button" class="btn btn-default">Copy</button>')
        .appendTo($('#uid'))
        .click({text: link}, function(event) {
            var text = event.data.text;
            var textarea = $('<textarea>' + text + '</textarea>')
                .prop('style', 'position: absolute; left: -9999px; top: 0px;')
                .appendTo($('body'))
                .select();
            var copySupported = document.queryCommandSupported('copy');
            if (copySupported) {
                document.execCommand('copy');
            } else {
                window.alert("Copy to clipboard: Ctrl+C, Enter", text);
            }
            textarea.remove();
        });
    $("#link").append('2. Open <a href="' + link + '">your link</a> with 3 browsers on THIS computer');
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
