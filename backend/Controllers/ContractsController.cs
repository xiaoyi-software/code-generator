using CodeGenerator.Data.Repositories;
using CodeGenerator.Models;
using CodeGenerator.Models.Common;
using Microsoft.AspNetCore.Mvc;

namespace CodeGenerator.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ContractsController> _logger;

        public ContractsController(IUnitOfWork unitOfWork, ILogger<ContractsController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult> GetContracts()
        {
            try
            {
                var contracts = await _unitOfWork.Contracts.GetAllAsync();
                return Ok(DynamicMessageResult.Success("获取成功").SetData(contracts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contracts");
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetContract(int id)
        {
            try
            {
                var contract = await _unitOfWork.Contracts.GetByIdAsync(id);
                if (contract == null)
                {
                    return Ok(DynamicMessageResult.Error("未找到指定合同"));
                }

                return Ok(DynamicMessageResult.Success("获取成功").SetData(contract));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contract {Id}", id);
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult> GetContractsByCustomer(int customerId)
        {
            try
            {
                var contracts = await _unitOfWork.Contracts.GetContractsByCustomerAsync(customerId);
                return Ok(DynamicMessageResult.Success("获取成功").SetData(contracts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contracts for customer {CustomerId}", customerId);
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpGet("active")]
        public async Task<ActionResult> GetActiveContracts()
        {
            try
            {
                var contracts = await _unitOfWork.Contracts.GetActiveContractsAsync();
                return Ok(DynamicMessageResult.Success("获取成功").SetData(contracts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active contracts");
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpGet("total-value")]
        public async Task<ActionResult> GetTotalContractValue()
        {
            try
            {
                var totalValue = await _unitOfWork.Contracts.GetTotalContractValueAsync();
                return Ok(DynamicMessageResult.Success("获取成功").SetData(totalValue));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting total contract value");
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreateContract(Contract contract)
        {
            try
            {
                contract.CreatedAt = DateTime.UtcNow;
                await _unitOfWork.Contracts.AddAsync(contract);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("创建成功").SetData(contract));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating contract");
                return Ok(DynamicMessageResult.Error($"创建失败：{ex.Message}"));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateContract(int id, Contract contract)
        {
            if (id != contract.Id)
            {
                return Ok(DynamicMessageResult.Error("ID不匹配"));
            }

            try
            {
                contract.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Contracts.UpdateAsync(contract);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("更新成功"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contract {Id}", id);
                return Ok(DynamicMessageResult.Error($"更新失败：{ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteContract(int id)
        {
            try
            {
                var contract = await _unitOfWork.Contracts.GetByIdAsync(id);
                if (contract == null)
                {
                    return Ok(DynamicMessageResult.Error("未找到指定合同"));
                }

                await _unitOfWork.Contracts.DeleteAsync(id);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("删除成功"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting contract {Id}", id);
                return Ok(DynamicMessageResult.Error($"删除失败：{ex.Message}"));
            }
        }
    }
} 