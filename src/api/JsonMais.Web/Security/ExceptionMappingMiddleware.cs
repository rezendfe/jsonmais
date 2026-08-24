using JsonMais.Application.Abstractions;

namespace JsonMais.Web.Security;

public sealed class ExceptionMappingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMappingMiddleware> _logger;

    public ExceptionMappingMiddleware(RequestDelegate next, ILogger<ExceptionMappingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            if (context.Response.HasStarted)
            {
                throw;
            }

            _logger.LogWarning("Application error. Code={ErrorCode}", ex.ErrorCode);
            context.Response.Clear();
            context.Response.StatusCode = ex.StatusCode;
            await context.Response.WriteAsJsonAsync(new { error = ex.ErrorCode, message = ex.Message });
        }
        catch (Exception ex)
        {
            if (context.Response.HasStarted)
            {
                throw;
            }

            _logger.LogError(ex, "Unhandled error");
            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(
                new { error = "internal_error", message = "Ocorreu um erro inesperado." });
        }
    }
}
