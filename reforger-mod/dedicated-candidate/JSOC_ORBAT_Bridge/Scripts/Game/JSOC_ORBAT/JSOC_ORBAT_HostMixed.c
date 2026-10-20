// Session-only host selection. No selected roster, factions or credentials enter mission saves.
class JSOC_ORBAT_RosterEntry
{
    string Key;
    string Label;
    int SessionPlayerId;
    IEntity Target;
    SCR_EditableCharacterComponent Editable;
    PlayerController InitialController;
};
class JSOC_ORBAT_CharacterRegistry
{
    static ref array<ref JSOC_ORBAT_RosterEntry> Entries = {};
    static int NextId;
    static void Add(SCR_EditableCharacterComponent component, IEntity owner)
    {
        if (!owner) return;
        JSOC_ORBAT_RosterEntry row = new JSOC_ORBAT_RosterEntry();
        NextId++; row.Key = string.Format("ai_%1", NextId); row.Target = owner; row.Editable = component;
        Entries.Insert(row);
    }
    static void Remove(SCR_EditableCharacterComponent component)
    {
        for (int i = Entries.Count()-1; i >= 0; i--) if (!Entries[i].Target || Entries[i].Editable == component) Entries.Remove(i);
    }
};
modded class SCR_EditableCharacterComponent
{
    protected bool m_JSOCRegistered;
    override void OnPostInit(IEntity owner)
    {
        super.OnPostInit(owner);
        if (!m_JSOCRegistered) { JSOC_ORBAT_CharacterRegistry.Add(this, owner); m_JSOCRegistered = true; }
    }
    void ~SCR_EditableCharacterComponent() { JSOC_ORBAT_CharacterRegistry.Remove(this); }
};
class JSOC_ORBAT_HostSlot
{
    ref JSOC_ORBAT_RosterEntry Entry;
    bool Selected;
    PlayerController Controller;
    ref JSOC_ORBAT_PlayerLease Lease = new JSOC_ORBAT_PlayerLease();
};
class JSOC_ORBAT_HostMixedBridge : JSOC_ORBAT_TrackedBridge
{
    protected string m_LastHostPairing;
    protected ref JSOC_ORBAT_HostGM m_GM;
    JSOC_ORBAT_HostGM GM() { if (!m_GM) m_GM = new JSOC_ORBAT_HostGM(); m_GM.RosterOwner = this; return m_GM; }
    override void Halt() { if (m_GM) m_GM.Stop(); super.Halt(); }
    override void Stop() { if (m_GM) m_GM.Stop(); super.Stop(); }
    ref array<ref JSOC_ORBAT_HostSlot> Slots = {};
    ref array<string> Factions = {};
    bool Humans = true;
    bool AI = true;
    string SelectionMessage;
    void JSOC_ORBAT_HostMixedBridge()
    {
        for (int i = 0; i < 60; i++)
        {
            Slots.Insert(new JSOC_ORBAT_HostSlot());
            m_Ids.Insert(string.Format("host_%1", i+1)); m_Targets.Insert(null); m_LastPositions.Insert(vector.Zero); m_HavePosition.Insert(false);
        }
    }
    override void Load() {} // Host pairing is explicit; no private-profile polling.
    string FactionKeyFor(IEntity target)
    {
        if (!target) return "NO_FACTION";
        SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(target.FindComponent(SCR_EditableCharacterComponent));
        Faction faction;
        if (editable) faction = editable.GetFaction();
        else
        {
            FactionAffiliationComponent affiliation = FactionAffiliationComponent.Cast(target.FindComponent(FactionAffiliationComponent));
            if (affiliation) faction = affiliation.GetAffiliatedFaction();
        }
        if (!faction) return "NO_FACTION";
        return faction.GetFactionKey();
    }
    void Roster(out array<ref JSOC_ORBAT_RosterEntry> rows)
    {
        rows.Clear(); PlayerManager manager = GetGame().GetPlayerManager();
        if (manager)
        {
            array<int> players = {}; manager.GetPlayers(players);
            foreach (int id : players)
            {
                JSOC_ORBAT_RosterEntry human = new JSOC_ORBAT_RosterEntry();
                human.InitialController = manager.GetPlayerController(id);
                human.Key = string.Format("player_%1", id); human.SessionPlayerId = id; human.Target = manager.GetPlayerControlledEntity(id);
                human.Label = string.Format("PLAYER %1: %2", id, manager.GetPlayerName(id)); rows.Insert(human);
            }
        }
        foreach (JSOC_ORBAT_RosterEntry entry : JSOC_ORBAT_CharacterRegistry.Entries)
        {
            if (!entry.Target || !entry.Editable || entry.Editable.IsDestroyed()) continue;
            if (manager && manager.GetPlayerIdFromControlledEntity(entry.Target) > 0) continue;
            entry.Label = "AI " + entry.Key + ": " + entry.Editable.GetDisplayName(); rows.Insert(entry);
        }
    }
    bool IsSelected(string key)
    {
        foreach (JSOC_ORBAT_HostSlot slot : Slots) if (slot.Entry && slot.Entry.Key == key) return slot.Selected;
        return false;
    }
    int SelectedCount()
    {
        int count = 0;
        foreach (JSOC_ORBAT_HostSlot slot : Slots) { if (slot.Selected) count++; }
        return count;
    }
    bool Toggle(JSOC_ORBAT_RosterEntry entry)
    {
        for (int i = 0; i < Slots.Count(); i++)
        {
            if (Slots[i].Entry && Slots[i].Entry.Key == entry.Key)
            {
                Slots[i].Selected = !Slots[i].Selected; m_HavePosition[i] = false; SelectionChanged(); return true;
            }
        }
        for (int j = 0; j < Slots.Count(); j++)
        {
            if (!Slots[j].Entry || (!m_Active && !Slots[j].Selected))
            {
                Slots[j] = new JSOC_ORBAT_HostSlot(); Slots[j].Entry = entry; Slots[j].Selected = true; m_HavePosition[j] = false; SelectionChanged(); return true;
            }
        }
        SelectionMessage = "60 slots reserved. Disconnect to reuse deselected slots."; return false;
    }
    protected void SelectionChanged()
    {
        m_Body = ""; m_Full = true;
        if (!m_Active) return;
        if (m_Callback) { m_Callback.Stopped = true; m_Callback.Owner = null; }
        m_Callback = new JSOC_ORBAT_DedicatedCallback(); m_Callback.Owner = this;
        GetGame().GetCallqueue().Remove(Send); GetGame().GetCallqueue().CallLater(Send, 1000, false);
    }
    void SetHumans(bool enabled) { Humans = enabled; SelectionChanged(); }
    void SetAI(bool enabled) { AI = enabled; SelectionChanged(); }
    bool SelectMatching(array<ref JSOC_ORBAT_RosterEntry> rows)
    {
        int additions = 0; int requiredSlots = 0; int freeSlots = 0;
        foreach (JSOC_ORBAT_HostSlot available : Slots) { if (!available.Entry || (!m_Active && !available.Selected)) freeSlots++; }
        foreach (JSOC_ORBAT_RosterEntry row : rows)
        {
            if (IsSelected(row.Key)) continue;
            additions++; bool known = false;
            foreach (JSOC_ORBAT_HostSlot slot : Slots) { if (slot.Entry && slot.Entry.Key == row.Key) known = true; }
            if (!known) requiredSlots++;
        }
        if (SelectedCount()+additions > 60 || requiredSlots > freeSlots) { SelectionMessage = "Too many units or reserved slots. Narrow factions or select individually; disconnect to reuse slots."; return false; }
        foreach (JSOC_ORBAT_RosterEntry entry : rows) { if (!IsSelected(entry.Key)) Toggle(entry); }
        SelectionMessage = ""; return true;
    }
    void ToggleFaction(string key)
    {
        int i = Factions.Find(key); if (i < 0) Factions.Insert(key); else Factions.Remove(i); SelectionChanged();
    }
    bool Allows(bool human, string factionKey) { return ((human && Humans) || (!human && AI)) && Factions.Find(factionKey) >= 0; }
    override protected IEntity ResolveTarget(int index)
    {
        JSOC_ORBAT_HostSlot slot = Slots[index];
        if (!slot.Entry || !slot.Selected) return null;
        IEntity target = slot.Entry.Target;
        if (slot.Entry.SessionPlayerId > 0)
        {
            PlayerManager manager = GetGame().GetPlayerManager(); if (!manager) return null;
            int id = slot.Entry.SessionPlayerId; bool connected = manager.IsPlayerConnected(id);
            PlayerController controller; if (connected) controller = manager.GetPlayerController(id);
            // Observe disconnects before checking the roster controller so a retired lease cannot revive.
            if (!slot.Lease.Accept(connected, controller != null, controller == slot.Controller)) return null;
            if (!slot.Entry.InitialController || controller != slot.Entry.InitialController) return null;
            slot.Controller = controller; target = manager.GetPlayerControlledEntity(id);
        }
        else
        {
            if (!slot.Entry.Editable || slot.Entry.Editable.IsDestroyed()) return null;
            PlayerManager aiManager = GetGame().GetPlayerManager();
            if (aiManager && aiManager.GetPlayerIdFromControlledEntity(target) > 0) return null;
        }
        if (target != m_Targets[index]) m_HavePosition[index] = false;
        m_Targets[index] = target;
        if (!Allows(slot.Entry.SessionPlayerId > 0, FactionKeyFor(target))) return null;
        return target;
    }
    IEntity ResolveCommandEntity(string alias, bool human)
    {
        int index = m_Ids.Find(alias);
        if (index < 0 || index >= Slots.Count() || !Slots[index].Entry || !Slots[index].Selected) return null;
        if ((Slots[index].Entry.SessionPlayerId > 0) != human) return null;
        return ResolveTarget(index);
    }
    bool ConnectHost(string endpoint, string code)
    {
        Stop(); SelectionMessage = "";
        if (!Replication.IsServer() || code.Length() != 32) { SelectionMessage = "Host pairing needs a 32-character code"; return false; }
        if (code == m_LastHostPairing) { SelectionMessage = "Start a fresh Companion pairing before reconnecting"; return false; }
        string hex = "0123456789abcdef";
        for (int i = 0; i < code.Length(); i++) if (hex.IndexOf(code.Substring(i,1)) < 0) return false;
        if (endpoint.IndexOf("https://") != 0 || endpoint.Length() < 10 || endpoint.Length() > 240 || endpoint.IndexOf("?") >= 0 || endpoint.IndexOf("#") >= 0 || endpoint.IndexOf("@") >= 0) { SelectionMessage = "Use the HTTPS address from the Host Local mixed profile"; return false; }
        if (endpoint.Substring(endpoint.Length()-1,1) != "/") endpoint += "/";
        string host = endpoint.Substring(8, endpoint.Length()-9), chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-";
        if (host.IsEmpty()) return false;
        for (int h = 0; h < host.Length(); h++) if (chars.IndexOf(host.Substring(h,1)) < 0) return false;
        m_Code = code; m_Endpoint = endpoint; m_Interval = 1000; m_Timeout = 5; m_Reconnect = true;
        m_Context = GetGame().GetRestApi().GetContext(endpoint); if (!m_Context) return false;
        m_Context.SetTimeout(5); m_Callback = new JSOC_ORBAT_DedicatedCallback(); m_Callback.Owner = this;
        for (int k = 0; k < 60; k++) { Slots[k].Lease = new JSOC_ORBAT_PlayerLease(); Slots[k].Controller = null; m_HavePosition[k] = false; }
        m_Sequence = 0; m_Batches = 0; m_Recovery = 0; m_Failures = 0; m_Full = true; m_Active = true; m_LastHostPairing = code; GM().Pair(endpoint,code);
        GetGame().GetCallqueue().CallLater(Send, 1000, false); return true;
    }
    string HostStatus()
    {
        if (!SelectionMessage.IsEmpty()) return SelectionMessage;
        if (!m_Active) return "Mixed feed disconnected";
        return string.Format("Mixed feed: %1/60 selected; %2 factions enabled", SelectedCount(), Factions.Count());
    }
};
