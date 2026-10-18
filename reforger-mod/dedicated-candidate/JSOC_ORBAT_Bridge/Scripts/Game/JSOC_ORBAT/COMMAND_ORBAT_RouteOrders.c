// Bounded infantry route ownership. All points are prepared before the old order is detached.
class COMMAND_ORBAT_OwnedRoute
{
    ref array<AIWaypoint> Waypoints = {};
};
class COMMAND_ORBAT_RouteOrders
{
    static void DeleteWaypoints(array<AIWaypoint> points)
    {
        foreach (AIWaypoint point : points) if (point) SCR_EntityHelper.DeleteEntityAndChildren(point);
    }
    static bool Valid(JSOC_ORBAT_GMRequest request)
    {
        if (!request || request.waypoints.Count() < 1 || request.waypoints.Count() > 16) return false;
        for (int i = 0; i < request.waypoints.Count(); i++)
        {
            COMMAND_ORBAT_RoutePoint point = request.waypoints[i];
            if (!point || !(point.worldX >= 0 && point.worldX <= 13500) || !(point.worldZ >= 0 && point.worldZ <= 13500)) return false;
            if (i > 0 && point.worldX == request.waypoints[i-1].worldX && point.worldZ == request.waypoints[i-1].worldZ) return false;
        }
        return true;
    }
    static COMMAND_ORBAT_OwnedRoute Create(JSOC_ORBAT_GMRequest request, SCR_AIGroup group)
    {
        if (!Valid(request)) return null;
        COMMAND_ORBAT_OwnedRoute route = new COMMAND_ORBAT_OwnedRoute();
        foreach (COMMAND_ORBAT_RoutePoint point : request.waypoints)
        {
            JSOC_ORBAT_GMRequest move = new JSOC_ORBAT_GMRequest(); move.kind = "ai-move"; move.worldX = point.worldX; move.worldZ = point.worldZ;
            AIWaypoint waypoint = JSOC_ORBAT_AIOrders.Create(move,group);
            if (!waypoint) { DeleteWaypoints(route.Waypoints); return null; }
            route.Waypoints.Insert(waypoint);
        }
        return route;
    }
    static bool Replace(SCR_AIGroup group, array<AIWaypoint> previous, array<AIWaypoint> next)
    {
        if (!group || next.Count() < 1 || next.Count() > 16) return false;
        array<AIWaypoint> before = {}; group.GetWaypoints(before);
        foreach (AIWaypoint old : before) if (old && previous.Find(old) < 0) return false;
        // Validate the full existing queue before requesting native activation.
        if (!JSOC_ORBAT_AIOrders.EnsureActive(group).IsEmpty()) return false;
        foreach (AIWaypoint remove : before) if (remove) group.RemoveWaypoint(remove);
        foreach (AIWaypoint add : next) group.AddWaypoint(add);
        array<AIWaypoint> installed = {}; group.GetWaypoints(installed);
        bool valid = installed.Count() == next.Count();
        if (valid) for (int i = 0; i < next.Count(); i++) if (installed[i] != next[i]) valid = false;
        if (!valid)
        {
            foreach (AIWaypoint rollback : next) if (rollback) group.RemoveWaypoint(rollback);
            foreach (AIWaypoint restore : before) if (restore) group.AddWaypoint(restore);
            return false;
        }
        foreach (AIWaypoint retired : previous) if (retired) group.GetGroupUtilityComponent().CancelActivitiesRelatedToWaypoint(retired);
        DeleteWaypoints(previous);
        return true;
    }
    static bool Cancel(SCR_AIGroup group, array<AIWaypoint> previous)
    {
        if (!group || !group.GetGroupUtilityComponent()) return false;
        foreach (AIWaypoint waypoint : previous) if (waypoint)
        {
            group.GetGroupUtilityComponent().CancelActivitiesRelatedToWaypoint(waypoint);
            group.RemoveWaypoint(waypoint);
        }
        array<AIWaypoint> installed = {}; group.GetWaypoints(installed);
        foreach (AIWaypoint remaining : installed) if (remaining && previous.Find(remaining) >= 0) return false;
        DeleteWaypoints(previous); return true;
    }
};
