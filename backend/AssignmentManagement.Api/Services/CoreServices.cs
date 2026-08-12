using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AssignmentManagement.Api.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

namespace AssignmentManagement.Api.Services;

public class MongoDbSettings { public string ConnectionString {get;set;}="mongodb://localhost:27017"; public string DatabaseName {get;set;}="assignment_management"; }
public class JwtSettings { public string Key {get;set;}=""; public string Issuer {get;set;}="AssignmentManagement.Api"; public string Audience {get;set;}="AssignmentManagement.Frontend"; public int ExpiresMinutes {get;set;}=120; }

public class MongoDbContext
{
    public IMongoDatabase Database {get;}
    public IMongoCollection<User> Users => Database.GetCollection<User>("users");
    public IMongoCollection<SchoolClass> Classes => Database.GetCollection<SchoolClass>("classes");
    public IMongoCollection<Subject> Subjects => Database.GetCollection<Subject>("subjects");
    public IMongoCollection<TeacherAssignment> TeacherAssignments => Database.GetCollection<TeacherAssignment>("teacherAssignments");
    public IMongoCollection<Assignment> Assignments => Database.GetCollection<Assignment>("assignments");
    public IMongoCollection<Submission> Submissions => Database.GetCollection<Submission>("submissions");
    public MongoDbContext(IOptions<MongoDbSettings> options){var client=new MongoClient(options.Value.ConnectionString); Database=client.GetDatabase(options.Value.DatabaseName);}
}

public class PasswordService { public string Hash(string password)=>BCrypt.Net.BCrypt.HashPassword(password); public bool Verify(string password,string hash)=>BCrypt.Net.BCrypt.Verify(password,hash); }

