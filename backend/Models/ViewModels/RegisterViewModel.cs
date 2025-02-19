using System.ComponentModel.DataAnnotations;

namespace CodeGenerator.Models.ViewModels
{
    public class RegisterViewModel
    {
        [Required(ErrorMessage = "用户名是必需的")]
        [Display(Name = "用户名")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "真实姓名是必需的")]
        [Display(Name = "真实姓名")]
        public string Name { get; set; }

        [Required(ErrorMessage = "邮箱是必需的")]
        [EmailAddress(ErrorMessage = "邮箱格式不正确")]
        [Display(Name = "邮箱")]
        public string Email { get; set; }

        [Required(ErrorMessage = "密码是必需的")]
        [StringLength(100, ErrorMessage = "{0} 必须至少包含 {2} 个字符。", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "密码")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "确认密码")]
        [Compare("Password", ErrorMessage = "密码和确认密码不匹配。")]
        public string ConfirmPassword { get; set; }
    }
} 