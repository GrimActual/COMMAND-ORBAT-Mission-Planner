// Session-bound command leases; never grants permission to delete recruited entities.
class COMMAND_ORBAT_FollowLease
{
    SCR_EntityWaypoint Waypoint;
    IEntity Target;
    string TargetAlias;
    float Deadline;
};
class COMMAND_ORBAT_SquadControl
{
    static ResourceName FOLLOW = "{A0509D3C4DD4475E}Prefabs/AI/Waypoints/AIWaypoint_Follow.et";
    static SCR_AIGroup GroupFor(IEntity member)
    {
        if (!member) return null;
        SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(member.FindComponent(SCR_EditableCharacterComponent));
        if (!editable || editable.IsDestroyed()) return null;
        SCR_EditableEntityComponent group = editable.GetAIGroup();
        if (!group) return null;
        return SCR_AIGroup.Cast(group.GetOwnerScripted());
    }
    static bool SameFaction(SCR_AIGroup group, string factionKey)
    {
        if (!group || factionKey.IsEmpty() || factionKey == "NO_FACTION") return false;
        array<AIAgent> agents = {}; group.GetAgents(agents);
        if (agents.Count() < 1 || agents.Count() > 16) return false;
        foreach (AIAgent agent : agents)
        {
            if (!agent || !agent.GetControlledEntity()) return false;
            SCR_EditableCharacterComponent character = SCR_EditableCharacterComponent.Cast(agent.GetControlledEntity().FindComponent(SCR_EditableCharacterComponent));
            if (!character || !character.GetFaction() || character.GetFaction().GetFactionKey() != factionKey) return false;
        }
        return true;
    }
    static COMMAND_ORBAT_FollowLease CreateFollow(SCR_AIGroup group, IEntity target, string alias, int seconds)
    {
        if (!group || !target || seconds < 5 || seconds > 300) return null;
        Resource resource = Resource.Load(FOLLOW);
        if (!resource || !resource.IsValid() || !resource.GetResource() || resource.GetResource().GetResourceName() != FOLLOW) return null;
        EntitySpawnParams parameters = new EntitySpawnParams(); parameters.TransformMode = ETransformMode.WORLD;
        Math3D.AnglesToMatrix(vector.Zero,parameters.Transform); parameters.Transform[3] = target.GetOrigin();
        IEntity entity = GetGame().SpawnEntityPrefab(resource,GetGame().GetWorld(),parameters);
        SCR_EntityWaypoint waypoint = SCR_EntityWaypoint.Cast(entity);
        if (!waypoint) { if (entity) SCR_EntityHelper.DeleteEntityAndChildren(entity); return null; }
        waypoint.SetEntity(target); waypoint.SetCompletionRadius(10);
        if (waypoint.GetEntity() != target) { SCR_EntityHelper.DeleteEntityAndChildren(waypoint); return null; }
        COMMAND_ORBAT_FollowLease lease = new COMMAND_ORBAT_FollowLease(); lease.Waypoint = waypoint; lease.Target = target; lease.TargetAlias = alias;
        lease.Deadline = GetGame().GetWorld().GetWorldTime() + seconds * 1000;
        return lease;
    }
};
