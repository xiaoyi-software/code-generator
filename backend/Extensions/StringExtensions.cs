using System.Text.Json;
using System.Text.Json.Nodes;

namespace CodeGenerator.Extensions
{
    public static class StringExtensions
    {
        /// <summary>
        /// 将字符串转换为有效的JSON对象字符串，如果转换失败则返回"{}"
        /// </summary>
        /// <param name="str">要转换的字符串</param>
        /// <returns>有效的JSON对象字符串</returns>
        public static string ToValidJsonObject(this string str)
        {
            try
            {
                if (!string.IsNullOrEmpty(str))
                {
                    // 尝试解析 JSON 以验证其有效性
                    var jsonObject = JsonSerializer.Deserialize<JsonObject>(str);
                    return str;
                }
            }
            catch
            {
                // 解析失败，忽略异常
            }
            
            return "{}";
        }

        /// <summary>
        /// 将字符串的首字母转换为小写
        /// </summary>
        public static string ToLowerFirst(this string str)
        {
            if (string.IsNullOrEmpty(str))
                return str;
            
            return char.ToLower(str[0]) + str[1..];
        }
    }
} 