public class JwtService(IOptions<JwtSettings> options)
{
    private readonly JwtSettings _settings=options.Value;
    public string CreateToken(User user)
    {
        var claims=new[]{new Claim(ClaimTypes.NameIdentifier,user.Id),new Claim(ClaimTypes.Name,user.Name),new Claim(ClaimTypes.Email,user.Email),new Claim(ClaimTypes.Role,user.Role),new Claim("classId",user.ClassId??"")};
        var key=new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var token=new JwtSecurityToken(_settings.Issuer,_settings.Audience,claims,expires:DateTime.UtcNow.AddMinutes(_settings.ExpiresMinutes),signingCredentials:new SigningCredentials(key,SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class AuthService(MongoDbContext db,PasswordService passwords,JwtService jwt)
{
    public async Task<(string token,User user)> LoginAsync(string email,string password)
    {
        var user=await db.Users.Find(x=>x.Email.ToLower()==email.ToLower() && x.IsActive).FirstOrDefaultAsync() ?? throw new UnauthorizedAccessException("Invalid email or password.");
        if(!passwords.Verify(password,user.PasswordHash)) throw new UnauthorizedAccessException("Invalid email or password.");
        return (jwt.CreateToken(user),user);
    }
}

public class UserService(MongoDbContext db,PasswordService passwords)
{
    public async Task<List<User>> GetAllAsync()=>await db.Users.Find(_=>true).SortBy(x=>x.Name).ToListAsync();
    public async Task<User> CreateAsync(string name,string email,string password,string role,string? classId)
    { if(!new[]{Roles.Admin,Roles.Teacher,Roles.Student}.Contains(role)) throw new ArgumentException("Invalid role."); if(await db.Users.Find(x=>x.Email.ToLower()==email.ToLower()).AnyAsync()) throw new InvalidOperationException("Email already exists."); var u=new User{Name=name,Email=email.ToLowerInvariant(),PasswordHash=passwords.Hash(password),Role=role,ClassId=classId}; await db.Users.InsertOneAsync(u); return u; }
}

public class AssignmentService(MongoDbContext db)
{
    public async Task<List<Assignment>> GetAllAsync()=>await db.Assignments.Find(_=>true).SortByDescending(x=>x.CreatedAt).ToListAsync();
    public async Task<List<Assignment>> GetForStudentAsync(string classId)=>await db.Assignments.Find(x=>x.ClassId==classId && x.Status==AssignmentStatuses.Published).SortBy(x=>x.Deadline).ToListAsync();
    public async Task<Assignment> GetAsync(string id)=>await db.Assignments.Find(x=>x.Id==id).FirstOrDefaultAsync() ?? throw new KeyNotFoundException("Assignment not found.");
    public async Task<Assignment> CreateAsync(Assignment a){if(a.Deadline<=DateTime.UtcNow) throw new ArgumentException("Deadline must be in the future."); if(a.MaxMarks<=0) throw new ArgumentException("Maximum marks must be greater than zero."); var assigned=await db.TeacherAssignments.Find(x=>x.TeacherId==a.TeacherId&&x.ClassId==a.ClassId&&x.SubjectId==a.SubjectId).AnyAsync(); if(!assigned) throw new UnauthorizedAccessException("Teacher is not assigned to this class and subject."); await db.Assignments.InsertOneAsync(a); return a;}
    public async Task UpdateAsync(Assignment a){a.UpdatedAt=DateTime.UtcNow; await db.Assignments.ReplaceOneAsync(x=>x.Id==a.Id,a);}
    public async Task DeleteAsync(string id)=>await db.Assignments.DeleteOneAsync(x=>x.Id==id);
}

public class SubmissionService(MongoDbContext db,AssignmentService assignments)
{
    public async Task<List<Submission>> GetForAssignmentAsync(string assignmentId)=>await db.Submissions.Find(x=>x.AssignmentId==assignmentId).SortByDescending(x=>x.SubmittedAt).ToListAsync();
    public async Task<Submission?> GetMineAsync(string assignmentId,string studentId)=>await db.Submissions.Find(x=>x.AssignmentId==assignmentId&&x.StudentId==studentId).FirstOrDefaultAsync();
    public async Task<Submission> SubmitAsync(string assignmentId,string studentId,string answer)
    {
        var a=await assignments.GetAsync(assignmentId); if(a.Status!=AssignmentStatuses.Published) throw new InvalidOperationException("Assignment is not published.");
        if(DateTime.UtcNow>a.Deadline) throw new InvalidOperationException("The submission deadline has passed."); if(string.IsNullOrWhiteSpace(answer)) throw new ArgumentException("Answer is required.");
        var existing=await GetMineAsync(assignmentId,studentId); if(existing is null){existing=new Submission{AssignmentId=assignmentId,StudentId=studentId,Answer=answer,SubmittedAt=DateTime.UtcNow,Status=SubmissionStatuses.Submitted}; await db.Submissions.InsertOneAsync(existing);} else {existing.Answer=answer;existing.SubmittedAt=DateTime.UtcNow;existing.Status=SubmissionStatuses.Submitted;existing.UpdatedAt=DateTime.UtcNow;await db.Submissions.ReplaceOneAsync(x=>x.Id==existing.Id,existing);} return existing;
    }
    public async Task<Submission> GradeAsync(string id,int marks,string? feedback,string status,string teacherId)
    {
        var s=await db.Submissions.Find(x=>x.Id==id).FirstOrDefaultAsync() ?? throw new KeyNotFoundException("Submission not found."); var a=await assignments.GetAsync(s.AssignmentId); if(a.TeacherId!=teacherId) throw new UnauthorizedAccessException("You cannot grade this submission."); if(marks<0||marks>a.MaxMarks) throw new ArgumentException("Marks are outside the allowed range."); s.Marks=marks;s.Feedback=feedback;s.Status=status;s.UpdatedAt=DateTime.UtcNow;await db.Submissions.ReplaceOneAsync(x=>x.Id==id,s);return s;
    }
}

public class AdminService(MongoDbContext db)
{
    public async Task<List<SchoolClass>> Classes()=>await db.Classes.Find(_=>true).SortBy(x=>x.Name).ToListAsync();
    public async Task<List<Subject>> Subjects()=>await db.Subjects.Find(_=>true).SortBy(x=>x.Name).ToListAsync();
    public async Task<SchoolClass> AddClass(SchoolClass c){await db.Classes.InsertOneAsync(c);return c;}
    public async Task<Subject> AddSubject(Subject s){await db.Subjects.InsertOneAsync(s);return s;}
    public async Task<TeacherAssignment> AssignTeacher(TeacherAssignment a){await db.TeacherAssignments.InsertOneAsync(a);return a;}
    public async Task<List<TeacherAssignment>> TeacherAssignments()=>await db.TeacherAssignments.Find(_=>true).ToListAsync();
}

public class SeedService(MongoDbContext db,PasswordService passwords)
{
    public async Task InitializeAsync()
    {
        if(await db.Classes.CountDocumentsAsync(_=>true)==0) await db.Classes.InsertManyAsync([new SchoolClass{Name="Class 10",Code="C10"},new SchoolClass{Name="Class 11",Code="C11"}]);
        if(await db.Subjects.CountDocumentsAsync(_=>true)==0) await db.Subjects.InsertManyAsync([new Subject{Name="Mathematics",Code="MATH"},new Subject{Name="English",Code="ENG"}]);
        if(await db.Users.CountDocumentsAsync(_=>true)>0) return;
        var cls=await db.Classes.Find(_=>true).FirstAsync(); var math=await db.Subjects.Find(x=>x.Code=="MATH").FirstAsync();
        var admin=new User{Name="System Admin",Email="admin@example.com",PasswordHash=passwords.Hash("Admin@12345"),Role=Roles.Admin};
        var teacher=new User{Name="Demo Teacher",Email="teacher@example.com",PasswordHash=passwords.Hash("Teacher@12345"),Role=Roles.Teacher};
        var student=new User{Name="Demo Student",Email="student@example.com",PasswordHash=passwords.Hash("Student@12345"),Role=Roles.Student,ClassId=cls.Id};
        await db.Users.InsertManyAsync([admin,teacher,student]);
        await db.TeacherAssignments.InsertOneAsync(new TeacherAssignment{TeacherId=teacher.Id,ClassId=cls.Id,SubjectId=math.Id});
        await db.Assignments.InsertOneAsync(new Assignment{Title="Algebra Practice",Description="Solve the provided algebra problems and explain your reasoning.",Deadline=DateTime.UtcNow.AddDays(7),MaxMarks=20,Status=AssignmentStatuses.Published,TeacherId=teacher.Id,ClassId=cls.Id,SubjectId=math.Id});
    }
}
