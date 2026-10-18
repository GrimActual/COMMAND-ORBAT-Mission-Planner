// Bounded server-side infantry-group orders. Ownership is supplied by HostGM, not by the caller.
class JSOC_ORBAT_AIOrders
{
    static ResourceName MOVE = "{750A8D1695BD6998}Prefabs/AI/Waypoints/AIWaypoint_Move.et";
    static ResourceName WAIT = "{531EC45063C1F57B}Prefabs/AI/Waypoints/AIWaypoint_Wait.et";
    static bool PlayerOccupies(IEntity root)
    {
        PlayerManager manager = GetGame().GetPlayerManager();
        if (!manager) return true; // Unknown ownership/control state fails closed.
        array<int> players = {}; manager.GetPlayers(players);
        foreach (int player : players)
        {
            IEntity controlled = manager.GetPlayerControlledEntity(player);
            IEntity ancestor = controlled; int depth = 0;
            while (ancestor && depth < 64) { if (ancestor == root) return true; ancestor = ancestor.GetParent(); depth++; }
            if (!controlled) continue;
            SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(controlled.FindComponent(SCR_EditableCharacterComponent));
            if (editable)
            {
                SCR_EditableEntityComponent vehicle = editable.GetVehicle(); SCR_EditableEntityComponent group = editable.GetAIGroup();
                if ((vehicle && vehicle.GetOwnerScripted() == root) || (group && group.GetOwnerScripted() == root)) return true;
            }
        }
        return false;
    }
    static string Check(SCR_AIGroup group, AIWaypoint ownedWaypoint, array<AIWaypoint> ownedRoute = null, bool allowMounted = false)
    {
        if (!group) return "Target must be a bridge-created infantry AI group";
        if (!group.GetGroupUtilityComponent()) return "Native group AI utility and waypoint processing are unavailable";
        if (PlayerOccupies(group)) return "Group control is unavailable or a player occupies this group";
        array<AIAgent> agents = {}; group.GetAgents(agents);
        if (agents.Count() < 1 || agents.Count() > 16) return "Order supports 1 to 16 resolved infantry AI members";
        foreach (AIAgent agent : agents)
        {
            if (!agent) return "AI membership is not ready";
            IEntity member = agent.GetControlledEntity();
            if (!member) return "AI member has no resolved character";
            SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(member.FindComponent(SCR_EditableCharacterComponent));
            if (!editable) return "Only standard editable infantry members are supported";
            if (!allowMounted && editable.GetVehicle()) return "Use separate transport or vehicle controls for mounted troops";
        }
        if (!group.GetLeaderEntity()) return "AI group leader is not ready";
        array<AIWaypoint> waypoints = {}; group.GetWaypoints(waypoints);
        foreach (AIWaypoint waypoint : waypoints) if (waypoint && waypoint != ownedWaypoint && (!ownedRoute || ownedRoute.Find(waypoint) < 0)) return "Existing in-game waypoints must be cleared by the host first";
        return "";
    }
    // Called only after an approved command resolves and validates its exact group.
    // A registered waypoint cannot drive a dormant group. Use native non-forced
    // activation, never a permanent LOD override or a reset of all AI behaviour.
    static string EnsureActive(SCR_AIGroup group)
    {
        if (!group) return "AI group is unavailable";
        if (!group.IsAIActivated()) group.ActivateAI(false);
        array<AIAgent> agents = {}; group.GetAgents(agents);
        foreach (AIAgent agent : agents)
        {
            if (!agent) return "AI member is unavailable";
            if (!agent.IsAIActivated()) agent.ActivateAI(false);
            if (!agent.IsAIActivated()) return "Native AI member activation was refused; check scenario AI settings";
        }
        if (!group.IsAIActivated()) return "Native AI group activation was refused; check scenario AI settings";
        return "";
    }
    static AIWaypoint Create(JSOC_ORBAT_GMRequest request, SCR_AIGroup group)
    {
        if (!request || !group || (request.kind != "ai-move" && request.kind != "ai-hold")) return null;
        ResourceName name = MOVE;
        vector position = Vector(request.worldX, 0, request.worldZ);
        if (request.kind == "ai-hold") { name = WAIT; position = group.GetLeaderEntity().GetOrigin(); }
        Resource resource = Resource.Load(name);
        if (!resource || !resource.IsValid() || !resource.GetResource() || resource.GetResource().GetResourceName() != name) return null;
        EntitySpawnParams parameters = new EntitySpawnParams(); parameters.TransformMode = ETransformMode.WORLD;
        Math3D.AnglesToMatrix(Vector(0,0,0),parameters.Transform);
        parameters.Transform[3] = Vector(position[0],GetGame().GetWorld().GetSurfaceY(position[0],position[2]),position[2]);
        IEntity entity = GetGame().SpawnEntityPrefab(resource,GetGame().GetWorld(),parameters);
        SCR_AIWaypoint waypoint = SCR_AIWaypoint.Cast(entity);
        if (!waypoint) { if (entity) SCR_EntityHelper.DeleteEntityAndChildren(entity); return null; }
        waypoint.SetCompletionRadius(5);
        if (request.kind == "ai-hold")
        {
            SCR_TimedWaypoint timed = SCR_TimedWaypoint.Cast(waypoint);
            if (!timed) { SCR_EntityHelper.DeleteEntityAndChildren(waypoint); return null; }
            timed.SetHoldingTime(request.holdSeconds);
        }
        return waypoint;
    }
};
