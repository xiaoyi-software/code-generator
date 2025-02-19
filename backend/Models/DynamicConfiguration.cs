namespace CodeGenerator.Models
{
    public class DynamicConfiguration
    {
        public int Id { get; set; }
        public string TableName { get; set; }
        public string Configuration { get; set; }
        public string DatabaseId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public ICollection<DynamicTableColumn> TableColumns { get; set; }
    }
} 