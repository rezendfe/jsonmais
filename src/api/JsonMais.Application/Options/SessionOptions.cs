namespace JsonMais.Application.Options;

public sealed class SessionOptions
{
    public const string SectionName = "Session";

    public string CookieName { get; set; } = "jsonmais_sid";

    public int TtlMinutes { get; set; } = 60;

    public TimeSpan Ttl => TimeSpan.FromMinutes(TtlMinutes <= 0 ? 60 : TtlMinutes);
}
