// A disconnect retires a slot for the pairing; a respawn keeps the connected controller lease.
class JSOC_ORBAT_PlayerLease
{
    protected bool m_Seen;
    protected bool m_Retired;
    bool Accept(bool connected, bool hasController, bool sameController)
    {
        if (m_Retired) return false;
        if (!connected) { if (m_Seen) m_Retired = true; return false; }
        if (!hasController) return false;
        if (m_Seen && !sameController) { m_Retired = true; return false; }
        m_Seen = true;
        return true;
    }
};
// Protocol 3: explicit named entities or session-bound player slots; never whole-world discovery.
class JSOC_ORBAT_TrackedBridge : JSOC_ORBAT_DedicatedBridge
{
    protected ref array<string> m_Names = {};
    protected ref array<string> m_Ids = {};
    protected ref array<IEntity> m_Targets = {};
    protected ref array<vector> m_LastPositions = {};
    protected ref array<bool> m_HavePosition = {};
    protected string m_Source = "named-entities";
    protected ref array<int> m_PlayerIds = {};
    protected ref array<PlayerController> m_Controllers = {};
    protected ref array<ref JSOC_ORBAT_PlayerLease> m_PlayerLeases = {};
    protected string m_PlayerPairing;
    protected string m_PlayerSelection;
    protected bool m_Full = true;
    protected int m_Batches;
    protected int m_Recovery;


    // Advertised by the relay only after an accepted legacy-shaped batch.
    protected bool m_IdentityMetadata;
    protected ref array<string> m_LastIdentities = {};
    void JSOC_ORBAT_TrackedBridge() { m_LastIdentities.Resize(60); }
    override void Halt() { m_IdentityMetadata = false; super.Halt(); }
    override void ReceiveResult(int code, string body)
    {
        if (m_Active && code == 200)
        {
            JsonLoadContext json = new JsonLoadContext(); int version;
            bool supported = json.LoadFromString(body) && json.ReadValue("identityMetadata", version) && version == 1;
            if (supported != m_IdentityMetadata) { m_IdentityMetadata = supported; m_Full = true; }
        }
        Result(code);
    }
    protected string IdentityState(int index, IEntity target, vector position)
    {
        string label = target.GetName(); string factionKey = "NO_FACTION"; string kind = "object";
        PlayerManager players = GetGame().GetPlayerManager(); int playerId;
        if (players) playerId = players.GetPlayerIdFromControlledEntity(target);
        SCR_EditableCharacterComponent character = SCR_EditableCharacterComponent.Cast(target.FindComponent(SCR_EditableCharacterComponent));
        SCR_EditableVehicleComponent vehicle = SCR_EditableVehicleComponent.Cast(target.FindComponent(SCR_EditableVehicleComponent));
        Faction faction;
        if (character) { kind = "ai"; faction = character.GetFaction(); }
        if (vehicle) { kind = "vehicle"; faction = vehicle.GetFaction(); }
        if (!faction)
        {
            FactionAffiliationComponent affiliation = FactionAffiliationComponent.Cast(target.FindComponent(FactionAffiliationComponent));
            if (affiliation) faction = affiliation.GetAffiliatedFaction();
        }
        if (faction && SafeKey(faction.GetFactionKey(),64)) factionKey = faction.GetFactionKey();
        if (playerId > 0) { kind = "player"; label = players.GetPlayerName(playerId); }
        label.Replace("\n", " "); label.Replace("\r", " "); label.Replace("\t", " ");
        if (label.IsEmpty()) label = m_Ids[index];
        if (label.Length() > 64) label = label.Substring(0,64);
        JsonSaveContext json = new JsonSaveContext();
        json.WriteValue("id",m_Ids[index]); json.WriteValue("x",position[0]); json.WriteValue("z",position[2]);
        json.WriteValue("label",label); json.WriteValue("faction",factionKey); json.WriteValue("kind",kind);
        return json.SaveToString();
    }

