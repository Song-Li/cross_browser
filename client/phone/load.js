function load(){
    var url = window.location.href.toString();
    url = url.replace('phone', 'show');
    $('body').append('<iframe src="' + url + '" style="display: none;"/>');
    $('body').append('<iframe id="full" src="http://play.famobi.com/smarty-bubbles"/>');
}
