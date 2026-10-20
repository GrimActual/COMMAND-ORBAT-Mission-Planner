// Experimental v2.9.1: server-local opt-in; one explicitly named entity; outbound REST only.
// Credentials are read from $profile:, never from a replicated component or Workshop resource.
class JSOC_ORBAT_DedicatedCallback : RestCallback
{
    JSOC_ORBAT_DedicatedBridge Owner;
    bool Stopped;
    void JSOC_ORBAT_DedicatedCallback()
    {
        SetOnSuccess(Completed);
        SetOnError(Completed);
    }
    void Completed(RestCallback cb)
    {
        if (!Stopped && Owner) Owner.ReceiveResult(cb.GetHttpCode(), cb.GetData());
    }
}

class JSOC_ORBAT_DedicatedBridge
{
    protected string m_Endpoint;
    protected string m_Code;
    protected string m_EntityName;
    protected string m_EntityId;
    protected int m_Interval = 2000;
    protected int m_Timeout = 5;
    protected bool m_Reconnect = true;
    protected int m_Sequence;
    protected int m_Failures;
    protected bool m_Active;
    protected bool m_Missing;
    protected bool m_ConfigProblem;
    protected string m_Body;
    protected RestContext m_Context;
    protected ref JSOC_ORBAT_DedicatedCallback m_Callback;

