using System.ComponentModel.DataAnnotations;

namespace CodeGenerator.Models;

/// <summary>
/// 商机信息，代表潜在的业务机会
/// </summary>
public class Opportunity
{
    /// <summary>
    /// 商机ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 商机标题
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = null!;

    /// <summary>
    /// 商机描述
    /// </summary>
    [StringLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// 预计价值
    /// </summary>
    public decimal EstimatedValue { get; set; }

    /// <summary>
    /// 商机状态（如：初步接触、需求确认、方案制定、商务谈判、赢单、输单等）
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Status { get; set; }

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
    /// 预计成交时间
    /// </summary>
    public DateTime? ExpectedCloseDate { get; set; }

    // 导航属性
    public Customer Customer { get; set; } = null!;
}

public enum OpportunityStatus
{
    New,
    Qualified,
    Proposal,
    Negotiation,
    Closed_Won,
    Closed_Lost
} 