//var ip_address = "139.129.203.226";
var ip_address = "54.221.117.15";
function parseForm(form){
    var res = $('input[type="radio"]:checked');
    var score = 10;
    if(res.length < 11)
        alert("您还有未选择的问题, 请重新选择");
    else{
        for(var i = 0;i < res.length;++ i){
            if(i == 8 || i == 9) continue;
            if(i == 0 || i == 2){
                if(res[i].value == 'Radio-0') score += 10;
                else if(res[i].value == 'Radio-1') score += 5;
            }else if(i == 4){
                if(res[i].value == 'Radio-3') score += 10;
                else if(res[i].value == 'Radio-2') score += 5;
                else if(res[i].value == 'Radio-1') score += 2.5;
            }else if(i == 10){
                if(res[i].value == 'Radio-1') score += 10;
            }else
                if(res[i].value == 'Radio-0') score += 10;
        }
    }
    postData = {score: '100', browser: '-1'};
    postData['score'] = score;
    postData['browser'] = res[8].value;

    $.ajax({
        url:"http://" + ip_address + "/survey.py",
        dataType:"text",
        type: 'POST',
        data : JSON.stringify(postData),
        success:function(score) {
            $('#FSForm').hide();
            $('#broken').show();
        }
    });
    return false;
}
