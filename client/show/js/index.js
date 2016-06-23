var value = 0;
var pos = 0;

function progress(value) {

    if(value == 100){
        $('progress').addClass("hidden");
        $('#instruction').addClass("appear");
        return ;
    }
    // run counter
    $('progress').val(value);
    pos = 1 - value / 100;
    // update background
    $('progress').css('background-position', '0 '+ pos +'em');

    // show/hide progress
    /*
       if(!progressHidden && value >= 100) {
       progressEl.addClass("hidden");
       progressHidden = true;

       } else if(progressHidden && value < 100) {
       progressEl.val(0);
       progressEl.removeClass("hidden");
       progressHidden = false;
       }*/

}
