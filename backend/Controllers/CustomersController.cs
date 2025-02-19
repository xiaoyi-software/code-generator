using CodeGenerator.Data.Repositories;
using CodeGenerator.Models;
using CodeGenerator.Models.Common;
using Microsoft.AspNetCore.Mvc;

namespace CodeGenerator.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CustomersController> _logger;

        public CustomersController(IUnitOfWork unitOfWork, ILogger<CustomersController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult> GetCustomers()
        {
            try
            {
                var customers = await _unitOfWork.Customers.GetAllAsync();
                return Ok(DynamicMessageResult.Success("获取成功").SetData(customers));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customers");
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetCustomer(int id)
        {
            try
            {
                var customer = await _unitOfWork.Customers.GetByIdAsync(id);
                if (customer == null)
                {
                    return Ok(DynamicMessageResult.Error("未找到指定客户"));
                }

                return Ok(DynamicMessageResult.Success("获取成功").SetData(customer));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer {Id}", id);
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreateCustomer(Customer customer)
        {
            try
            {
                customer.CreatedAt = DateTime.UtcNow;
                await _unitOfWork.Customers.AddAsync(customer);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("创建成功").SetData(customer));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating customer");
                return Ok(DynamicMessageResult.Error($"创建失败：{ex.Message}"));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCustomer(int id, Customer customer)
        {
            if (id != customer.Id)
            {
                return Ok(DynamicMessageResult.Error("ID不匹配"));
            }

            try
            {
                customer.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Customers.UpdateAsync(customer);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("更新成功"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer {Id}", id);
                return Ok(DynamicMessageResult.Error($"更新失败：{ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCustomer(int id)
        {
            try
            {
                var customer = await _unitOfWork.Customers.GetByIdAsync(id);
                if (customer == null)
                {
                    return Ok(DynamicMessageResult.Error("未找到指定客户"));
                }

                await _unitOfWork.Customers.DeleteAsync(id);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("删除成功"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting customer {Id}", id);
                return Ok(DynamicMessageResult.Error($"删除失败：{ex.Message}"));
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult> SearchCustomers([FromQuery] string term)
        {
            try
            {
                var customers = await _unitOfWork.Customers.SearchCustomersAsync(term);
                return Ok(DynamicMessageResult.Success("搜索成功").SetData(customers));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching customers");
                return Ok(DynamicMessageResult.Error($"搜索失败：{ex.Message}"));
            }
        }

        [HttpGet("with-contacts")]
        public async Task<ActionResult> GetCustomersWithContacts()
        {
            try
            {
                var customers = await _unitOfWork.Customers.GetCustomersWithContactsAsync();
                return Ok(DynamicMessageResult.Success("获取成功").SetData(customers));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customers with contacts");
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }
    }
} 