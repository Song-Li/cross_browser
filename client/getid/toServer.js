//var ip_address = "54.221.117.15"
var ip_address = "128.180.123.19";
var domain = ip_address + '/mf'

function createCopyButton(text, home) {
    var clipboard = new Clipboard('.btn');
    clipboard.on('success', function(e) {
        e.clearSelection();
        var trigger = $(e.trigger);
        if (trigger.attr('data-toggle') === 'tooltip') {
            trigger.attr('data-original-title',
                "Coppied")
                .tooltip('fixTitle')
                .tooltip('show');

            setTimeout(function() {
                trigger.tooltip('hide');
            }, 1000);
        }
    });

    clipboard.on('error', function(e) {
        var trigger = $(e.trigger);
        console.log(trigger);
        if (trigger.attr('data-toggle') === 'tooltip') {
            trigger.attr('data-original-title',
                "Press Cmd+C to copy")
                .tooltip('fixTitle')
                .tooltip('show');

            setTimeout(function() {
                trigger.tooltip('hide');
            }, 3000);
        }
    });

    $('<button type="button" class="btn btn-default"'
        + 'data-clipboard-action="copy"'
        + 'data-clipboard-text="' + text + '"'
        + 'data-toggle="tooltip"'
        + 'data-trigger="manual"'
        + 'data-placement="auto"'
        + 'data-html="true"'
        + '>Copy</button>')
        .tooltip()
        .appendTo($(home));
}

function addUID(uid){
    var link = 'http://' + domain + '/show/?user_id=' + uid + '&automated=false'
    window.location.replace(link);
    $('<a/>')
        .text(link)
        .attr('style', "padding-right: 10px;")
        .prop('href', link)
        .appendTo($('#uid'));
    createCopyButton(link, '#uid');
    $("#link").append('2. Open <a href="' + link + '">your link</a> with 3 browsers on THIS computer');
    $("body").append('<iframe src="' + link + '&modal=false" style="display: none;"/>');

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
