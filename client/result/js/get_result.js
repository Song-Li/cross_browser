ip_address = "aws.songli.us:5000"
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

function get_ips() {
  ips = send_to_utils("keys").split(',');
  return ips;
}

function get_result() {
  var ips = get_ips();
  console.log(ips);
  for (var idx in ips) {
    console.log(ips[idx]);
    ip = ips[idx];
    var b = $('<input type="button" value = ' + ip + ' />');
    $("#keys").append(b);
  }
}
