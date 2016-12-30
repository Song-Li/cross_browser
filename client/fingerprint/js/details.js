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
      console.log(data);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      alert(thrownError);
    }
  });
}
