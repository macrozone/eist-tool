var mysql      = require('mysql');
var connection;

module.exports.connect = function(settings)
{
  connection = mysql.createConnection(settings);
  
  
  connection.connect(function(err) {
      if(err)
        console.log(err);
      else
        console.log("successfully connected to database");
  }); 
}



module.exports.getSignalLevelsForLocation = function(locationID, callback)
{
  connection.query("SELECT * FROM signal_level where location_fk=?", locationID, callback); 
}

module.exports.getLocations = function(callback)
{
  connection.query("SELECT * FROM location", callback); 
}



module.exports.getConnections = function(callback)
{
  connection.query("SELECT connection.id, from.name_short as `from`, to.name_short as `to` FROM connection JOIN `location` `from` on connection.from = from.id JOIN location `to` on connection.to=to.id", callback); 
}

module.exports.getConnection = function(connectionID, callback)
{
  connection.query("SELECT connection.id, from.name_short as `from`, to.name_short as `to` FROM connection JOIN `location` `from` on connection.from = from.id JOIN location `to` on connection.to=to.id WHERE connection.id=?", connectionID, callback); 
  
}

module.exports.addLevel = function(level, callback)
{
  var fields = 
  [
    'connection_fk', "rx", "tx", "location_from_to", "itime"
  ];
  
  var level = sanitize(level, fields);
  console.log(level);
  connection.query("INSERT INTO signal_level SET ?", level, callback);
}

module.exports.addLocation = function(location, callback)
{
  var fields = 
  [
    'name', 'short_name'
  ];
  
  var data = sanitize(location, fields);
  return connection.query('INSERT INTO location SET ?',data, callback);
  
}


module.exports.addConnection = function(data, callback)
{
  var fields = 
  [
    'id', 'from', 'to'
  ];
  
  var data = sanitize(data, fields);
  return connection.query('INSERT INTO connection SET ?',data, callback);
  
}

module.exports.updateLocation = function(id, fields, callback)
{
  return connection.query("UPDATE `location` SET ? WHERE id=?", [fields,id], callback);
}

module.exports.getLevelsForConnection = function(connectionID, callback)
{
 return connection.query("SELECT * from signal_level where connection_fk=?", connectionID, callback); 
}


function sanitize(rawData, fields)
{
  var data = {};
  
  {};
  
  fields.forEach(function(field)
    {
      if(typeof rawData[field] != 'undefined')
      {
        if(typeof rawData[field] == 'string' && rawData[field].length == 0)
        {
          
          data[field] = null;
        }
        else
        {
          data[field] = rawData[field];
        }
      }
      
    });
  
  return data; 
}










