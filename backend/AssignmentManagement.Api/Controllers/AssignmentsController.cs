using System.Security.Claims;
using AssignmentManagement.Api.DTOs;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/assignments")]
[Authorize]
public class AssignmentsController(AssignmentService service, MongoDbContext db) : ControllerBase
{
    [HttpGet] public async Task<IActionResult> Get() { var role = User.FindFirstValue(ClaimTypes.Role); if (role == Roles.Student) { var c = User.FindFirstValue("classId") ?? (await db.Users.Find(x => x.Id == User.FindFirstValue(ClaimTypes.NameIdentifier)).FirstAsync()).ClassId; return Ok(c is null ? [] : await service.GetForStudentAsync(c)); } return Ok(await service.GetAllAsync()); }
    [HttpGet("{id}")] public async Task<IActionResult> GetById(string id) => Ok(await service.GetAsync(id));
    [HttpPost][Authorize(Roles = Roles.Teacher)] public async Task<IActionResult> Create(CreateAssignmentRequest r) { var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier)!; var a = new Assignment { Title = r.Title, Description = r.Description, Deadline = r.Deadline.ToUniversalTime(), MaxMarks = r.MaxMarks, ClassId = r.ClassId, SubjectId = r.SubjectId, TeacherId = teacherId, Status = r.Publish ? AssignmentStatuses.Published : AssignmentStatuses.Draft }; return Ok(await service.CreateAsync(a)); }
    [HttpPut("{id}")][Authorize(Roles = Roles.Teacher)] public async Task<IActionResult> Update(string id, UpdateAssignmentRequest r) { var a = await service.GetAsync(id); if (a.TeacherId != User.FindFirstValue(ClaimTypes.NameIdentifier)) return Forbid(); a.Title = r.Title; a.Description = r.Description; a.Deadline = r.Deadline.ToUniversalTime(); a.MaxMarks = r.MaxMarks; a.ClassId = r.ClassId; a.SubjectId = r.SubjectId; a.Status = r.Publish ? AssignmentStatuses.Published : AssignmentStatuses.Draft; await service.UpdateAsync(a); return Ok(a); }
    [HttpDelete("{id}")][Authorize(Roles = Roles.Teacher)] public async Task<IActionResult> Delete(string id) { var a = await service.GetAsync(id); if (a.TeacherId != User.FindFirstValue(ClaimTypes.NameIdentifier)) return Forbid(); await service.DeleteAsync(id); return NoContent(); }
}
