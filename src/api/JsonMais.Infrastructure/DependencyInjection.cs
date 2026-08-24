using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using JsonMais.Application.Options;
using JsonMais.Application.Ports;
using JsonMais.Application.UseCases;
using JsonMais.Infrastructure.Sessions;
using JsonMais.Infrastructure.Time;

namespace JsonMais.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddJsonMaisInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.Configure<SessionOptions>(configuration.GetSection(SessionOptions.SectionName));
        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<ISessionService, InMemorySessionService>();
        services.AddSingleton<EndSessionUseCase>();
        return services;
    }
}
