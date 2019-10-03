debugger;
var httpRequest = require('request');
var xPath = require('xpath');
var xmlDOM = require('xmldom');
var xml2js = require('xml2js');
//var express = require('express'); //external
//var fs = require('fs'); //builtin

var xml = "<config><test>User-Agent</test><data>Node.js</data></config>";
var extractedData = {};
var parser = new xml2js.Parser();
parser.parseString(xml, function (err, result) {
    extractedData.SomeData = result['config']['data'];
    extractedData.SomeTest = result['config']['test'];
    console.log(extractedData);
});


var someURI = "https://api.github.com/users";
var someMethod = "GET";
var someHeaders = {
    [extractedData.SomeTest]: extractedData.SomeData
}
makeRequest(someURI, someMethod, someHeaders);

function makeRequest(httpEndpoint, httpMethod, httpHeaders) {
    httpRequest(
        {
            method: httpMethod,
            uri: httpEndpoint,
            headers: httpHeaders
        },
        function handleResponse(error, response, body) {
            debugger;
            
            if (response.statusCode == 200) {
                callback(null, {
                    output: JSON.parse(body),
                    previousRunContext: "myContextVariable"
                });
            }
            else {
                throw new Error("The request did not return a 200 (OK) status.\r\nThe returned error was:\r\n" + error);
            }
        }
    );
}


