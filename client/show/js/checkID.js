var user_id, url;

var cubeTest,
  lineTest,
  textureTest,
  simpleLightTest,
  moreLightTest,
  transparentTest,
  videoTest,
  clippingTest,
  lightingTest;

$(function() {
  url = document.URL;
  var parser = document.createElement('a');
  parser.href = url;
  var command = parser.search;
  var requests = {};
  if (command) {
    var commands = command.slice(1).split('&');
    for (var i = 0; i < commands.length; i++) {
      var seq = commands[i].split('=');
      requests[seq[0]] = seq[1];
    }
  }

  if (!requests.hasOwnProperty('user_id')) {
    var uid = Cookies.get('machine_fingerprinting_userid');
    if (!uid) {
      window.location.href = error_page;
    }
    user_id = parseInt(uid);
    if (!command) {
      parser.search = "?user_id=" + user_id;
    } else {
      parser.search += "user_id=" + user_id;
    }

    url = parser.href;
  } else {
    user_id = parseInt(requests['user_id']);
  }

  sender = new Sender();
  cubeTest = new CubeTest();
  lineTest = new LineTest();
  textureTest = new TextureTest();
  simpleLightTest = new SimpleLightTest();
  moreLightTest = new MoreLightTest();
  transparentTest = new TransparentTest();
  videoTest = new VideoTest();
  clippingTest = new ClippingTest();
  lightingTest = new LightingTest();


  // Tests begin in HERE
  cubeTest.begin();
  lineTest.begin();
  textureTest.begin();
  simpleLightTest.begin();
  moreLightTest.begin();
  transparentTest.begin();
  videoTest.begin();
  clippingTest.begin();
  lightingTest.begin();

});
