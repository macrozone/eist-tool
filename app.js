

var express = require('express')
, http = require('http');

var app = express();



// Configuration

app.configure(function(){

    app.set("database", "techmat");
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    // app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.set('port', 1338);
     app.set("database", "eist-tool");
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
        app.set('port', 80);
    app.use(express.errorHandler()); 
});


var database = require("./database");
database.connect({
    host     : '127.0.0.1 ',
    user     : 'eist-tool',
    password : 'aWHBfRGB',
    database : app.get("database")
});



var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

require("./routes")(app, database);
require("./socket")(server, database);
