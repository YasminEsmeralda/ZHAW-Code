$(document).ready(function(){ 
    $.get("../menu.html", function(data) {
      $("#menu").html(data);
    });
  }); 