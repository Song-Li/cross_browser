ip_address = "aws.songli.us/uniquemachine"
address = "http://aws.songli.us/pictures/"
function send_to_utils(command) {
  res = ""
  $.ajax({
    url: "http://" + ip_address + "/utils",
    type: 'POST',
    async: false,
    data: {
      key: command
    },
    success: function(data) {
      res = data;
    },
    error: function(xhr, ajaxOptions, thrownError) {
    }
  });
  return res; 
}

function get_keys() {
  keys = send_to_utils("keys").split(',');
  return keys;
}

function get_result() {
  var keys = get_keys();
  console.log(keys);
  for (var idx in keys) {
    id = keys[idx].split('_')[1];
    ip = keys[idx].split('_')[0];

    var b = $('<input type="button" value = ' + ip + ' onclick="get_pictures_by_id(' + id + ')"/>');
    $("#keys").append(b);
  }
}

function get_pictures_by_id(id) {
  console.log(id);
  picture_ids = send_to_utils("get_pictures_by_id," + id).split(',');
  sorted = {}
  for(var idx in picture_ids) {
    v = picture_ids[idx]
    sorted[parseInt(v.split('_')[0])] = v.split('_')[1]
  }
  for(k in sorted){
    console.log(k)
    var img = $('<img src="' + address + sorted[k] + '.png" />');
    $('#picture_1').append(img);
  }
}
