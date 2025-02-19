using System.Text.Json.Serialization;
using DotLiquid;

namespace CodeGenerator.CodeGen
{
    /// <summary>
    /// 数据库列模型
    /// </summary>
    public class ColumnModel : ILiquidizable
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }
        
        [JsonPropertyName("dbType")]
        public string DbType { get; set; }

        [JsonIgnore]
        public string DataType { get; private set; }

        [JsonPropertyName("isNullable")]
        public bool IsNullable { get; set; }
        
        [JsonPropertyName("isPrimaryKey")]
        public bool IsPrimaryKey { get; set; }
        
        [JsonPropertyName("isIdentity")]
        public bool IsIdentity { get; set; }
        
        [JsonPropertyName("maxLength")]
        public long? MaxLength { get; set; }

        [JsonPropertyName("comment")]
        public string Comment { get; set; }

        public void SetCSharpType()
        {
            DataType = GetCSharpType(DbType, IsNullable);
        }

        private string GetCSharpType(string dbType, bool isNullable)
        {
            // 提取数据库类型的基本类型部分（去除长度等信息）
            var baseDbType = dbType.Split('(')[0].ToLower().Trim();
            
            var baseType = baseDbType switch
            {
                // 整数类型
                "int" or "integer" => "int",
                "bigint" => "long",
                "smallint" => "short",
                "tinyint" => "byte",
                
                // 布尔类型
                "bit" or "boolean" or "bool" => "bool",
                
                // 小数类型
                "decimal" or "numeric" or "money" or "smallmoney" => "decimal",
                "float" or "double precision" => "double",
                "real" => "float",
                
                // 日期时间类型
                "datetime" or "datetime2" or "smalldatetime" or "timestamp" => "DateTime",
                "date" => "DateOnly",
                "time" => "TimeOnly",
                "datetimeoffset" => "DateTimeOffset",
                
                // 字符串类型
                "char" or "character" or "nchar" or
                "varchar" or "character varying" or "nvarchar" or
                "text" or "ntext" or "clob" or
                "xml" or "json" => "string",
                
                // 二进制类型
                "binary" or "varbinary" or "image" or "blob" => "byte[]",
                
                // GUID类型
                "uniqueidentifier" or "uuid" => "Guid",
                
                // 默认类型
                _ => "object"
            };

            // string 和 byte[] 类型默认可空，不需要添加 ?
            if (baseType == "string" || baseType == "byte[]")
            {
                return baseType;
            }

            return isNullable ? $"{baseType}?" : baseType;
        }

        public object ToLiquid()
        {
            // 确保Type已设置
            if (string.IsNullOrEmpty(DataType))
            {
                SetCSharpType();
            }

            return Hash.FromDictionary(new Dictionary<string, object>
            {
                { "Name", Name },
                { "DbType", DbType },
                { "DataType", DataType },
                { "IsNullable", IsNullable },
                { "IsPrimaryKey", IsPrimaryKey },
                { "IsIdentity", IsIdentity },
                { "MaxLength", MaxLength }
            });
        }
    }
} 