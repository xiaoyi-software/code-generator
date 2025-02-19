using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace CodeGenerator.Models.Dto;

public class DynamicDataSearchDto
{
    /// <summary>
    /// 表名
    /// </summary>
    public string TableName { get; set; }

    /// <summary>
    /// 页码
    /// </summary>
    public int PageIndex { get; set; } = 1;

    /// <summary>
    /// 每页大小
    /// </summary>
    public int PageSize { get; set; } = 10;

    /// <summary>
    /// 过滤条件
    /// </summary>
    public Dictionary<string, string> Filters { get; set; } = new();

    // 添加自定义的 Filters 设置方法
    [FromQuery(Name = "filters")]
    public string FiltersJson 
    { 
        get => JsonSerializer.Serialize(Filters);
        set
        {
            if (!string.IsNullOrEmpty(value))
            {
                Filters = JsonSerializer.Deserialize<Dictionary<string, string>>(value);
            }
        }
    }
    public string SortsJson { get; set; }
}

// 添加自定义的字典值提供程序
public class DictionaryValueProvider : IValueProvider
{
    private readonly IQueryCollection _queryCollection;

    public DictionaryValueProvider(IQueryCollection queryCollection)
    {
        _queryCollection = queryCollection;
    }

    public bool ContainsPrefix(string prefix)
    {
        return _queryCollection.Keys.Any(k => k.StartsWith($"{prefix}["));
    }

    public ValueProviderResult GetValue(string key)
    {
        var result = new Dictionary<string, string>();
        foreach (var queryKey in _queryCollection.Keys)
        {
            if (queryKey.StartsWith($"{key}[") && queryKey.EndsWith("]"))
            {
                var dictKey = queryKey.Substring(key.Length + 1, queryKey.Length - key.Length - 2);
                var value = _queryCollection[queryKey].ToString();
                if (!string.IsNullOrEmpty(value))
                {
                    result[dictKey] = value;
                }
            }
        }

        return new ValueProviderResult(JsonSerializer.Serialize(result));
    }
}

// 添加自定义的值提供程序工厂
public class DictionaryValueProviderFactory : IValueProviderFactory
{
    public Task CreateValueProviderAsync(ValueProviderFactoryContext context)
    {
        context.ValueProviders.Add(new DictionaryValueProvider(context.ActionContext.HttpContext.Request.Query));
        return Task.CompletedTask;
    }
}
public class DynamicDataSortItem
{
    public string Field { get; set; }
    public string Order { get; set; } // "asc" 或 "desc"
}