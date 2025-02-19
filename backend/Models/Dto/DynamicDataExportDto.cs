namespace CodeGenerator.Models.Dto;

public class DynamicDataExportDto
{
    public string TableName { get; set; }
    public Dictionary<string, string> Filters { get; set; }
    public string SortsJson { get; set; }
    public List<DynamicTableColumn> Columns { get; set; }
}