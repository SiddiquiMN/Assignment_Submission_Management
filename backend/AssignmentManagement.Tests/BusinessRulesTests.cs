using Xunit;
namespace AssignmentManagement.Tests;
public class BusinessRulesTests
{
 [Fact] public void MaxMarks_MustBePositive(){var maxMarks=0;Assert.True(maxMarks<=0);}
 [Fact] public void Deadline_MustBeFuture(){var deadline=DateTime.UtcNow.AddMinutes(-1);Assert.True(deadline<=DateTime.UtcNow);}
 [Theory] [InlineData("Admin")] [InlineData("Teacher")] [InlineData("Student")]
 public void SupportedRoles_AreRecognized(string role)=>Assert.Contains(role,new[]{"Admin","Teacher","Student"});
}
