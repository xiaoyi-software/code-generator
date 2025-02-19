using System.Text.Json.Serialization;
using DotLiquid;

namespace CodeGenerator.CodeGen
{
    /// <summary>
    /// 数据库表结构模型
    /// </summary>
    public class SchemaModel : ILiquidizable
    {
        [JsonPropertyName("tableName")]
        public string TableName { get; set; }
        
        [JsonPropertyName("schema")]
        public string Schema { get; set; }

        [JsonPropertyName("comment")]
        public string Comment { get; set; }

        [JsonPropertyName("columns")]
        public List<ColumnModel> Columns { get; set; } = new();
        
        [JsonPropertyName("foreignKeys")]
        public List<ForeignKeyModel> ForeignKeys { get; set; } = new();

        public object ToLiquid()
        {
            // 确保所有列的Type属性都已设置
            foreach (var column in Columns)
            {
                column.SetCSharpType();
            }

            return Hash.FromDictionary(new Dictionary<string, object>
            {
                { "TableName", TableName ?? string.Empty },
                { "Schema", Schema ?? string.Empty },
                { "Columns", Columns?.Select(c => c.ToLiquid()).ToList() ?? new List<object>() },
                { "ForeignKeys", ForeignKeys?.Select(f => f.ToLiquid()).ToList() ?? new List<object>() }
            });
        }
    }
} 