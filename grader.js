#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr)) {
      console.log("%s does not exist. Exiting.", instr);
      process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
  }
  return instr;
};

var assertUrlIsValid = function(url){
  if(/((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(url)){
    return url;
  }else{
    return false;
  }

};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, isFile, callback) {

    var processCheck= function($){
      var checks = loadChecks(checksfile).sort();
      var out = {};
      for(var ii in checks) {
          var present = $(checks[ii]).length > 0;
          out[checks[ii]] = present;
      }
      callback(out);
    }

    if(isFile===true){
      $ = cheerioHtmlFile(htmlfile);
      processCheck($);  
    }else{
       rest.get( htmlfile ).on('complete', function( result ) {
          if (result instanceof Error) {
            console.log("%s does not exist. Exiting." + result.message, instr);
            process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
          } else {
            processCheck(cheerio.load(result));
          }
      });
    }
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <html_url>', 'URL to the file to check', clone(assertUrlIsValid), false)
        .parse(process.argv);

    var content = program.file;
    var isFile = true;

    if(program.url!=false){
      content = program.url;
      isFile = false;
    }

    checkHtmlFile(content, program.checks, isFile ,function(checkJson){
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
    });

} else {
    exports.checkHtmlFile = checkHtmlFile;
}