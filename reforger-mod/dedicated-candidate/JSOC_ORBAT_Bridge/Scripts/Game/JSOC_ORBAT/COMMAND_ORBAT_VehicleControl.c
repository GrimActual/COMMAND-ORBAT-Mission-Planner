// Original wheeled-vehicle command lease; distinct from infantry and boarding orders.
class COMMAND_ORBAT_VehicleControlLease
{
    ref JSOC_ORBAT_GMRequest Request;
    SCR_AIGroup Group;
    IEntity TargetVehicle;
    IEntity Leader;
    IEntity Driver;
    string ControlFaction;
    ref SCR_AIGroupVehicle Assignment;
    ref array<IEntity> Members = {};
    ref array<AIWaypoint> Waypoints = {};
    float Deadline;
    float PollAt;
    int Reached;
    bool Installed;
    vector PursuitDestination;
    float PursuitCheckAt;
    static bool Kind(string kind) { return kind == "vehicle-route" || kind == "convoy-attach" || kind == "convoy-detach"; }
    static IEntity CurrentDriver(IEntity vehicle)
    {
        if (!vehicle) return null;
        BaseCompartmentManagerComponent manager = BaseCompartmentManagerComponent.Cast(vehicle.FindComponent(BaseCompartmentManagerComponent));
        if (!manager) return null;
        array<BaseCompartmentSlot> seats = {}; manager.GetCompartments(seats);
        foreach (BaseCompartmentSlot seat : seats) if (seat && seat.GetType() == ECompartmentType.PILOT && seat.GetOccupant()) return seat.GetOccupant();
        return null;
    }
    string Validate(bool checkRegistration = true)
    {
        if (!Group || !TargetVehicle || !TargetVehicle.FindComponent(CarControllerComponent) || !Driver) return "Wheeled vehicle or driver is unavailable";
        if (JSOC_ORBAT_AIOrders.PlayerOccupies(Group) || JSOC_ORBAT_AIOrders.PlayerOccupies(TargetVehicle)) return "Human-controlled crew or occupied vehicle is protected";
        if (ControlFaction.IsEmpty() || ControlFaction == "NO_FACTION" || COMMAND_ORBAT_TransportLease.VehicleFaction(TargetVehicle) != ControlFaction || !COMMAND_ORBAT_SquadControl.SameFaction(Group,ControlFaction)) return "TargetVehicle and crew factions differ or changed";
        if (CurrentDriver(TargetVehicle) != Driver || Members.Find(Driver) < 0) return "The exact AI driver must belong to the controlled crew";
        COMMAND_ORBAT_VehicleInspection seats = COMMAND_ORBAT_VehicleInspection.Read(TargetVehicle);
        if (!seats || seats.players > 0 || seats.other > 0 || seats.occupied != Members.Count()) return "Unsupported, foreign or protected vehicle occupants";
        array<AIAgent> agents = {}; Group.GetAgents(agents);
        if (agents.Count() != Members.Count() || agents.Count() < 1 || agents.Count() > 16) return "TargetVehicle crew membership changed";
        foreach (AIAgent agent : agents)
        {
            if (!agent || !agent.GetControlledEntity() || Members.Find(agent.GetControlledEntity()) < 0 || COMMAND_ORBAT_TransportLease.MountedIn(agent.GetControlledEntity()) != TargetVehicle) return "All exact crew members must remain aboard the selected vehicle";
            SCR_EditableCharacterComponent member = SCR_EditableCharacterComponent.Cast(agent.GetControlledEntity().FindComponent(SCR_EditableCharacterComponent));
            if (!member || member.IsDestroyed()) return "TargetVehicle crew member is unavailable";
        }
        SCR_AIGroupUtilityComponent utility = Group.GetGroupUtilityComponent();
        if (checkRegistration && (!utility || !utility.m_VehicleMgr || !Assignment || utility.m_VehicleMgr.FindVehicle(TargetVehicle) != Assignment || !Assignment.CanMove() || !Assignment.DriverIsConscious())) return "Native vehicle registration, mobility or conscious driver changed";
        if (Request.kind == "convoy-attach")
        {
            if (!Leader || Leader == TargetVehicle || !Leader.FindComponent(CarControllerComponent) || JSOC_ORBAT_AIOrders.PlayerOccupies(Leader) || COMMAND_ORBAT_TransportLease.VehicleFaction(Leader) != ControlFaction) return "Lead vehicle identity, faction or human protection changed";
            COMMAND_ORBAT_VehicleInspection leaderSeats = COMMAND_ORBAT_VehicleInspection.Read(Leader);
            if (!leaderSeats || leaderSeats.players > 0 || leaderSeats.other > 0) return "Lead vehicle occupants are unsupported or protected";
        }
        if (Installed)
        {
            array<AIWaypoint> current = {}; Group.GetWaypoints(current);
            foreach (AIWaypoint point : current) if (point && Waypoints.Find(point) < 0) return "Waypoint authority changed outside COMMAND";
        }
        return "";
    }
    bool CreateWaypoints()
    {
        if (Request.kind == "vehicle-route")
        {
            if (Request.waypoints.Count() < 1 || Request.waypoints.Count() > 16) return false;
            foreach (COMMAND_ORBAT_RoutePoint point : Request.waypoints)
            {
                if (!point || point.worldX < 0 || point.worldX > 13500 || point.worldZ < 0 || point.worldZ > 13500) { COMMAND_ORBAT_RouteOrders.DeleteWaypoints(Waypoints); return false; }
                JSOC_ORBAT_GMRequest move = new JSOC_ORBAT_GMRequest(); move.kind = "ai-move"; move.worldX = point.worldX; move.worldZ = point.worldZ;
                AIWaypoint waypoint = JSOC_ORBAT_AIOrders.Create(move,Group);
                if (!waypoint) { COMMAND_ORBAT_RouteOrders.DeleteWaypoints(Waypoints); return false; }
                waypoint.SetCompletionRadius(8); Waypoints.Insert(waypoint);
            }
            return true;
        }
        AIWaypoint pursuit = CreateConvoyPoint();
        if (!pursuit) return false;
        Waypoints.Insert(pursuit); return true;
    }
    protected AIWaypoint CreateConvoyPoint()
    {
        if (!Leader || !TargetVehicle) return null;
        vector lead = Leader.GetOrigin(); vector follower = TargetVehicle.GetOrigin();
        float dx = lead[0]-follower[0]; float dz = lead[2]-follower[2];
        float distance = Math.Sqrt(dx*dx + dz*dz);
        // Follow a sampled native destination with a 20m gap. Never steer, teleport,
        // alter physics or repeatedly replace an unfinished segment as the leader moves.
        float x = lead[0]; float z = lead[2];
        if (distance > 20) { x -= 20*dx/distance; z -= 20*dz/distance; }
        else { x = follower[0]; z = follower[2]; }
        if (x < 0 || x > 13500 || z < 0 || z > 13500) return null;
        JSOC_ORBAT_GMRequest move = new JSOC_ORBAT_GMRequest(); move.kind = "ai-move"; move.worldX = x; move.worldZ = z;
        AIWaypoint point = JSOC_ORBAT_AIOrders.Create(move,Group);
        if (point) { point.SetCompletionRadius(8); PursuitDestination = Vector(x,0,z); }
        return point;
    }
    string UpdateConvoy()
    {
        float now = GetGame().GetWorld().GetWorldTime();
        if (now < PursuitCheckAt) return "";
        PursuitCheckAt = now + 1000;
        vector follower = TargetVehicle.GetOrigin(); vector lead = Leader.GetOrigin();
        float dx = lead[0]-follower[0]; float dz = lead[2]-follower[2];
        if (dx*dx + dz*dz <= 900) return "";
        float targetX = PursuitDestination[0]-follower[0]; float targetZ = PursuitDestination[2]-follower[2];
        array<AIWaypoint> current = {}; Group.GetWaypoints(current);
        if (current.Count() > 0 && targetX*targetX + targetZ*targetZ > 144) return "";
        AIWaypoint point = CreateConvoyPoint();
        if (!point) return "Native convoy destination unavailable";
        array<AIWaypoint> next = {point};
        if (!COMMAND_ORBAT_RouteOrders.Replace(Group,Waypoints,next))
        {
            COMMAND_ORBAT_RouteOrders.DeleteWaypoints(next);
            return "Convoy waypoint authority changed";
        }
        Waypoints.Copy(next); return "";
    }
    void ObserveRoute()
    {
        if (!TargetVehicle || Request.kind != "vehicle-route" || Reached >= Request.waypoints.Count()) return;
        COMMAND_ORBAT_RoutePoint point = Request.waypoints[Reached]; vector origin = TargetVehicle.GetOrigin();
        float dx = origin[0]-point.worldX; float dz = origin[2]-point.worldZ;
        if (dx*dx + dz*dz <= 144) Reached++;
    }
    void Stop()
    {
        if (Group && Group.GetGroupUtilityComponent()) COMMAND_ORBAT_RouteOrders.Cancel(Group,Waypoints);
        else COMMAND_ORBAT_RouteOrders.DeleteWaypoints(Waypoints);
        Waypoints.Clear();
    }
};
