"use strict";

/**

sorry for the mess here, i had some memory leaks to fix. 

Be carefull, when adding event handlers to elements that you dont have control and that can be removed or replaced. 
E.g. the table rows can get hidden by dataTables and so its not easy to remove event handlers there.

Better solution is to use jquery's "on" (formerly "delegate") to bind event handlers.
jquery will automatically add theses handlers to new nodes
*/

$(document).ready(function() {
    
     initDialogs();
    $(".datetime").datetimepicker({timeFormat: "hh:mm", dateFormat:"yy-mm-dd"});
    
    $(window).on("resize", onResize);
    
    function onResize()
    {
      $("#connection .ui-widget-content").css("max-height", $(window).height()-60);
    }
    // init socket
    var socket = io.connect(document.location.origin);
    var currentConnectionID = null;
    var dataService =  {
      getConnection: function(connectionID, callback)
      {
        socket.emit("connection get", connectionID, callback);
      },
      addLocation: function(data, callback)
      {
        socket.emit("location add", data, callback);
      },
      
      updateLocation: function(locationID, fields, callback)
      {
        socket.emit("location update", {locationID: locationID, fields: fields}, callback); 
      },
      
     
     
      addConnection: function(data, callback)
      {
       socket.emit("connection add", data, callback); 
      },
      
      addLevel: function(level, callback)
      {
           socket.emit("level add", level, callback); 
     
      },
      getLevelsForConnection: function(connectionID, callback)
      {
        socket.emit("level get all", connectionID, callback);
      }
     
    };
    
    var chartWindowService = new ChartWindowService(socket, dataService);
    
   
    
    socket.on("client connected", function(data)
      {
        
        $("#numberOfClients").text(data.numberOfCients);
      });
    
    socket.on("client disconnected", function(data)
      {
        $("#numberOfClients").text(data.numberOfCients);
      });   
    
    
    socket.on("connection changed", function(data)
      {
        
        
        if(data && data.connectionID && currentConnectionID == data.connectionID)
        {
          // refresh connection form
          showConnection(currentConnectionID);
        }
        
        refreshConnectionTable();
      });
    
    socket.on("location changed", refreshLocationTable);
    
   
    $( "#tabs" ).tabs();
    
    
    var locationColumns = [
      { "mDataProp": "id", "sWidth": "12px"},
      { "mDataProp": "name" , "sClass": "editable", "sWidth": "140px"},
      { "mDataProp": "name_short" , "sClass": "editable", "sWidth": "40px" }

    ];
    
    
    
    
    var $table =  $("#locationTable");
    var oTable =  createLocationTable($table, locationColumns);
    
    
    var connectionColumns = [
      { "mDataProp": "id"},
     
      
      { "mDataProp": "from"},
      { "mDataProp": "to"},
      { "mDataProp": null, "fnCreatedCell": function(cell)
        {
        
          $('<a class="addLevelButton">+ Pegelmeldung</a>').appendTo($(cell));
           $('<a class="showChartButton">Pegel anzeigen</a>').appendTo($(cell));
        }
      }
      ];
    
    
    var $connectionTable = $("#connectionTable");
    var oConnectionTable = createConnectionTable($connectionTable, connectionColumns);
    
    $("#actions .refresh").button().on("click",function()
      {
        refreshLocationTable();
        refreshConnectionTable(); 
      });
    $("#actions .print").button().on("click",showPrintDialog);
    $("#actions .newLocation").button().on("click",showAddLocationDialog);
    $("#actions .newConnection").button().on("click", showNewConnectionDialog);
    
    
    
    $(window).scroll(function(){
        $("#connection")
        .stop()
        .animate({"marginTop": ($(window).scrollTop() + 10) + "px"}, "fast");
    });
    
   
    
    
    
    function initDialogs()
    {
      var defaultSettings = {title: "Fehler", modal: true, autoOpen: false, buttons:{"Schliessen": function() {
        $( this ).dialog( "close" );
      }}}
      $("#printDialog").dialog($.extend({},defaultSettings,{ title: "Drucken"}));
      $( "#printDialog" ).find(".button").button();
      
      $( "#printDialog" ).find(".printAll").on("click", printAll);
      $( "#printDialog" ).find(".exportAll").on("click", exportAll);
      $( "#printDialog" ).find(".printStock").on("click", printStock);
      $( "#printDialog" ).find(".exportStock").on("click", exportStock);
      $( "#printDialog" ).find(".printAway").on("click", printAway);
      $( "#printDialog" ).find(".exportAway").on("click", exportAway);
      
      
      $("#addNewLevelDialog").dialog($.extend({},defaultSettings,{ title: "Neue Pegelmeldung", 
          buttons:{"Schliessen": function()
            {
              $(this).dialog("close");
            },
            "Speichern": function()
            {
              $(this).find(".form").submit();
            }
      }}));
      
      
      
      $("#connectionIsEmptyMessage").dialog(defaultSettings);
      $("#connectionNotEmptyMessage").dialog(defaultSettings);
      $("#errorDialog").dialog(defaultSettings); 
      $( "#addNewLocationDialog").dialog($.extend({},defaultSettings,{ title: "Neuer Ort hinzufügen", 
          buttons:{"Schliessen": function()
            {
              
              $(this).dialog("close");
            },
            "Speichern": function()
            {
              $(this).find(".form").submit();
            }
      }})); 
      
      
      $("#addNewLocationDialog .form").submit(function()
        {
          var $form = $(this);
          var data = 
          {
            name: $(this).find("input[name='name']").val(),
            ext_id: $(this).find("input[name='ext_id']").val(),
            sap: $(this).find("input[name='sap']").val()
          };
          
          
          dataService.addLocation(data, function(error, result)
            {
              if(!error)
              {
                // everything is ok, reload locations 
                refreshLocationTable();
                $form[0].reset();
              }
              else
              {
                showErrorDialog(error); 
              }
            });
          
          return false;
        });
      
      
      $( "#addNewConnectionDialog" ).dialog($.extend({},defaultSettings,{ title: "Neue Verbindung hinzufügen", 
          buttons:{"Schliessen": function()
            {
              
              $(this).dialog("close");
            },
            "Speichern": function()
            {
              $(this).find(".form").submit();
            }
      }})); 
      
      $("#addNewConnectionDialog .form").submit(function()
        {
          var $form = $(this);
          var data = 
          {
            id: $(this).find("input[name='id']").val(),
            from: $(this).find("select[name='from']").val(),
            to: $(this).find("select[name='to']").val()
          };
          console.log(data);
          if(data.from == data.to)
          {
            showErrorDialog("Beide Stationen sind identisch");
          }
          else
          {
        
          dataService.addConnection(data, function(error, result)
            {
              if(!error)
              {
                // everything is ok, reload locations 
                refreshConnectionTable();
                $form[0].reset();
              }
              else
              {
                showErrorDialog(error); 
              }
            });
          }
          
          return false;
        });
        
    }
    
    function showErrorDialog(error)
    {
      
      $( "#errorDialog" ).dialog('open');
      $( "#errorDialog" ).find(".error").empty().text(JSON.stringify(error));
      
      
    }
    
    
    
    
    function showAddLocationDialog()
    {
      $( "#addNewLocationDialog" ).dialog('open');
      
    }
    
    
     function showNewConnectionDialog()
    {
      $( "#addNewConnectionDialog" ).dialog('open');
      
      // load locations for dropdowns
      
      $.get("/ajax/locations", function(data)
        {
          var locations = data.aaData;
          $("#addNewConnectionDialog").find("select").empty();
          $.each(locations, function(index, location)
            {
              var $option = $('<option value="'+location.id+'">'+location.name_short+'</option>');
              $("#addNewConnectionDialog").find("select").append($option);
            });
        });
      
     
      
    }
    
    function showNewLevelDialog(connectionID)
    {
      var $dialog =  $("#addNewLevelDialog");
      dataService.getConnection(connectionID, function(error, result)
        {
          if(!error)
          {
            
            var connection = result[0];
            $dialog.find(".from").text(connection.from);
            
            $dialog.find(".to").text(connection.to);
            
            
          $dialog.dialog("open"); 
           $dialog.find(".connectionID").text(connectionID);
           $dialog.find(".form").off("submit");
           $dialog.find(".form").on("submit", function()
             {
               // validate
               
               var level = 
               {
                connection_fk: connectionID,
                rx:   $dialog.find('.form input[name="rx"]').val(),
                tx:   $dialog.find('.form input[name="tx"]').val(),
                itime:   $dialog.find('.form input[name="itime"]').val(),
                location_from_to:   $dialog.find('.form input[name="location_from_to"]').val()
                
               }
         
               
               dataService.addLevel(level, function(error, result)
                 {
                   if(error) showErrorDialog(error);
                   else $dialog.dialog("close");
                 });
               
               return false;
             });
          }
          else
          {
            showErrorDialog(error);
          }
        });
      
    
     
     
    }
    
    
    
    
    function showPrintDialog()
    {
      $( "#printDialog" ).dialog('open');
    }
    
    
    function createLocationTable($table, columns)
    {
      
      
      var $header = $("<tr />").appendTo($("<thead />").appendTo($table));
      var headers = 
      [
        "ID", "Name", "Kürzel"
      ];
      
      $.each(headers, function(index, header)
        {
          $header.append($("<th>"+header+"</th>"));
        });
      
      
      
      var oTable = $table.dataTable( {
          "bJQueryUI": true,
          "bProcessing": true,
          "sAjaxSource": "ajax/locations",
          "iDisplayLength": 25,
          "aoColumns": columns,
          "fnDrawCallback": function onDraw()
          {
            $("#locationTable").off("click");
            $("#locationTable").on("click", "td.editable",   function onEditCellClick()
              {
                
                var node = $(this).parent().get(0);
                var cell = this;
                var $cell = $(this);
                if(!$cell.hasClass("editing"))
                {
                  $cell.addClass("editing");
                  var oldValue = $cell.text();
                  $cell.empty();
                  var $input = $('<input type="text" value="'+oldValue+'" />');
                  
                  $cell.append($input);
                  $input.focus();
                  $input.on("blur",function()
                    {
                      var newVal =  $(this).val();
                      if(newVal != oldValue)
                      {
                        var rowData = oTable.fnGetData(node);
                        
                        var pos = oTable.fnGetPosition(cell);
                        var key = locationColumns[pos[1]].mDataProp;
                        
                        // save value
                        
                        var fields = {};
                        console.log(key);
                        fields[key] = newVal;
                        console.log(fields);
                        dataService.updateLocation(rowData.id, fields, function(error, result)
                          {
                            
                            if(!error)
                            {
                              // everything went as expected
                              //oTable.fnUpdate(newVal, iRow, iCol);
                              $input.off("blur");
                              $cell.removeClass("editing");
                              $cell.empty();
                              
                              $cell.text(newVal);
                            }
                            else
                            {
                              // error
                              showErrorDialog(error);
                              $input.focus();
                              
                            }
                          });
                        
                        
                      }
                      else
                      {
                        $input.off("blur");
                        $cell.removeClass("editing");
                        $cell.empty();
                        $cell.text(newVal); 
                      }
                      
                    });
                  
                  
                }
                
              });
            
            
            
            
          }
      } );
      
      
      
      
      return oTable;
    }
    
    
    
    
    
    
    function onCreateConnectionCell(cell, sData, rowData, iRow, iCol)
    {
      
      if(rowData.connection_fk !=null)
      {
        $(cell).parent().addClass("borrowed");
        if(rowData.connection_fk == currentConnectionID)
        {
          $(cell).parent().addClass("connectionSelected");
          
        }
      }
      
      
    }
    
    
    function onCreateOptionCell(cell, sData, rowData, iRow, iCol)
    {
      
      
      
      if(rowData.connection_fk !=null)
      {
        // is borrowed
        var $button = $('<a class="showConnectionButton">Anzeigen</a>');
        $(cell).append($button);
        
      }
      
      else
      {
        // is not borrowed
        
        var $createNewConnectionButton = $('<a class="newConnectionButton">Verleihen</a>');
        
        
        $(cell).append($createNewConnectionButton);
        
        var $addToConnectionButton = $('<a class="addToConnectionButton">hinzufügen ►</a>');
        $(cell).append($addToConnectionButton);
        
        
        
      }
      
    }
    
    
    
    
    function createConnectionTable($table, columns)
    {
      
      
      var $header = $("<tr />").appendTo($("<thead />").appendTo($table));
      var headers = 
      [
        "Bündel-Nr", "Von", "Nach", "Optionen"
      ];
      
      
      
      $.each(headers, function(index, header)
        {
          $header.append($("<th>"+header+"</th>"));
        });
      
      
      
      
      
      
      var oTable = $table.dataTable( {
          "bJQueryUI": true,
          "bProcessing": true,
          "sAjaxSource": "ajax/connections",
          "iDisplayLength": 25,
          "aoColumns": columns,
          "fnDrawCallback": function()
          {
            $(".addLevelButton").button();
            
            $table.off("click");
            $table.on("click", ".addLevelButton", function()
              {
                 var row = $(this).parentsUntil("tr").parent().get(0);
                   var rowData = oTable.fnGetData(row);
                
                
                var connectionID = rowData.id;
                showNewLevelDialog(connectionID);
              });
            
            
             $(".showChartButton").button();
            
           
            $table.on("click", ".showChartButton", function()
              {
                 var row = $(this).parentsUntil("tr").parent().get(0);
                   var rowData = oTable.fnGetData(row);
            
                
                var connectionID = rowData.id;
                chartWindowService.createNewWindow(connectionID);
              });
            
            
            
          } 
          
      } );
      
      return oTable;
    }
    
    function deleteConnection(connectionData)
    {
      if(connectionData.number_of_locations >0)
      {
        $("#connectionNotEmptyMessage").dialog("open"); 
      }
      else
      {
        dataService.deleteConnection(connectionData.id, function(error, result){
        refreshConnectionTable();}); 
      }
    }
    
    
    function onCreateConnectionIDCell(cell, sData, rowData, iRow, iCol)
    {
      if(sData == currentConnectionID)
      {
        $(cell).parent().addClass("connectionSelected");
        
      } 
    }
    
    function onCreateConnectionOptionCell(cell, sData, rowData, iRow, iCol)
    {
      $('<a class="deleteButton">Löschen</a>').appendTo($(cell));
      $('<a class="showConnectionButton">Anzeigen</a>').appendTo($(cell));
      
      
      
    }
    
    
    
    function printAll()
    {
      
      printPopupWithURL("/print/locations/all");
    }
    function exportAll()
    {
      document.location.href ="/csv/locations/all";
    }
    function printStock()
    {
      printPopupWithURL("/print/locations/stock");
    }
    function exportStock()
    {
      document.location.href ="/csv/locations/stock";
    }
    
    function printAway()
    {
      
      printPopupWithURL("/print/locations/away");
      
    }
    
    function exportAway()
    {
      document.location.href ="/csv/locations/away";
    }
    
    function printPopup($element, title) 
    {
      
      
      var mywindow = window.open('', 'my div', 'height='+screen.availHeight+',width='+screen.availWidth);
      mywindow.document.write('<html><head>');
      mywindow.document.write('<title>'+title+'</title>');
      mywindow.document.write('<link rel="stylesheet" href="/css/printConnection.css" />');
      mywindow.document.write('<title>'+title+'</title>');
      /*optional stylesheet*/ //mywindow.document.write('<link rel="stylesheet" href="main.css" type="text/css" />');
      mywindow.document.write('</head><body >');
      
      mywindow.document.write($element.html());
      mywindow.document.write('</body></html>');
      
      mywindow.print();
      
      
      return true;
    }
    
    function printPopupWithURL(url, title) 
    {
      
      
      var mywindow = window.open(url, 'Drucken', 'height='+screen.availHeight+',width='+screen.availWidth);
      
      
      mywindow.print();
      
      
      return true;
    }
    
    function onChangeConnectionProperty(event)
    {
      var value = $(this).val();
      var name = $(this).attr("name");
      var connectionID = event.data.connectionID;
      var data = {};
      data[name] = value;
      
      dataService.updateConnection(connectionID, data, function(error, result)
        {
          
          refreshConnectionTable(); 
        });
      
      
    }
    
    
 
    
    
    function refreshConnectionTable()
    {
      window.setTimeout(function()
        {
          console.log("refreshing connection table");
          
          $("#connectionTable").dataTable().fnReloadAjax();
        }, 0);
    }
    
    
    
    function refreshLocationTable()
    {
      window.setTimeout(function()
        {
          console.log("refreshing table");
          /*
          console.log( $("#locationTable td").length);
          $.each($("#locationTable").dataTable().fnGetNodes(), function(index, row)
          {
          $(row).find("*").off();
          });
          //$("#locationTable tbody td").empty();
          */
          $("#locationTable").dataTable().fnReloadAjax();
        }, 0);
    }
    
    function addLocationToConnection(connectionID, locationID, callback)
    {
      dataService.addLocationToConnection(connectionID, locationID, function(error, result)
        {
          refreshConnectionTable();
          
          showConnection(connectionID);
          callback(error, result);
        });
    }
    
    function removeLocationFromConnection(connectionID, locationID, callback)
    {
      dataService.removeLocationFromConnection(connectionID, locationID, function(error, result)
        {
          
          
          showConnection(connectionID);
          callback(error, result);
        });
    }
    
    
    
} );


