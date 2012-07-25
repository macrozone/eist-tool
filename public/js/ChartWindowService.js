
// constructor
function ChartWindowService(socket, dataService)
{
  
  function makeID(connectionID)
  {
    return "chart_"+connectionID; 
  }
  var highchartsDefaults = {
		chart: {
		  zoomType: 'x',
			type: 'line'
		},
		
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: { // don't display the dummy year
				month: '%e. %b',
				year: '%b'
			}
		},
		
		
		yAxis: {
			title: {
				text: 'Pegel (db)'
			}
		},
		tooltip: {
			formatter: function() {
			  return '<b>'+ this.series.name +'</b><br/>'+
			  tools.formatTime(this.x) +': '+ "<strong>"+this.y+'db</strong>';
			}
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'top',
			x: -10,
			y: 100,
			borderWidth: 0
		}
		
		
	};
	
  socket.on("connection changed", function(connectionID)
    {
      var chart = $("#"+makeID(connectionID)).data("chart");
      if(chart)
      {
        loadData(connectionID, function(dataFromTX, dataFromRX, dataToTX, dataToRX)
          {
            chart.series[0].setData(dataFromTX);
            
            chart.series[1].setData(dataFromRX);
            chart.series[2].setData(dataToTX);
            chart.series[3].setData(dataToRX);
            
            
            chart.redraw();
          });
      }
    });
  
  this.createNewWindow = function(connectionID)
  {
    
    var id = makeID(connectionID);
    var $window = $("#"+id);
    var chart;
    if($window.length)
    {
      // exists
    }
    else
    {
      // doesnt exist
      $window = $('<div id="'+id+'" />');
      
      $window.appendTo($("body"));
      var $chartContainer = $("<div class='chartContainer' />").appendTo($window);
      $chartContainer.height("100%");
      
      loadChartToWindow(connectionID, $window);
      
      
      // make dialog window
      
      // little workaround
      $window.on("dialogresize", function()
        {
          $(window).trigger("resize");
        });
      $window.dialog({canMinimize:true,
				canMaximize:true,position: ["right", "top"],width:600, title: "Bündel: "+connectionID, buttons:{"Schliessen": function() {
          $( this ).dialog( "close" );
      }}});
      
      // destroy dialog on close completely
      
      $window.on("dialogclose", function()
        {
          $( this ).dialog( "destroy" );
          $(this).remove(); 
        });
      
    }
    
    
    
    
  }
  
  
  function loadChartToWindow(connectionID, $window)
  {
    loadSeries(connectionID, function(connection, series)
      {
        var options = {
          chart:
          {
            
            renderTo: $window.find(".chartContainer").get(0)
          },
          title: 
          {
            text:"Bündel "+connectionID+": "+connection.from+" - "+connection.to
          },
          series: series,
          plotOptions: {
            series: {
              cursor: 'pointer',
              point: {
                events: {
                  click: function() {
                    var level = this.config[2];
                    var options = {title: this.series.name, buttons:{"Löschen": function()
                      {
                       
                       dataService.deleteLevel(level, function(error, result)
                         {
                           $dialog.dialog("close");
                         });
                    }}};
                    var $dialog = tools.showMessage('<b>'+ this.series.name +'</b><br/>'+
                      tools.formatTime(this.x) +': '+ "<strong>"+this.y+'db</strong>', options);
                    
                  }
                }
              },
              marker: {
                lineWidth: 1
              }
            }
          }
        }
        var settings = $.extend(true, {}, highchartsDefaults, options);
        
        chart = new Highcharts.Chart(settings);
        $window.data("chart", chart);
      });
    
    
    
    
  }
  
  function loadSeries(connectionID, callback)
  {
    dataService.getConnection(connectionID, function(error, result)
      {
        var connection = result[0];
        
        
        loadData(connectionID, function(dataFromTX, dataFromRX, dataToTX, dataToRX)
          {
            var series = [
              {
                name: "TX "+connection.from,
                data: dataFromTX
              },
              {
                name: "RX "+connection.from,
                data: dataFromRX
              },
              {
                name: "TX "+connection.to,
                data: dataToTX
              },
              {
                name: "RX "+connection.to,
                data: dataToRX
              }
              
            ];
            
            callback(connection, series);
            
            
          });
        
      }); 
  }
  
  function loadData(connectionID, callback)
  {
    dataService.getLevelsForConnection(connectionID, function(error, result)
      {
        
        var dataFromTX = [];
        var dataToTX = [];
        var dataFromRX = [];
        var dataToRX = [];
        
        $.each(result, function(index, item)
          {
            if(item.location_from_to == "FROM")
            {
              dataFromTX.push([new Date(item.itime).getTime(), item.tx, item]);
              dataFromRX.push([new Date(item.itime).getTime(), item.rx, item]);
            }
            else
            {
              dataToTX.push([new Date(item.itime).getTime(), item.tx, item]);
              dataToRX.push([new Date(item.itime).getTime(), item.rx, item]);
            }
          });
        dataFromTX.sort(compareByDate);
        
        dataFromRX.sort(compareByDate);
        dataToRX.sort(compareByDate);
        dataToTX.sort(compareByDate); 
        
        callback(dataFromTX, dataFromRX, dataToTX, dataToRX);
      });
  }
  
  function compareByDate(a,b)
  {
    if (a[0] < b[0])
      return -1;
    if (a[0] > b[0])
      return 1;
    return 0;
  }
  
  
}



