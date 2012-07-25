
var fs = require('fs');

var database = require("./database");
database.connect({
    host     : '127.0.0.1 ',
    user     : 'root',
    password : 'pamir',
    database : "techmat_test"
});



fs.readFile('geheim_mat.csv', "utf-8", function(err,data){
    if(err) {
      console.error("Could not open file: %s", err);
      process.exit(1);
    }
    
    data.split("\n").forEach(function(line)
      {
        
        
        var lineArray =line.split(";");
        var number = lineArray[0];
        var article = {
          
          location:lineArray[1],
          sap :lineArray[2],
          name : lineArray[3],
          ext_id : lineArray[4] == "Nein" ? null : lineArray[4]
        }
        for(i = 0; i< number; i++)
        {
          database.addArticle(article, function(error, result)
            {
              if(error) console.log(error);
            });
        }
        
        
      });
});
