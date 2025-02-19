using System.ComponentModel.DataAnnotations;

namespace CodeGenerator.Models;

/// <summary>
/// 客户信息，CRM系统的核心实体
/// </summary>
public class Customer
{
    /// <summary>
    /// 客户ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 客户名称/公司名称
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    /// <summary>
    /// 客户描述/备注信息
    /// </summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// 公司网站
    /// </summary>
    [StringLength(200)]
    public string? Website { get; set; }

    /// <summary>
    /// 所属行业
    /// </summary>
    [StringLength(50)]
    public string? Industry { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 最后更新时间
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
    
    // 导航属性
    /// <summary>
    /// 客户的联系人列表
    /// </summary>
    public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
    /// <summary>
    /// 客户的商机列表
    /// </summary>
    public ICollection<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
    /// <summary>
    /// 客户的合同列表
    /// </summary>
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
} 