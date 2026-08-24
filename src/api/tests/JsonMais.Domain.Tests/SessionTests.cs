using JsonMais.Domain.Sessions;

namespace JsonMais.Domain.Tests;

public class SessionIdTests
{
    [Fact]
    public void TryParse_rejects_empty()
    {
        Assert.False(SessionId.TryParse("", out _));
        Assert.False(SessionId.TryParse(Guid.Empty.ToString(), out _));
    }

    [Fact]
    public void Roundtrip()
    {
        var id = SessionId.New();
        Assert.True(SessionId.TryParse(id.ToString(), out var parsed));
        Assert.Equal(id, parsed);
    }
}

public class SessionRecordTests
{
    [Fact]
    public void Touch_extends_expiry_when_active()
    {
        var now = DateTimeOffset.Parse("2026-08-24T12:00:00Z");
        var record = new SessionRecord(
            SessionId.New(),
            now,
            now,
            now.AddMinutes(60),
            SessionStatus.Active);

        record.Touch(now.AddMinutes(10), TimeSpan.FromMinutes(60));

        Assert.Equal(now.AddMinutes(70), record.ExpiresAt);
        Assert.True(record.IsActive(now.AddMinutes(65)));
    }

    [Fact]
    public void Ended_is_not_active()
    {
        var now = DateTimeOffset.UtcNow;
        var record = new SessionRecord(
            SessionId.New(),
            now,
            now,
            now.AddHours(1),
            SessionStatus.Active);
        record.MarkEnded();
        Assert.False(record.IsActive(now));
    }
}
