using System.ComponentModel.DataAnnotations;

namespace CodeGenerator.Models.ViewModels
{
    public class ProfileViewModel
    {
        [Required(ErrorMessage = "用户名是必需的")]
        [Display(Name = "用户名")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "邮箱是必需的")]
        [EmailAddress(ErrorMessage = "邮箱格式不正确")]
        [Display(Name = "邮箱")]
        public string Email { get; set; }

        [Required(ErrorMessage = "姓名是必需的")]
        [Display(Name = "姓名")]
        public string Name { get; set; }
        
        [Display(Name = "头像")]
        public string? Avatar { get; set; }

        [Display(Name = "当前密码")]
        [DataType(DataType.Password)]
        public string? CurrentPassword { get; set; }

        [Display(Name = "新密码")]
        [StringLength(100, ErrorMessage = "{0}必须至少包含{2}个字符。", MinimumLength = 6)]
        [DataType(DataType.Password)]
        public string? NewPassword { get; set; }

        [Display(Name = "确认新密码")]
        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "新密码和确认密码不匹配。")]
        public string? ConfirmNewPassword { get; set; }
    }
} 