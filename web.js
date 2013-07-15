var fs = require("fs");
var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var index = fs.readFileSync("index.html");
  response.send(index.toString());

  //response.send('Hello World 2!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});


var index = fs.readFileSync("index.html");
console.log(index.toString());
