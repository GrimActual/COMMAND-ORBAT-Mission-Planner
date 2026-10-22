class JSOC_ORBAT_PairingHandler : ScriptedWidgetEventHandler
{
    Widget GMRoot;
    ref JSOC_ORBAT_GMHandler GMHandler;
    void CloseGM()
    {
        if (GMHandler)
        {
            GetGame().GetCallqueue().Remove(GMHandler.Refresh);
            if (GMRoot) GMRoot.RemoveHandler(GMHandler);
            GMHandler.Root = null;
            GMHandler.GM = null;
            GMHandler.Owner = null;
        }
        if (GMRoot) GMRoot.RemoveFromHierarchy();
        GMRoot = null;
        GMHandler = null;
        if (Root) Root.SetVisible(true);
    }
    Widget RosterRoot;
    ref JSOC_ORBAT_RosterHandler RosterHandler;
    bool MixedMode;
    void CloseRoster() { if (RosterRoot) RosterRoot.RemoveFromHierarchy(); RosterRoot = null; RosterHandler = null; if (Root) Root.SetVisible(true); }
    Widget Root;
    JSOC_ORBAT_HostBridge Bridge;
    override bool OnClick(Widget w, int x, int y, int button)
    {
        if (!Root || !Bridge || !w) return false;
        if (w.GetName() == "JSOCGM")
        {
            // Do not attach a second handler if an input is delivered twice.
            if (GMRoot) return true;
            WorkspaceWidget workspace = GetGame().GetWorkspace();
            JSOC_ORBAT_HostMixedBridge mixed = Bridge.Mixed();
            if (!workspace || !mixed) return true;
            Print("[COMMAND GM review 0.15.5] opening layout", LogLevel.NORMAL);
            GMRoot = workspace.CreateWidgets("UI/layouts/JSOC_ORBAT_GM.layout", Root.GetParent());
            if (!GMRoot)
            {
                Print("[COMMAND GM review 0.15.5] layout failed to load", LogLevel.ERROR);
                return true;
            }
            GMHandler = new JSOC_ORBAT_GMHandler();
            GMHandler.Root = GMRoot;
            GMHandler.Owner = this;
            GMHandler.GM = mixed.GM();
            GMRoot.AddHandler(GMHandler);
            Root.SetVisible(false);
            // Return from the click dispatch before initializing and measuring the new tree.
            GetGame().GetCallqueue().CallLater(GMHandler.Refresh, 50, false);
            Print("[COMMAND GM review 0.15.5] layout attached", LogLevel.NORMAL);
            return true;
        }
        if (w.GetName() == "JSOCMixed")
        {
            MixedMode = true; Bridge.UseMixed = true;
            if (!RosterRoot) RosterRoot = GetGame().GetWorkspace().CreateWidgets("UI/layouts/JSOC_ORBAT_Roster.layout", Root.GetParent());
            if (RosterRoot)
            {
                Root.SetVisible(false); RosterHandler = new JSOC_ORBAT_RosterHandler();
                RosterHandler.Root = RosterRoot; RosterHandler.Owner = this; RosterHandler.Mixed = Bridge.Mixed();
                RosterRoot.AddHandler(RosterHandler); RosterHandler.RefreshRoster();
            }
            return true;
        }
        if (w.GetName() == "JSOCConnect")
        {
            EditBoxWidget endpoint = EditBoxWidget.Cast(Root.FindAnyWidget("JSOCEndpoint"));
            EditBoxWidget code = EditBoxWidget.Cast(Root.FindAnyWidget("JSOCCode"));
            if (!endpoint || !code) return false;
            bool connected;
            if (MixedMode) { Bridge.Disconnect(); connected = Bridge.Mixed().ConnectHost(endpoint.GetText(), code.GetText()); }
            else connected = Bridge.Connect(endpoint.GetText(), code.GetText());
            if (connected) { Bridge.UseMixed = MixedMode; code.SetText(""); }
            Refresh();
            return true;
        }
        if (w.GetName() == "JSOCDisconnect") { Bridge.Disconnect(); MixedMode = false; Bridge.UseMixed = false; Refresh(); return true; }
        return false;
    }
    void Refresh()
    {
        if (!Root || !Bridge) return;
        if (GMHandler) GMHandler.Refresh();
        TextWidget status = TextWidget.Cast(Root.FindAnyWidget("JSOCStatus"));
        if (status) { if (MixedMode) status.SetText(Bridge.Mixed().HostStatus()); else status.SetText(Bridge.Status()); }
    }
}

modded class PauseMenuUI
{
    protected Widget m_JSOCPanel;
    protected ref JSOC_ORBAT_PairingHandler m_JSOCHandler;
    override void OnMenuOpen()
    {
        super.OnMenuOpen();
        if (!Replication.IsServer() || m_JSOCPanel) return;
        SCR_BaseGameMode mode = SCR_BaseGameMode.Cast(GetGame().GetGameMode());
        if (!mode) return;
        m_JSOCPanel = GetGame().GetWorkspace().CreateWidgets("UI/layouts/JSOC_ORBAT_Pairing.layout", GetRootWidget());
        if (!m_JSOCPanel) { Print("[COMMAND ORBAT] Pairing layout failed to load", LogLevel.ERROR); return; }
        EditBoxWidget endpoint = EditBoxWidget.Cast(m_JSOCPanel.FindAnyWidget("JSOCEndpoint"));
        if (endpoint) endpoint.SetText(mode.GetJSOCBridge().Endpoint());
        m_JSOCHandler = new JSOC_ORBAT_PairingHandler();
        m_JSOCHandler.Root = m_JSOCPanel;
        m_JSOCHandler.Bridge = mode.GetJSOCBridge();
        m_JSOCHandler.MixedMode = m_JSOCHandler.Bridge.UseMixed;
        m_JSOCPanel.AddHandler(m_JSOCHandler);
        m_JSOCHandler.Refresh();
        GetGame().GetCallqueue().CallLater(m_JSOCHandler.Refresh, 500, true);
    }
    override void OnMenuClose()
    {
        if (m_JSOCHandler) { m_JSOCHandler.CloseRoster(); m_JSOCHandler.CloseGM(); GetGame().GetCallqueue().Remove(m_JSOCHandler.Refresh); }
        if (m_JSOCPanel) m_JSOCPanel.RemoveFromHierarchy();
        m_JSOCPanel = null;
        m_JSOCHandler = null;
        super.OnMenuClose();
    }
}
