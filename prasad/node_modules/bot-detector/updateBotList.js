'use strict';
var request = require('request');
var parseString = require('xml2js').parseString;
var fs = require('fs');

var userAgentsOrgUrl = 'http://www.user-agents.org/allagents.xml';
// Doesn't have hardly any bots.  Boo.
//var secondUrl = 'http://techpatterns.com/downloads/firefox/useragentswitcher.xml';

var ua_list = {};
var exports = module.exports = {};

// This can be called manually and piped into botlist.json to update the botlist
var updateXML = function() {
  fetchData(userAgentsOrgUrl, function(err, result) {
    var uas = result['user-agents']['user-agent'];
    uas.forEach(function(ua) {
      ua_list[ua.String[0]] = 1;
    });

    // Write the list out
    fs.writeFile("botlist.json", JSON.stringify(ua_list), function(err) {
      if (err) {
        console.log("There was an error writing the list: "+err);
      } else {
        console.log("Wrote botlist");
      }
    });
  });
}

var fetchData = function(url, callback) {
  request(url, function (error, response, xml) {
    if (error) {
      callback(error);
    } else if (response.statusCode != 200) {
      callback("Server did not return a 200!  Status code was "+response.statusCode);
    } else if (!error && response.statusCode == 200) {
      parseString(xml, function(err, result) {
        callback(result);
      });
    } 
  });
}


updateXML();
