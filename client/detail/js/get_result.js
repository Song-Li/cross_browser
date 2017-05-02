ip_address = "aws.songli.us/uniquemachine"
address = "http://aws.songli.us/pictures/"
details_global = [];
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

// gengerate keys
function get_keys() {
  var keys = send_to_utils("keys").split(',');
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

function get_details_by_id(column, id) {
  var command = "get_details," + id;
  details = send_to_utils(command);
  return details
}

function get_details(column) {
  var id = $("select[id=select_" + column + "]").val();
  var details = get_details_by_id(column, id);
  details_global.push(details);
  getDetails(details, column);
}

// subtract all the imgs
function subtract() {
  // clear the res div
  //$('#subtract').empty();
  // here we only have 28 pictures
  for (var i in details_global[0]) {
    if (details_global[0][i] == details_global[1][i]) continue;
    g_0 = details_global[0][i];
    g_1 = details_global[1][i];
    $('#table_3').append('<tr><td>' + i + '</td><td>' + g_0.substring(0, 6) + '</td><td>' + g_1.substring(0, 6) + '</td></tr>');
    if (i == 'gpuimgs') {
      hashes_0 = {};
      hashes_1 = {};
      var str_0 = details_global[0][i].split(',');
      var str_1 = details_global[1][i].split(',');
      for (var j in str_0) {
        var id = str_0[j].split('_')[0];
        hashes_0[id] = str_0[j].split('_')[2];
        id = str_1[j].split('_')[0];
        hashes_1[id] = str_1[j].split('_')[2];
      }
      for (var j in hashes_0) {
        if (hashes_0[j] != hashes_1[j]) {
          $('#table_3').append('<tr><td>' + j + '</td><td>' + hashes_0[j].substring(0, 4) + '</td><td>' + hashes_1[j].substring(0, 4) + '</td></tr>');
        }
      }
    } else if (i == "fonts") {
      var str_0 = details_global[0][i];
      var str_1 = details_global[1][i];
      var font_res = [];
      for (var j in str_0) {
        if (str_0[j] != str_1[j]) {
          console.log(j, str_0[j], str_1[j]);
          font_res.push(font_list[j]);
        }
      }
      for (var j = 0;j < font_res.length;j += 3) {
        $('#table_3').append('<tr><td>' + font_res[j] + '</td><td>' + font_res[j + 1]
          + '</td><td>' + font_res[j + 2] + '</td></tr>');
      }
    }
  }
}

// this function is used to clear all the data
function clear_all_data() {
  var password = prompt("Input your password to clear data: ");
  res = send_to_utils("clear," + password);
  alert(res);
}
