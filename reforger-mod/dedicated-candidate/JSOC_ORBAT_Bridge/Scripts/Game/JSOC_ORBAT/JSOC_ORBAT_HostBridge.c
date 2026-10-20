// Host Local bridge: explicit pairing; only the host's controlled entity is shared.
class JSOC_ORBAT_HostCallback : RestCallback
{
    bool Busy;
    bool Stopped;
    string Status = "Waiting";
    void JSOC_ORBAT_HostCallback()
    {
        SetOnSuccess(Success);
        SetOnError(Failure);
    }
    void Success(RestCallback cb)
    {
        Busy = false;
        if (Stopped) return;
        if (cb.GetHttpCode() == 200) Status = "Connected";
        else Status = "Pairing rejected - check code";
    }
    void Failure(RestCallback cb)
    {
        Busy = false;
        if (Stopped) return;
        Status = "Connection lost - retrying";
    }
}

class JSOC_ORBAT_HostBridge
{
    bool UseMixed;
    protected ref JSOC_ORBAT_HostMixedBridge m_Mixed;
    JSOC_ORBAT_HostMixedBridge Mixed() { if (!m_Mixed) m_Mixed = new JSOC_ORBAT_HostMixedBridge(); return m_Mixed; }
    protected string m_Code;
    protected string m_Endpoint = "http://127.0.0.1:8791/";
    string Endpoint() { return m_Endpoint; }
    protected RestContext m_Context;
    protected ref JSOC_ORBAT_HostCallback m_Callback;
    protected string m_Status = "Disconnected";

    bool Connect(string endpoint, string code)
    {
        Disconnect();
        if (!Replication.IsServer()) { m_Status = "Only the game host can connect"; return false; }
        if (code.Length() != 32) { m_Status = "Pairing code must contain 32 characters"; return false; }
        string allowed = "0123456789abcdef";
        for (int i = 0; i < code.Length(); i++)
            if (allowed.IndexOf(code.Substring(i, 1)) < 0) { m_Status = "Invalid pairing code"; return false; }
        // The remote endpoint is explicit, never inferred from mod content or the code.
        if (endpoint != "http://127.0.0.1:8791/" && endpoint.IndexOf("https://") != 0)
        { m_Status = "Use the local endpoint or an HTTPS relay"; return false; }
        if (endpoint.Length() > 240 || endpoint.IndexOf("?") >= 0 || endpoint.IndexOf("#") >= 0 || endpoint.IndexOf("@") >= 0)
        { m_Status = "Invalid endpoint"; return false; }
        if (endpoint.Substring(endpoint.Length()-1, 1) != "/") endpoint += "/";
        m_Endpoint = endpoint;
        m_Code = code;
        m_Context = GetGame().GetRestApi().GetContext(endpoint);
        if (!m_Context) { m_Code = ""; m_Status = "Could not open endpoint"; return false; }
        m_Context.SetTimeout(5);
        m_Callback = new JSOC_ORBAT_HostCallback();
        GetGame().GetCallqueue().CallLater(Send, 2000, true);
        m_Status = "Waiting for host character";
        return true;
    }
    void Send()
    {
        if (!Replication.IsServer() || !m_Context || !m_Callback || m_Callback.Busy) return;
        PlayerController controller = GetGame().GetPlayerController();
        IEntity target;
        if (controller) target = controller.GetControlledEntity();
        if (!target) { m_Status = "Spawn or possess a character to send its position"; return; }
        vector p = target.GetOrigin();
        if (p[0] < -13500 || p[0] > 13500 || p[2] < -13500 || p[2] > 13500)
        { m_Status = "Outside supported Everon test bounds"; return; }
        m_Status = "";
        string body = string.Format("{\"token\":\"%1\",\"x\":%2,\"z\":%3}", m_Code, p[0], p[2]);
        m_Callback.Busy = true;
        m_Context.POST(m_Callback, "marker", body);
    }
    string Status()
    {
        if (!m_Status.IsEmpty()) return m_Status;
        if (m_Callback) return m_Callback.Status;
        return "Disconnected";
    }
    void Disconnect()
    {
        if (GetGame()) GetGame().GetCallqueue().Remove(Send);
        if (m_Callback) m_Callback.Stopped = true;
        m_Callback = null;
        m_Context = null;
        m_Code = "";
        if (m_Mixed) m_Mixed.Stop();
        m_Status = "Disconnected";
    }
}

modded class SCR_BaseGameMode
{
    protected ref JSOC_ORBAT_HostBridge m_JSOCBridge;
    protected ref JSOC_ORBAT_DedicatedBridge m_JSOCDedicated;
    protected ref JSOC_ORBAT_TrackedBridge m_JSOCTracked;
    protected ref COMMAND_ORBAT_ServerGM m_COMMANDServerGM;
    override void OnGameStart()
    {
        super.OnGameStart();
        if (Replication.IsServer())
        {
            m_JSOCDedicated = new JSOC_ORBAT_DedicatedBridge();
            m_JSOCDedicated.Start();
            m_JSOCTracked = new JSOC_ORBAT_TrackedBridge();
            m_JSOCTracked.Start();
            m_COMMANDServerGM = new COMMAND_ORBAT_ServerGM(); m_COMMANDServerGM.Start();
        }
    }
    JSOC_ORBAT_HostBridge GetJSOCBridge()
    {
        if (!Replication.IsServer()) return null;
        if (!m_JSOCBridge) m_JSOCBridge = new JSOC_ORBAT_HostBridge();
        return m_JSOCBridge;
    }
    void ~SCR_BaseGameMode()
    {
        if (m_JSOCBridge) m_JSOCBridge.Disconnect();
        if (m_JSOCDedicated) m_JSOCDedicated.Stop();
        if (m_JSOCTracked) m_JSOCTracked.Stop();
        if (m_COMMANDServerGM) m_COMMANDServerGM.Stop();
    }
}
