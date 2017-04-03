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

    var b_1 = $('<option value = "' + id + '">' + ip + '</option>');
    var b_2 = $('<option value = "' + id + '">' + ip + '</option>');
    $("#select_1").append(b_1);
    $("#select_2").append(b_2);
  }
}

function get_pictures(column) {
  var id = $("select[id=select_" + column + "]").val();
  get_pictures_by_id(column, id);
}

function get_pictures_by_id(column, id) {
  picture_ids = send_to_utils("get_pictures_by_id," + id).split(',');
  sorted = {}
  for(var idx in picture_ids) {
    v = picture_ids[idx]
    sorted[parseInt(v.split('_')[0])] = v.split('_')[1]
  }
  for(k in sorted){
    var img = $('<img id=' + column + k + ' src="' + address + sorted[k] + '.png" />');
    $('#picture_' + column).append(img);
  }
}

function subtract() {
  console.log("here");
}
