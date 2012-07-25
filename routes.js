module.exports = function(app, database)
{
  
  app.get("/", function(req, res)
    {
      res.render("index", {
          title: "Home" 
      });
      
    });
  /*
  app.get("/csv/articles/all", function(req, res)
    {
      showArticleCSV(req, res, database.allArticles);
    });
  
   app.get("/csv/articles/away", function(req, res)
    {
      showArticleCSV(req, res, database.awayArticles);
    });
   
     app.get("/csv/articles/stock", function(req, res)
    {
      showArticleCSV(req, res, database.stockArticles);
    });
  
  function showArticleCSV(req, res, dbQuery)
  {
    res.header("Content-Type","application/octet-stream");
    res.header("Content-Disposition", "attachment;filename=\"articles.csv\"");
    
    
    var query=  dbQuery(function(error, result, fields)
      {
        var counter = 0;
        for(column in fields){
          counter++;
          res.write(fields[column].name);
          if(counter < fields.length)
          {
            res.write(";"); 
          }
          
        }
        res.write("\n");
        
        for(id in result)
        {
          var row = result[id];
          counter = 0;
          for(column in fields){
            var field = row[fields[column].name];
            res.write(""+(field !=null ? field: ""));
            counter++;
            if(counter < fields.length)
            {
              res.write(";"); 
            }
          }
          
          res.write("\n");
        }
        
        
        
        res.end();
      });
  }
  */
  
  /*
  
  app.get("/print/articles/all", function(req, res)
    {
      showPrintArticleList(req, res, database.allArticles);
      
    });
  
  app.get("/print/articles/stock", function(req, res)
    {
      showPrintArticleList(req, res, database.stockArticles);
      
    });
  
  app.get("/print/articles/away", function(req, res)
    {
      showPrintArticleList(req, res, database.awayArticles);
      
    });
  
  function showPrintArticleList(req, res, dbQuery)
  {
    dbQuery(function(error, result, fields)
      {
        
        
        res.render("articleList",
          {
            title: "Alle Artikel",
            headers:["ID", "Name", "Name", "Geheim-Nr","Ort", "Bemerk.", "Weg?"],
            articles: result
          });
        
      });
  }
  
  // ajax calls are mostly deprecated
  // only ajax/articles is used
  
  */
  
  
  app.get('/ajax/locations', function(req, res){
      
      database.getLocations(function(error, result, fields)
        {
          
          
          var response = 
          {
           
            error: error,
            aaData: result
          };
          
          res.json(response);
        });
      
      
  });
  
  
  app.post("/ajax/signal_levels/:id?", function(req, res)
    {
      var id= req.params.id;
      database.getSignalLevelsForLocation(id, function(error, result)
        {
          var response = 
          {
            error: error,
            aaData: result
          };
          
          res.json(response);  
        });
    });
  
  
  app.get("/ajax/connections", function(req, res)
    {
      database.getConnections(function(error, result, fields)
        {
          
          
          var response = 
          {
           
            error: error,
            aaData: result
          };
          
          res.json(response);
        });
      
    });
 
}

