var func = function (context, postresult) {
    debugger;
    const { NodeVM, VM, VMScript } = require('vm2');
    const extend = require('extend');
    const dns = require('dns');
    const url = require('url');
    var whitelistedIps = ['140.82.118.5','140.82.114.6','140.82.114.5'];
    var scriptExecutionContext = context.ScriptExecutionContext;
	
    var prepareRequire = function (){}
    var modifiedRequire = function (module) {
        console.log(module);
        var preparedRequire = prepareRequire(module);
        debugger;
        if (module === 'request') {
            return function request(uri, options, callback) {
                var mergedInput = mergeInput(uri, options, callback);
                var uri = url.parse(mergedInput.uri);
                if (isValidIpAddress(uri.host)) {
                    if (!isAllowedIP(uri.host)) {
                        let message = `Data Request IP (${uri.host}) does not fall within the outgoing IP whitelist range.`;
                        throw new Error(message);
                    }
                    else {
                        return preparedRequire(mergedInput, mergedInput.callback);
                    }
                }
                else {
                    dns.lookup(uri.host, function (err, result) {
                        if (result) {
                            if (!isAllowedIP(result)) {
                                let message = `Data Request URI (${uri.host}) whose IP is (${result}) does not fall within the outgoing IP whitelist range.`;
                                throw new Error(message);
                            }
                            else {
                                return preparedRequire(mergedInput, mergedInput.callback);
                            }
                        }
                        else {
                            throw err;
                        }
                    });
                }
            }
        }
        return preparedRequire;
    }

    const vm = new NodeVM({
        console: 'inherit',
        setTimeout: setTimeout,
        require: {
            external: {
                modules:['request', 'xpath', 'xmldom', 'xml2js']
            },
            builtin: false,
            context: 'host'
        },
        root: './ ',
        sandbox: {
            context: scriptExecutionContext,    
            callback: callback,
            eval: undefined,
            modifiedRequire: modifiedRequire
        }
    });
	
    prepareRequire = vm._prepareRequire(context.AssemblyDirectory+ '\\edge');
 
    var script = `require = modifiedRequire;\n` + context.Script;
    vm.run(script, context.AssemblyDirectory + '\\edge\\SampleScript.js');

    process.on('uncaughtException',
        (err) => {
            postresult(null,
                {
                    output: null,
                    previousRunContext: null,
                    scriptLogs: [],
                    success: false,
                    errormessage: "SCRIPTUNCAUGHTEXCEPTION: " + err.message
                });
        });

    function callback(scope, result) {
        result.success = true;
        postresult(scope, result);
    }
	
    function isAllowedIP(ipAddress) {
        let ipAddressInt = toInt(ipAddress);
        for (let index = 0; index < whitelistedIps.length; index++) {
            var val = whitelistedIps[index];
            if (val.indexOf('-') !== -1) {
                let ipRange = val.split('-');
                let minIp = toInt(ipRange[0]);
                let maxIp = toInt(ipRange[1]);
                if (ipAddressInt >= minIp && ipAddressInt <= maxIp) {
                    return true;
                }
            }
            else {
                let ip = toInt(val);
                if (ip === ipAddressInt) {
                    return true;
                }
            }
        }

        return false;
    }

    function mergeInput(uri, options, callback) {
        if (typeof options === 'function') {
            callback = options
        }

        var mergedInput = {}
        if (options !== null && typeof options === 'object') {
            extend(mergedInput, options, { uri: uri })
        }
        else if (typeof uri === 'string') {
            extend(mergedInput, { uri: uri })
        }
        else {
            extend(mergedInput, uri)
        }

        mergedInput.callback = callback || mergedInput.callback
        return mergedInput
    }

    function toInt(ip) {
        return ip.split('.').map((octet, index, array) => {
            return parseInt(octet) * Math.pow(256, (array.length - index - 1));
        }).reduce((prev, curr) => {
            return prev + curr;
        });
    }

    function isValidIpAddress(value) {
        const regexIP = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
        return regexIP.test(value);
    }
};
return func;