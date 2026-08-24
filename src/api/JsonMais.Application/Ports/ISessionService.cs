using JsonMais.Domain.Sessions;

namespace JsonMais.Application.Ports;

public interface ISessionService
{
    Task<SessionId> EnsureSessionAsync(SessionId? existing, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(SessionId sessionId, CancellationToken cancellationToken = default);

    Task TouchAsync(SessionId sessionId, CancellationToken cancellationToken = default);

    Task EndAsync(SessionId sessionId, CancellationToken cancellationToken = default);
}
