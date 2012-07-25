
var tools={
  formatTime: function(timeString)
  {
    var date = new Date(timeString);
    // return date.toLocaleString();
    function addZeros(number)
    {
      return number < 10? "0"+""+number : number; 
    }
    return addZeros(date.getDate())+"-"+ addZeros(date.getMonth()+1)+"-"+ date.getFullYear() + " "+addZeros(date.getHours()) + ":"+addZeros(date.getMinutes());
    
  },
  showMessage: function(html, options)
  {
    
    var defaultSettings = {
      
      modal: true, 
      buttons:{"Schliessen": function() {
        
        $( this ).dialog( "close" );
      }}
    };
    var settings = $.extend(true, {}, defaultSettings, options);
    var $dialog = $("<div />").appendTo($("body"));
    $dialog.html(html);
    $dialog.dialog(settings);
    $dialog.on("dialogclose", function()
      {
        $(this).dialog( "destroy" );
        $(this).remove(); 
      });
    
  }
  
  
}
