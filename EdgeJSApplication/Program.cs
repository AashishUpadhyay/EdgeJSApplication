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
        private const string SANDBOXED_SCRIPT_FILE = "EdgeJSApplication.NodeScripts.SandboxedScript.js";
        private const string SAMPLE_SCRIPT = "EdgeJSApplication.NodeScripts.SampleScript.js";

        static void Main(string[] args)
        {
            ////Environment.SetEnvironmentVariable("EDGE_NODE_PARAMS", $"--max_old_space_size=2048 --inspect-brk");

            Environment.SetEnvironmentVariable("EDGE_NODE_PARAMS", $"--max_old_space_size=2048");

            var sanboxedScript = GetScript(SANDBOXED_SCRIPT_FILE);
            var script = GetScript(SAMPLE_SCRIPT);

            var func = Edge.Func(sanboxedScript);

            var context = new EdgeJSScriptExecutorContext(script);
            var funcTask = func(context);

            dynamic scriptResult = funcTask.Result;

            var json = JsonConvert.SerializeObject(scriptResult.output);

            Console.WriteLine(json);

            Console.Read();
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
                    throw new ArgumentNullException("Sandbox script.");
                }
            }

            return sanboxedScript;
        }
    }

    public class EdgeJSScriptExecutorContext 
    {
        #region Private Fields

        private string _assemblyDirectory;

        #endregion

        #region Constructor

        public EdgeJSScriptExecutorContext(string script)
        {
            Script = script;
        }

        #endregion

        #region Public Properties

        /// <summary>
        /// Script that would get executed by NodeJS
        /// </summary>
        public string Script { get; }

        public string AssemblyDirectory => _assemblyDirectory ?? (_assemblyDirectory = GetAssemblyDirectory());

        #endregion

        #region Private Methods

        private string GetAssemblyDirectory()
        {
            string codeBase = typeof(EdgeJSScriptExecutorContext).Assembly.CodeBase;
            UriBuilder uri = new UriBuilder(codeBase);
            string path = Uri.UnescapeDataString(uri.Path);
            var assemblyDirectory = Path.GetDirectoryName(path);
            return assemblyDirectory + "\\edge";
        }

        #endregion
    }

}
