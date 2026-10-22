class JSOC_ORBAT_GMHandler : ScriptedWidgetEventHandler
{
    Widget Root;
    JSOC_ORBAT_PairingHandler Owner;
    JSOC_ORBAT_HostGM GM;
    int UnitIndex;
    bool TextViewportsReady;
    string LastStatusText;
    string LastPreviewText;
    string ReviewRequestId;
    int ReviewUnitIndex = -1;
    float LastStatusWidth;
    float LastPreviewWidth;
    bool Refreshing;
    float LastPanelTop = -1;

    protected void ConfigureReviewSurface()
    {
        // Use the layout's ordinary widget background; no custom native draw commands.
        Widget backdrop = Root.FindAnyWidget("GMBackdrop");
        if (backdrop)
        {
            backdrop.SetFlags(WidgetFlags.IGNORE_CURSOR | WidgetFlags.NOFOCUS);
            backdrop.SetIsColorInherited(false);
            backdrop.SetColorInt(0xFF101916);
            backdrop.SetOpacity(1);
        }
        ConfigureFixedLabel("GMAutoStatus");
        ConfigureFixedLabel("GMAutoFeedback");
    }
    protected void FitPanelToWindow()
    {
        WorkspaceWidget workspace = Root.GetWorkspace();
        if (!workspace) return;
        float screenWidth, screenHeight, panelWidth, panelHeight;
        workspace.GetScreenSize(screenWidth, screenHeight);
        Root.GetScreenSize(panelWidth, panelHeight);
        if (screenHeight <= 0 || panelHeight <= 0) return;
        // Preserve readable control sizes; lift the panel only when its bottom would overflow.
        float top = Math.Max(0, Math.Min(workspace.DPIScale(40), screenHeight - panelHeight - 8));
        if (Math.AbsFloat(top - LastPanelTop) <= 0.5) return;
        FrameSlot.SetPosY(Root, workspace.DPIUnscale(top));
        LastPanelTop = top;
    }
    protected void ConfigureFixedLabel(string name)
    {
        Widget bounds = Root.FindAnyWidget(name + "Bounds");
        TextWidget text = TextWidget.Cast(Root.FindAnyWidget(name));
        if (bounds)
        {
            bounds.ClearFlags(WidgetFlags.INHERIT_CLIPPING | WidgetFlags.DO_NOT_CLIP_RECT);
            bounds.SetFlags(WidgetFlags.CLIPCHILDREN | WidgetFlags.IGNORE_CURSOR);
        }
        if (text)
        {
            text.ClearFlags(WidgetFlags.CLIPCHILDREN | WidgetFlags.DO_NOT_CLIP_RECT);
            text.SetFlags(WidgetFlags.INHERIT_CLIPPING | WidgetFlags.IGNORE_CURSOR);
            text.SetTextWrapping(false);
            FrameSlot.SetSizeToContent(text, false);
        }
    }

    // Serialized layout slot names are not the script Slot helper classes.
    // Native CreateWidget chooses the correct slot from its actual parent.
    protected bool CreateTextViewport(string name)
    {
        ScrollLayoutWidget scroll = ScrollLayoutWidget.Cast(Root.FindAnyWidget(name + "Scroll"));
        WorkspaceWidget workspace = Root.GetWorkspace();
        if (!scroll || !workspace) return false;
        if (Root.FindAnyWidget(name)) return true;
        SizeLayoutWidget extent = SizeLayoutWidget.Cast(workspace.CreateWidget(WidgetType.SizeLayoutWidgetTypeID, WidgetFlags.VISIBLE, new Color(1, 1, 1, 1), 0, scroll));
        if (!extent) return false;
        extent.SetName(name + "Extent");
        ScrollLayoutSlot.SetHorizontalAlign(extent, LayoutHorizontalAlign.Stretch);
        ScrollLayoutSlot.SetVerticalAlign(extent, LayoutVerticalAlign.Top);
        Widget content = workspace.CreateWidget(WidgetType.FrameWidgetTypeID, WidgetFlags.VISIBLE, new Color(1, 1, 1, 1), 0, extent);
        if (!content)
        {
            extent.RemoveFromHierarchy();
            return false;
        }
        content.SetName(name + "Content");
        SizeLayoutSlot.SetHorizontalAlign(content, LayoutHorizontalAlign.Stretch);
        SizeLayoutSlot.SetVerticalAlign(content, LayoutVerticalAlign.Stretch);
        TextWidget text = TextWidget.Cast(workspace.CreateWidgets("{3132F64DB8B4CB44}UI/layouts/WidgetLibrary/TextWidgets/Text_Body.layout", content));
        if (!text)
        {
            extent.RemoveFromHierarchy();
            return false;
        }
        text.SetName(name);
        text.SetIsColorInherited(false);
        text.SetColorInt(0xFFFFFFFF);
        text.SetExactFontSize(16);
        FrameSlot.SetAnchorMin(text, 0, 0);
        FrameSlot.SetAnchorMax(text, 1, 0);
        FrameSlot.SetOffsets(text, 0, 0, 20, -142);
        ConfigureTextViewport(name);
        return true;
    }

    // Keep the native action row fixed; only each full-text region scrolls.
    protected void ConfigureTextViewport(string name)
    {
        ScrollLayoutWidget scroll = ScrollLayoutWidget.Cast(Root.FindAnyWidget(name + "Scroll"));
        SizeLayoutWidget extent = SizeLayoutWidget.Cast(Root.FindAnyWidget(name + "Extent"));
        Widget content = Root.FindAnyWidget(name + "Content");
        TextWidget text = TextWidget.Cast(Root.FindAnyWidget(name));
        if (!scroll || !extent || !content || !text) return;
        scroll.ClearFlags(WidgetFlags.INHERIT_CLIPPING | WidgetFlags.DO_NOT_CLIP_RECT | WidgetFlags.IGNORE_CURSOR);
        scroll.SetFlags(WidgetFlags.CLIPCHILDREN);
        extent.ClearFlags(WidgetFlags.CLIPCHILDREN | WidgetFlags.DO_NOT_CLIP_RECT);
        extent.SetFlags(WidgetFlags.INHERIT_CLIPPING | WidgetFlags.IGNORE_CURSOR);
        content.ClearFlags(WidgetFlags.CLIPCHILDREN | WidgetFlags.DO_NOT_CLIP_RECT);
        content.SetFlags(WidgetFlags.INHERIT_CLIPPING | WidgetFlags.IGNORE_CURSOR);
        text.ClearFlags(WidgetFlags.CLIPCHILDREN | WidgetFlags.DO_NOT_CLIP_RECT);
        text.SetFlags(WidgetFlags.INHERIT_CLIPPING | WidgetFlags.IGNORE_CURSOR);
        text.SetTextWrapping(true);
        FrameSlot.SetSizeToContent(text, false);
        extent.EnableHeightOverride(true);
    }
    protected void SetViewportText(string name, string value, float minimumHeight, bool changed, bool reset)
    {
        ScrollLayoutWidget scroll = ScrollLayoutWidget.Cast(Root.FindAnyWidget(name + "Scroll"));
        SizeLayoutWidget extent = SizeLayoutWidget.Cast(Root.FindAnyWidget(name + "Extent"));
        TextWidget text = TextWidget.Cast(Root.FindAnyWidget(name));
        if (!scroll || !extent || !text) return;
        if (changed)
        {
            float oldX, oldY;
            scroll.GetSliderPosPixels(oldX, oldY);
            text.SetText(value);
            text.Update();
            float textWidth, textHeight;
            text.GetTextSize(textWidth, textHeight);
            // Reserve enough logical height under either DPI scaling convention.
            // Extra tail space is preferable to hiding the last review line.
            WorkspaceWidget workspace = text.GetWorkspace();
            float logicalHeight = textHeight;
            if (workspace) logicalHeight = workspace.DPIUnscale(textHeight);
            float height = Math.Max(minimumHeight, Math.Max(textHeight, logicalHeight) + 4);
            FrameSlot.SetSizeY(text, height);
            extent.SetHeightOverride(height);
            extent.Update();
            scroll.Update();
            if (!reset) scroll.SetSliderPosPixels(oldX, oldY);
        }
        if (reset) scroll.SetSliderPos(0, 0);
    }

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
        // Layout updates may dispatch widget events. Never re-enter initialization.
        if (!Root || !GM || Refreshing) return;
        Refreshing = true;
        RefreshContents();
        Refreshing = false;
    }
    protected void RefreshContents()
    {
        string requestId;
        if (GM.Pending && GM.Pending.request) requestId = GM.Pending.request.requestId;
        bool reset = !TextViewportsReady || requestId != ReviewRequestId || UnitIndex != ReviewUnitIndex;
        if (!TextViewportsReady)
        {
            ConfigureReviewSurface();
            if (!CreateTextViewport("GMStatus") || !CreateTextViewport("GMPreview"))
            {
                Print("[COMMAND GM review 0.15.5] text content creation failed", LogLevel.ERROR);
                return;
            }
            Print("[COMMAND GM review 0.15.5] controls initialized", LogLevel.NORMAL);
        }
        FitPanelToWindow();
        float statusWidth, statusHeight, previewWidth, previewHeight;
        Widget statusArea = Root.FindAnyWidget("GMStatusScroll");
        Widget previewArea = Root.FindAnyWidget("GMPreviewScroll");
        if (statusArea) statusArea.GetScreenSize(statusWidth, statusHeight);
        if (previewArea) previewArea.GetScreenSize(previewWidth, previewHeight);
        string statusText = "STATUS (scroll here for full text)\n" + GM.Status + "\nApproval still requires validation, authority and hard limits. Disable All stops future automatic approvals; already-approved running actions continue.";
        string previewText = "REQUEST DETAILS (scroll here)\n" + GM.Preview(UnitIndex);
        SetViewportText("GMStatus", statusText, 70, !TextViewportsReady || statusText != LastStatusText || Math.AbsFloat(statusWidth - LastStatusWidth) > 0.5, reset);
        SetViewportText("GMPreview", previewText, 142, !TextViewportsReady || previewText != LastPreviewText || Math.AbsFloat(previewWidth - LastPreviewWidth) > 0.5, reset);
        LastStatusText = statusText;
        LastPreviewText = previewText;
        LastStatusWidth = statusWidth;
        LastPreviewWidth = previewWidth;
        ReviewRequestId = requestId;
        ReviewUnitIndex = UnitIndex;
        TextViewportsReady = true;
        bool available = GM.CanSetApprovalPolicy();
        bool fullAvailable = GM.FullApprovalAvailable();
        bool full = GM.AutoAll();
        bool automatic = full || GM.AutoAI() || GM.AutoSpawn() || GM.AutoRemove();
        PolicyButton("GMAutoAI","AI ORDERS",GM.AutoAI(),available && !full);
        PolicyButton("GMAutoSpawn","SPAWNING",GM.AutoSpawn(),available && !full);
        PolicyButton("GMAutoRemove","REMOVAL",GM.AutoRemove(),available && !full);
        Widget fullButton = Root.FindAnyWidget("GMAutoAll");
        if (fullButton) fullButton.SetEnabled(fullAvailable && !full);
        TextWidget fullText = TextWidget.Cast(Root.FindAnyWidget("GMAutoAllText"));
        if (fullText)
        {
            if (!fullAvailable) fullText.SetText("AUTO ALL: UNAVAILABLE");
            else if (full) fullText.SetText("AUTO ALL: ON");
            else fullText.SetText("AUTO-APPROVE ALL SUPPORTED ACTIONS");
        }
        Widget customButton = Root.FindAnyWidget("GMAutoCustom");
        if (customButton) customButton.SetEnabled(available);
        TextWidget customText = TextWidget.Cast(Root.FindAnyWidget("GMAutoCustomText"));
        if (customText)
        {
            if (full) customText.SetText("USE CUSTOM CATEGORIES");
            else customText.SetText("CUSTOM CATEGORIES");
        }
        TextWidget policy = TextWidget.Cast(Root.FindAnyWidget("GMAutoStatus"));
        if (policy)
        {
            if (GM.ApprovalPolicyPending()) policy.SetText("Mode update pending - waiting for relay.");
            else if (full && !fullAvailable) policy.SetText("Mode: FULL UNAVAILABLE");
            else if (full) policy.SetText("Mode: AUTO ALL - supported actions");
            else if (automatic) policy.SetText("Mode: CUSTOM - ON categories only");
            else policy.SetText("Mode: MANUAL - automatic approval OFF");
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
            if (!GM.IsPaired()) feedback.SetText("Pair the mixed host connection first.");
            else if (!available) feedback.SetText("Approval controls unavailable. Update the relay.");
            else if (GM.ApprovalPolicyPending()) feedback.SetText("Policy sent; relay acknowledgement pending.");
            else if (full && !fullAvailable) feedback.SetText("Full mode unavailable. Select Custom or reconnect.");
            else if (full) feedback.SetText("Full mode uses supported actions; custom switches are ignored.");
            else if (!fullAvailable) feedback.SetText("Full mode unavailable; custom categories remain separate.");
            else feedback.SetText("Disable All affects future approvals, not running actions.");
        }
        Widget approve = Root.FindAnyWidget("GMApprove"); if (approve) approve.SetEnabled(GM.CanApprove());
        Widget reject = Root.FindAnyWidget("GMReject"); if (reject) reject.SetEnabled(GM.CanApprove());
    }
    bool HandleApprovalAction(string name)
    {
        if (!GM) return false;
        if (name == "GMAutoAll") { if (GM.FullApprovalAvailable()) GM.SetFullApprovalPolicy(true); }
        else if (name == "GMAutoCustom") { if (GM.CanSetApprovalPolicy()) GM.SetFullApprovalPolicy(false); }
        else if (name == "GMAutoAI") GM.SetApprovalPolicy(!GM.AutoAI(),GM.AutoSpawn(),GM.AutoRemove());
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
            if (name == "GMDone") { if (Owner) Owner.CloseGM(); return true; }
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
