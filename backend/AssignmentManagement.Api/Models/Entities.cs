using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssignmentManagement.Api.Models;

public static class Roles { public const string Admin="Admin"; public const string Teacher="Teacher"; public const string Student="Student"; }
public static class AssignmentStatuses { public const string Draft="Draft"; public const string Published="Published"; }
public static class SubmissionStatuses { public const string Submitted="Submitted"; public const string Late="Late"; public const string Graded="Graded"; public const string Returned="Returned"; }

public abstract class Entity { [BsonId] [BsonRepresentation(BsonType.ObjectId)] public string Id { get; set; } = ObjectId.GenerateNewId().ToString(); public DateTime CreatedAt { get; set; } = DateTime.UtcNow; public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; }

public class User : Entity { public string Name { get; set; }=""; public string Email { get; set; }=""; public string PasswordHash { get; set; }=""; public string Role { get; set; }=""; public string? ClassId { get; set; } public bool IsActive { get; set; }=true; }
public class SchoolClass : Entity { public string Name { get; set; }=""; public string Code { get; set; }=""; }
public class Subject : Entity { public string Name { get; set; }=""; public string Code { get; set; }=""; }
public class TeacherAssignment : Entity { public string TeacherId { get; set; }=""; public string ClassId { get; set; }=""; public string SubjectId { get; set; }=""; }
public class Assignment : Entity { public string Title { get; set; }=""; public string Description { get; set; }=""; public DateTime Deadline { get; set; } public int MaxMarks { get; set; } public string Status { get; set; }=AssignmentStatuses.Draft; public string TeacherId { get; set; }=""; public string ClassId { get; set; }=""; public string SubjectId { get; set; }=""; }
public class Submission : Entity { public string AssignmentId { get; set; }=""; public string StudentId { get; set; }=""; public string Answer { get; set; }=""; public DateTime SubmittedAt { get; set; } public string Status { get; set; }=SubmissionStatuses.Submitted; public int? Marks { get; set; } public string? Feedback { get; set; } }
