using JsonMais.Infrastructure;
using JsonMais.Web.Endpoints;
using JsonMais.Web.Security;
using JsonMais.Web.Session;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddJsonMaisInfrastructure(builder.Configuration);

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("JsonMaisCors", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            return;
        }

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseCors("JsonMaisCors");
app.UseMiddleware<ExceptionMappingMiddleware>();
app.UseMiddleware<SessionMiddleware>();

app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
app.MapHealthEndpoints();
app.MapSessionEndpoints();

app.Run();

public partial class Program;
