using System.Text.Json.Serialization;
using DotLiquid;

namespace CodeGenerator.CodeGen
{
    /// <summary>
    /// 外键关系模型
    /// </summary>
    public class ForeignKeyModel : ILiquidizable
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }
        
        [JsonPropertyName("properties")]
        public List<string> Properties { get; set; } = new();
        
        [JsonPropertyName("principalTable")]
        public string PrincipalTable { get; set; }
        
        [JsonPropertyName("principalColumns")]
        public List<string> PrincipalColumns { get; set; } = new();

        public object ToLiquid()
        {
            return Hash.FromDictionary(new Dictionary<string, object>
            {
                { "Name", Name ?? string.Empty },
                { "Properties", Properties ?? new List<string>() },
                { "PrincipalTable", PrincipalTable ?? string.Empty },
                { "PrincipalColumns", PrincipalColumns ?? new List<string>() }
            });
        }
    }
} 