    bool SafeKey(string value, int limit)
    {
        if (value.Length() < 1 || value.Length() > limit) return false;
        string allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
        for (int i = 0; i < value.Length(); i++)
            if (allowed.IndexOf(value.Substring(i, 1)) < 0) return false;
        return true;
    }
    void InvalidConfig()
    {
        if (!m_ConfigProblem) Print("[COMMAND ORBAT] Invalid dedicated configuration; sender disabled. Check required fields and supported limits.");
        m_ConfigProblem = true;
        Suspend();
    }
    void Start()
    {
        if (!Replication.IsServer()) return;
        Load();
        GetGame().GetCallqueue().CallLater(Load, 5000, true);
    }
    void Load()
    {
        if (!Replication.IsServer()) return;
        ref JsonLoadContext json = new JsonLoadContext();
        if (!json.LoadFromFile("$profile:JSOC_ORBAT_Dedicated.json")) { Suspend(); return; }
        bool enabled;
        if (!json.ReadValue("enabled", enabled) || !enabled) { Suspend(); return; }
        string endpoint, pairingCode, entityName, entityId;
        int intervalMs, timeoutSeconds;
        bool autoReconnect;
        if (!json.ReadValue("endpoint", endpoint) || !json.ReadValue("pairingCode", pairingCode) || !json.ReadValue("entityName", entityName) || !json.ReadValue("entityId", entityId) || !json.ReadValue("intervalMs", intervalMs) || !json.ReadValue("timeoutSeconds", timeoutSeconds) || !json.ReadValue("autoReconnect", autoReconnect))
        { InvalidConfig(); return; }
        if (!SafeKey(entityName, 64) || !SafeKey(entityId, 64) || pairingCode.Length() != 32 || intervalMs < 1000 || intervalMs > 5000 || timeoutSeconds < 2 || timeoutSeconds > 15)
        { InvalidConfig(); return; }
        string hex = "0123456789abcdef";
        for (int i = 0; i < pairingCode.Length(); i++)
            if (hex.IndexOf(pairingCode.Substring(i, 1)) < 0) { InvalidConfig(); return; }
        if (endpoint.IndexOf("https://") != 0 || endpoint.Length() < 10 || endpoint.Length() > 240 || endpoint.IndexOf("?") >= 0 || endpoint.IndexOf("#") >= 0 || endpoint.IndexOf("@") >= 0)
        { InvalidConfig(); return; }
        if (endpoint.Substring(endpoint.Length()-1, 1) != "/") endpoint += "/";
        string host = endpoint.Substring(8, endpoint.Length()-9);
        string hostChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-";
        if (host.IsEmpty()) { InvalidConfig(); return; }
        for (int j = 0; j < host.Length(); j++)
            if (hostChars.IndexOf(host.Substring(j, 1)) < 0) { InvalidConfig(); return; }
        m_ConfigProblem = false;
        // An unchanged config never restarts an exhausted or locked-out session.
        if (m_Code == pairingCode && m_Endpoint == endpoint && m_EntityName == entityName && m_EntityId == entityId && m_Interval == intervalMs && m_Timeout == timeoutSeconds && m_Reconnect == autoReconnect) return;
        // Interval/timeout changes keep the monotonic sequence of the same relay stream.
        // A new endpoint, pairing code or entity ID starts a new stream instead.
        int nextSequence = 0;
        if (m_Code == pairingCode && m_Endpoint == endpoint && m_EntityId == entityId)
            nextSequence = m_Sequence;
        Suspend();
        m_Endpoint = endpoint; m_Code = pairingCode; m_EntityName = entityName; m_EntityId = entityId;
        m_Interval = intervalMs; m_Timeout = timeoutSeconds; m_Reconnect = autoReconnect;
        m_Context = GetGame().GetRestApi().GetContext(endpoint);
        if (!m_Context) return;
        m_Context.SetTimeout(timeoutSeconds);
        m_Callback = new JSOC_ORBAT_DedicatedCallback(); m_Callback.Owner = this;
        m_Active = true; m_Sequence = nextSequence; m_Failures = 0; m_Body = "";
        Print("[COMMAND ORBAT] Dedicated sender enabled: one authorised named entity, read-only.");
        GetGame().GetCallqueue().CallLater(Send, m_Interval, false);
    }
    void Send()
    {
        if (!m_Active || !Replication.IsServer() || !m_Context || !m_Callback) return;
        if (m_Body.IsEmpty())
        {
            IEntity target = GetGame().GetWorld().FindEntityByName(m_EntityName);
            if (!target)
            {
                if (!m_Missing) Print("[COMMAND ORBAT] Waiting for the configured named entity; no player enumeration.");
                m_Missing = true;
                GetGame().GetCallqueue().CallLater(Send, m_Interval, false);
                return;
            }
            m_Missing = false;
            vector p = target.GetOrigin();
            if (p[0] < -13500 || p[0] > 13500 || p[2] < -13500 || p[2] > 13500) { Halt(); return; }
            m_Sequence++;
            m_Body = string.Format("{\"protocol\":2,\"token\":\"%1\",\"entityId\":\"%2\",\"sequence\":%3,\"x\":%4,\"z\":%5}", m_Code, m_EntityId, m_Sequence, p[0], p[2]);
        }
        // Retry exactly the same bytes after a lost acknowledgement.
        m_Context.POST(m_Callback, "marker", m_Body);
    }
    void ReceiveResult(int code, string body) { Result(code); }
    void Result(int code)
    {
        if (!m_Active) return;
        if (code == 200)
        {
            if (m_Sequence == 1) Print("[COMMAND ORBAT] Dedicated relay acknowledged the permitted position.");
            m_Failures = 0; m_Body = "";
            GetGame().GetCallqueue().CallLater(Send, m_Interval, false);
            return;
        }
        if (code == 400 || code == 401 || code == 403 || code == 404 || code == 409 || code == 413 || code == 423 || code == 426)
        { Print("[COMMAND ORBAT] Pairing, protocol or permission rejected. Sender stopped; configure a new session."); Halt(); return; }
        m_Failures++;
        if (!m_Reconnect || m_Failures > 5)
        { Print("[COMMAND ORBAT] Retry limit reached. Sender stopped."); Halt(); return; }
        int delay = 1000;
        for (int n = 1; n < m_Failures; n++) delay *= 2;
        Print("[COMMAND ORBAT] Connection interrupted; bounded retry scheduled.");
        GetGame().GetCallqueue().CallLater(Send, delay, false);
    }
    void Halt()
    {
        m_Active = false;
        if (GetGame()) GetGame().GetCallqueue().Remove(Send);
        if (m_Callback) { m_Callback.Stopped = true; m_Callback.Owner = null; }
        m_Callback = null; m_Context = null; m_Body = "";
    }
    void Suspend() { Halt(); m_Code = ""; }
    void Stop()
    {
        Suspend();
        if (GetGame()) GetGame().GetCallqueue().Remove(Load);
    }
}
