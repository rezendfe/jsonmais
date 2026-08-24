# Architecture — 000-foundation

```text
Browser (React)
    │ HTTP + cookie jsonmais_sid
    ▼
JsonMais.Web (minimal APIs, middleware sessão)
    ▼
JsonMais.Application (ISessionService, IClock, EndSessionUseCase)
    ▼
JsonMais.Domain (SessionId, SessionRecord, SessionStatus)
    ▲
JsonMais.Infrastructure (InMemorySessionService, SystemClock)
```

React não referencia Domain C#. Contratos HTTP em `contracts/`.
