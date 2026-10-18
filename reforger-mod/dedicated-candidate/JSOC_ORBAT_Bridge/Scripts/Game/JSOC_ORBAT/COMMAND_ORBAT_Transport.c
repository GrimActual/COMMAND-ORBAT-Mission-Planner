// Exact native assignment identity created by COMMAND; preserve pre-existing assignments.
class COMMAND_ORBAT_VehicleBinding
{
    SCR_AIVehicleUsageComponent Usage;
    ref SCR_AIGroupVehicle OwnedAssignment;
    bool AddedUsable;
};
// Original COMMAND bounded transport adapter; no forced entry, ejection or player control.
class COMMAND_ORBAT_TransportLease
{
    SCR_AIGroup Group;
    IEntity Target;
    SCR_BoardingWaypoint Waypoint;
    ref array<IEntity> Members = {};
    ref JSOC_ORBAT_GMRequest Request;
    float Deadline;
    string ControlFaction;
    ref SCR_AIGroupVehicle OwnedAssignment;
    ref array<ref AIActionBase> InitialGroupActions = {};
    ref array<ref SCR_AIGetInActivity> GeneratedActivities = {};
    static IEntity MountedIn(IEntity member)
    {
        if (!member) return null;
        CompartmentAccessComponent access = CompartmentAccessComponent.Cast(member.FindComponent(CompartmentAccessComponent));
        if (!access) return null;
        BaseCompartmentSlot slot = access.GetCompartment();
        if (!slot || slot.GetOccupant() != member) return null;
        return slot.GetVehicle();
    }
    static string VehicleFaction(IEntity target)
    {
        if (!target) return "";
        SCR_EditableVehicleComponent editable = SCR_EditableVehicleComponent.Cast(target.FindComponent(SCR_EditableVehicleComponent));
        if (editable && editable.GetFaction()) return editable.GetFaction().GetFactionKey();
        FactionAffiliationComponent affiliation = FactionAffiliationComponent.Cast(target.FindComponent(FactionAffiliationComponent));
        if (!affiliation) return "";
        if (!affiliation.GetAffiliatedFaction()) return affiliation.GetDefaultFactionKey();
        return affiliation.GetAffiliatedFaction().GetFactionKey();
    }
    string Validate(bool initial)
    {
        if (!Group || !Target || !Request) return "Transport identity changed";
        if (ControlFaction.IsEmpty() || ControlFaction == "NO_FACTION") return "Vehicle faction is unresolved";
        if (!COMMAND_ORBAT_SquadControl.SameFaction(Group,ControlFaction)) return "Squad and vehicle factions do not match";
        if (VehicleFaction(Target) != ControlFaction) return "Vehicle faction changed";
        if (JSOC_ORBAT_AIOrders.PlayerOccupies(Group) || JSOC_ORBAT_AIOrders.PlayerOccupies(Target)) return "Human-controlled groups or occupied vehicles are protected";
        array<AIAgent> agents = {}; Group.GetAgents(agents);
        if (agents.Count() != Members.Count()) return "Transport squad membership changed";
        foreach (AIAgent agent : agents) if (!agent || Members.Find(agent.GetControlledEntity()) < 0) return "Transport squad identity changed";
        COMMAND_ORBAT_VehicleInspection snapshot = COMMAND_ORBAT_VehicleInspection.Read(Target);
        if (!snapshot || snapshot.players > 0 || snapshot.other > 0) return "Unsupported or protected vehicle occupants";
        foreach (IEntity member : Members)
        {
            if (!member) return "Transport member is unavailable";
            SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(member.FindComponent(SCR_EditableCharacterComponent));
            if (!editable || editable.IsDestroyed()) return "Transport member is destroyed";
            IEntity vehicle = MountedIn(member);
            if (vehicle && vehicle != Target) return "A squad member occupies another vehicle";
            if (initial && Request.kind == "ai-embark" && vehicle) return "Embark requires an on-foot squad";

        }
        if (initial && Request.kind == "ai-dismount" && CompletedMembers() == Members.Count()) return "No squad members occupy the selected vehicle";
        if (initial && Request.kind == "ai-embark")
        {
            string reason;
            if (!COMMAND_ORBAT_EmbarkPreflight.Check(Target,Members.Count(),Request.driverAllowed,Request.gunnerAllowed,Request.cargoAllowed,reason)) return reason;
        }
        return "";
    }
    void ObserveGeneratedActivities()
    {
        if (!Group || !Target || !Waypoint || !OwnedAssignment) return;
        SCR_AIGroupUtilityComponent utility = Group.GetGroupUtilityComponent();
        if (!utility || !utility.m_VehicleMgr || utility.m_VehicleMgr.FindVehicle(Target) != OwnedAssignment) return;
        array<AIWaypoint> points = {}; Group.GetWaypoints(points);
        foreach (AIWaypoint point : points) if (point && point != Waypoint) return;
        array<ref AIActionBase> actions = {}; utility.GetActions(actions);
        foreach (AIActionBase action : actions)
        {
            SCR_AIGetInActivity activity = SCR_AIGetInActivity.Cast(action);
            if (!activity || InitialGroupActions.Find(action) >= 0 || GeneratedActivities.Find(activity) >= 0) continue;
            if (activity.m_Vehicle && activity.m_Vehicle.m_Value == Target && (!activity.m_RelatedWaypoint || activity.m_RelatedWaypoint == Waypoint)) GeneratedActivities.Insert(activity);
        }
    }
    void StopMemberBehaviors()
    {
        if (!Waypoint) return;
        foreach (SCR_AIGetInActivity generated : GeneratedActivities) if (generated) generated.Fail(true);
        foreach (IEntity member : Members)
        {
            if (!member || JSOC_ORBAT_AIOrders.PlayerOccupies(member)) continue;
            AIControlComponent control = AIControlComponent.Cast(member.FindComponent(AIControlComponent));
            if (!control || !control.GetAIAgent()) continue;
            SCR_AIUtilityComponent utility = SCR_AIUtilityComponent.Cast(control.GetAIAgent().FindComponent(SCR_AIUtilityComponent));
            if (!utility) continue;
            foreach (SCR_AIGetInActivity generated : GeneratedActivities) if (generated) utility.SetStateOfRelatedAction(generated,EAIActionState.FAILED);
            array<ref AIActionBase> actions = {}; utility.GetActions(actions);
            foreach (AIActionBase action : actions)
            {
                if (!action) continue;
                SCR_AIActivityBase activity = SCR_AIActivityBase.Cast(action.GetRelatedGroupActivity());
                if (activity && (activity.m_RelatedWaypoint == Waypoint || GeneratedActivities.Find(SCR_AIGetInActivity.Cast(activity)) >= 0)) action.Fail();
            }
        }
    }
    int CompletedMembers()
    {
        int complete = 0;
        foreach (IEntity member : Members)
        {
            IEntity vehicle = MountedIn(member);
            CompartmentAccessComponent access; if (member) access = CompartmentAccessComponent.Cast(member.FindComponent(CompartmentAccessComponent));
            if (Request.kind == "ai-embark" && vehicle == Target && access && !access.IsGettingIn()) complete++;
            if (Request.kind == "ai-dismount" && !vehicle && (!access || !access.IsGettingOut())) complete++;
        }
        return complete;
    }
    static COMMAND_ORBAT_TransportLease Prepare(JSOC_ORBAT_GMRequest request, SCR_AIGroup group, IEntity target, out string problem)
    {
        problem = "Transport request or squad is unavailable";
        if (!request || !group || !target || request.timeoutSeconds < 5 || request.timeoutSeconds > 120) return null;
        COMMAND_ORBAT_TransportLease lease = new COMMAND_ORBAT_TransportLease(); lease.Request = request; lease.Group = group; lease.Target = target; lease.ControlFaction = VehicleFaction(target);
        group.GetGroupUtilityComponent().GetActions(lease.InitialGroupActions);
        array<AIAgent> agents = {}; group.GetAgents(agents);
        if (agents.Count() < 1 || agents.Count() > 16) return null;
        foreach (AIAgent agent : agents)
        {
            if (!agent || !agent.GetControlledEntity())
            {
                return null;
            }
            lease.Members.Insert(agent.GetControlledEntity());
        }
        problem = lease.Validate(true);
        if (!problem.IsEmpty()) return null;
        problem = "Native boarding resource unavailable";
        ResourceName name = "{8AD8C82346156494}Prefabs/AI/Waypoints/AIWaypoint_GetInSelected.et";
        if (request.kind == "ai-dismount") name = "{C40316EE26846CAB}Prefabs/AI/Waypoints/AIWaypoint_GetOut.et";
        Resource resource = Resource.Load(name);
        if (!resource || !resource.IsValid() || !resource.GetResource() || resource.GetResource().GetResourceName() != name) return null;
        EntitySpawnParams parameters = new EntitySpawnParams(); parameters.TransformMode = ETransformMode.WORLD;
        Math3D.AnglesToMatrix(vector.Zero,parameters.Transform); parameters.Transform[3] = target.GetOrigin();
        IEntity entity = GetGame().SpawnEntityPrefab(resource,GetGame().GetWorld(),parameters);
        lease.Waypoint = SCR_BoardingWaypoint.Cast(entity);
        if (!lease.Waypoint) { if (entity) SCR_EntityHelper.DeleteEntityAndChildren(entity); return null; }
        if (request.kind == "ai-embark")
        {
            SCR_BoardingEntityWaypoint boarding = SCR_BoardingEntityWaypoint.Cast(entity);
            if (!boarding) { SCR_EntityHelper.DeleteEntityAndChildren(entity); return null; }
            boarding.SetEntity(target); boarding.SetAllowance(request.driverAllowed,request.gunnerAllowed,request.cargoAllowed);
            SCR_AIBoardingParameters allowance = boarding.GetAllowance();
            if (!allowance || allowance.m_bIsDriverAllowed != request.driverAllowed || allowance.m_bIsGunnerAllowed != request.gunnerAllowed || allowance.m_bIsCargoAllowed != request.cargoAllowed)
            {
                SCR_EntityHelper.DeleteEntityAndChildren(entity);
                return null;
            }
            if (boarding.GetEntity() != target) { SCR_EntityHelper.DeleteEntityAndChildren(entity); return null; }
        }
        lease.Deadline = GetGame().GetWorld().GetWorldTime() + request.timeoutSeconds * 1000;
        problem = "";
        return lease;
    }
};
