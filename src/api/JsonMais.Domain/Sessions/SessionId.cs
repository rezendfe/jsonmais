namespace JsonMais.Domain.Sessions;

/// <summary>
/// Opaque anonymous session identifier (not a user identity).
/// </summary>
public readonly record struct SessionId(Guid Value)
{
    public static SessionId New() => new(Guid.NewGuid());

    public static SessionId Parse(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value);
        return new SessionId(Guid.Parse(value));
    }

    public static bool TryParse(string? value, out SessionId sessionId)
    {
        if (Guid.TryParse(value, out var guid) && guid != Guid.Empty)
        {
            sessionId = new SessionId(guid);
            return true;
        }

        sessionId = default;
        return false;
    }

    public override string ToString() => Value.ToString("D");
}
