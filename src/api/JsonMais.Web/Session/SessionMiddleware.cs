using Microsoft.Extensions.Options;
using JsonMais.Application.Ports;
using JsonMais.Domain.Sessions;
using AppSessionOptions = JsonMais.Application.Options.SessionOptions;

namespace JsonMais.Web.Session;

public sealed class SessionMiddleware
{
    private readonly RequestDelegate _next;

    public SessionMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(
        HttpContext context,
        ISessionService sessionService,
        IOptions<AppSessionOptions> optionsAccessor)
    {
        if (ShouldSkip(context.Request.Path))
        {
            await _next(context);
            return;
        }

        var options = optionsAccessor.Value;
        var hasCookie = context.Request.Cookies.TryGetValue(options.CookieName, out var raw) &&
                        !string.IsNullOrWhiteSpace(raw);
        SessionId? parsed = null;
        if (hasCookie && SessionId.TryParse(raw, out var id))
        {
            parsed = id;
        }

        if (parsed is { } existing && await sessionService.ExistsAsync(existing, context.RequestAborted))
        {
            await sessionService.TouchAsync(existing, context.RequestAborted);
            context.Items[SessionHttpContextKeys.SessionId] = existing;
            await _next(context);
            return;
        }

        var sessionId = await sessionService.EnsureSessionAsync(null, context.RequestAborted);
        context.Items[SessionHttpContextKeys.SessionId] = sessionId;
        context.Response.Cookies.Append(
            options.CookieName,
            sessionId.ToString(),
            CreateCookieOptions(context, options.Ttl));

        await _next(context);
    }

    internal static CookieOptions CreateCookieOptions(HttpContext context, TimeSpan ttl)
    {
        var secure = IsHttpsRequest(context);
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = secure ? SameSiteMode.None : SameSiteMode.Lax,
            Path = "/",
            IsEssential = true,
            MaxAge = ttl
        };
    }

    internal static void ClearCookie(HttpContext context, string cookieName)
    {
        var secure = IsHttpsRequest(context);
        context.Response.Cookies.Append(
            cookieName,
            string.Empty,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = secure ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/",
                IsEssential = true,
                MaxAge = TimeSpan.Zero,
                Expires = DateTimeOffset.UnixEpoch
            });
    }

    private static bool IsHttpsRequest(HttpContext context) =>
        context.Request.IsHttps
        || string.Equals(
            context.Request.Headers["X-Forwarded-Proto"].ToString(),
            "https",
            StringComparison.OrdinalIgnoreCase);

    private static bool ShouldSkip(PathString path) =>
        path.StartsWithSegments("/health")
        || path.StartsWithSegments("/swagger");
}
