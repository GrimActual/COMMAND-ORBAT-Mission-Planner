class JSOC_ORBAT_RosterHandler : ScriptedWidgetEventHandler
{
    Widget Root;
    JSOC_ORBAT_PairingHandler Owner;
    JSOC_ORBAT_HostMixedBridge Mixed;
    ref array<ref JSOC_ORBAT_RosterEntry> Rows = {};
    ref array<ref JSOC_ORBAT_RosterEntry> Visible = {};
    ref array<string> Keys = {};
    int Page;
    int FactionIndex;
    void Text(string name, string value)
    {
        TextWidget text = TextWidget.Cast(Root.FindAnyWidget(name)); if (text) text.SetText(value);
    }
    void RefreshRoster()
    {
        Mixed.Roster(Rows); Keys.Clear();
        FactionManager manager = GetGame().GetFactionManager();
        if (manager)
        {
            array<Faction> factions = {}; manager.GetFactionsList(factions);
            foreach (Faction faction : factions) if (faction && Keys.Find(faction.GetFactionKey()) < 0) Keys.Insert(faction.GetFactionKey());
        }
        Keys.Insert("NO_FACTION"); Page = 0; FactionIndex = 0; Render();
    }
    void Render()
    {
        if (!Root || !Mixed) return;
        Visible.Clear();
        foreach (JSOC_ORBAT_RosterEntry row : Rows)
        {
            if ((row.SessionPlayerId > 0 && !Mixed.Humans) || (row.SessionPlayerId == 0 && !Mixed.AI)) continue;
            if (Mixed.Factions.Find(Mixed.FactionKeyFor(row.Target)) < 0) continue;
            Visible.Insert(row);
        }
        if (Page * 6 >= Visible.Count()) Page = 0;
        string human = "ON", ai = "ON"; if (!Mixed.Humans) human = "OFF"; if (!Mixed.AI) ai = "OFF";
        Text("RosterHumansText", "HUMAN PLAYERS: " + human); Text("RosterAIText", "AI CHARACTERS: " + ai);
        if (Keys.Count() > 0)
        {
            string on = "OFF"; if (Mixed.Factions.Find(Keys[FactionIndex]) >= 0) on = "ON";
            Text("RosterFactionText", "FACTION " + Keys[FactionIndex] + ": " + on + " (CLICK TO TOGGLE)");
        }
        Text("RosterStatus", string.Format("%1/60 selected; page %2; %3 matching units. %4", Mixed.SelectedCount(), Page+1, Visible.Count(), Mixed.SelectionMessage));
        for (int i = 0; i < 6; i++)
        {
            Widget button = Root.FindAnyWidget(string.Format("RosterRow%1", i)); int index = Page * 6 + i;
            if (button) button.SetVisible(index < Visible.Count());
            if (index >= Visible.Count()) continue;
            string checked = "[ ]"; if (Mixed.IsSelected(Visible[index].Key)) checked = "[X]";
            Text(string.Format("RosterRow%1Text", i), checked + " " + Visible[index].Label);
        }
    }
    override bool OnClick(Widget w, int x, int y, int button)
    {
        if (!Root || !Mixed || !w) return false;
        string name = w.GetName();
        if (name == "RosterDone") { Owner.CloseRoster(); Owner.Refresh(); return true; }
        if (name == "RosterRefresh") { RefreshRoster(); return true; }
        if (name == "RosterSelect") { Mixed.SelectMatching(Visible); Render(); return true; }
        if (name == "RosterHumans") Mixed.SetHumans(!Mixed.Humans);
        else if (name == "RosterAI") Mixed.SetAI(!Mixed.AI);
        else if (name == "RosterFaction" && Keys.Count() > 0) Mixed.ToggleFaction(Keys[FactionIndex]);
        else if (name == "RosterFactionNext" && Keys.Count() > 0) FactionIndex = (FactionIndex+1) % Keys.Count();
        else if (name == "RosterFactionPrev" && Keys.Count() > 0) FactionIndex = (FactionIndex+Keys.Count()-1) % Keys.Count();
        else if (name == "RosterNext" && (Page+1)*6 < Visible.Count()) Page++;
        else if (name == "RosterPrev" && Page > 0) Page--;
        else
        {
            for (int i = 0; i < 6; i++) if (name == string.Format("RosterRow%1", i) && Page*6+i < Visible.Count()) Mixed.Toggle(Visible[Page*6+i]);
        }
        Render(); return true;
    }
};
