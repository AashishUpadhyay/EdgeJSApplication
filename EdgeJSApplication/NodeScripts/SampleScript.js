var httpRequest = require('request');
var xPath = require('xpath');
var xmlDOM = require('xmldom');
var parser = require('xml2js');
var express = require('express');

var someURI = "https://api.github.com/users";
var someMethod = "GET";
var output = {};
makeRequest(someURI, someMethod);

function makeRequest(httpEndpoint, httpMethod) {
    httpRequest(
        {
            method: httpMethod,
            uri: httpEndpoint,
            headers: { 'user-agent': 'node.js' }
        },
        function handleResponse(error, response, body) {
            if (response.statusCode == 200) {
                output = JSON.parse(body);
            }
            else {
                throw new Error("The request did not return a 200 (OK) status.\r\nThe returned error was:\r\n" + error);
            }

            callback(null, {
                output: output,
                previousRunContext: "myContextVariable"
            });
        }
    );
}


