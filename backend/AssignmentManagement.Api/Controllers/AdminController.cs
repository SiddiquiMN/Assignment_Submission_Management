using AssignmentManagement.Api.DTOs;
using AssignmentManagement.Api.Models;
using AssignmentManagement.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController(UserService users, AdminService admin) : ControllerBase
{
    [HttpGet("users")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Users()
        => Ok(await users.GetAllAsync());

    [HttpGet("classes")]
    [Authorize(Roles = Roles.Admin + "," + Roles.Teacher)]
    public async Task<IActionResult> Classes()
        => Ok(await admin.Classes());

    [HttpPost("classes")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> CreateClass(CreateClassRequest r)
        => Ok(await admin.AddClass(new SchoolClass
        {
            Name = r.Name,
            Code = r.Code
        }));

    [HttpGet("subjects")]
    [Authorize(Roles = Roles.Admin + "," + Roles.Teacher)]
    public async Task<IActionResult> Subjects()
        => Ok(await admin.Subjects());

    [HttpPost("subjects")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> CreateSubject(CreateSubjectRequest r)
        => Ok(await admin.AddSubject(new Subject
        {
            Name = r.Name,
            Code = r.Code
        }));

    [HttpPost("teacher-assignments")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> AssignTeacher(AssignTeacherRequest r)
        => Ok(await admin.AssignTeacher(new TeacherAssignment
        {
            TeacherId = r.TeacherId,
            ClassId = r.ClassId,
            SubjectId = r.SubjectId
        }));

    [HttpGet("teacher-assignments")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> TeacherAssignments()
        => Ok(await admin.TeacherAssignments());
}