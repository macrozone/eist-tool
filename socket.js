var socket = require('socket.io');
var numberOfCients = 0;

module.exports = function(server, database)
{
  var io = socket.listen(server);
  
  
  io.sockets.on('connection', function (socket) { 
      numberOfCients++;
      io.sockets.emit("client connected", {numberOfCients: numberOfCients});
      console.log("client connected");
      
      
      socket.on("order get", function(orderID, callback)
        {       
          database.getOrder(orderID,callback);
        });
      
      socket.on("location add", function(data, callback)
        {
          database.addLocation(data, callback);
          socket.broadcast.emit("location changed");
        });
      socket.on("connection add", function(data, callback)
        {
          database.addConnection(data, callback);
          socket.broadcast.emit("connection changed");
        });
      
      socket.on("connection get", database.getConnection);
      
      
      
      socket.on("level add", function(level, callback)
        {
          database.addLevel(level, callback);
          // broadcast to all
          io.sockets.emit("connection changed", level.connection_fk);
          
        });
      
      socket.on("level get all", database.getLevelsForConnection);
      
      socket.on("level delete", function(level, callback)
        {
          
          database.deleteLevel(level, callback);
           // broadcast to all
          io.sockets.emit("connection changed", level.connection_fk);
        });
      
      socket.on("location update", function(data, callback)
        {
          database.updateLocation(data.locationID, data.fields, callback); 
          socket.broadcast.emit("location changed", {locationID: data.locationID});
          
        });
 
      
      socket.on("disconnect", function()
        {
          console.log("client disconnected");
          numberOfCients--
          io.sockets.emit("client disconnected", {numberOfCients: numberOfCients});
        });
      
  });
  
  
  
}

// status 0 is success
function writeResponse(callback, status, data)
{
  var answer = 
  {
    status: status,
    statusText: getStatusText(status),
    data: data
  };
  callback(answer);
  
  
}


function getStatusText(status)
{
  switch(status)
  {
  case 0:
    return "success";
  default:
    return "unknown";
  }
}

