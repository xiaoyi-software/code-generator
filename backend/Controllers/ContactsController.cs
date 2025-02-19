using CodeGenerator.Data.Repositories;
using CodeGenerator.Models;
using CodeGenerator.Models.Common;
using Microsoft.AspNetCore.Mvc;

namespace CodeGenerator.Controllers
{
    /// <summary>
    /// 联系人管理控制器
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ContactsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ContactsController> _logger;

        public ContactsController(IUnitOfWork unitOfWork, ILogger<ContactsController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        /// <summary>
        /// 获取所有联系人列表
        /// </summary>
        /// <returns>联系人列表</returns>
        /// <response code="200">成功获取联系人列表</response>
        /// <response code="400">获取过程中发生错误</response>
        [HttpGet]
        public async Task<ActionResult> GetContacts()
        {
            try
            {
                var contacts = await _unitOfWork.Contacts.GetAllAsync();
                return Ok(DynamicMessageResult.Success("获取成功").SetData(contacts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contacts");
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        /// <summary>
        /// 获取指定联系人的详细信息
        /// </summary>
        /// <param name="id">联系人ID</param>
        /// <returns>联系人详细信息</returns>
        /// <response code="200">成功获取联系人信息</response>
        /// <response code="404">未找到指定联系人</response>
        [HttpGet("{id}")]
        public async Task<ActionResult> GetContact(int id)
        {
            try
            {
                var contact = await _unitOfWork.Contacts.GetByIdAsync(id);
                if (contact == null)
                {
                    return Ok(DynamicMessageResult.Error("未找到指定联系人"));
                }

                return Ok(DynamicMessageResult.Success("获取成功").SetData(contact));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contact {Id}", id);
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        /// <summary>
        /// 获取指定客户的所有联系人
        /// </summary>
        /// <param name="customerId">客户ID</param>
        /// <returns>联系人列表</returns>
        /// <response code="200">成功获取联系人列表</response>
        /// <response code="400">获取过程中发生错误</response>
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult> GetContactsByCustomer(int customerId)
        {
            try
            {
                var contacts = await _unitOfWork.Contacts.GetContactsByCustomerAsync(customerId);
                return Ok(DynamicMessageResult.Success("获取成功").SetData(contacts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contacts for customer {CustomerId}", customerId);
                return Ok(DynamicMessageResult.Error($"获取失败：{ex.Message}"));
            }
        }

        /// <summary>
        /// 创建新的联系人
        /// </summary>
        /// <param name="contact">联系人信息</param>
        /// <returns>创建的联系人信息</returns>
        /// <response code="200">成功创建联系人</response>
        /// <response code="400">创建过程中发生错误</response>
        [HttpPost]
        public async Task<ActionResult> CreateContact(Contact contact)
        {
            try
            {
                contact.CreatedAt = DateTime.UtcNow;
                await _unitOfWork.Contacts.AddAsync(contact);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("创建成功").SetData(contact));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating contact");
                return Ok(DynamicMessageResult.Error($"创建失败：{ex.Message}"));
            }
        }

        /// <summary>
        /// 更新指定联系人的信息
        /// </summary>
        /// <param name="id">联系人ID</param>
        /// <param name="contact">更新的联系人信息</param>
        /// <returns>更新结果</returns>
        /// <response code="200">成功更新联系人信息</response>
        /// <response code="400">更新过程中发生错误或ID不匹配</response>
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateContact(int id, Contact contact)
        {
            if (id != contact.Id)
            {
                return Ok(DynamicMessageResult.Error("ID不匹配"));
            }

            try
            {
                contact.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Contacts.UpdateAsync(contact);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("更新成功"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contact {Id}", id);
                return Ok(DynamicMessageResult.Error($"更新失败：{ex.Message}"));
            }
        }

        /// <summary>
        /// 删除指定的联系人
        /// </summary>
        /// <param name="id">联系人ID</param>
        /// <returns>删除结果</returns>
        /// <response code="200">成功删除联系人</response>
        /// <response code="400">删除过程中发生错误</response>
        /// <response code="404">未找到指定联系人</response>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteContact(int id)
        {
            try
            {
                var contact = await _unitOfWork.Contacts.GetByIdAsync(id);
                if (contact == null)
                {
                    return Ok(DynamicMessageResult.Error("未找到指定联系人"));
                }

                await _unitOfWork.Contacts.DeleteAsync(id);
                await _unitOfWork.SaveChangesAsync();

                return Ok(DynamicMessageResult.Success("删除成功"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting contact {Id}", id);
                return Ok(DynamicMessageResult.Error($"删除失败：{ex.Message}"));
            }
        }
    }
} 