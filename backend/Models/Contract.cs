using System.ComponentModel.DataAnnotations;

namespace CodeGenerator.Models;

/// <summary>
/// 合同信息，代表已签订的业务合同
/// </summary>
public class Contract
{
    /// <summary>
    /// 合同ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 合同编号
    /// </summary>
    [Required]
    [StringLength(50)]
    public string ContractNumber { get; set; } = null!;

    /// <summary>
    /// 合同标题
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = null!;

    /// <summary>
    /// 合同金额
    /// </summary>
    public decimal Value { get; set; }

    /// <summary>
    /// 签订日期
    /// </summary>
    public DateTime SignedDate { get; set; }

    /// <summary>
    /// 开始日期
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// 结束日期
    /// </summary>
    public DateTime EndDate { get; set; }

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
    /// 合同状态（如：执行中、已完成、已终止等）
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Status { get; set; }

    // 导航属性
    public Customer Customer { get; set; } = null!;
}

public enum ContractStatus
{
    Draft,
    UnderReview,
    Active,
    Completed,
    Terminated
} 