using JsonMais.Application.UseCases;
using JsonMais.Domain.Sessions;
using JsonMais.Web.Session;
using Microsoft.Extensions.Options;
using AppSessionOptions = JsonMais.Application.Options.SessionOptions;

namespace JsonMais.Web.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/health", () => Results.Json(new { status = "Healthy" }));
        app.MapGet("/health/ready", () => Results.Json(new { status = "Healthy" }));
        return app;
    }
}

public static class SessionEndpoints
{
    public static IEndpointRouteBuilder MapSessionEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/session", (HttpContext http) =>
        {
            if (http.Items[SessionHttpContextKeys.SessionId] is not SessionId sessionId)
            {
                return Results.Problem(
                    detail: "Session was not established.",
                    statusCode: StatusCodes.Status500InternalServerError);
            }

            return Results.Json(new { sessionId = sessionId.ToString() });
        });

        app.MapDelete("/api/session", async (
            HttpContext http,
            EndSessionUseCase endSession,
            IOptions<AppSessionOptions> optionsAccessor,
            CancellationToken cancellationToken) =>
        {
            if (http.Items[SessionHttpContextKeys.SessionId] is SessionId active)
            {
                await endSession.ExecuteAsync(active, cancellationToken);
            }

            SessionMiddleware.ClearCookie(http, optionsAccessor.Value.CookieName);
            return Results.NoContent();
        });

        return app;
    }
}
