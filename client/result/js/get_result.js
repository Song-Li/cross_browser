ip_address = "aws.songli.us/uniquemachine"
address = "http://aws.songli.us/pictures/"
// send information to utils function
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

// get all of the tests
function get_keys() {
  keys = send_to_utils("keys").split(',');
  return keys;
}

// gengerate keys
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

// add picture to html
function get_pictures_by_id(column, id) {
  // clear this div
  $('#picture_' + column).empty();

  picture_ids = send_to_utils("get_pictures_by_id," + id).split(',');
  sorted = {}
  for(var idx in picture_ids) {
    v = picture_ids[idx]
      sorted[parseInt(v.split('_')[0])] = v.split('_')[1]
  }
  for(k in sorted){
    var img = new Image();
    // the cross origin cliam have to before src attrabute
    img.crossOrigin="Anonymous";
    img.id = column + k;
    img.src = address + sorted[k] + '.png';
    $('#picture_' + column).append(img);
  }
}

// this function is used to get the pixels of a img
// var: img html object
// return: array of pixels
function get_pixel_from_img(img) {
  var width = img.clientWidth;
  var height = img.clientHeight;
  // the canvas may be taint for cross origin info
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  data = context.getImageData(0, 0, width, height);
  return data; 
}

function subtract() {
  pic1_data = get_pixel_from_img(document.getElementById('10'));
  console.log(pic1_data); 
  console.log("here");
}
