ip_address = "lab.songli.us/uniquemachine"
address = "http://lab.songli.us/pictures/"
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
    parts = keys[idx].split('~')
    ip = parts[0];
    time = parts[1];
    browser = parts[2];
    os = parts[3];
    id = parts[4];

    var b_1 = $('<option value = "' + id + '">' + ip + '_' + os + '_' + browser + '_' + time + '</option>');
    var b_2 = $('<option value = "' + id + '">' + ip + '_' + os + '_' + browser + '_' + time + '</option>');
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
function get_pixel_from_img(img_id) {
  var img = document.getElementById(img_id); 
  var width = img.clientWidth;
  var height = img.clientHeight;
  // the canvas may be taint for cross origin info
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  data = context.getImageData(0, 0, width, height);
  delete canvas;
  return data; 
}


function sub_pic_data(pic1_data, pic2_data) {
  var sub_data = pic1_data;
  var same = true;
  for (var i in pic1_data.data) {
    // both the two will be considered
    sub_data.data[i] = Math.abs(pic1_data.data[i] - pic2_data.data[i]);

    // here we make the pixels 100 times brighter
    // may overflow, but seems ok
    sub_data.data[i] *= 100;

    // force set every alpha value to be 255
    if (i % 4 == 3) {
      sub_data.data[i] = 255;
    }else if (sub_data.data[i] != 0) {
      same = false;
    }
  }
  sub_data.same = same;
  return sub_data;
}

// subtract all the imgs
function subtract() {
  // clear the res div
  $('#subtract').empty();
  // here we only have 28 pictures
  for (var idx = 0;idx < 28;++ idx) {
    pic1_data = get_pixel_from_img("1" + idx);
    pic2_data = get_pixel_from_img("2" + idx);
    var sub_data = sub_pic_data(pic1_data, pic2_data);

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = sub_data.width;
    canvas.height = sub_data.height;
    ctx.putImageData(sub_data, 0, 0);
    $('#subtract').append(canvas);

    var res_img = new Image(); 
    res_img.height = "32";
    res_img.width = "32";
    res_img.align = "top";
    if (sub_data.same) {
      res_img.src = "./img/yes.png";
    } else {
      res_img.src = "./img/no.png";
    } 

    $('#subtract').append(res_img);
  }
}

// this function is used to clear all the data
function clear_all_data() {
  var password = prompt("Input your password to clear data: ");
  res = send_to_utils("clear," + password);
  alert(res);
}