    override void Load()
    {
        if (!Replication.IsServer()) return;
        ref JsonLoadContext json = new JsonLoadContext();
        if (!json.LoadFromFile("$profile:JSOC_ORBAT_Tracked.json")) { Suspend(); return; }
        bool enabled;
        if (!json.ReadValue("enabled", enabled) || !enabled) { Suspend(); return; }
        string endpoint, code;
        string source = "named-entities";
        json.ReadValue("source", source);
        if (source != "named-entities" && source != "players") { InvalidConfig(); return; }
        ref array<int> playerIds = {};
        int interval, timeout;
        bool reconnect;
        ref array<string> names = {};
        ref array<string> ids = {};
        if (!json.ReadValue("endpoint", endpoint) || !json.ReadValue("pairingCode", code) || !json.ReadValue("entityIds", ids) || !json.ReadValue("intervalMs", interval) || !json.ReadValue("timeoutSeconds", timeout) || !json.ReadValue("autoReconnect", reconnect)) { InvalidConfig(); return; }
        if (source == "players")
        {
            if (!json.ReadValue("playerIds", playerIds) || playerIds.Count() != ids.Count()) { InvalidConfig(); return; }
        }
        else if (!json.ReadValue("entityNames", names) || names.Count() != ids.Count()) { InvalidConfig(); return; }
        if (ids.Count() < 1 || ids.Count() > 60 || interval < 1000 || interval > 2000 || timeout < 2 || timeout > 15 || code.Length() != 32) { InvalidConfig(); return; }
        string hex = "0123456789abcdef";
        for (int c = 0; c < code.Length(); c++) if (hex.IndexOf(code.Substring(c, 1)) < 0) { InvalidConfig(); return; }
        for (int i = 0; i < ids.Count(); i++)
        {
            if (!SafeKey(ids[i], 64) || (source == "named-entities" && !SafeKey(names[i], 64)) || (source == "players" && playerIds[i] <= 0)) { InvalidConfig(); return; }
            for (int j = 0; j < i; j++) if (ids[i] == ids[j] || (source == "named-entities" && names[i] == names[j]) || (source == "players" && playerIds[i] == playerIds[j])) { InvalidConfig(); return; }
        }
        if (endpoint.IndexOf("https://") != 0 || endpoint.Length() < 10 || endpoint.Length() > 240 || endpoint.IndexOf("?") >= 0 || endpoint.IndexOf("#") >= 0 || endpoint.IndexOf("@") >= 0) { InvalidConfig(); return; }
        if (endpoint.Substring(endpoint.Length()-1, 1) != "/") endpoint += "/";
        string host = endpoint.Substring(8, endpoint.Length()-9);
        string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-";
        if (host.IsEmpty()) { InvalidConfig(); return; }
        for (int h = 0; h < host.Length(); h++) if (chars.IndexOf(host.Substring(h, 1)) < 0) { InvalidConfig(); return; }
        string selection = "";
        for (int a = 0; a < ids.Count(); a++)
        {
            if (source == "players") selection += string.Format("%1:%2;", playerIds[a], ids[a]);
            else selection += names[a] + ":" + ids[a] + ";";
        }
        // Pairing authorises one fixed player selection; disabling cannot silently rebind IDs.
        if (source == "players" && m_PlayerPairing == code && m_PlayerSelection != selection) { InvalidConfig(); return; }
        bool same = m_Code == code && m_Endpoint == endpoint && m_Source == source && m_Ids.Count() == ids.Count();
        if (same) for (int n = 0; n < ids.Count(); n++)
        {
            if (m_Ids[n] != ids[n]) same = false;
            if (source == "players" && m_PlayerIds[n] != playerIds[n]) same = false;
            if (source == "named-entities" && m_Names[n] != names[n]) same = false;
        }

        if (same && m_Interval == interval && m_Timeout == timeout && m_Reconnect == reconnect) return;
        int sequence = 0;
        if (same) sequence = m_Sequence;
        Suspend();
        m_Source = source; m_Names = names; m_Ids = ids; m_PlayerIds = playerIds; m_Targets.Clear(); m_LastPositions.Clear(); m_HavePosition.Clear();
        if (source == "players" && m_PlayerPairing != code)
        {
            m_Controllers.Clear(); m_PlayerLeases.Clear();
            for (int slot = 0; slot < ids.Count(); slot++) { m_Controllers.Insert(null); m_PlayerLeases.Insert(new JSOC_ORBAT_PlayerLease()); }
            m_PlayerPairing = code; m_PlayerSelection = selection;
        }
        for (int k = 0; k < ids.Count(); k++)
        {
            IEntity initial;
            if (source == "named-entities") initial = GetGame().GetWorld().FindEntityByName(names[k]);
            m_Targets.Insert(initial); m_LastPositions.Insert(vector.Zero); m_HavePosition.Insert(false);
        }
        m_Code = code; m_Endpoint = endpoint; m_Interval = interval; m_Timeout = timeout; m_Reconnect = reconnect;
        m_Context = GetGame().GetRestApi().GetContext(endpoint);
        if (!m_Context) return;
        m_Context.SetTimeout(timeout);
        m_Callback = new JSOC_ORBAT_DedicatedCallback(); m_Callback.Owner = this;
        m_Sequence = sequence; m_Active = true; m_Failures = 0; m_Body = ""; m_Full = true; m_Batches = 0; m_Recovery = 0; m_ConfigProblem = false;
        Print("[COMMAND ORBAT] Tracked sender enabled: explicit allowlist, maximum 60, read-only.");
        GetGame().GetCallqueue().CallLater(Send, m_Interval, false);
    }
    override void Send()
    {
        if (!m_Active || !Replication.IsServer() || !m_Context || !m_Callback) return;
        if (m_Body.IsEmpty())
        {
            bool full = m_Full || m_Batches % 10 == 0;
            string active = "", states = "";
            for (int i = 0; i < m_Ids.Count(); i++)
            {
                IEntity target = ResolveTarget(i);
                if (!target) { m_HavePosition[i] = false; continue; }
                vector p = target.GetOrigin();
                if (p[0] < -13500 || p[0] > 13500 || p[2] < -13500 || p[2] > 13500) { Halt(); return; }
                if (!active.IsEmpty()) active += ",";
                active += string.Format("\"%1\"", m_Ids[i]);
                string identity = "";
                if (m_IdentityMetadata) identity = IdentityState(i,target,Vector(0,0,0));
                vector prior = m_LastPositions[i];
                float dx = p[0] - prior[0]; float dz = p[2] - prior[2];
                if (full || !m_HavePosition[i] || identity != m_LastIdentities[i] || dx * dx + dz * dz >= 0.25)
                {
                    if (!states.IsEmpty()) states += ",";
                    if (m_IdentityMetadata) states += IdentityState(i,target,p);
                    else states += string.Format("{\"id\":\"%1\",\"x\":%2,\"z\":%3}", m_Ids[i], p[0], p[2]);
                    m_LastIdentities[i] = identity;
                    m_LastPositions[i] = p; m_HavePosition[i] = true;
                }
            }
            string fullText = "false";
            if (full) fullText = "true";
            m_Sequence++; m_Batches++; m_Full = false;
            m_Body = string.Format("{\"protocol\":3,\"token\":\"%1\",\"sequence\":%2,\"full\":%3,\"activeIds\":[%4],\"entities\":[%5]}", m_Code, m_Sequence, fullText, active, states);
        }
        m_Context.POST(m_Callback, "batch", m_Body);
    }
    protected IEntity ResolveTarget(int index)
    {
        if (m_Source == "players")
        {
            IEntity controlled = ResolvePlayer(GetGame().GetPlayerManager(), index);
            if (controlled != m_Targets[index]) m_HavePosition[index] = false;
            m_Targets[index] = controlled;
        }
        else if (!m_Targets[index] && m_Batches % 5 == 0) m_Targets[index] = GetGame().GetWorld().FindEntityByName(m_Names[index]);
        return m_Targets[index];
    }
    protected IEntity ResolvePlayer(PlayerManager manager, int index)
    {
        if (!manager) return null;
        int id = m_PlayerIds[index];
        bool connected = manager.IsPlayerConnected(id);
        PlayerController controller;
        if (connected) controller = manager.GetPlayerController(id);
        bool hasController = controller != null;
        bool sameController = controller == m_Controllers[index];
        if (!m_PlayerLeases[index].Accept(connected, hasController, sameController)) return null;
        m_Controllers[index] = controller;
        return manager.GetPlayerControlledEntity(id);
    }
    override void Result(int code)
    {
        if (!m_Active) return;
        if (code == 409)
        {
            m_Recovery++;
            if (m_Recovery > 3) { Print("[COMMAND ORBAT] Tracked snapshot recovery exhausted; sender stopped."); Halt(); return; }
            m_Body = ""; m_Full = true;
            GetGame().GetCallqueue().CallLater(Send, m_Interval, false);
            return;
        }
        if (code == 200) m_Recovery = 0;
        super.Result(code);
    }
};
