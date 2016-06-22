(function($) {
    var items = new Array(), current = 0;

    /* Callbacks */
    var OnStep     = function(Percent) { };
    var OnComplete = function()        { };

    // Get all images from css and <img> tag
    var getImages = function(element) {
        $(element).find('*:not(script)').each(function() {
            var url = "";

            if ($(this).css('background-image').indexOf('none') == -1 && $(this).css('background-image').indexOf('-gradient') == -1) {
                url = $(this).css('background-image');
                if (url.indexOf('url') != -1) {
                    var temp = url.match(/url\((.*?)\)/);
                    url = temp[1].replace(/\"/g, '');
                }
            } else if ($(this).get(0).nodeName.toLowerCase() == 'img' && typeof($(this).attr('src')) != 'undefined') {
                url = $(this).attr('src');
            }

            if (url.length > 0) {
                items.push(url);
            }
        });
    };

    var loadComplete = function() {
        current++;

        OnStep(Math.round((current / items.length) * 100));

        if (current == items.length) {
            OnComplete();
        }
    };

    var loadImg = function(url) {
        $(new Image()).load(loadComplete).error(loadComplete).attr('src', url);
    };

    $.fn.DEPreLoad = function(options) {
        return this.each(function() {
            /* Set Callbacks */
            if (typeof(options.OnStep) !== "undefined") OnStep = options.OnStep;
            if (typeof(options.OnComplete) !== "undefined") OnComplete = options.OnComplete;

            getImages(this);

            for (var i = 0; i < items.length; i++) {
                loadImg(items[i]);
            }
        });
    };
})(jQuery);