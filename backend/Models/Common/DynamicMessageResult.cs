using System.Collections;
using System.Dynamic;
using System.Text.Json;
using System.Text.Json.Serialization;
using CodeGenerator.Extensions;

namespace CodeGenerator.Models.Common
{
    /// <summary>
    /// 动态数据结构，用于存储键值对数据
    /// </summary>
    public class DynamicData : DynamicObject
    {
        private readonly Dictionary<string, object> _data = new();

        /// <summary>
        /// 设置属性值
        /// </summary>
        public void SetValue(string name, object value)
        {
            _data[name] = value;
        }

        /// <summary>
        /// 获取属性值
        /// </summary>
        public object GetValue(string name)
        {
            return _data.TryGetValue(name, out var value) ? value : null;
        }

        /// <summary>
        /// 获取所有属性
        /// </summary>
        public Dictionary<string, object> GetAll()
        {
            return new Dictionary<string, object>(_data);
        }

        public override bool TryGetMember(GetMemberBinder binder, out object result)
        {
            return _data.TryGetValue(binder.Name, out result);
        }

        public override bool TrySetMember(SetMemberBinder binder, object value)
        {
            _data[binder.Name] = value;
            return true;
        }

        /// <summary>
        /// 用于 JSON 序列化
        /// </summary>
        [JsonExtensionData]
        public Dictionary<string, object> SerializationData => _data;

        // 或者重写 ToString 方法，返回 JSON 字符串
        public override string ToString()
        {
            return JsonSerializer.Serialize(_data);
        }
    }

    /// <summary>
    /// 动态消息结果，支持动态设置数据属性
    /// </summary>
    public class DynamicMessageResult : MessageResult<DynamicData>
    {
        public DynamicMessageResult()
        {
            Data = new DynamicData();
        }

        /// <summary>
        /// 创建成功的动态返回结果
        /// </summary>
        public new static DynamicMessageResult Success(string message = "success")
        {
            return new DynamicMessageResult
            {
                Status = 0,
                Message = message,
                Data = new DynamicData()
            };
        }

        /// <summary>
        /// 创建失败的动态返回结果
        /// </summary>
        public static DynamicMessageResult Error(string message, int status = -1)
        {
            return new DynamicMessageResult
            {
                Status = status,
                Message = message,
                Data = new DynamicData()
            };
        }

        /// <summary>
        /// 设置数据属性值
        /// </summary>
        public DynamicMessageResult SetValue(string name, object value)
        {
            Data.SetValue(name, value);
            return this;
        }

        /// <summary>
        /// 批量设置数据属性值
        /// </summary>
        public DynamicMessageResult SetData(Dictionary<string, object> values)
        {
            foreach (var pair in values)
            {
                Data.SetValue(pair.Key, pair.Value);
            }
            return this;
        }

        /// <summary>
        /// 设置对象的所有公共属性到数据字典
        /// </summary>
        public DynamicMessageResult SetData(object obj, string prefix = "")
        {
            if (obj == null) return this;

            if (obj is IDictionary dictionary)
            {
                foreach (DictionaryEntry o in dictionary)
                {
                    this.SetValue(o.Key.ToString(), o.Value);
                }
            }
            else
            {
                foreach (var prop in obj.GetType().GetProperties())
                {
                    var value = prop.GetValue(obj);
                    var key = string.IsNullOrEmpty(prefix) ? prop.Name : $"{prefix}{prop.Name}";
                    key = key.ToLowerFirst();
                    Data.SetValue(key, value);
                }
            }

            return this;
        }
    }
} 