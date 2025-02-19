using System.ComponentModel.DataAnnotations;

namespace CodeGenerator.Models.ViewModels
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "用户名是必需的")]
        [Display(Name = "用户名")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "密码是必需的")]
        [DataType(DataType.Password)]
        [Display(Name = "密码")]
        public string Password { get; set; }

        [Display(Name = "记住我?")]
        public bool RememberMe { get; set; }
    }
} 