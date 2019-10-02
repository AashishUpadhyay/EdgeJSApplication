var func = function (context, postresult) {
    const { NodeVM, VM, VMScript } = require('vm2');

    var scriptExecutionContext = context.ScriptExecutionContext;

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
            eval: undefined
        }
    });

 
    var script = context.Script;
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
};
return func;