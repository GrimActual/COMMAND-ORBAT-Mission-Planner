// Native tactical adapter. Reached only after capability and in-game host approval checks.
// The caller must resolve and authorise the group and its COMMAND-owned waypoint first.
class COMMAND_ORBAT_TacticalOrders
{
    static ResourceName DEFEND = "{93291E72AC23930F}Prefabs/AI/Waypoints/AIWaypoint_Defend.et";
    static SCR_DefendWaypoint CreateDefend(SCR_AIGroup group, AIWaypoint previous, float worldX, float worldZ, int seconds, array<AIWaypoint> ownedRoute = null)
    {
        if (!group || seconds < 5 || seconds > 300 || !(worldX >= 0 && worldX <= 13500) || !(worldZ >= 0 && worldZ <= 13500)) return null;
        if (!JSOC_ORBAT_AIOrders.Check(group,previous,ownedRoute).IsEmpty()) return null;
        Resource resource = Resource.Load(DEFEND);
        if (!resource || !resource.IsValid() || !resource.GetResource() || resource.GetResource().GetResourceName() != DEFEND) return null;
        EntitySpawnParams parameters = new EntitySpawnParams(); parameters.TransformMode = ETransformMode.WORLD;
        Math3D.AnglesToMatrix(Vector(0,0,0),parameters.Transform);
        parameters.Transform[3] = Vector(worldX,GetGame().GetWorld().GetSurfaceY(worldX,worldZ),worldZ);
        IEntity entity = GetGame().SpawnEntityPrefab(resource,GetGame().GetWorld(),parameters);
        SCR_DefendWaypoint waypoint = SCR_DefendWaypoint.Cast(entity);
        if (!waypoint) { if (entity) SCR_EntityHelper.DeleteEntityAndChildren(entity); return null; }
        // Preserve native defend presets/sector/cover configuration; do not substitute a Move radius.
        waypoint.SetHoldingTime(seconds);
        return waypoint;
    }
    static bool CancelOwnedMovement(SCR_AIGroup group, AIWaypoint waypoint)
    {
        if (!group || !waypoint || !JSOC_ORBAT_AIOrders.Check(group,waypoint).IsEmpty()) return false;
        array<AIWaypoint> installed = {}; group.GetWaypoints(installed);
        if (installed.Find(waypoint) < 0) return false;
        // Cancel the native activities associated with this waypoint, not all AI behaviour.
        group.GetGroupUtilityComponent().CancelActivitiesRelatedToWaypoint(waypoint);
        group.RemoveWaypoint(waypoint); installed.Clear(); group.GetWaypoints(installed);
        if (installed.Find(waypoint) >= 0) return false;
        SCR_EntityHelper.DeleteEntityAndChildren(waypoint);
        return true;
    }
};
