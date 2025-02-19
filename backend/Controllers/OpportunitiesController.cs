using CodeGenerator.Data.Repositories;
using CodeGenerator.Models;
using CodeGenerator.Models.Common;
using Microsoft.AspNetCore.Mvc;

namespace CodeGenerator.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OpportunitiesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<OpportunitiesController> _logger;

        public OpportunitiesController(IUnitOfWork unitOfWork, ILogger<OpportunitiesController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult> GetOpportunities()
        {
            try
            {
                var opportunities = await _unitOfWork.Opportunities.GetAllAsync();
                return Ok(DynamicMessageResult.Success("获取成功").SetData(opportunities));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting opportunities");
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetOpportunity(int id)
        {
            try
            {
                var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(id);
                if (opportunity == null)
                {
                    return Ok(DynamicMessageResult.Error("未找到指定商机"));
                }

                return Ok(DynamicMessageResult.Success("获取成功").SetData(opportunity));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting opportunity {Id}", id);
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult> GetOpportunitiesByCustomer(int customerId)
        {
            try
            {
                var opportunities = await _unitOfWork.Opportunities.GetOpportunitiesByCustomerAsync(customerId);
                return Ok(DynamicMessageResult.Success("获取成功").SetData(opportunities));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting opportunities for customer {CustomerId}", customerId);
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult> GetOpportunitiesByStatus(OpportunityStatus status)
        {
            try
            {
                var opportunities = await _unitOfWork.Opportunities.GetOpportunitiesByStatusAsync(status);
                return Ok(DynamicMessageResult.Success("获取成功").SetData(opportunities));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting opportunities by status {Status}", status);
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreateOpportunity(Opportunity opportunity)
        {
            try
            {
                opportunity.CreatedAt = DateTime.UtcNow;
                await _unitOfWork.Opportunities.AddAsync(opportunity);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("创建成功").SetData(opportunity));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating opportunity");
                return Ok(DynamicMessageResult.Error($"创建失败：{ex.Message}"));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateOpportunity(int id, Opportunity opportunity)
        {
            if (id != opportunity.Id)
            {
                return Ok(DynamicMessageResult.Error("ID不匹配"));
            }

            try
            {
                opportunity.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Opportunities.UpdateAsync(opportunity);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("更新成功"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating opportunity {Id}", id);
                return Ok(DynamicMessageResult.Error($"更新失败：{ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteOpportunity(int id)
        {
            try
            {
                var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(id);
                if (opportunity == null)
                {
                    return Ok(DynamicMessageResult.Error("未找到指定商机"));
                }

                await _unitOfWork.Opportunities.DeleteAsync(id);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("删除成功"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting opportunity {Id}", id);
                return Ok(DynamicMessageResult.Error($"删除失败：{ex.Message}"));
            }
        }
    }
} 