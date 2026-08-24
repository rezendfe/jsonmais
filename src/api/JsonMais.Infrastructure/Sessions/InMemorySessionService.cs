using System.Collections.Concurrent;
using Microsoft.Extensions.Options;
using JsonMais.Application.Options;
using JsonMais.Application.Ports;
using JsonMais.Domain.Sessions;

namespace JsonMais.Infrastructure.Sessions;

public sealed class InMemorySessionService : ISessionService
{
    private readonly ConcurrentDictionary<Guid, SessionRecord> _sessions = new();
    private readonly IClock _clock;
    private readonly SessionOptions _options;

    public InMemorySessionService(IClock clock, IOptions<SessionOptions> options)
    {
        _clock = clock;
        _options = options.Value;
    }

    public Task<SessionId> EnsureSessionAsync(
        SessionId? existing,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (existing is { } id && Exists(id))
        {
            return Task.FromResult(id);
        }

        var now = _clock.UtcNow;
        var created = SessionId.New();
        _sessions[created.Value] = new SessionRecord(
            created,
            now,
            now,
            now.Add(_options.Ttl),
            SessionStatus.Active);
        return Task.FromResult(created);
    }

    public Task<bool> ExistsAsync(SessionId sessionId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return Task.FromResult(Exists(sessionId));
    }

    public Task TouchAsync(SessionId sessionId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (_sessions.TryGetValue(sessionId.Value, out var record) && record.IsActive(_clock.UtcNow))
        {
            record.Touch(_clock.UtcNow, _options.Ttl);
        }

        return Task.CompletedTask;
    }

    public Task EndAsync(SessionId sessionId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (_sessions.TryGetValue(sessionId.Value, out var record))
        {
            record.MarkEnded();
        }

        return Task.CompletedTask;
    }

    private bool Exists(SessionId sessionId)
    {
        if (!_sessions.TryGetValue(sessionId.Value, out var record))
        {
            return false;
        }

        if (!record.IsActive(_clock.UtcNow))
        {
            if (record.Status == SessionStatus.Active)
            {
                record.MarkExpired();
            }

            return false;
        }

        return true;
    }
}
