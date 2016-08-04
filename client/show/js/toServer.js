var ip_address = "54.221.117.15";
var error_page = "http://mf.songli.us/error"
// var ip_address = "128.180.123.19";
// var ip_address = "52.90.197.136";

function populateFontList(fontArr) {
  fonts = [];
  for (var key in fontArr) {
    var fontName = fontArr[key];

    // trim
    fontName = fontName.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    fonts.push(fontName);
  }

  sender.addFonts(fonts);
}

var Sender = function() {
    this.finalized = false;
    this.postData = {fontlist: "No Flash",
        user_id: -1,
        WebGL: false,
        inc: "Undefined",
        gpu: "Undefined",
        hash: "Undefined",
        timezone: "Undefined",
        resolution: "Undefined",
        plugins: "Undefined",
        cookie: "Undefined",
        localstorage: "Undefined",
        manufacturer: "Undefined",
        gpuImgs: [],
        adBlock: "Undefined",
        cpu_cores: "Undefined", 
        canvas_test: "Undefined", 
        langsDetected: [],
        fps: 0.0,
        video: []
    };
    sumRGB = function(img) {
        var sum = 0.0;
        for (var i = 0; i < img.length; i += 4) {
            sum += parseFloat(img[i + 0]);
            sum += parseFloat(img[i + 1]);
            sum += parseFloat(img[i + 2]);
        }
        return sum;
    };

    this.addFonts = function(fonts) {
        this.postData['fontlist'] = fonts;
    };

    this.nextID = 0;
    this.getID = function() {
        if (this.finalized) {
            throw "Can no longer generate ID's";
            return -1;
        }
        return this.nextID++;
    };

  function hashRGB(array) {
    var hash = 0, i, chr, len, j;
    if (array.length === 0)
      return hash;
    for (i = 0, len = array.length; i < len; i += 4) {
      for (j = 0; j < 3; ++j) {
        chr = array[i] | 0;
        hash ^= (((hash << 5) - hash) + chr + 0x9e3779b9) | 0;
        hash |= 0; // Convert to 32bit integer
      }
    }
    return hash;
  };

  function sumRGB(array) {
    var sum = 0;
    for (var i = 0; i < array.length; i += 4) {
      sum += array[i + 0];
      sum += array[i + 1];
      sum += array[i + 2];
    }
    return sum;
  }

  this.addFonts = function(fonts) {
    this.postData['fontlist'] = fonts;
  };

  this.nextID = 0;
  this.getID = function() {
    if (this.finalized) {
      throw "Can no longer generate ID's";
      return -1;
    }
    return this.nextID++;
  };

  this.getIDs = function(numIDs) {
    var idList = [];
    for (var i = 0; i < numIDs; i++) {
      idList.push(this.getID());
    }
    return idList;
  };

  this.postLangsDetected = function(data) {
    this.postData['langsDetected'] = data;
  };

  this.getDataFromCanvas = function(ctx, id) {
    if (!this.finalized) {
      throw "Still generating ID's";
      return -1;
    }
    function hash(array) {
      var hash = 0, i, chr, len;
      if (array.length === 0)
        return hash;
      for (i = 0, len = array.length; i < len; i++) {
        chr = array[i] | 0;
        hash ^= (((hash << 5) - hash) + chr + 0x9e3779b9) | 0;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }
    var w = 256, h = 256;
    // Send pixels to server
    var pixels = ctx.getImageData(0, 0, w, h).data;
    var hashV = hash(pixels);
    console.log("CTX: " + hashV);

    this.toServer(false, "None", "None", hashV, id, pixels);
    if (sumRGB(pixels) > 1.0) {
      return hashRGB(pixels);
    } else {
      return 0;
    }
  };

  this.getData = function(gl, id) {
    if (!this.finalized) {
      throw "Still generating ID's";
      return -1;
    }
    var WebGL = true;
    var pixels = new Uint8Array(256 * 256 * 4);
    gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    var ven, ren;
    var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      ven = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      ren = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } else {
      console.log("debugInfo is not accessable");
      ven = 'No debug Info';
      ren = 'No debug Info';
    }
    var hash = pixels.hashCode();
    console.log("gl: " + hash);

    this.toServer(WebGL, ven, ren, hash, id, pixels);
    if (sumRGB(pixels) > 1.0) {
      return hashRGB(pixels);
    } else {
      return 0;
    }
  };

  this._fps = null;
  this.setFPS = function(fps) {
    this._fps = parseFloat(fps);
    this.postData['fps'] = this._fps;
    console.log("FPS: " + this._fps);
  };
  this.calcFPS = function(times) {
    var fpses = [];
    for (var i = 1; i < times.length; i++) {
      fpses.push(1000.0 / (times[i] - times[i - 1]));
    }
    var average = 0;
    for (var i = 0; i < fpses.length; i++) {
      average += fpses[i];
    }
    this.setFPS(average / fpses.length);
  };
  this.urls = [];
  this.finished = 0;

  $("manufacturer.modal").modal('hide');

  this.toServer = function(
      WebGL, inc, gpu, hash, id,
      dataurl) { // send messages to server and receive messages from server

    this.postData['gpuImgs'][id] = {w: 256, h: 256, pixels: stringify(dataurl)};

    if (WebGL) {
      this.postData['WebGL'] = WebGL;
      this.postData['inc'] = inc;
      this.postData['gpu'] = gpu;
      this.postData['hash'] = hash;
    }
  };

  this.sendData =
      function() {

          this.fontsData = "";
          var fonts = ["cursive", "monospace", "serif", "sans-serif", "fantasy", "default", "Arial", "Arial Black", "Arial Narrow", "Arial Rounded MT Bold", "Bookman Old Style", "Bradley Hand ITC", "Century", "Century Gothic", "Comic Sans MS", "Courier", "Courier New", "Georgia", "Gentium", "Impact", "King", "Lucida Console", "Lalit", "Modena", "Monotype Corsiva", "Papyrus", "Tahoma", "TeX", "Times", "Times New Roman", "Trebuchet MS", "Verdana", "Verona"];
          fonts = fonts.concat(['Abadi MT Condensed Extra Bold', 'Abadi MT Condensed Light', 'Al Bayan Bold', 'Al Bayan Plain', 'Al Nile', 'Al Nile Bold', 'Al Tarikh Regular', 'American Typewriter', 'American Typewriter Bold', 'American Typewriter Condensed', 'American Typewriter Condensed Bold', 'American Typewriter Condensed Light', 'American Typewriter Light', 'Andale Mono', 'Anonymice Powerline', 'Anonymice Powerline Bold', 'Anonymice Powerline Bold Italic', 'Anonymice Powerline Italic', 'Apple Braille', 'Apple Braille Outline 6 Dot', 'Apple Braille Outline 8 Dot', 'Apple Braille Pinpoint 6 Dot', 'Apple Braille Pinpoint 8 Dot', 'Apple Chancery', 'Apple Color Emoji', 'Apple SD Gothic Neo Bold', 'Apple SD Gothic Neo Heavy', 'Apple SD Gothic Neo Light', 'Apple SD Gothic Neo Medium', 'Apple SD Gothic Neo Regular', 'Apple SD Gothic Neo SemiBold', 'Apple SD Gothic Neo Thin', 'Apple SD Gothic Neo UltraLight', 'Apple SD GothicNeo ExtraBold', 'Apple SD GothicNeo ExtraBold', 'Apple Symbols', 'AppleGothic Regular', 'AppleMyungjo Regular', 'Arial', 'Arial Black', 'Arial Bold', 'Arial Bold Italic', 'Arial Hebrew', 'Arial Hebrew Bold', 'Arial Hebrew Light', 'Arial Hebrew Scholar', 'Arial Hebrew Scholar Bold', 'Arial Hebrew Scholar Light', 'Arial Italic', 'Arial Narrow', 'Arial Narrow Bold', 'Arial Narrow Bold Italic', 'Arial Narrow Italic', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Arimo Bold for Powerline', 'Arimo Bold Italic for Powerline', 'Arimo for Powerline', 'Arimo Italic for Powerline', 'Athelas Bold', 'Athelas Bold Italic', 'Athelas Italic', 'Athelas Regular', 'Avenir Black', 'Avenir Black Oblique', 'Avenir Book', 'Avenir Book Oblique', 'Avenir Heavy', 'Avenir Heavy Oblique', 'Avenir Light', 'Avenir Light Oblique', 'Avenir Medium', 'Avenir Medium Oblique', 'Avenir Next Bold', 'Avenir Next Bold Italic', 'Avenir Next Condensed Bold', 'Avenir Next Condensed Bold Italic', 'Avenir Next Condensed Demi Bold', 'Avenir Next Condensed Demi Bold Italic', 'Avenir Next Condensed Heavy', 'Avenir Next Condensed Heavy Italic', 'Avenir Next Condensed Italic', 'Avenir Next Condensed Medium', 'Avenir Next Condensed Medium Italic', 'Avenir Next Condensed Regular', 'Avenir Next Condensed Ultra Light', 'Avenir Next Condensed Ultra Light Italic', 'Avenir Next Demi Bold', 'Avenir Next Demi Bold Italic', 'Avenir Next Heavy', 'Avenir Next Heavy Italic', 'Avenir Next Italic', 'Avenir Next Medium', 'Avenir Next Medium Italic', 'Avenir Next Regular', 'Avenir Next Ultra Light', 'Avenir Next Ultra Light Italic', 'Avenir Oblique', 'Avenir Roman', 'Ayuthaya', 'Baghdad Regular', 'Bangla MN', 'Bangla MN Bold', 'Bangla Sangam MN', 'Bangla Sangam MN Bold', 'Baoli SC Regular', 'Baskerville', 'Baskerville Bold', 'Baskerville Bold Italic', 'Baskerville Italic', 'Baskerville Old Face', 'Baskerville SemiBold', 'Baskerville SemiBold Italic', 'Batang', 'Bauhaus 93', 'Beirut Regular', 'Bell MT', 'Bell MT Bold', 'Bell MT Italic', 'Bernard MT Condensed', 'Big Caslon Medium', 'Bodoni 72 Bold', 'Bodoni 72 Book', 'Bodoni 72 Book Italic', 'Bodoni 72 Oldstyle Bold', 'Bodoni 72 Oldstyle Book', 'Bodoni 72 Oldstyle Book Italic', 'Bodoni 72 Smallcaps Book', 'Bodoni Ornaments', 'Book Antiqua', 'Book Antiqua Bold', 'Book Antiqua Bold Italic', 'Book Antiqua Italic', 'Bookman Old Style', 'Bookman Old Style Bold', 'Bookman Old Style Bold Italic', 'Bookman Old Style Italic', 'Bookshelf Symbol 7', 'Bradley Hand Bold', 'Braggadocio', 'Britannic Bold', 'Brush Script MT Italic', 'Calibri', 'Calibri Bold', 'Calibri Bold Italic', 'Calibri Italic', 'Calibri Light', 'Calisto MT', 'Calisto MT Bold', 'Calisto MT Bold Italic', 'Calisto MT Italic', 'Cambria', 'Cambria Bold', 'Cambria Bold Italic', 'Cambria Italic', 'Cambria Math', 'Candara', 'Candara Bold', 'Candara Bold Italic', 'Candara Italic', 'Century', 'Century Gothic', 'Century Gothic Bold', 'Century Gothic Bold Italic', 'Century Gothic Italic', 'Century Schoolbook', 'Century Schoolbook Bold', 'Century Schoolbook Bold Italic', 'Century Schoolbook Italic', 'Chalkboard', 'Chalkboard Bold', 'Chalkboard SE Bold', 'Chalkboard SE Light', 'Chalkboard SE Regular', 'Chalkduster', 'Charter Black', 'Charter Black Italic', 'Charter Bold', 'Charter Bold Italic', 'Charter Italic', 'Charter Roman', 'Cochin', 'Cochin Bold', 'Cochin Bold Italic', 'Cochin Italic', 'Colonna MT', 'Comic Sans MS', 'Comic Sans MS Bold', 'Consolas', 'Consolas Bold', 'Consolas Bold Italic', 'Consolas Italic', 'Constantia', 'Constantia Bold', 'Constantia Bold Italic', 'Constantia Italic', 'Cooper Black', 'Copperplate', 'Copperplate Bold', 'Copperplate Gothic Bold', 'Copperplate Gothic Light', 'Copperplate Light', 'Corbel', 'Corbel Bold', 'Corbel Bold Italic', 'Corbel Italic', 'Corsiva Hebrew', 'Corsiva Hebrew Bold', 'Courier', 'Courier Bold', 'Courier Bold Oblique', 'Courier New', 'Courier New Bold', 'Courier New Bold Italic', 'Courier New Italic', 'Courier Oblique', 'Cousine Bold for Powerline', 'Cousine Bold Italic for Powerline', 'Cousine for Powerline', 'Cousine Italic for Powerline', 'Curlz MT', 'Damascus Bold', 'Damascus Light', 'Damascus Medium', 'Damascus Regular', 'Damascus Semi Bold', 'DecoType Naskh Regular', 'DejaVu Sans Mono Bold for Powerline', 'DejaVu Sans Mono Bold Oblique for Powerline', 'DejaVu Sans Mono for Powerline', 'DejaVu Sans Mono Oblique for Powerline', 'Desdemona', 'Devanagari MT', 'Devanagari MT Bold', 'Devanagari Sangam MN', 'Devanagari Sangam MN Bold', 'Didot', 'Didot Bold', 'Didot Italic', 'DIN Alternate Bold', 'DIN Condensed Bold', 'Diwan Kufi Regular', 'Diwan Thuluth Regular', 'Droid Sans Mono Dotted for Powerline', 'Droid Sans Mono for Powerline', 'Droid Sans Mono Slashed for Powerline', 'Edwardian Script ITC', 'Engravers MT', 'Engravers MT Bold', 'Euphemia UCAS', 'Euphemia UCAS Bold', 'Euphemia UCAS Italic', 'Eurostile', 'Eurostile Bold', 'Farah Regular', 'Farisi Regular', 'Fira Mono', 'Fira Mono Bold for Powerline', 'Fira Mono Medium for Powerline', 'Footlight MT Light', 'Franklin Gothic Book', 'Franklin Gothic Book Italic', 'Franklin Gothic Medium', 'Franklin Gothic Medium Italic', 'Futura Condensed ExtraBold', 'Futura Condensed Medium', 'Futura Medium', 'Futura Medium Italic', 'Gabriola', 'Garamond', 'Garamond Bold', 'Garamond Italic', 'GB18030 Bitmap', 'Geeza Pro Bold', 'Geeza Pro Regular', 'Geneva', 'Georgia', 'Georgia Bold', 'Georgia Bold Italic', 'Georgia Italic', 'Gill Sans', 'Gill Sans Bold', 'Gill Sans Bold Italic', 'Gill Sans Italic', 'Gill Sans Light', 'Gill Sans Light Italic', 'Gill Sans MT', 'Gill Sans MT Bold', 'Gill Sans MT Bold Italic', 'Gill Sans MT Italic', 'Gill Sans SemiBold', 'Gill Sans SemiBold Italic', 'Gill Sans UltraBold', 'Gloucester MT Extra Condensed', 'Goudy Old Style', 'Goudy Old Style Bold', 'Goudy Old Style Italic', 'Gujarati MT', 'Gujarati MT Bold', 'Gujarati Sangam MN', 'Gujarati Sangam MN Bold', 'Gulim', 'GungSeo Regular', 'Gurmukhi MN', 'Gurmukhi MN Bold', 'Gurmukhi MT', 'Gurmukhi Sangam MN', 'Gurmukhi Sangam MN Bold', 'Hack Bold', 'Hack Bold Italic', 'Hack Italic', 'Hack Regular', 'Haettenschweiler', 'Hannotate SC Bold', 'Hannotate SC Regular', 'Hannotate TC Bold', 'Hannotate TC Regular', 'HanziPen SC Bold', 'HanziPen SC Regular', 'HanziPen TC Bold', 'HanziPen TC Regular', 'Harrington', 'HeadLineA Regular', 'Heiti SC Light', 'Heiti SC Medium', 'Heiti TC Light', 'Heiti TC Medium', 'Helvetica', 'Helvetica Bold', 'Helvetica Bold Oblique', 'Helvetica Light', 'Helvetica Light Oblique', 'Helvetica Neue', 'Helvetica Neue Bold', 'Helvetica Neue Bold Italic', 'Helvetica Neue Condensed Black', 'Helvetica Neue Condensed Bold', 'Helvetica Neue Italic', 'Helvetica Neue Light', 'Helvetica Neue Light Italic', 'Helvetica Neue Medium', 'Helvetica Neue Medium Italic', 'Helvetica Neue Thin', 'Helvetica Neue Thin Italic', 'Helvetica Neue UltraLight', 'Helvetica Neue UltraLight Italic', 'Helvetica Oblique', 'Herculanum', 'Hiragino Kaku Gothic Pro W3', 'Hiragino Kaku Gothic Pro W6', 'Hiragino Kaku Gothic ProN W3', 'Hiragino Kaku Gothic ProN W6', 'Hiragino Kaku Gothic Std W8', 'Hiragino Kaku Gothic StdN W8', 'Hiragino Maru Gothic Pro W4', 'Hiragino Maru Gothic ProN W4', 'Hiragino Mincho Pro W3', 'Hiragino Mincho Pro W6', 'Hiragino Mincho ProN W3', 'Hiragino Mincho ProN W6', 'Hiragino Sans GB W3', 'Hiragino Sans GB W6', 'Hiragino Sans W0', 'Hiragino Sans W1', 'Hiragino Sans W2', 'Hiragino Sans W3', 'Hiragino Sans W4', 'Hiragino Sans W5', 'Hiragino Sans W6', 'Hiragino Sans W7', 'Hiragino Sans W8', 'Hiragino Sans W9', 'Hoefler Text', 'Hoefler Text Black', 'Hoefler Text Black Italic', 'Hoefler Text Italic', 'Hoefler Text Ornaments', 'Impact', 'Imprint MT Shadow', 'InaiMathi', 'Inconsolata for Powerline', 'Inconsolata-dz for Powerline', 'Inconsolata-g for Powerline', 'Iowan Old Style Black', 'Iowan Old Style Black Italic', 'Iowan Old Style Bold', 'Iowan Old Style Bold Italic', 'Iowan Old Style Italic', 'Iowan Old Style Roman', 'Iowan Old Style Titling', 'ITF Devanagari Bold', 'ITF Devanagari Book', 'ITF Devanagari Demi', 'ITF Devanagari Light', 'ITF Devanagari Marathi Bold', 'ITF Devanagari Marathi Book', 'ITF Devanagari Marathi Demi', 'ITF Devanagari Marathi Light', 'ITF Devanagari Marathi Medium', 'ITF Devanagari Medium', 'Kailasa Bold', 'Kailasa Regular', 'Kaiti SC Black', 'Kaiti SC Bold', 'Kaiti SC Regular', 'Kaiti TC Bold', 'Kaiti TC Regular', 'Kannada MN', 'Kannada MN Bold', 'Kannada Sangam MN', 'Kannada Sangam MN Bold', 'Kefa Bold', 'Kefa Regular', 'Khmer MN', 'Khmer MN Bold', 'Khmer Sangam MN', 'Kino MT', 'Klee Demibold', 'Klee Medium', 'Kohinoor Bangla', 'Kohinoor Bangla Bold', 'Kohinoor Bangla Light', 'Kohinoor Bangla Medium', 'Kohinoor Bangla Semibold', 'Kohinoor Devanagari Bold', 'Kohinoor Devanagari Light', 'Kohinoor Devanagari Medium', 'Kohinoor Devanagari Regular', 'Kohinoor Devanagari Semibold', 'Kohinoor Telugu', 'Kohinoor Telugu Bold', 'Kohinoor Telugu Light', 'Kohinoor Telugu Medium', 'Kohinoor Telugu Semibold', 'Kokonor Regular', 'Krungthep', 'KufiStandardGK Regular', 'Lantinghei SC Demibold', 'Lantinghei SC Extralight', 'Lantinghei SC Heavy', 'Lantinghei TC Demibold', 'Lantinghei TC Extralight', 'Lantinghei TC Heavy', 'Lao MN', 'Lao MN Bold', 'Lao Sangam MN', 'Libian SC Regular', 'LiHei Pro', 'LiSong Pro', 'Literation Mono Powerline', 'Literation Mono Powerline Bold', 'Literation Mono Powerline Bold Italic', 'Literation Mono Powerline Italic', 'Lucida Blackletter', 'Lucida Bright', 'Lucida Bright Demibold', 'Lucida Bright Demibold Italic', 'Lucida Bright Italic', 'Lucida Calligraphy Italic', 'Lucida Console', 'Lucida Fax Demibold', 'Lucida Fax Demibold Italic', 'Lucida Fax Italic', 'Lucida Fax Regular', 'Lucida Grande', 'Lucida Grande Bold', 'Lucida Handwriting Italic', 'Lucida Sans Demibold Italic', 'Lucida Sans Demibold Roman', 'Lucida Sans Italic', 'Lucida Sans Regular', 'Lucida Sans Typewriter Bold', 'Lucida Sans Typewriter Bold Oblique', 'Lucida Sans Typewriter Oblique', 'Lucida Sans Typewriter Regular', 'Lucida Sans Unicode', 'Luminari', 'Malayalam MN', 'Malayalam MN Bold', 'Malayalam Sangam MN', 'Malayalam Sangam MN Bold', 'Marion Bold', 'Marion Italic', 'Marion Regular', 'Marker Felt Thin', 'Marker Felt Wide', 'Marlett', 'Matura MT Script Capitals', 'Meiryo', 'Meiryo Bold', 'Meiryo Bold Italic', 'Meiryo Italic', 'Menlo Bold', 'Menlo Bold Italic', 'Menlo Italic', 'Menlo Regular', 'Meslo LG L DZ Regular for Powerline', 'Meslo LG L Regular for Powerline', 'Meslo LG M DZ Regular for Powerline', 'Meslo LG M Regular for Powerline', 'Meslo LG S DZ Regular for Powerline', 'Meslo LG S Regular for Powerline', 'Microsoft Himalaya', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft Tai Le Bold', 'Microsoft Yi Baiti', 'MingLiU', 'MingLiU-ExtB', 'MingLiU', 'HKSCS', 'MingLiU', 'HKSCS-ExtB', 'Mishafi Gold Regular', 'Mishafi Regular', 'Mistral', 'Modern No', ' 20', 'Monaco', 'Mongolian Baiti', 'monofur bold for Powerline', 'monofur italic for Powerline', 'monofur for Powerline', 'Monotype Corsiva', 'Monotype Sorts', 'MS Gothic', 'MS Mincho', 'MS PGothic', 'MS PMincho', 'MS Reference Sans Serif', 'MS Reference Specialty', 'Mshtakan', 'Mshtakan Bold', 'Mshtakan BoldOblique', 'Mshtakan Oblique', 'MT Extra', 'Muna Black', 'Muna Bold', 'Muna Regular', 'Myanmar MN', 'Myanmar MN Bold', 'Myanmar Sangam MN', 'Myanmar Sangam MN Bold', 'Nadeem Regular', 'Nanum Brush Script', 'Nanum Pen Script', 'NanumGothic', 'NanumGothic Bold', 'NanumGothic ExtraBold', 'NanumMyeongjo', 'NanumMyeongjo Bold', 'NanumMyeongjo ExtraBold', 'New Peninim MT', 'New Peninim MT Bold', 'New Peninim MT Bold Inclined', 'New Peninim MT Inclined', 'News Gothic MT', 'News Gothic MT Bold', 'News Gothic MT Italic', 'Noteworthy Bold', 'Noteworthy Light', 'Onyx', 'Optima Bold', 'Optima Bold Italic', 'Optima ExtraBlack', 'Optima Italic', 'Optima Regular', 'Oriya MN', 'Oriya MN Bold', 'Oriya Sangam MN', 'Oriya Sangam MN Bold', 'Osaka', 'Osaka-Mono', 'Palatino', 'Palatino Bold', 'Palatino Bold Italic', 'Palatino Italic', 'Palatino Linotype', 'Palatino Linotype Bold', 'Palatino Linotype Bold Italic', 'Palatino Linotype Italic', 'Papyrus', 'Papyrus Condensed', 'PCMyungjo Regular', 'Perpetua', 'Perpetua Bold', 'Perpetua Bold Italic', 'Perpetua Italic', 'Perpetua Titling MT Bold', 'Perpetua Titling MT Light', 'Phosphate Inline', 'Phosphate Solid', 'PilGi Regular', 'PingFang HK Light', 'PingFang HK Medium', 'PingFang HK Regular', 'PingFang HK Semibold', 'PingFang HK Thin', 'PingFang HK Ultralight', 'PingFang SC Light', 'PingFang SC Medium', 'PingFang SC Regular', 'PingFang SC Semibold', 'PingFang SC Thin', 'PingFang SC Ultralight', 'PingFang TC Light', 'PingFang TC Medium', 'PingFang TC Regular', 'PingFang TC Semibold', 'PingFang TC Thin', 'PingFang TC Ultralight', 'Plantagenet Cherokee', 'Playbill', 'PMingLiU', 'PMingLiU-ExtB', 'PT Mono', 'PT Mono Bold', 'PT Sans', 'PT Sans Bold', 'PT Sans Bold Italic', 'PT Sans Caption', 'PT Sans Caption Bold', 'PT Sans Italic', 'PT Sans Narrow', 'PT Sans Narrow Bold', 'PT Serif', 'PT Serif Bold', 'PT Serif Bold Italic', 'PT Serif Caption', 'PT Serif Caption Italic', 'PT Serif Italic', 'Raanana', 'Raanana Bold', 'Roboto Mono Bold for Powerline', 'Roboto Mono Bold Italic for Powerline', 'Roboto Mono for Powerline', 'Roboto Mono Italic for Powerline', 'Roboto Mono Light for Powerline', 'Roboto Mono Light Italic for Powerline', 'Roboto Mono Medium for Powerline', 'Roboto Mono Medium Italic for Powerline', 'Roboto Mono Thin for Powerline', 'Roboto Mono Thin Italic for Powerline', 'Rockwell', 'Rockwell Bold', 'Rockwell Bold Italic', 'Rockwell Extra Bold', 'Rockwell Italic', 'Sana Regular', 'Sathu', 'Sauce Code Powerline', 'Sauce Code Powerline Black', 'Sauce Code Powerline Bold', 'Sauce Code Powerline ExtraLight', 'Sauce Code Powerline Light', 'Sauce Code Powerline Semibold', 'Savoye LET Plain CC', '', '1', '0', 'Savoye LET Plain', '1', '0', 'Seravek', 'Seravek Bold', 'Seravek Bold Italic', 'Seravek ExtraLight', 'Seravek ExtraLight Italic', 'Seravek Italic', 'Seravek Light', 'Seravek Light Italic', 'Seravek Medium', 'Seravek Medium Italic', 'Shree Devanagari 714', 'Shree Devanagari 714 Bold', 'Shree Devanagari 714 Bold Italic', 'Shree Devanagari 714 Italic', 'SignPainter-HouseScript', 'Silom', 'SimHei', 'SimSun', 'SimSun-ExtB', 'Sinhala MN', 'Sinhala MN Bold', 'Sinhala Sangam MN', 'Sinhala Sangam MN Bold', 'Skia Black', 'Skia Black Condensed', 'Skia Black Extended', 'Skia Bold', 'Skia Condensed', 'Skia Extended', 'Skia Light', 'Skia Light Condensed', 'Skia Light Extended', 'Skia Regular', 'Snell Roundhand', 'Snell Roundhand Black', 'Snell Roundhand Bold', 'Songti SC Black', 'Songti SC Bold', 'Songti SC Light', 'Songti SC Regular', 'Songti TC Bold', 'Songti TC Light', 'Songti TC Regular', 'Source Code Pro', 'Source Code Pro Medium', 'Stencil', 'STFangsong', 'STHeiti', 'STIXGeneral-Bold', 'STIXGeneral-BoldItalic', 'STIXGeneral-Italic', 'STIXGeneral-Regular', 'STIXIntegralsD-Bold', 'STIXIntegralsD-Regular', 'STIXIntegralsSm-Bold', 'STIXIntegralsSm-Regular', 'STIXIntegralsUp-Bold', 'STIXIntegralsUp-Regular', 'STIXIntegralsUpD-Bold', 'STIXIntegralsUpD-Regular', 'STIXIntegralsUpSm-Bold', 'STIXIntegralsUpSm-Regular', 'STIXNonUnicode-Bold', 'STIXNonUnicode-BoldItalic', 'STIXNonUnicode-Italic', 'STIXNonUnicode-Regular', 'STIXSizeFiveSym-Regular', 'STIXSizeFourSym-Bold', 'STIXSizeFourSym-Regular', 'STIXSizeOneSym-Bold', 'STIXSizeOneSym-Regular', 'STIXSizeThreeSym-Bold', 'STIXSizeThreeSym-Regular', 'STIXSizeTwoSym-Bold', 'STIXSizeTwoSym-Regular', 'STIXVariants-Bold', 'STIXVariants-Regular', 'STKaiti', 'STSong', 'STXihei', 'Sukhumvit Set Bold', 'Sukhumvit Set Light', 'Sukhumvit Set Medium', 'Sukhumvit Set Semi Bold', 'Sukhumvit Set Text', 'Sukhumvit Set Thin', 'Superclarendon Black', 'Superclarendon Black Italic', 'Superclarendon Bold', 'Superclarendon Bold Italic', 'Superclarendon Italic', 'Superclarendon Light', 'Superclarendon Light Italic', 'Superclarendon Regular', 'Symbol', 'Symbol Neu for Powerline', 'System Font Black', 'System Font Bold', 'System Font Bold', 'System Font Bold G1', 'System Font Bold G2', 'System Font Bold G3', 'System Font Bold Italic', 'System Font Bold Italic G1', 'System Font Bold Italic G2', 'System Font Bold Italic G3', 'System Font Heavy', 'System Font Heavy', 'System Font Heavy Italic', 'System Font Italic', 'System Font Italic G1', 'System Font Italic G2', 'System Font Italic G3', 'System Font Light', 'System Font Light', 'System Font Light Italic', 'System Font Medium', 'System Font Medium', 'System Font Medium Italic', 'System Font Regular', 'System Font Regular', 'System Font Regular G1', 'System Font Regular G2', 'System Font Regular G3', 'System Font Semibold', 'System Font Semibold', 'System Font Semibold Italic', 'System Font Thin', 'System Font Ultralight', 'Tahoma', 'Tahoma Negreta', 'Tamil MN', 'Tamil MN Bold', 'Tamil Sangam MN', 'Tamil Sangam MN Bold', 'TeamViewer10', 'Telugu MN', 'Telugu MN Bold', 'Telugu Sangam MN', 'Telugu Sangam MN Bold', 'Thonburi', 'Thonburi Bold', 'Thonburi Light', 'Times Bold', 'Times Bold Italic', 'Times Italic', 'Times New Roman', 'Times New Roman Bold', 'Times New Roman Bold Italic', 'Times New Roman Italic', 'Times Roman', 'Tinos Bold for Powerline', 'Tinos Bold Italic for Powerline', 'Tinos for Powerline', 'Tinos Italic for Powerline', 'Trattatello', 'Trebuchet MS', 'Trebuchet MS Bold', 'Trebuchet MS Bold Italic', 'Trebuchet MS Italic', 'Tsukushi A Round Gothic Bold', 'Tsukushi A Round Gothic Regular', 'Tsukushi B Round Gothic Bold', 'Tsukushi B Round Gothic Regular', 'Tw Cen MT', 'Tw Cen MT Bold', 'Tw Cen MT Bold Italic', 'Tw Cen MT Italic', 'Ubuntu Mono derivative Powerline', 'Ubuntu Mono derivative Powerline Bold', 'Ubuntu Mono derivative Powerline Bold Italic', 'Ubuntu Mono derivative Powerline Italic', 'Verdana', 'Verdana Bold', 'Verdana Bold Italic', 'Verdana Italic', 'Waseem Light', 'Waseem Regular', 'Wawati SC Regular', 'Wawati TC Regular', 'Webdings', 'Weibei SC Bold', 'Weibei TC Bold', 'Wide Latin', 'Wingdings', 'Wingdings 2', 'Wingdings 3', 'Xingkai SC Bold', 'Xingkai SC Light', 'Yuanti SC Bold', 'Yuanti SC Light', 'Yuanti SC Regular', 'Yuanti TC Bold', 'Yuanti TC Light', 'Yuanti TC Regular', 'YuGothic Bold', 'YuGothic Medium', 'YuMincho ', '36p Kana Demibold', 'YuMincho ', '36p Kana Medium', 'YuMincho Demibold', 'YuMincho Medium', 'Yuppy SC Regular', 'Yuppy TC Regular', 'Zapf Dingbats', 'Zapfino']);
          var detector = new fontDetector();
          for(i = 0, len = fonts.length; i < len;++ i) {
              if(detector.detect(fonts[i])) this.fontsData += '1';
              else this.fontsData += '0';
          }

          this.postData['fonts'] = this.fontsData;

          this.postData['timezone'] = new Date().getTimezoneOffset();
          var zoom_level = detectZoom.device();
          var fixed_width = window.screen.width * zoom_level;
          var fixed_height = window.screen.height * zoom_level;
          this.postData['resolution'] = Math.round(fixed_width) + 'x' + Math.round(fixed_height) + 'x' + zoom_level + 'x' + window.screen.width+"x"+window.screen.height+"x"+window.screen.colorDepth;
          console.log(this.postData['resolution']);
          var plgs_len = navigator.plugins.length;
          var plgs = "";
          for(var i = 0;i < plgs_len;i ++) {
              plgs += navigator.plugins[i].name + '_';
          }
          plgs = plgs.replace(/[^a-zA-Z ]/g, "");
          this.postData['plugins'] = plgs;
          this.postData['cookie'] = navigator.cookieEnabled;

          try {
              localStorage.setItem('test', 'test');
              localStorage.removeItem('test');
              this.postData['localstorage'] = true;
          } catch(e) {
              this.postData['localstorage'] = false;
          }

          this.postData['user_id'] = user_id;
          this.postData['adBlock'] = $('#ad')[0] == null ? 'Yes' : 'No';

          console.log(this.postData['adBlock'])

              console.log("Sent " + this.postData['gpuImgs'].length + " images");
          this.postData['manufacturer'] = "Undefined";
          cvs_test = CanvasTest();
          this.postData['canvas_test'] = Base64EncodeUrlSafe(calcSHA1(cvs_test.substring(22, cvs_test.length))); //remove the leading words
          this.postData['cpu_cores'] = navigator.hardwareConcurrency;

          var start_time = Date.now();
          var cpu_work_load = 1e9;
          var help = 1.0;
          while(help ++ != cpu_work_load){};
          var time = Date.now() - start_time;
          this.postData['cpu_cal'] = time;

          //    console.log(plgs);
          //console.log(this.postData['gpuImageHashes']);

          $('#manufacturer.modal').modal('show');
          $('#submitBtn').prop('disabled', true);
          $('#manufacturer.selectpicker').on('changed.bs.select', function() {
              $('#submitBtn').prop('disabled', false);
          });

          $('#submitBtn').click({self : this}, function(event) {
              var self = event.data.self;
              self.postData['manufacturer'] = $("#manufacturer.selectpicker").val();
              $('#manufacturer.modal').modal('hide');

              /*var f = document.createElement("form");
                f.setAttribute('method',"post");
                f.setAttribute('action',"http://" + ip_address + "/collect.py");
                var i = document.createElement("input"); //input element, text
                i.setAttribute('type',"text");
                i.setAttribute('name',JSON.stringify(self.postData));
                f.appendChild(i);
                f.submit();

                return ;*/

              navigator.getHardwareConcurrency(function(cores0) {
                  self.postData['cpu_cores'] += ',' + (cores0).toString() + ',';
                  navigator.getHardwareConcurrency(function(cores1) {
                      self.postData['cpu_cores'] += (cores1).toString() + ',';
                      navigator.getHardwareConcurrency(function(cores2) {
                          self.postData['cpu_cores'] += (cores2).toString() + ',';
                          console.log(self.postData['cpu_cores']);
                          $.ajax({
                              url : "http://" + ip_address + "/collect.py",
                              dataType : "html",
                              type : 'POST',
                              data : JSON.stringify(self.postData),
                              success : function(data) {
                                  console.log("success");
                                  if (data === 'user_id error') {
                                      window.location.href = error_page;
                                  } else {
                                      num = data.split(',')[0];
                                      code = data.split(',')[1];
                                      if (num < '2') {
                                          $('#instruction')
                              .append('You have finished <strong>' + num +
                                  '</strong> browsers<br>');

                          if (!requests.hasOwnProperty('automated') ||
                              requests[
                              'automated'] === 'true') {
                                  $('#instruction')
                                      .append(
                                              'Please close this browser and check a different browser for your completion code');

                              } else {
                                  $('#instruction')
                                      .append('Now open the link:<br><a href="' + url + '">' +
                                              url + '</a> <br>');
                                  createCopyButton(url, '#instruction');
                                  $('#instruction')
                                      .append(
                                              '<br><br>with another browser on <em>this</em> computer')
                                      .append(
                                              '<div id= "browsers" style="text-align: center;">(Firefox, chrome, safair or edge)</div>');
                              }
                                      } else if(num == 2){
                                          $('#instruction')
                                              .append('You have finished <strong>' + num +
                                                      '</strong> browsers<br>Your code is ' + code +
                                                      '<br> <strong>Thank you!</strong><div style="font-size:0.8em; color:red;">If you do this task with 3 browsers, you will get a new code and a <strong>bonus</strong>!<div>');
                                          $('#instruction')
                                              .append('Your link is:<br><a href="' + url + '">' +
                                                      url + '</a> <br>');
                                          createCopyButton(url, '#instruction');
                                      }else {
                                          $('#instruction')
                                              .append('You have finished <strong>' + num +
                                                      '</strong> browsers<br>Your code is ' + code +
                                                      '<br> <strong>Thank you!</strong><br><div style="font-size:0.8em;">Just input this code back to Amazon mechanical turk, we will know you finished three browsers</div>');
                                      }
                                      progress(100);
                                      Cookies.set('machine_fingerprinting_userid', user_id,
                                              {expires: new Date(2020, 1, 1)});
                                  }
                              }
                          });
                      });
                  });
              });
          });
          if (requests.hasOwnProperty('modal') && requests['modal'] === 'false') {
              $('#submitBtn').click();
          }
      }
};

/* Converts the charachters that aren't UrlSafe to ones that are and
   removes the padding so the base64 string can be sent
   */
Base64EncodeUrlSafe = function(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
};

stringify = function(array) {
    var str = "";
    for (var i = 0, len = array.length; i < len; i += 4) {
        str += String.fromCharCode(array[i + 0]);
        str += String.fromCharCode(array[i + 1]);
        str += String.fromCharCode(array[i + 2]);
    }

    // NB: AJAX requires that base64 strings are in their URL safe
    // form and don't have any padding
    var b64 = window.btoa(str);
    return Base64EncodeUrlSafe(b64);
};

Uint8Array.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0)
        return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this[i];
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
