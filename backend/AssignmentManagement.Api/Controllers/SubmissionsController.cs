using System.Security.Claims;using AssignmentManagement.Api.DTOs;using AssignmentManagement.Api.Models;using AssignmentManagement.Api.Services;using Microsoft.AspNetCore.Authorization;using Microsoft.AspNetCore.Mvc;
namespace AssignmentManagement.Api.Controllers;
[ApiController][Route("api/submissions")][Authorize]
public class SubmissionsController(SubmissionService service):ControllerBase
{
 [HttpGet("assignment/{assignmentId}")][Authorize(Roles=Roles.Teacher+","+Roles.Admin)] public async Task<IActionResult> GetForAssignment(string assignmentId)=>Ok(await service.GetForAssignmentAsync(assignmentId));
 [HttpGet("assignment/{assignmentId}/mine")][Authorize(Roles=Roles.Student)] public async Task<IActionResult> Mine(string assignmentId){var s=await service.GetMineAsync(assignmentId,User.FindFirstValue(ClaimTypes.NameIdentifier)!);return Ok(s);}
 [HttpPost("assignment/{assignmentId}")][Authorize(Roles=Roles.Student)] public async Task<IActionResult> Submit(string assignmentId,CreateSubmissionRequest r)=>Ok(await service.SubmitAsync(assignmentId,User.FindFirstValue(ClaimTypes.NameIdentifier)!,r.Answer));
 [HttpPut("{id}/grade")][Authorize(Roles=Roles.Teacher)] public async Task<IActionResult> Grade(string id,GradeSubmissionRequest r)=>Ok(await service.GradeAsync(id,r.Marks,r.Feedback,r.Status,User.FindFirstValue(ClaimTypes.NameIdentifier)!));
}
