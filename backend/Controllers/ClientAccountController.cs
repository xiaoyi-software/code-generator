using CodeGenerator.Models.Common;
using CodeGenerator.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SkiaSharp;

namespace CodeGenerator.Controllers
{
    [ApiController]
    [Route("api/account")]
    public class ClientAccountController : ControllerBase
    {

        public ClientAccountController()
        {
        }

        [Authorize]
        [HttpGet("user")]
        public Task<IActionResult> GetUser()
        {
            return Task.FromResult<IActionResult>(Ok(DynamicMessageResult.Success("").SetValue("dto", new 
            {
                Id = Guid.Empty.ToString(),
                UserName = "admin",
                Email = "admin@126.aaa",
                Name = "管理员",
                NickName = "",
                LastLoginTime = DateTime.Now,
                Roles = new List<string>()
            })));
        }

    }

    public class LoginRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public int RegMethod { get; set; }
        public string Code { get; set; }
    }

    public class UpdateUserRequest
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string NickName { get; set; }
        public string Avatar { get; set; }
    }
}
