using JsonMais.Application.Ports;
using JsonMais.Domain.Sessions;

namespace JsonMais.Application.UseCases;

public sealed class EndSessionUseCase
{
    private readonly ISessionService _sessions;

    public EndSessionUseCase(ISessionService sessions) => _sessions = sessions;

    public Task ExecuteAsync(SessionId sessionId, CancellationToken cancellationToken = default) =>
        _sessions.EndAsync(sessionId, cancellationToken);
}
