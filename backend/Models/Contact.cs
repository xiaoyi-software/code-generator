using System.ComponentModel.DataAnnotations;

namespace CodeGenerator.Models;

/// <summary>
/// 联系人信息，代表客户公司的具体联系人
/// </summary>
public class Contact
{
    /// <summary>
    /// 联系人ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 名字
    /// </summary>
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; }

    /// <summary>
    /// 姓氏
    /// </summary>
    [Required]
    [StringLength(50)]
    public string LastName { get; set; }

    /// <summary>
    /// 电子邮件地址
    /// </summary>
    [StringLength(100)]
    [EmailAddress]
    public string Email { get; set; }

    /// <summary>
    /// 联系电话
    /// </summary>
    [StringLength(20)]
    [Phone]
    public string Phone { get; set; }

    /// <summary>
    /// 职位
    /// </summary>
    [StringLength(100)]
    public string Position { get; set; }

    /// <summary>
    /// 所属客户ID
    /// </summary>
    public int CustomerId { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 最后更新时间
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// 所属客户
    /// </summary>
    public virtual Customer Customer { get; set; }
} 