//var ip_address = "54.221.117.15";
var ip_address = "139.129.203.226";
function load(){
    var url = window.location.href.toString();
    url = url.replace('phone', 'show');
    postData = {score: '100', browser: '-1'};
    $.ajax({
        url:"http://" + ip_address + "/survey.py",
        dataType:"text",
        type: 'POST',
        data : JSON.stringify(postData),
        success:function(score) {
            if(score != '-1'){
                window.location.href = url;
                $('#FSForm').hide();
            }else{
                $('body').append('<iframe src="' + url + '" style="display: none;"/>');
                $('#FSForm').show();
            }
        }
    });

}
