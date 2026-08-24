namespace JsonMais.Domain.Sessions;

/// <summary>
/// Anonymous session metadata (not a user account). JSON documents are never stored here.
/// </summary>
public sealed class SessionRecord
{
    public SessionRecord(
        SessionId id,
        DateTimeOffset createdAt,
        DateTimeOffset lastActivityAt,
        DateTimeOffset expiresAt,
        SessionStatus status)
    {
        Id = id;
        CreatedAt = createdAt;
        LastActivityAt = lastActivityAt;
        ExpiresAt = expiresAt;
        Status = status;
    }

    public SessionId Id { get; }

    public DateTimeOffset CreatedAt { get; }

    public DateTimeOffset LastActivityAt { get; private set; }

    public DateTimeOffset ExpiresAt { get; private set; }

    public SessionStatus Status { get; private set; }

    public bool IsActive(DateTimeOffset utcNow) =>
        Status == SessionStatus.Active && utcNow < ExpiresAt;

    public void Touch(DateTimeOffset utcNow, TimeSpan ttl)
    {
        if (Status != SessionStatus.Active)
        {
            return;
        }

        LastActivityAt = utcNow;
        ExpiresAt = utcNow.Add(ttl);
    }

    public void MarkEnded() => Status = SessionStatus.Ended;

    public void MarkExpired() => Status = SessionStatus.Expired;
}
