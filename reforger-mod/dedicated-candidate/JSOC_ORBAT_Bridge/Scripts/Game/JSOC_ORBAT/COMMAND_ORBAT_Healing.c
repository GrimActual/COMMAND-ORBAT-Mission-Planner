// Original bounded native treatment of one wounded member of the approved squad.
class COMMAND_ORBAT_HealingLease
{
    ref JSOC_ORBAT_GMRequest Request;
    SCR_AIGroup Group;
    IEntity Patient;
    SCR_EntityWaypoint Waypoint;
    ref array<IEntity> Members = {};
    string ControlFaction;
    float Deadline;
    float PollAt;
    int InitialBandages;
    bool ObservedTreatment;
    static int Bandages(SCR_AIGroup group)
    {
        int count; array<AIAgent> agents = {}; group.GetAgents(agents);
        foreach (AIAgent agent : agents)
        {
            if (!agent || !agent.GetControlledEntity()) continue;
            InventoryStorageManagerComponent inventory = InventoryStorageManagerComponent.Cast(agent.GetControlledEntity().FindComponent(InventoryStorageManagerComponent));
            if (!inventory) continue;
            array<IEntity> items = {}; inventory.GetItems(items);
            foreach (IEntity item : items)
            {
                if (!item) continue;
                SCR_ConsumableItemComponent consumable = SCR_ConsumableItemComponent.Cast(item.FindComponent(SCR_ConsumableItemComponent));
                if (consumable && SCR_ConsumableBandage.Cast(consumable.GetConsumableEffect())) count++;
            }
        }
        return count;
    }
    static IEntity WoundedMember(SCR_AIGroup group)
    {
        if (!group) return null;
        array<AIAgent> agents = {}; group.GetAgents(agents);
        foreach (AIAgent agent : agents)
        {
            if (!agent || !agent.GetControlledEntity()) continue;
            IEntity member = agent.GetControlledEntity();
            SCR_CharacterDamageManagerComponent damage = SCR_CharacterDamageManagerComponent.Cast(member.FindComponent(SCR_CharacterDamageManagerComponent));
            SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(member.FindComponent(SCR_EditableCharacterComponent));
            if (damage && editable && !editable.IsDestroyed() && damage.IsBleeding() && damage.CanBeHealed() && !COMMAND_ORBAT_TransportLease.MountedIn(member) && !JSOC_ORBAT_AIOrders.PlayerOccupies(member)) return member;
        }
        return null;
    }
    string Validate()
    {
        if (!Group || !Patient || !Waypoint || Members.Find(Patient) < 0) return "Healing identity unavailable";
        if (JSOC_ORBAT_AIOrders.PlayerOccupies(Group) || JSOC_ORBAT_AIOrders.PlayerOccupies(Patient)) return "Human-controlled squad or patient is protected";
        if (ControlFaction.IsEmpty() || ControlFaction == "NO_FACTION" || !COMMAND_ORBAT_SquadControl.SameFaction(Group,ControlFaction)) return "Healing squad faction changed";
        array<AIAgent> agents = {}; Group.GetAgents(agents);
        if (agents.Count() != Members.Count()) return "Healing squad membership changed";
        foreach (AIAgent agent : agents)
        {
            if (!agent || !agent.GetControlledEntity() || Members.Find(agent.GetControlledEntity()) < 0) return "Healing squad identity changed";
            IEntity member = agent.GetControlledEntity();
            SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(member.FindComponent(SCR_EditableCharacterComponent));
            if (!editable || editable.IsDestroyed() || COMMAND_ORBAT_TransportLease.MountedIn(member)) return "Healing requires living on-foot squad members";
        }
        array<AIWaypoint> points = {}; Group.GetWaypoints(points);
        foreach (AIWaypoint point : points) if (point && point != Waypoint) return "Waypoint authority changed outside COMMAND";
        if (Waypoint.GetEntity() != Patient) return "Native treatment target changed";
        return "";
    }
    bool Completed()
    {
        foreach (IEntity member : Members)
        {
            if (!member) continue;
            AIControlComponent control = AIControlComponent.Cast(member.FindComponent(AIControlComponent));
            if (!control || !control.GetAIAgent()) continue;
            SCR_AIUtilityComponent utility = SCR_AIUtilityComponent.Cast(control.GetAIAgent().FindComponent(SCR_AIUtilityComponent));
            if (!utility) continue;
            SCR_AIMedicHealBehavior treatment = SCR_AIMedicHealBehavior.Cast(utility.GetCurrentBehavior());
            if (!treatment || treatment.m_EntityToHeal.m_Value != Patient) continue;
            SCR_AIActivityBase activity = SCR_AIActivityBase.Cast(treatment.GetRelatedGroupActivity());
            if (activity && activity.m_RelatedWaypoint == Waypoint) ObservedTreatment = true;
        }
        SCR_CharacterDamageManagerComponent damage;
        if (Patient) damage = SCR_CharacterDamageManagerComponent.Cast(Patient.FindComponent(SCR_CharacterDamageManagerComponent));
        return ObservedTreatment && damage && !damage.IsBleeding() && Bandages(Group) < InitialBandages;
    }
    void Stop()
    {
        foreach (IEntity member : Members)
        {
            if (!member || JSOC_ORBAT_AIOrders.PlayerOccupies(member)) continue;
            AIControlComponent control = AIControlComponent.Cast(member.FindComponent(AIControlComponent));
            if (!control || !control.GetAIAgent()) continue;
            SCR_AIUtilityComponent utility = SCR_AIUtilityComponent.Cast(control.GetAIAgent().FindComponent(SCR_AIUtilityComponent));
            if (!utility) continue;
            array<ref AIActionBase> actions = {}; utility.GetActions(actions);
            foreach (AIActionBase action : actions)
            {
                if (!action) continue;
                SCR_AIActivityBase activity = SCR_AIActivityBase.Cast(action.GetRelatedGroupActivity());
                if (activity && activity.m_RelatedWaypoint == Waypoint) action.Fail();
            }
        }
        array<AIWaypoint> points = {}; if (Waypoint) points.Insert(Waypoint);
        if (Group) COMMAND_ORBAT_RouteOrders.Cancel(Group,points);
        else COMMAND_ORBAT_RouteOrders.DeleteWaypoints(points);
        Waypoint = null;
    }
};
