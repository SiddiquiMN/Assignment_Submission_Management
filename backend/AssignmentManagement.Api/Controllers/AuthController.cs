using AssignmentManagement.Api.DTOs;using AssignmentManagement.Api.Services;using Microsoft.AspNetCore.Mvc;
namespace AssignmentManagement.Api.Controllers;
[ApiController][Route("api/auth")]
public class AuthController(AuthService auth):ControllerBase
{
 [HttpPost("login")] public async Task<IActionResult> Login(LoginRequest request){var (token,user)=await auth.LoginAsync(request.Email,request.Password);return Ok(new{token,user=new{id=user.Id,name=user.Name,email=user.Email,role=user.Role,classId=user.ClassId}});}
 [HttpGet("me")][Microsoft.AspNetCore.Authorization.Authorize] public IActionResult Me()=>Ok(new{id=User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,name=User.Identity?.Name,email=User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,role=User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value});
}
