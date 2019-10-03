using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using EdgeJs;
using Newtonsoft.Json;

namespace EdgeJSApplication
{
    class Program
    {
        private const string SWSANDBOXEDSCRIPTIPLISTING = "EdgeJSApplication.NodeScripts.SandboxedScriptIPListing.js";
        private const string SANDBOXEDSCRIPT = "EdgeJSApplication.NodeScripts.SandboxedScript.js";
        private const string SAMPLE_SCRIPT = "EdgeJSApplication.NodeScripts.SampleScript.js";

        static void Main(string[] args)
        {
            try
            {
                //chrome://inspect/#devices
                Environment.SetEnvironmentVariable("EDGE_NODE_PARAMS", $"--max_old_space_size=2048 --inspect-brk");

                //Environment.SetEnvironmentVariable("EDGE_NODE_PARAMS", $"--max_old_space_size=2048");

                var sanboxedScript = GetScript(SWSANDBOXEDSCRIPTIPLISTING);
                var script = GetScript(SAMPLE_SCRIPT);

                var func = Edge.Func(sanboxedScript);

                var executorSettings = new Dictionary<string, object>();
                executorSettings.Add("Tokens", null);

                var funcTask = func(new
                {
                    Script = script,
                    ScriptExecutionContext = new
                    {
                        Tokens = new
                        {
                            OutputFileName = "",
                            IsOutgoingIpWhitelistEnabled = "true",
                        }
                    },
                    AssemblyDirectory = GetAssemblyDirectory()
                });

                dynamic scriptResult = funcTask.Result;

                var json = JsonConvert.SerializeObject(scriptResult.output);

                Console.WriteLine(json);

                Console.Read();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private static string GetScript(string script)
        {
            var assembly = Assembly.GetExecutingAssembly();
            string sanboxedScript;

            using (var stream = assembly.GetManifestResourceStream(script))
            {
                if (stream != null)
                {
                    using (var reader = new StreamReader(stream))
                    {
                        sanboxedScript = reader.ReadToEnd();
                    }
                }
                else
                {
                    throw new ArgumentNullException("Script not found!");
                }
            }

            return sanboxedScript;
        }

        private static string GetAssemblyDirectory()
        {
            string codeBase = typeof(Program).Assembly.CodeBase;
            UriBuilder uri = new UriBuilder(codeBase);
            string path = Uri.UnescapeDataString(uri.Path);
            var assemblyDirectory = Path.GetDirectoryName(path);
            return assemblyDirectory;
        }
    }
}
