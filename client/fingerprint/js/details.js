function buildTable(data) {
  for (var name in data) {
    value = data[name];
    $('#result_table').append('<tr><td>' + name + '</td><td>' + value + '</td></tr>');
  }
}
function getDetails() {
  ip_address = "sec.uniquemachine.org:5000"
  console.log(window.location.href);
  var ID = window.location.href.split("?")[1];

  $.ajax({
    url : "http://" + ip_address + "/details",
    dataType : "json",
    contentType: 'application/json', 
    type : 'POST',
    data : JSON.stringify({"ID" : ID}),
    success : function(data) {
      buildTable(data);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      alert(thrownError);
    }
  });
}
