using System.Net;
using System.Text.Json;

namespace AssignmentManagement.Api.Middleware;
public class ExceptionHandlingMiddleware(RequestDelegate next,ILogger<ExceptionHandlingMiddleware> logger)
{
 public async Task Invoke(HttpContext context){try{await next(context);}catch(Exception ex){logger.LogError(ex,"Unhandled request error");context.Response.ContentType="application/json";context.Response.StatusCode=ex switch{UnauthorizedAccessException=>401,KeyNotFoundException=>404,ArgumentException=>400,InvalidOperationException=>400,_=>500};await context.Response.WriteAsync(JsonSerializer.Serialize(new{message=ex.Message}));}}
}
