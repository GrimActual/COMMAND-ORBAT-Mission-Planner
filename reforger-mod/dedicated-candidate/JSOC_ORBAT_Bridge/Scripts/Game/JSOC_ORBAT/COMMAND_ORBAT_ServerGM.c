// Optional private server-local GM runner. Disabled without explicit per-pair configuration.
class COMMAND_ORBAT_ServerGM
{
    protected ref JSOC_ORBAT_HostGM m_GM;
    protected string m_LastPairing;
    protected string m_LastEndpoint;
    protected string m_LastReview;
    void Start() { if (Replication.IsServer()) GetGame().GetCallqueue().CallLater(Tick,1000,true); }
    void Stop() { if (GetGame()) GetGame().GetCallqueue().Remove(Tick); if (m_GM) m_GM.Stop(); m_GM = null; }
    protected void Disable() { if (m_GM) m_GM.Stop(); m_GM = null; }
    void Tick()
    {
        if (!Replication.IsServer()) return;
        JsonLoadContext json = new JsonLoadContext(); bool enabled;
        if (!json.LoadFromFile("$profile:COMMAND_ORBAT_ServerGM.json") || !json.ReadValue("enabled",enabled) || !enabled) { Disable(); return; }
        string endpoint, code, approvalPairingCode; bool ai, spawning, removal, allSupported;
        if (!json.ReadValue("endpoint",endpoint) || !json.ReadValue("pairingCode",code) || !json.ReadValue("approvalPairingCode",approvalPairingCode) || !json.ReadValue("automaticAIOrders",ai) || !json.ReadValue("automaticSpawning",spawning) || !json.ReadValue("automaticRemoval",removal)) { Disable(); return; }
        if (code.Length() != 32 || endpoint.Length() > 240 || endpoint.IndexOf("?") >= 0 || endpoint.IndexOf("#") >= 0 || endpoint.IndexOf("@") >= 0) { Disable(); return; }
        string hex = "0123456789abcdef";
        for (int i = 0; i < code.Length(); i++) if (hex.IndexOf(code.Substring(i,1)) < 0) { Disable(); return; }
        // Plain HTTP is permitted only for the explicit server-local relay.
        bool loopback = endpoint.IndexOf("http://127.0.0.1:") == 0;
        int prefix = 8; if (loopback) prefix = 7;
        if (!loopback && endpoint.IndexOf("https://") != 0) { Disable(); return; }
        if (endpoint.Length() <= prefix+1 || endpoint.Substring(endpoint.Length()-1,1) != "/") { Disable(); return; }
        string host = endpoint.Substring(prefix,endpoint.Length()-prefix-1), chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-";
        for (int n = 0; n < host.Length(); n++) if (chars.IndexOf(host.Substring(n,1)) < 0) { Disable(); return; }
        if (loopback)
        {
            string port = host.Substring(10,host.Length()-10);
            if (port.IsEmpty() || port.ToInt() < 1 || port.ToInt() > 65535) { Disable(); return; }
            for (int digit = 0; digit < port.Length(); digit++) if ("0123456789".IndexOf(port.Substring(digit,1)) < 0) { Disable(); return; }
        }
        if (!m_GM)
        {
            // A retired code cannot silently recover ownership after a disconnect.
            if (code == m_LastPairing && endpoint == m_LastEndpoint) return;
            m_GM = new JSOC_ORBAT_HostGM(); m_GM.Pair(endpoint,code);
            m_LastPairing = code; m_LastEndpoint = endpoint;
        }
        else if (code != m_LastPairing || endpoint != m_LastEndpoint)
        {
            m_GM.Pair(endpoint,code); m_LastPairing = code; m_LastEndpoint = endpoint;
        }
        // The administrator must explicitly bind automatic permissions to this exact pairing.
        json.ReadValue("automaticAllSupported",allSupported);
        if (approvalPairingCode == code)
        {
            if (allSupported) m_GM.SetFullApprovalPolicy(true);
            else m_GM.SetApprovalPolicy(ai,spawning,removal);
        }
        else m_GM.SetApprovalPolicy(false,false,false);
        if (!m_GM.IsPaired()) { Disable(); return; }
        // A review file is local administrator information, never a replicated secret.
        JsonSaveContext review = new JsonSaveContext(); review.WriteValue("pending",m_GM.Pending);
        string reviewText = review.SaveToString();
        if (reviewText != m_LastReview && review.SaveToFile("$profile:COMMAND-Pending-Review.json")) m_LastReview = reviewText;
        string manualRequestId;
        json.ReadValue("manualApprovalRequestId",manualRequestId);
        m_GM.ReviewManualRequest(manualRequestId);
        m_GM.Poll();
    }
};
