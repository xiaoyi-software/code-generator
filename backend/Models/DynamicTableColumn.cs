namespace CodeGenerator.Models
{
    public class DynamicTableColumn
    {
        public int Id { get; set; }
        public int DynamicConfigurationId { get; set; }
        public string ColumnName { get; set; }
        public string DisplayName { get; set; }
        public bool IsSortable { get; set; }
        public bool IsVisible { get; set; } = true;
        public int OrderIndex { get; set; }
        public string Description { get; set; }
        
        // Navigation property
        public DynamicConfiguration DynamicConfiguration { get; set; }
    }
} 