class JSOC_ORBAT_GMHandler : ScriptedWidgetEventHandler
{
    Widget Root;
    JSOC_ORBAT_PairingHandler Owner;
    JSOC_ORBAT_HostGM GM;
    int UnitIndex;

    protected string PolicyState(bool enabled)
    {
        if (enabled) return "ON";
        return "OFF";
    }
    protected void PolicyButton(string name, string label, bool enabled, bool available)
    {
        Widget button = Root.FindAnyWidget(name);
        if (button) button.SetEnabled(available);
        TextWidget text = TextWidget.Cast(Root.FindAnyWidget(name + "Text"));
        if (text) text.SetText(label + ": " + PolicyState(enabled));
    }
    void Refresh()
    {
        if (!Root || !GM) return;
        TextWidget status = TextWidget.Cast(Root.FindAnyWidget("GMStatus")); if (status) status.SetText(GM.Status);
        TextWidget preview = TextWidget.Cast(Root.FindAnyWidget("GMPreview")); if (preview) preview.SetText(GM.Preview(UnitIndex));
        bool available = GM.CanSetApprovalPolicy();
        PolicyButton("GMAutoAI","AI ORDERS",GM.AutoAI(),available);
        PolicyButton("GMAutoSpawn","SPAWNING",GM.AutoSpawn(),available);
        PolicyButton("GMAutoRemove","REMOVAL",GM.AutoRemove(),available);
        bool automatic = GM.AutoAI() || GM.AutoSpawn() || GM.AutoRemove();
        TextWidget policy = TextWidget.Cast(Root.FindAnyWidget("GMAutoStatus"));
        if (policy)
        {
            if (automatic) policy.SetText("Automatic approval enabled for the ON categories below.");
            else policy.SetText("Manual approval - all automatic categories OFF.");
        }
        Widget disable = Root.FindAnyWidget("GMAutoDisable");
        if (disable) disable.SetEnabled(available && automatic);
        TextWidget disableText = TextWidget.Cast(Root.FindAnyWidget("GMAutoDisableText"));
        if (disableText)
        {
            if (automatic) disableText.SetText("DISABLE ALL AUTO-APPROVAL");
            else disableText.SetText("ALL AUTO-APPROVAL OFF");
        }
        TextWidget feedback = TextWidget.Cast(Root.FindAnyWidget("GMAutoFeedback"));
        if (feedback)
        {
            if (!GM.IsPaired()) feedback.SetText("Connect the mixed host pairing before changing approval controls.");
            else if (!available) feedback.SetText("This relay does not support automatic approval. Update the relay.");
            else if (GM.ApprovalPolicyPending()) feedback.SetText("Policy update awaiting relay acknowledgement. Snapshots remain manual.");
            else feedback.SetText("Choose each category above. Snapshots always need manual approval.");
        }
        Widget approve = Root.FindAnyWidget("GMApprove"); if (approve) approve.SetEnabled(GM.CanApprove());
        Widget reject = Root.FindAnyWidget("GMReject"); if (reject) reject.SetEnabled(GM.CanApprove());
    }
    bool HandleApprovalAction(string name)
    {
        if (!GM) return false;
        if (name == "GMAutoAI") GM.SetApprovalPolicy(!GM.AutoAI(),GM.AutoSpawn(),GM.AutoRemove());
        else if (name == "GMAutoSpawn") GM.SetApprovalPolicy(GM.AutoAI(),!GM.AutoSpawn(),GM.AutoRemove());
        else if (name == "GMAutoRemove") GM.SetApprovalPolicy(GM.AutoAI(),GM.AutoSpawn(),!GM.AutoRemove());
        else if (name == "GMAutoDisable") GM.SetApprovalPolicy(false,false,false);
        else return false;
        return true;
    }
    override bool OnClick(Widget w, int x, int y, int button)
    {
        if (!Root || !GM || !w) return false;
        Widget clicked = w;
        string name;
        while (clicked && clicked != Root)
        {
            name = clicked.GetName();
            if (name == "GMDone") { Owner.CloseGM(); return true; }
            if (HandleApprovalAction(name)) { Refresh(); return true; }
            if (name == "GMPoll") { UnitIndex = 0; GM.Poll(); Refresh(); return true; }
            if (name == "GMApprove") { if (GM.CanApprove()) GM.Approve(); Refresh(); return true; }
            if (name == "GMReject") { if (GM.CanApprove()) GM.Reject(); Refresh(); return true; }
            if (name == "GMNext")
            {
                if (GM.Pending && GM.Pending.request && GM.PreviewCount() > 0) UnitIndex = (UnitIndex+1) % GM.PreviewCount();
                Refresh(); return true;
            }
            clicked = clicked.GetParent();
        }
        return false;
    }
};
