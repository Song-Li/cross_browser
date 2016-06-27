var user_id, url;
$(function() {
  url = document.URL;
  var parser = document.createElement('a');
  parser.href = url;
  var command = parser.search;
  var requests = {};
  if (command) {
    var commands = command.replace(/\?/g, '').split('&');
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

  drawCube();
  drawLine();
  drawTexture();
  drawSimpleLight();
  drawMoreLight();
  drawTransparent();
  startVideo();
  startClipping();
  startLighting();
});
