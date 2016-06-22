![DePreLoad js image preloader](https://cloud.githubusercontent.com/assets/8479569/6285799/848d8eba-b919-11e4-92c2-60fe9e7ef7e2.jpg "DePreLoad js image preloader")

DEPreLoad.js - [DEMO](http://demos.weare.de.com/depreloadjs/)
=========

Include this in your page in `<head>`, or before `</body>`:

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="jquery.DEPreLoad.js"></script>
```

Initialize the plugin within document ready function:

```javascript
$(document).ready(function() {
    var loader = $("body").DEPreLoad({
        OnStep: function(percent) {},
        OnComplete: function() {}
    });
});
```
