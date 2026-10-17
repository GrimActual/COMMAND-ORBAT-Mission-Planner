// Persistent AI settings. Each lease owns only its exact setting objects.
class COMMAND_ORBAT_PreferenceLease
{
    string OriginalFormation;
    string AppliedFormation;
    ref SCR_AICharacterStanceSetting Stance;
    ref SCR_AIGroupCombatModeSetting Combat;
    EAIGroupCombatMode OriginalCombat;
    EAIGroupCombatMode AppliedCombat;
};
class COMMAND_ORBAT_SquadPreferences
{
    static string FormationName(string value)
    {
        if (value == "column") return "Column";
        if (value == "staggered-column") return "StaggeredColumn";
        if (value == "wedge") return "Wedge";
        if (value == "line") return "Line";
        return "";
    }
    static string Formation(SCR_AIGroup group, COMMAND_ORBAT_PreferenceLease lease, string value)
    {
        AIFormationComponent component = group.GetFormationComponent();
        if (!component || !component.GetFormation()) return "Squad has no resolved formation definition";
        string current = component.GetFormation().GetName();
        if (!lease.AppliedFormation.IsEmpty() && current != lease.AppliedFormation) return "Formation was changed outside Companion; release control first";
        if (value == "restore")
        {
            if (lease.AppliedFormation.IsEmpty()) return "";
            if (!component.SetFormation(lease.OriginalFormation) || !component.GetFormation() || component.GetFormation().GetName() != lease.OriginalFormation) return "Original formation restoration failed";
            lease.AppliedFormation = ""; return "";
        }
        string name = FormationName(value); if (name.IsEmpty()) return "Unsupported formation";
        if (!component.SetFormation(name) || !component.GetFormation() || component.GetFormation().GetName() != name)
        {
            component.SetFormation(current); return "Formation definition unavailable; previous formation restored";
        }
        if (lease.AppliedFormation.IsEmpty()) lease.OriginalFormation = current;
        lease.AppliedFormation = name; return "";
    }
    static string Stance(SCR_AIGroup group, COMMAND_ORBAT_PreferenceLease lease, string value)
    {
        SCR_AIGroupSettingsComponent settings = SCR_AIGroupSettingsComponent.Cast(group.FindComponent(SCR_AIGroupSettingsComponent));
        if (!settings) return "Native group settings unavailable";
        if (value == "auto")
        {
            if (lease.Stance) settings.RemoveSetting(lease.Stance);
            lease.Stance = null; return "";
        }
        ECharacterStance stance;
        if (value == "stand") stance = ECharacterStance.STAND;
        else if (value == "crouch") stance = ECharacterStance.CROUCH;
        else if (value == "prone") stance = ECharacterStance.PRONE;
        else return "Unsupported stance";
        SCR_AICharacterStanceSetting next = SCR_AICharacterStanceSetting.Create(SCR_EAISettingOrigin.COMMANDING,SCR_EAIBehaviorCause.ALWAYS,stance);
        if (!next || !settings.AddSetting(next,false,false)) return "Native stance setting rejected";
        SCR_AICharacterStanceSettingBase effective = SCR_AICharacterStanceSettingBase.Cast(settings.GetCurrentSetting(SCR_AICharacterStanceSettingBase));
        if (effective != next || effective.GetStance(ECharacterStance.STAND) != stance)
        {
            settings.RemoveSetting(next); return "A higher-priority stance setting blocks this request";
        }
        if (lease.Stance) settings.RemoveSetting(lease.Stance);
        lease.Stance = next; RequestStanceTransition(group,next,stance); return "";
    }
    // Native stance settings are queried by behaviour tasks and can leave idle AI
    // in their previous pose. Request the normal transition once after approval;
    // keep the setting for subsequent behaviour and respect native transition checks.
    static void RequestStanceTransition(SCR_AIGroup group, SCR_AICharacterStanceSetting setting, ECharacterStance stance)
    {
        array<AIAgent> members = {}; group.GetAgents(members);
        foreach (AIAgent agent : members)
        {
            if (!agent) continue;
            ChimeraCharacter character = ChimeraCharacter.Cast(agent.GetControlledEntity());
            if (!character) continue;
            SCR_AICharacterSettingsComponent settings = SCR_AICharacterSettingsComponent.FindOnControlledEntity(character);
            if (!settings) continue;
            SCR_AICharacterStanceSettingBase active = SCR_AICharacterStanceSettingBase.Cast(settings.GetCurrentSetting(SCR_AICharacterStanceSettingBase,SCR_EAIBehaviorCause.ALWAYS));
            // Group settings propagate as child copies. An editor/scenario override
            // with the same stance value still belongs to somebody else.
            if (!active || (active != setting && active.GetParentSetting() != setting)) continue;
            CharacterControllerComponent controller = character.GetCharacterController();
            // Native CharacterStanceChange: erected=1, crouch=2, prone=3.
            int transition = stance + 1;
            if (controller && controller.CanChangeStance(transition)) controller.SetStanceChange(transition);
        }
    }
    static string Combat(SCR_AIGroup group, COMMAND_ORBAT_PreferenceLease lease, string value)
    {
        SCR_AIGroupSettingsComponent settings = SCR_AIGroupSettingsComponent.Cast(group.FindComponent(SCR_AIGroupSettingsComponent));
        SCR_AIGroupUtilityComponent utility = group.GetGroupUtilityComponent();
        if (!settings || !utility) return "Native group combat settings unavailable";
        if (value == "auto")
        {
            bool restore = lease.Combat && settings.GetCurrentSetting(SCR_AIGroupCombatModeSettingBase) == lease.Combat && utility.GetCombatModeExternal() == lease.AppliedCombat;
            if (lease.Combat) settings.RemoveSetting(lease.Combat);
            if (restore) { utility.SetCombatMode(lease.OriginalCombat); utility.EvaluateCombatMode(); }
            lease.Combat = null; return "";
        }
        EAIGroupCombatMode mode;
        if (value == "open-fire") mode = EAIGroupCombatMode.FIRE_AT_WILL;
        else if (value == "hold-fire") mode = EAIGroupCombatMode.HOLD_FIRE;
        else if (value == "return-fire") mode = EAIGroupCombatMode.RETURN_FIRE;
        else return "Unsupported fire policy";
        EAIGroupCombatMode before = utility.GetCombatModeExternal();
        if (lease.Combat && before != lease.AppliedCombat) return "Fire policy changed outside Companion; release control first";
        SCR_AIGroupCombatModeSetting next = SCR_AIGroupCombatModeSetting.Create(SCR_EAISettingOrigin.COMMANDING,mode);
        if (!next || !settings.AddSetting(next,false,false)) return "Native fire policy rejected";
        if (settings.GetCurrentSetting(SCR_AIGroupCombatModeSettingBase) != next)
        {
            settings.RemoveSetting(next); return "A higher-priority fire setting blocks this request";
        }
        utility.SetCombatMode(mode); utility.EvaluateCombatMode();
        if (utility.GetCombatModeExternal() != mode)
        {
            settings.RemoveSetting(next); utility.SetCombatMode(before); return "Native fire policy readback failed";
        }
        if (!lease.Combat) lease.OriginalCombat = before;
        if (lease.Combat) settings.RemoveSetting(lease.Combat);
        lease.Combat = next; lease.AppliedCombat = mode; return "";
    }
    static void Release(SCR_AIGroup group, COMMAND_ORBAT_PreferenceLease lease)
    {
        if (!group || !lease) return;
        AIFormationComponent formation = group.GetFormationComponent();
        if (!lease.AppliedFormation.IsEmpty() && formation && formation.GetFormation() && formation.GetFormation().GetName() == lease.AppliedFormation) formation.SetFormation(lease.OriginalFormation);
        Stance(group,lease,"auto"); Combat(group,lease,"auto");
    }
};
