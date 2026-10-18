// Typed, host-approved GM requests. No arbitrary scripts or file paths are executed.
class JSOC_ORBAT_GMEntityIntent
{
    string unitId;
    string name;
    ResourceName resourceName;
    float worldX;
    float worldZ;
    float headingDegrees;
};
class COMMAND_ORBAT_RoutePoint
{
    float worldX;
    float worldZ;
};
class JSOC_ORBAT_GMRequest
{
    int version;
    string requestId;
    string kind;
    string targetRequestId;
    string sourceMissionSha256;
    string snapshotName;
    string reviewRequestId;
    ref array<ref COMMAND_ORBAT_SnapshotTarget> targets = {};
    string unitId;
    string sourceEntityId;
    string followEntityId;
    string formation;
    string stance;
    string combatMode;
    string leaderRequestId;
    string leaderUnitId;
    string vehicleRequestId;
    string vehicleUnitId;
    int timeoutSeconds;
    bool driverAllowed;
    bool gunnerAllowed;
    bool cargoAllowed;
    float worldX;
    float worldZ;
    int holdSeconds;
    ref array<ref COMMAND_ORBAT_RoutePoint> waypoints = {};
    ref array<ref JSOC_ORBAT_GMEntityIntent> entities = {};
};
class COMMAND_ORBAT_GMOutcome
{
    string status;
    string message;
};
class JSOC_ORBAT_GMRecord
{
    ref JSOC_ORBAT_GMRequest request;
    string phase;
};
class JSOC_ORBAT_GMSpawnGroup
{
    ref map<string, ref COMMAND_ORBAT_SnapshotOrders> SnapshotOrders = new map<string, ref COMMAND_ORBAT_SnapshotOrders>();
    bool Recruited;
    bool Revoked;
    string SourceAlias;
    string ControlFaction;
    IEntity SourceCharacter;
    ref map<string, ref COMMAND_ORBAT_FollowLease> Follows = new map<string, ref COMMAND_ORBAT_FollowLease>();
    ref array<IEntity> Entities = {};
    ref array<string> Ids = {};
    ref array<string> UnitIds = {};
    ref map<string, ref COMMAND_ORBAT_OwnedRoute> Routes = new map<string, ref COMMAND_ORBAT_OwnedRoute>();
    ref map<string, ref COMMAND_ORBAT_PreferenceLease> Preferences = new map<string, ref COMMAND_ORBAT_PreferenceLease>();
    ref map<string, ref COMMAND_ORBAT_VehicleBinding> VehicleBindings = new map<string, ref COMMAND_ORBAT_VehicleBinding>();
    ref map<string, AIWaypoint> Orders = new map<string, AIWaypoint>();
};
class JSOC_ORBAT_GMCallback : RestCallback
{
    JSOC_ORBAT_HostGM Owner;
    string Action;
    bool Stopped;
    void JSOC_ORBAT_GMCallback() { SetOnSuccess(Complete); SetOnError(Complete); }
    void Complete(RestCallback cb) { if (!Stopped && Owner) Owner.Complete(Action, cb.GetHttpCode(), cb.GetData()); }
};
class JSOC_ORBAT_HostGM
{
    JSOC_ORBAT_HostMixedBridge RosterOwner;
    protected RestContext m_Context;
    protected string m_Code;
    protected ref JSOC_ORBAT_GMCallback m_Callback;
    protected ref map<string, ref JSOC_ORBAT_GMSpawnGroup> m_Owned = new map<string, ref JSOC_ORBAT_GMSpawnGroup>();
    protected ref map<string, string> m_Results = new map<string, string>();
    protected string m_Outcome;
    protected bool m_ControlStatusDirty;
    protected int m_ControlStatusRevision;
    protected int m_ControlStatusPosted;
    protected bool m_Busy;
    protected bool m_LegacyRelay;
    protected bool m_OrdersAllowed;
    protected int m_CapabilityMode;
    protected string m_Expected;
    protected ref COMMAND_ORBAT_TransportLease m_Transport;
    protected float m_TransportPollAt;
    ref JSOC_ORBAT_GMRecord Pending;
    string Status = "No GM request loaded";
    void Pair(string endpoint, string code) { Stop(); m_LegacyRelay = false; m_OrdersAllowed = false; m_CapabilityMode = 12; m_Context = GetGame().GetRestApi().GetContext(endpoint); if (m_Context) m_Context.SetTimeout(5); m_Code = code; GetGame().GetCallqueue().CallLater(MaintainControl,1000,true); }
    void Stop() { m_Outcome = ""; m_ControlStatusDirty = false; m_ControlStatusRevision = 0; m_ControlStatusPosted = 0; StopHealing(); StopVehicleControl(); if (m_RestoringSnapshot) SnapshotRollback("Pairing stopped during restore; partial batch removed"); m_SnapshotReviews.Clear(); CancelTransport(); if (GetGame()) GetGame().GetCallqueue().Remove(MaintainControl); array<string> releasedLeases = {}; foreach (string releaseKey, JSOC_ORBAT_GMSpawnGroup releaseBatch : m_Owned) { ClearPreferences(releaseBatch); ClearVehicleBindings(releaseBatch); if (releaseBatch.Recruited || releaseBatch.Follows.Count() > 0) ClearControlledOrders(releaseBatch); if (releaseBatch.Recruited) releasedLeases.Insert(releaseKey); } foreach (string retiredLease : releasedLeases) m_Owned.Remove(retiredLease); if (m_Callback) { m_Callback.Stopped = true; m_Callback.Owner = null; } m_Callback = null; m_Context = null; m_Code = ""; m_Busy = false; m_OrdersAllowed = false; Pending = null; }
    void Post(string action, string body)
    {
        if (!Replication.IsServer() || !m_Context || m_Busy) return;
        if (action == "result")
        {
            JsonLoadContext receipt = new JsonLoadContext(); COMMAND_ORBAT_GMOutcome outcome;
            if (receipt.LoadFromString(body) && receipt.ReadValue("result",outcome) && outcome)
                m_Outcome = outcome.status + ": " + outcome.message;
        }
        m_Busy = true; m_Callback = new JSOC_ORBAT_GMCallback(); m_Callback.Owner = this; m_Callback.Action = action;
        m_Context.POST(m_Callback, "gm-" + action, body);
    }
    void Poll()
    {
        if (m_Transport || m_RestoringSnapshot || m_Driving || m_Healing) return;
        Status = "Checking paired GM requests";
        if (m_CapabilityMode >= 12)
        {
            m_ControlStatusPosted = m_ControlStatusRevision;
            string retired;
            foreach (string leaseId, JSOC_ORBAT_GMSpawnGroup lease : m_Owned)
            {
                if (!lease.Recruited || !lease.Revoked) continue;
                if (!retired.IsEmpty()) retired += ",";
                retired += "\"" + leaseId + "\"";
            }
            Post("poll",string.Format("{\"token\":\"%1\",\"revokedTargets\":[%2],\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\",\"ai-formation-v1\",\"ai-stance-v1\",\"ai-fire-policy-v1\",\"vehicle-inspection-v1\",\"ai-transport-v1\",\"scenario-snapshots-v1\",\"vehicle-control-v1\",\"convoy-v1\",\"ai-healing-v1\",\"ai-control-status-v1\"]}",m_Code,retired));
        }
        else if (m_LegacyRelay) Post("poll",string.Format("{\"token\":\"%1\"}",m_Code));
        else if (m_CapabilityMode == 1) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\"]}",m_Code));
        else if (m_CapabilityMode == 2) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\"]}",m_Code));
        else if (m_CapabilityMode == 3) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\"]}",m_Code));
        else if (m_CapabilityMode == 4) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\"]}",m_Code));
        else if (m_CapabilityMode == 5) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\",\"ai-formation-v1\",\"ai-stance-v1\",\"ai-fire-policy-v1\"]}",m_Code));
        else if (m_CapabilityMode == 6) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\",\"ai-formation-v1\",\"ai-stance-v1\",\"ai-fire-policy-v1\",\"vehicle-inspection-v1\"]}",m_Code));
        else if (m_CapabilityMode == 7) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\",\"ai-formation-v1\",\"ai-stance-v1\",\"ai-fire-policy-v1\",\"vehicle-inspection-v1\",\"ai-transport-v1\"]}",m_Code));
        else if (m_CapabilityMode == 8) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\",\"ai-formation-v1\",\"ai-stance-v1\",\"ai-fire-policy-v1\",\"vehicle-inspection-v1\",\"ai-transport-v1\",\"scenario-snapshots-v1\"]}",m_Code));
        else if (m_CapabilityMode == 9) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\",\"ai-formation-v1\",\"ai-stance-v1\",\"ai-fire-policy-v1\",\"vehicle-inspection-v1\",\"ai-transport-v1\",\"scenario-snapshots-v1\",\"vehicle-control-v1\"]}",m_Code));
        else if (m_CapabilityMode == 10) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\",\"ai-formation-v1\",\"ai-stance-v1\",\"ai-fire-policy-v1\",\"vehicle-inspection-v1\",\"ai-transport-v1\",\"scenario-snapshots-v1\",\"vehicle-control-v1\",\"convoy-v1\"]}",m_Code));
        else Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\",\"ai-formation-v1\",\"ai-stance-v1\",\"ai-fire-policy-v1\",\"vehicle-inspection-v1\",\"ai-transport-v1\",\"scenario-snapshots-v1\",\"vehicle-control-v1\",\"convoy-v1\",\"ai-healing-v1\"]}",m_Code));
    }
    bool CanApprove() { return Pending && Pending.request && !m_Busy && !m_Transport && !m_RestoringSnapshot && !m_Driving && !m_Healing; }
    int PreviewCount()
    {
        if (!Pending || !Pending.request) return 0;
        if (Pending.request.kind == "scenario-restore")
        {
            COMMAND_ORBAT_Snapshot reviewed;
            if (m_SnapshotReviews.Find(Pending.request.reviewRequestId,reviewed)) return reviewed.entities.Count();
            return 0;
        }
        if (Pending.request.kind == "scenario-save-current") return Pending.request.targets.Count();
        if (Pending.request.kind == "vehicle-route") return Pending.request.waypoints.Count();
        if (Pending.request.kind == "ai-route") return Pending.request.waypoints.Count();
        return Pending.request.entities.Count();
    }
    string Preview(int index)
    {
        if (!Pending || !Pending.request) return m_Outcome;
        JSOC_ORBAT_GMRequest request = Pending.request;
        if (request.kind == "ai-diagnose") return "READ-ONLY AI EXECUTION CHECK: reports group/member activation, leader position, current waypoint and control authority. Does not move units or change settings.";
        if (request.kind == "ai-heal") return string.Format("TREAT ONE WOUNDED SQUAD MEMBER: %1 / %2. At approval choose one currently bleeding, treatable AI member inside this exact on-foot squad. Native medic and bandage required. Timeout %3 seconds. No health edits, resurrection or treatment of players. Completion requires observed native treatment, stopped bleeding and consumed bandage.",request.targetRequestId,request.unitId,request.timeoutSeconds);
        if (COMMAND_ORBAT_VehicleControlLease.Kind(request.kind))
        {
            string text = string.Format("WHEELED VEHICLE %1: crew %2 / %3, vehicle %4 / %5, lead vehicle %6 / %7. Timeout %8 seconds. Requires the exact same-faction mounted AI crew and conscious owned driver. Player-occupied vehicles are protected.",request.kind,request.targetRequestId,request.unitId,request.vehicleRequestId,request.vehicleUnitId,request.leaderRequestId,request.leaderUnitId,request.timeoutSeconds);
            if (request.kind == "vehicle-route" && index >= 0 && index < request.waypoints.Count()) text += string.Format(" Route point %1 / %2: X %3 / Z %4. NEXT reviews all points. Execution requires observed ordered vehicle arrivals.",index+1,request.waypoints.Count(),request.waypoints[index].worldX,request.waypoints[index].worldZ);
            if (request.kind == "convoy-attach") text += " Installs bounded native vehicle pursuit with sampled destinations and a 20m gap. Expiry or changed eligibility stops this owned follow. Installation is not proof of convoy travel.";
            if (request.kind == "convoy-detach") text += " Stops only this owned convoy follow. Occupants are not ejected.";
            return text;
        }
        if (SnapshotKind(request.kind)) return PreviewSnapshot(request,index);
        if (request.kind == "ai-embark" || request.kind == "ai-dismount") return string.Format("TRANSPORT %1: squad %2 / %3, vehicle %4 / %5. Driver %6, gunner %7, cargo %8. Timeout %9 seconds. Player-occupied vehicles are protected. Completion requires observed member state.",request.kind,request.targetRequestId,request.unitId,request.vehicleRequestId,request.vehicleUnitId,request.driverAllowed,request.gunnerAllowed,request.cargoAllowed,request.timeoutSeconds);
        if (request.kind == "vehicle-inspect") return "READ-ONLY VEHICLE INSPECTION for " + request.targetRequestId + " / " + request.unitId + ". Reports native seat capacity, available roles, locks, reservations and occupant counts. Does not move, reserve, embark or eject anyone.";
        if (request.kind == "ai-formation") return "FORMATION " + request.formation + " for " + request.targetRequestId + " / " + request.unitId + ". Native definition is checked before replacement. Restore returns the prior formation; terrain-adaptive Auto is not provided.";
        if (request.kind == "ai-stance") return "AI STANCE " + request.stance + " for " + request.targetRequestId + " / " + request.unitId + ". Persistent squad setting; Auto removes only the Companion override. Physical pose and combat response are not confirmed.";
        if (request.kind == "ai-combat-mode") return "NATIVE FIRE POLICY " + request.combatMode + " for " + request.targetRequestId + " / " + request.unitId + ". Auto removes only the Companion override. Strict no-fire behavior under attack still requires combat acceptance.";
        if (request.kind == "ai-recruit") return "RECRUIT EXISTING AI SQUAD from selected live identity " + request.sourceEntityId + ". Only its allowed same-faction on-foot AI group is eligible. Existing foreign waypoints block recruitment. Release returns control without deleting the squad.";
        if (request.kind == "ai-release") return "RELEASE control of recruited squad " + request.targetRequestId + " / " + request.unitId + ". Only Companion-owned waypoints are cleared; no squad is deleted.";
        if (request.kind == "ai-follow") return string.Format("FOLLOW selected player %1 for %2 seconds. Squad %3 / %4. Requires selected same-faction player. Follow stops on expiry, target loss/respawn, revoked selection or incompatible membership. Arrival/formation is not confirmed.",request.followEntityId,request.holdSeconds,request.targetRequestId,request.unitId);
        if (request.kind == "ai-route")
        {
            if (index < 0 || index >= request.waypoints.Count()) return "Invalid route preview";
            COMMAND_ORBAT_RoutePoint point = request.waypoints[index];
            return string.Format("INFANTRY ROUTE: point %1 / %2\nGroup %3 / unit %4\nX %5 / Z %6\nReview every point with NEXT. Approval installs the full route; arrival is not confirmed.",index+1,request.waypoints.Count(),request.targetRequestId,request.unitId,point.worldX,point.worldZ);
        }
        if (request.kind == "ai-move") return string.Format("MOVE AI infantry group %1 / planned unit %2\nDestination X %3 / Z %4\nReplaces only the previous Companion waypoint. Player-controlled or mounted groups are blocked. Arrival is not confirmed by acceptance.",request.targetRequestId,request.unitId,request.worldX,request.worldZ);
        if (request.kind == "ai-hold") return string.Format("HOLD AI infantry group %1 / planned unit %2\nWait at current leader position for %3 seconds. AI may still react to combat.\nPlayer-controlled or mounted groups are blocked.",request.targetRequestId,request.unitId,request.holdSeconds);
        if (request.kind == "ai-defend") return string.Format("DEFEND infantry AI group %1 / planned unit %2\nX %3 / Z %4 for %5 seconds, using the native defend preset.\nApproval confirms installation, not arrival or successful defence.",request.targetRequestId,request.unitId,request.worldX,request.worldZ,request.holdSeconds);
        if (request.kind == "ai-halt") return "CANCEL the Companion-owned movement/defend waypoint for group " + request.targetRequestId + " / unit " + request.unitId + ". Combat reactions remain enabled.";
        if (request.kind == "remove") return "REMOVE bridge-created group " + request.targetRequestId;
        if (index < 0 || index >= request.entities.Count()) return Status;
        JSOC_ORBAT_GMEntityIntent entity = request.entities[index];
        return string.Format("%1 / %2: %3\n%4\nX %5 / Z %6 / heading %7\nTerrain height will be resolved. Full batch needs host approval.",index+1,request.entities.Count(),entity.name,entity.resourceName,entity.worldX,entity.worldZ,entity.headingDegrees);
    }
    void Approve()
    {
        if (!Pending || !Pending.request || m_Transport || m_RestoringSnapshot || m_Driving || m_Healing) return;
        m_Expected = Pending.request.requestId;
        Status = "Checking approval and expiry with relay";
        Post("approve", string.Format("{\"token\":\"%1\",\"requestId\":\"%2\"}", m_Code, m_Expected));
    }
    void Reject()
    {
        if (!Pending || !Pending.request) return;
        Report(Pending.request.requestId, "rejected", "Host rejected the request", ""); Pending = null;
    }
    void Complete(string action, int code, string data)
    {
        m_Busy = false;
        if (action == "poll" && code == 409 && !m_LegacyRelay) { m_CapabilityMode--; m_LegacyRelay = m_CapabilityMode <= 0; m_OrdersAllowed = false; Poll(); return; }
        if (code == 401 || code == 423) { Stop(); Status = "Pairing revoked; recruited control and follow orders released"; return; }
        if (code != 200)
        {
            if (code == 409 && (action == "result" || action == "approve")) Pending = null;
            if (code == 409 && action == "approve")
            {
                Status = "Approval unavailable";
                m_Outcome = "Request expired or already finished. Check pending request again.";
            }
            else if (action == "result") Status = "Result delivery failed; the execution outcome is shown below. Check Companion results before retrying.";
            else Status = "GM relay request failed. Check the paired connection and try again.";
            return;
        }
        if (action == "poll" && !m_LegacyRelay) { m_OrdersAllowed = true; if (m_ControlStatusPosted == m_ControlStatusRevision) m_ControlStatusDirty = false; }
        if (action == "result") { Status = "Result delivered to Companion"; Pending = null; return; }
        if (data.Length() > 32768) { Status = "Oversized GM response rejected"; return; }
        JsonLoadContext json = new JsonLoadContext(); JSOC_ORBAT_GMRecord record;
        if (!json.LoadFromString(data) || !json.ReadValue("record", record) || !record || !record.request) { if (m_Healing) StopHealing(); if (m_Transport) CancelTransport(); if (m_Driving) { m_Driving.Stop(); m_Driving = null; } Pending = null; Status = "No pending GM request"; return; }
        if (action == "poll" && m_Healing)
        {
            if (record.phase != "approved" || record.request.requestId != m_Healing.Request.requestId) { StopHealing(); Pending = null; Status = "Healing cancelled or expired"; }
            return;
        }
        if (action == "poll" && m_Driving)
        {
            if (record.phase != "approved" || record.request.requestId != m_Driving.Request.requestId) { m_Driving.Stop(); m_Driving = null; Pending = null; Status = "Vehicle route cancelled or expired"; }
            return;
        }
        if (action == "poll" && m_Transport)
        {
            if (record.phase != "approved" || record.request.requestId != m_Transport.Request.requestId)
            {
                CancelTransport(); Pending = null; Status = "Transport cancelled or expired";
            }
            return;
        }
        if (action == "approve")
        {
            if (record.phase != "approved" || record.request.requestId != m_Expected) { Status = "Approval identity mismatch"; return; }
            ExecuteApproved(record.request); return;
        }
        Pending = record;
        if (record.request.kind == "ai-move" || record.request.kind == "ai-hold" || record.request.kind == "ai-defend" || record.request.kind == "ai-halt" || record.request.kind == "ai-route" || record.request.kind == "ai-recruit" || record.request.kind == "ai-release" || record.request.kind == "ai-follow" || record.request.kind == "ai-formation" || record.request.kind == "ai-stance" || record.request.kind == "ai-combat-mode") Status = "Pending infantry AI order. Review target and waypoint before approving.";
        else Status = string.Format("Pending %1 request %2 (%3 units). Review before approving.", record.request.kind, record.request.requestId, record.request.entities.Count());
    }
    protected bool SafeKey(string value)
    {
        if (value.IsEmpty() || value.Length() > 64) return false;
        string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
        for (int i = 0; i < value.Length(); i++) if (chars.IndexOf(value.Substring(i,1)) < 0) return false;
        return true;
    }
    protected bool SafeResource(string value)
    {
        if (value.Length() < 22 || value.Length() > 530 || value.Substring(0,1) != "{" || value.Substring(17,1) != "}" || value.Substring(value.Length()-3,3) != ".et") return false;
        string hex = "0123456789abcdefABCDEF";
        for (int i = 1; i < 17; i++) if (hex.IndexOf(value.Substring(i,1)) < 0) return false;
        if (value.IndexOf("..") >= 0 || value.IndexOf(":") >= 0 || value.IndexOf("\\") >= 0 || value.IndexOf("%") >= 0 || value.IndexOf("?") >= 0 || value.IndexOf("#") >= 0 || value.Substring(18,1) == "/") return false;
        return true;
    }
    void ExecuteApproved(JSOC_ORBAT_GMRequest request)
    {
        if (!Replication.IsServer() || !request || (request.version != 1 && request.version != 2 && request.version != 3 && request.version != 4) || !SafeKey(request.requestId) || request.requestId.Length() > 40) return;
        string cached;
        if (m_Results.Find(request.requestId, cached)) { Post("result", cached); return; }
        if (m_Results.Count() >= 100) { Status = "Scene GM command budget reached"; return; }
        if (request.kind == "ai-heal") { BeginHealing(request); return; }
        if (COMMAND_ORBAT_VehicleControlLease.Kind(request.kind)) { ExecuteVehicleControl(request); return; }
        if (SnapshotKind(request.kind)) { ExecuteSnapshot(request); return; }
        if (request.kind == "ai-embark" || request.kind == "ai-dismount") { BeginTransport(request); return; }
        if (request.kind == "vehicle-inspect") { InspectVehicle(request); return; }
        if (request.kind == "ai-recruit") { Recruit(request); return; }
        if (request.kind == "ai-diagnose" || request.kind == "ai-move" || request.kind == "ai-hold" || request.kind == "ai-defend" || request.kind == "ai-halt" || request.kind == "ai-route" || request.kind == "ai-release" || request.kind == "ai-follow" || request.kind == "ai-formation" || request.kind == "ai-stance" || request.kind == "ai-combat-mode") { ExecuteAIOrder(request); return; }
        if (request.version != 1) { Report(request.requestId,"failed","Unsupported GM version for this action",""); return; }
        if (request.kind == "remove")
        {
            JSOC_ORBAT_GMSpawnGroup group;
            if (!SafeKey(request.targetRequestId) || !m_Owned.Find(request.targetRequestId, group)) { Report(request.requestId, "failed", "Only bridge-created groups can be removed", ""); return; }
            if (group.Recruited) { Report(request.requestId,"failed","Recruited squads cannot be deleted; release control instead",""); return; }
            PlayerManager manager = GetGame().GetPlayerManager();
            if (manager)
            {
                array<int> players = {}; manager.GetPlayers(players);
                foreach (int player : players)
                {
                    IEntity controlled = manager.GetPlayerControlledEntity(player);
                    foreach (IEntity root : group.Entities)
                    {
                        IEntity ancestor = controlled; int depth = 0;
                        while (ancestor && depth < 64) { if (ancestor == root) { Report(request.requestId,"failed","A player occupies this group; leave it before removal",""); return; } ancestor = ancestor.GetParent(); depth++; }
                        if (controlled)
                        {
                            SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(controlled.FindComponent(SCR_EditableCharacterComponent));
                            if (editable)
                            {
                                SCR_EditableEntityComponent vehicle = editable.GetVehicle(); SCR_EditableEntityComponent aiGroup = editable.GetAIGroup();
                                if ((vehicle && vehicle.GetOwnerScripted() == root) || (aiGroup && aiGroup.GetOwnerScripted() == root)) { Report(request.requestId,"failed","A player occupies this group; leave it before removal",""); return; }
                            }
                        }
                    }
                }
            }
            foreach (string routeUnit, COMMAND_ORBAT_OwnedRoute route : group.Routes) if (route) COMMAND_ORBAT_RouteOrders.DeleteWaypoints(route.Waypoints);
            group.Routes.Clear();
            foreach (string orderUnit, AIWaypoint orderWaypoint : group.Orders) if (orderWaypoint) SCR_EntityHelper.DeleteEntityAndChildren(orderWaypoint);
            group.Orders.Clear();
            foreach (IEntity createdEntity : group.Entities) if (createdEntity) SCR_EntityHelper.DeleteEntityAndChildren(createdEntity);
            m_Owned.Remove(request.targetRequestId); Report(request.requestId, "executed", "Bridge-created group removed", ""); return;
        }
        if (request.kind != "spawn" || request.entities.Count() < 1 || request.entities.Count() > 16) { Report(request.requestId, "failed", "Unsupported spawn request", ""); return; }
        int ownedCount = 0; foreach (string ownedKey, JSOC_ORBAT_GMSpawnGroup ownedGroup : m_Owned) { foreach (IEntity existing : ownedGroup.Entities) { if (existing) ownedCount++; } }
        if (ownedCount + request.entities.Count() > 60) { Report(request.requestId, "failed", "60 bridge-created entities maximum", ""); return; }
        ref array<ref Resource> resources = {}; array<string> unitIds = {};
        foreach (JSOC_ORBAT_GMEntityIntent intent : request.entities)
        {
            if (!intent || !SafeKey(intent.unitId) || unitIds.Find(intent.unitId) >= 0 || !SafeResource(intent.resourceName) || !(intent.worldX >= 0 && intent.worldX <= 13500) || !(intent.worldZ >= 0 && intent.worldZ <= 13500) || !(intent.headingDegrees >= 0 && intent.headingDegrees < 360)) { Report(request.requestId, "failed", "Invalid native spawn intent", ""); return; }
            unitIds.Insert(intent.unitId); ref Resource resource = Resource.Load(intent.resourceName);
            if (!resource || !resource.IsValid() || !resource.GetResource() || !resource.GetResource().ToEntitySource() || resource.GetResource().GetResourceName() != intent.resourceName) { Report(request.requestId, "failed", "Required prefab is unavailable on this server", ""); return; }
            resources.Insert(resource);
        }
        JSOC_ORBAT_GMSpawnGroup created = new JSOC_ORBAT_GMSpawnGroup(); string resultIds;
        for (int i = 0; i < request.entities.Count(); i++)
        {
            JSOC_ORBAT_GMEntityIntent entity = request.entities[i]; EntitySpawnParams parameters = new EntitySpawnParams(); parameters.TransformMode = ETransformMode.WORLD;
            Math3D.AnglesToMatrix(Vector(entity.headingDegrees, 0, 0), parameters.Transform);
            parameters.Transform[3] = Vector(entity.worldX, GetGame().GetWorld().GetSurfaceY(entity.worldX, entity.worldZ), entity.worldZ);
            IEntity spawned = GetGame().SpawnEntityPrefab(resources[i], GetGame().GetWorld(), parameters);
            if (!spawned)
            {
                foreach (IEntity partial : created.Entities) if (partial) SCR_EntityHelper.DeleteEntityAndChildren(partial);
                Report(request.requestId, "failed", "Spawn failed; partial batch removed", ""); return;
            }
            string createdId = string.Format("spawn_%1_%2", request.requestId, i);
            SnapshotTrackCreated(spawned);
            created.Entities.Insert(spawned); created.Ids.Insert(createdId); created.UnitIds.Insert(entity.unitId);
            if (!resultIds.IsEmpty()) resultIds += ","; resultIds += "\"" + createdId + "\"";
        }
        m_Owned.Insert(request.requestId, created); Report(request.requestId, "executed", "Approved prefab batch spawned", resultIds);
    }
    protected void CancelTransport(bool keepVehicleBinding = false)
    {
        if (GetGame()) GetGame().GetCallqueue().Remove(TickTransport);
        if (!m_Transport) return;
        m_Transport.ObserveGeneratedActivities();
        if (!keepVehicleBinding)
        {
            JSOC_ORBAT_GMSpawnGroup batch;
            if (m_Owned.Find(m_Transport.Request.targetRequestId,batch)) ClearVehicleBinding(batch,m_Transport.Request.unitId,m_Transport.Group);
        }
        m_Transport.StopMemberBehaviors();
        array<AIWaypoint> points = {}; if (m_Transport.Waypoint) points.Insert(m_Transport.Waypoint);
        if (m_Transport.Group) COMMAND_ORBAT_RouteOrders.Cancel(m_Transport.Group,points);
        else COMMAND_ORBAT_RouteOrders.DeleteWaypoints(points);
        BaseCompartmentManagerComponent compartments;
        if (m_Transport.Target) compartments = BaseCompartmentManagerComponent.Cast(m_Transport.Target.FindComponent(BaseCompartmentManagerComponent));
        if (compartments)
        {
            array<BaseCompartmentSlot> seats = {}; compartments.GetCompartments(seats);
            foreach (BaseCompartmentSlot seat : seats)
            {
                if (!seat) continue;
                foreach (IEntity member : m_Transport.Members)
                {
                    if (member && !JSOC_ORBAT_AIOrders.PlayerOccupies(member) && seat.IsReservedBy(member)) seat.SetReserved(null);
                }
            }
        }
        m_Transport = null;
    }
    protected void ClearVehicleBinding(JSOC_ORBAT_GMSpawnGroup batch, string unit, SCR_AIGroup group)
    {
        COMMAND_ORBAT_VehicleBinding binding;
        if (!batch.VehicleBindings.Find(unit,binding)) return;
        if (binding && binding.Usage && group && group.GetGroupUtilityComponent())
        {
            SCR_AIGroupUtilityComponent utility = group.GetGroupUtilityComponent();
            if (binding.OwnedAssignment && utility.m_VehicleMgr && utility.m_VehicleMgr.FindVehicle(binding.Usage) == binding.OwnedAssignment) utility.m_VehicleMgr.RemoveVehicle(binding.Usage);
            if (binding.AddedUsable) utility.RemoveUsableVehicle(binding.Usage);
        }
        batch.VehicleBindings.Remove(unit);
    }
    protected void ClearVehicleBindings(JSOC_ORBAT_GMSpawnGroup batch)
    {
        foreach (int index, IEntity root : batch.Entities) ClearVehicleBinding(batch,batch.UnitIds[index],SCR_AIGroup.Cast(root));
    }
    protected void BeginTransport(JSOC_ORBAT_GMRequest request)
    {
        if (request.version != 2 || !m_OrdersAllowed || m_CapabilityMode < 7 || m_Transport || !SafeKey(request.targetRequestId) || !SafeKey(request.unitId) || !SafeKey(request.vehicleRequestId) || !SafeKey(request.vehicleUnitId)) { Report(request.requestId,"failed","Transport requires negotiated support and exact paired identities",""); return; }
        if (m_Convoys.Contains(VehicleControlKey(request))) { Report(request.requestId,"failed","Detach convoy follow before changing transport",""); return; }
        JSOC_ORBAT_GMSpawnGroup squadBatch; JSOC_ORBAT_GMSpawnGroup vehicleBatch;
        if (!m_Owned.Find(request.targetRequestId,squadBatch) || !m_Owned.Find(request.vehicleRequestId,vehicleBatch) || vehicleBatch.Recruited || squadBatch.Recruited && !LeaseValid(squadBatch)) { Report(request.requestId,"failed","Transport ownership or recruited authority unavailable",""); return; }
        int squadIndex = squadBatch.UnitIds.Find(request.unitId); int vehicleIndex = vehicleBatch.UnitIds.Find(request.vehicleUnitId);
        if (squadIndex < 0 || squadIndex >= squadBatch.Entities.Count() || vehicleIndex < 0 || vehicleIndex >= vehicleBatch.Entities.Count()) { Report(request.requestId,"failed","Transport identity unavailable",""); return; }
        SCR_AIGroup group = SCR_AIGroup.Cast(squadBatch.Entities[squadIndex]);
        array<AIWaypoint> previous = {}; COMMAND_ORBAT_OwnedRoute route; squadBatch.Routes.Find(request.unitId,route);
        if (route) previous = route.Waypoints;
        string problem = JSOC_ORBAT_AIOrders.Check(group,null,previous,request.kind == "ai-dismount");
        if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
        COMMAND_ORBAT_TransportLease lease = COMMAND_ORBAT_TransportLease.Prepare(request,group,vehicleBatch.Entities[vehicleIndex],problem);
        if (!lease) { Report(request.requestId,"failed",problem,""); return; }
        SCR_AIVehicleUsageComponent usage = SCR_AIVehicleUsageComponent.Cast(lease.Target.FindComponent(SCR_AIVehicleUsageComponent));
        if (!usage) { SCR_EntityHelper.DeleteEntityAndChildren(lease.Waypoint); Report(request.requestId,"failed","Vehicle has no supported native AI usage component",""); return; }
        SCR_AIGroupUtilityComponent utility = group.GetGroupUtilityComponent();
        if (!utility.m_VehicleMgr) { SCR_EntityHelper.DeleteEntityAndChildren(lease.Waypoint); Report(request.requestId,"failed","Native group vehicle manager unavailable",""); return; }
        COMMAND_ORBAT_VehicleBinding binding;
        if (squadBatch.VehicleBindings.Find(request.unitId,binding) && binding.Usage != usage)
        {
            if (binding.Usage && binding.Usage.IsOccupiedByGroup(group)) { SCR_EntityHelper.DeleteEntityAndChildren(lease.Waypoint); Report(request.requestId,"failed","Dismount the previous controlled vehicle first",""); return; }
            ClearVehicleBinding(squadBatch,request.unitId,group); binding = null;
        }
        bool createdBinding = false;
        if (!binding && request.kind == "ai-embark")
        {
            binding = new COMMAND_ORBAT_VehicleBinding(); binding.Usage = usage;
            SCR_AIGroupVehicle previousAssignment = utility.m_VehicleMgr.FindVehicle(usage);
            binding.AddedUsable = !utility.IsUsableVehicle(usage);
            if (binding.AddedUsable) utility.AddUsableVehicle(usage);
            if (!previousAssignment) binding.OwnedAssignment = utility.m_VehicleMgr.TryAddVehicle(usage);
            squadBatch.VehicleBindings.Set(request.unitId,binding); createdBinding = true;
            if (!utility.IsUsableVehicle(usage) || !utility.m_VehicleMgr.FindVehicle(usage))
            {
                ClearVehicleBinding(squadBatch,request.unitId,group); SCR_EntityHelper.DeleteEntityAndChildren(lease.Waypoint); Report(request.requestId,"failed","Native vehicle registration failed",""); return;
            }
        }
        if (binding) lease.OwnedAssignment = binding.OwnedAssignment;
        array<AIWaypoint> next = {lease.Waypoint};
        if (!COMMAND_ORBAT_RouteOrders.Replace(group,previous,next))
        {
            if (createdBinding) ClearVehicleBinding(squadBatch,request.unitId,group);
            COMMAND_ORBAT_RouteOrders.DeleteWaypoints(next); Report(request.requestId,"failed","Transport waypoint attachment failed",""); return;
        }
        SnapshotForgetMovement(squadBatch,request.unitId);
        squadBatch.Routes.Remove(request.unitId); squadBatch.Orders.Remove(request.unitId); squadBatch.Follows.Remove(request.unitId);
        m_Transport = lease; Status = "Transport running; waiting for observed member completion";
        GetGame().GetCallqueue().CallLater(TickTransport,200,true);
    }
    protected void TickTransport()
    {
        if (!m_Transport || m_Busy) return;
        m_Transport.ObserveGeneratedActivities();
        string problem = m_Transport.Validate(false); JSOC_ORBAT_GMSpawnGroup batch;
        if (!m_Owned.Find(m_Transport.Request.targetRequestId,batch) || batch.Recruited && !LeaseValid(batch)) problem = "Transport squad authority expired";
        string id = m_Transport.Request.requestId; int completed = m_Transport.CompletedMembers(); int total = m_Transport.Members.Count();
        bool expired = GetGame().GetWorld().GetWorldTime() >= m_Transport.Deadline;
        if (problem.IsEmpty() && completed < total && !expired)
        {
            float now = GetGame().GetWorld().GetWorldTime();
            if (now >= m_TransportPollAt)
            {
                m_TransportPollAt = now + 1000;
                Post("poll",string.Format("{\"token\":\"%1\"}",m_Code));
            }
            return;
        }
        bool success = problem.IsEmpty() && completed == total;
        if (problem.IsEmpty() && expired) problem = "timed out";
        bool retainBinding = success && m_Transport.Request.kind == "ai-embark";
        CancelTransport(retainBinding);
        if (success) Report(id,"executed",string.Format("Observed transport completion: %1 of %2 members",completed,total),"");
        else Report(id,"failed",string.Format("Transport stopped: %1 of %2 completed; %3; no forced movement",completed,total,problem),"");
    }
    protected void InspectVehicle(JSOC_ORBAT_GMRequest request)
    {
        if (request.version != 2 || !m_OrdersAllowed || m_CapabilityMode < 6) { Report(request.requestId,"failed","Vehicle inspection capability not negotiated",""); return; }
        JSOC_ORBAT_GMSpawnGroup batch;
        if (!m_Owned.Find(request.targetRequestId,batch) || batch.Recruited) { Report(request.requestId,"failed","Choose a bridge-created vehicle from this pairing",""); return; }
        int index = batch.UnitIds.Find(request.unitId);
        if (index < 0 || index >= batch.Entities.Count()) { Report(request.requestId,"failed","Vehicle target is unavailable",""); return; }
        COMMAND_ORBAT_VehicleInspection snapshot = COMMAND_ORBAT_VehicleInspection.Read(batch.Entities[index]);
        if (!snapshot) { Report(request.requestId,"failed","Target has no supported 1 to 128 seat native compartment manager",""); return; }
        string body = string.Format("{\"token\":\"%1\",\"result\":{\"requestId\":\"%2\",\"status\":\"executed\",\"message\":\"Read-only vehicle seat snapshot; no occupants moved\",\"createdIds\":[],\"vehicle\":%3}}",m_Code,request.requestId,snapshot.ToJson());
        m_Results.Insert(request.requestId,body); Status = "Vehicle inspection completed; no occupants moved"; Post("result",body);
    }
    protected void ClearPreference(JSOC_ORBAT_GMSpawnGroup batch, string unit, SCR_AIGroup group)
    {
        COMMAND_ORBAT_PreferenceLease preference;
        if (batch.Preferences.Find(unit,preference)) COMMAND_ORBAT_SquadPreferences.Release(group,preference);
        batch.Preferences.Remove(unit);
    }
    protected void ClearPreferences(JSOC_ORBAT_GMSpawnGroup batch)
    {
        foreach (int index, IEntity root : batch.Entities) ClearPreference(batch,batch.UnitIds[index],SCR_AIGroup.Cast(root));
    }
    protected void ClearControlledOrders(JSOC_ORBAT_GMSpawnGroup batch)
    {
        if (!batch) return;
        ClearPreferences(batch);
        ClearVehicleBindings(batch);
        foreach (string unit, COMMAND_ORBAT_OwnedRoute route : batch.Routes)
        {
            int index = batch.UnitIds.Find(unit); SCR_AIGroup group;
            if (index >= 0 && index < batch.Entities.Count()) group = SCR_AIGroup.Cast(batch.Entities[index]);
            if (route && group) COMMAND_ORBAT_RouteOrders.Cancel(group,route.Waypoints);
            else if (route) COMMAND_ORBAT_RouteOrders.DeleteWaypoints(route.Waypoints);
        }
        batch.Routes.Clear(); batch.Orders.Clear(); batch.Follows.Clear();
    }
    protected bool LeaseValid(JSOC_ORBAT_GMSpawnGroup batch)
    {
        if (!batch || !batch.Recruited || batch.Revoked || !RosterOwner || batch.Entities.Count() != 1) return false;
        IEntity source = RosterOwner.ResolveCommandEntity(batch.SourceAlias,false);
        SCR_AIGroup group = SCR_AIGroup.Cast(batch.Entities[0]);
        return source && source == batch.SourceCharacter && COMMAND_ORBAT_SquadControl.GroupFor(source) == group && COMMAND_ORBAT_SquadControl.SameFaction(group,batch.ControlFaction);
    }
    protected void MaintainControl()
    {
        if (!m_Context || !Replication.IsServer()) return;
        foreach (string id, JSOC_ORBAT_GMSpawnGroup batch : m_Owned)
        {
            if (batch.Recruited && !LeaseValid(batch)) { if (!batch.Revoked) { ClearControlledOrders(batch); batch.Revoked = true; m_ControlStatusDirty = true; m_ControlStatusRevision++; } continue; }
            if (!batch.Recruited && batch.Follows.Count() == 0 && batch.Preferences.Count() == 0) continue;
            foreach (int index, IEntity root : batch.Entities)
            {
                string unit = batch.UnitIds[index];
                COMMAND_ORBAT_FollowLease follow; batch.Follows.Find(unit,follow);
                if (!batch.Recruited && !follow && !batch.Preferences.Contains(unit)) continue;
                SCR_AIGroup group = SCR_AIGroup.Cast(root);
                if ((m_Transport && m_Transport.Group == group) || (m_Healing && m_Healing.Group == group) || VehicleControlActiveFor(group))
                {
                    continue;
                }
                AIWaypoint point;
                batch.Orders.Find(unit,point);
                COMMAND_ORBAT_OwnedRoute route; batch.Routes.Find(unit,route); array<AIWaypoint> points = {}; if (route) points = route.Waypoints;
                bool invalidControl = !JSOC_ORBAT_AIOrders.Check(group,point,points,true).IsEmpty(); bool invalid = invalidControl;
                if (follow)
                {
                    IEntity target; if (RosterOwner) target = RosterOwner.ResolveCommandEntity(follow.TargetAlias,true);
                    invalid = invalid || !target || target != follow.Target || !COMMAND_ORBAT_SquadControl.SameFaction(group,RosterOwner.FactionKeyFor(target)) || GetGame().GetWorld().GetWorldTime() >= follow.Deadline;
                }
                if (invalid)
                {
                    if (route && group) COMMAND_ORBAT_RouteOrders.Cancel(group,route.Waypoints);
                    else if (route) COMMAND_ORBAT_RouteOrders.DeleteWaypoints(route.Waypoints);
                    batch.Routes.Remove(unit); batch.Orders.Remove(unit); batch.Follows.Remove(unit);
                    if (invalidControl) { ClearPreference(batch,unit,group); if (batch.Recruited) batch.Revoked = true; }
                }
            }
        }
        SyncControlStatus();
    }
    protected void SyncControlStatus()
    {
        if (m_ControlStatusDirty && m_CapabilityMode >= 12 && !m_Busy && !Pending && !m_Transport && !m_Driving && !m_Healing && !m_RestoringSnapshot) Poll();
    }
    protected void Recruit(JSOC_ORBAT_GMRequest request)
    {
        if (request.version != 2 || !m_OrdersAllowed || m_CapabilityMode < 4 || !RosterOwner || !SafeKey(request.sourceEntityId)) { Report(request.requestId,"failed","Recruitment requires selected live AI and current host approval",""); return; }
        IEntity member = RosterOwner.ResolveCommandEntity(request.sourceEntityId,false); SCR_AIGroup group = COMMAND_ORBAT_SquadControl.GroupFor(member);
        string problem = JSOC_ORBAT_AIOrders.Check(group,null);
        if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
        string faction = RosterOwner.FactionKeyFor(member);
        if (!COMMAND_ORBAT_SquadControl.SameFaction(group,faction)) { Report(request.requestId,"failed","Recruitment requires resolved same-faction squad membership",""); return; }
        int roots;
        foreach (string priorId, JSOC_ORBAT_GMSpawnGroup prior : m_Owned) foreach (IEntity entity : prior.Entities)
        {
            if (entity == group) { Report(request.requestId,"failed","Squad is already bridge-created or recruited",""); return; }
            if (entity) roots++;
        }
        if (roots >= 60) { Report(request.requestId,"failed","60 controlled roots maximum",""); return; }
        JSOC_ORBAT_GMSpawnGroup batch = new JSOC_ORBAT_GMSpawnGroup(); batch.Recruited = true; batch.SourceAlias = request.sourceEntityId; batch.SourceCharacter = member; batch.ControlFaction = faction;
        batch.Entities.Insert(group); batch.UnitIds.Insert(request.sourceEntityId); m_Owned.Insert(request.requestId,batch);
        Report(request.requestId,"executed","Existing squad recruited; ownership does not allow deletion","");
    }
    protected void ExecuteAIOrder(JSOC_ORBAT_GMRequest request)
    {
        if (request.version != 2 || !m_OrdersAllowed || !SafeKey(request.targetRequestId) || request.targetRequestId.Length() > 40 || !SafeKey(request.unitId)) { Report(request.requestId,"failed","AI order requires the updated paired mod and a safe target",""); return; }
        if ((request.kind == "ai-move" || request.kind == "ai-defend") && (!(request.worldX >= 0 && request.worldX <= 13500) || !(request.worldZ >= 0 && request.worldZ <= 13500))) { Report(request.requestId,"failed","AI destination is outside supported Everon bounds",""); return; }
        if ((request.kind == "ai-hold" || request.kind == "ai-defend") && (request.holdSeconds < 5 || request.holdSeconds > 300)) { Report(request.requestId,"failed","Hold duration must be 5 to 300 seconds",""); return; }
        JSOC_ORBAT_GMSpawnGroup ownedBatch;
        if (!m_Owned.Find(request.targetRequestId,ownedBatch)) { Report(request.requestId,"failed","Only bridge-created or recruited groups can receive AI orders",""); return; }
        int index = ownedBatch.UnitIds.Find(request.unitId);
        if (index < 0 || index >= ownedBatch.Entities.Count()) { Report(request.requestId,"failed","Owned unit identity is unavailable",""); return; }
        if (request.kind == "ai-release")
        {
            if (m_CapabilityMode < 4 || !ownedBatch.Recruited) { Report(request.requestId,"failed","Release requires a recruited squad and supported relay",""); return; }
            ClearControlledOrders(ownedBatch); m_Owned.Remove(request.targetRequestId);
            Report(request.requestId,"executed","Control released; recruited squad retained",""); return;
        }
        if (request.kind == "ai-diagnose")
        {
            if (m_CapabilityMode < 12) { Report(request.requestId,"failed","Execution inspection requires updated paired support",""); return; }
            SCR_AIGroup observed = SCR_AIGroup.Cast(ownedBatch.Entities[index]);
            if (!observed || !observed.GetLeaderEntity()) { Report(request.requestId,"failed","Squad or leader is unavailable",""); return; }
            array<AIAgent> members = {}; observed.GetAgents(members); int active;
            foreach (AIAgent member : members) if (member && member.IsAIActivated()) active++;
            vector position = observed.GetLeaderEntity().GetOrigin();
            AIWaypoint current = observed.GetCurrentWaypoint(); string task = "none";
            if (current) task = current.Type().ToString();
            if (task.Length() > 48) task = task.Substring(0,48);
            string authority = "owned";
            if (ownedBatch.Recruited && !LeaseValid(ownedBatch)) authority = "revoked: release and recruit again";
            Report(request.requestId,"executed",string.Format("AI active: group %1, members %2/%3. Leader X %4 / Z %5. Current waypoint: %6. Authority: %7.",observed.IsAIActivated(),active,members.Count(),position[0],position[2],task,authority),"");
            return;
        }
        if (ownedBatch.Recruited && !LeaseValid(ownedBatch)) { ClearControlledOrders(ownedBatch); ownedBatch.Revoked = true; m_ControlStatusDirty = true; m_ControlStatusRevision++; Report(request.requestId,"failed","Recruited control expired or faction/selection changed",""); return; }
        SCR_AIGroup group = SCR_AIGroup.Cast(ownedBatch.Entities[index]); AIWaypoint previous;
        ownedBatch.Orders.Find(request.unitId,previous);
        COMMAND_ORBAT_OwnedRoute ownedRoute; ownedBatch.Routes.Find(request.unitId,ownedRoute);
        array<AIWaypoint> previousPoints = {};
        if (ownedRoute) { foreach (AIWaypoint ownedPoint : ownedRoute.Waypoints) if (ownedPoint) previousPoints.Insert(ownedPoint); }
        else if (previous) previousPoints.Insert(previous);
        string problem = JSOC_ORBAT_AIOrders.Check(group,previous,previousPoints);
        if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
        if (request.kind != "ai-halt") problem = JSOC_ORBAT_AIOrders.EnsureActive(group);
        if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
        if (request.kind == "ai-formation" || request.kind == "ai-stance" || request.kind == "ai-combat-mode")
        {
            if (m_CapabilityMode < 5) { Report(request.requestId,"failed","Paired relay did not negotiate squad settings",""); return; }
            COMMAND_ORBAT_PreferenceLease preference; if (!ownedBatch.Preferences.Find(request.unitId,preference)) { preference = new COMMAND_ORBAT_PreferenceLease(); ownedBatch.Preferences.Set(request.unitId,preference); }
            string error;
            if (request.kind == "ai-formation") error = COMMAND_ORBAT_SquadPreferences.Formation(group,preference,request.formation);
            else if (request.kind == "ai-stance") error = COMMAND_ORBAT_SquadPreferences.Stance(group,preference,request.stance);
            else error = COMMAND_ORBAT_SquadPreferences.Combat(group,preference,request.combatMode);
            if (!error.IsEmpty()) { Report(request.requestId,"failed",error,""); return; }
            SnapshotRemember(request);
            Report(request.requestId,"executed","Native squad setting applied; physical movement and combat outcome are not confirmed",""); return;
        }
        if ((request.kind == "ai-defend" || request.kind == "ai-halt") && m_CapabilityMode < 2) { Report(request.requestId,"failed","Paired relay did not negotiate tactical AI support",""); return; }
        if (request.kind == "ai-route" && (m_CapabilityMode < 3 || !COMMAND_ORBAT_RouteOrders.Valid(request))) { Report(request.requestId,"failed","Route requires negotiated support and 1 to 16 valid points",""); return; }
        if (request.kind == "ai-halt")
        {
            if (!COMMAND_ORBAT_RouteOrders.Cancel(group,previousPoints)) { Report(request.requestId,"failed","Owned route cancellation could not be confirmed",""); return; }
            ownedBatch.Orders.Remove(request.unitId); ownedBatch.Routes.Remove(request.unitId); ownedBatch.Follows.Remove(request.unitId);
            SnapshotRemember(request);
            Report(request.requestId,"executed","Companion route cancelled; combat reactions remain enabled",""); return;
        }
        COMMAND_ORBAT_FollowLease follow;
        if (request.kind == "ai-follow")
        {
            if (m_CapabilityMode < 4 || !RosterOwner || request.holdSeconds < 5 || request.holdSeconds > 300) { Report(request.requestId,"failed","Follow requires current roster and 5 to 300 second duration",""); return; }
            IEntity target = RosterOwner.ResolveCommandEntity(request.followEntityId,true);
            if (!target || !COMMAND_ORBAT_SquadControl.SameFaction(group,RosterOwner.FactionKeyFor(target))) { Report(request.requestId,"failed","Follow target must be a selected same-faction player",""); return; }
            follow = COMMAND_ORBAT_SquadControl.CreateFollow(group,target,request.followEntityId,request.holdSeconds);
            if (!follow) { Report(request.requestId,"failed","Native Follow waypoint unavailable; prior order retained",""); return; }
        }
        COMMAND_ORBAT_OwnedRoute next = new COMMAND_ORBAT_OwnedRoute();
        if (follow) next.Waypoints.Insert(follow.Waypoint);
        else if (request.kind == "ai-route") next = COMMAND_ORBAT_RouteOrders.Create(request,group);
        else
        {
            AIWaypoint waypoint;
            if (request.kind == "ai-defend") waypoint = COMMAND_ORBAT_TacticalOrders.CreateDefend(group,previous,request.worldX,request.worldZ,request.holdSeconds,previousPoints);
            else waypoint = JSOC_ORBAT_AIOrders.Create(request,group);
            if (waypoint) next.Waypoints.Insert(waypoint);
        }
        if (!next || next.Waypoints.Count() < 1) { Report(request.requestId,"failed","Required native waypoints unavailable; previous order retained",""); return; }
        if (!COMMAND_ORBAT_RouteOrders.Replace(group,previousPoints,next.Waypoints))
        {
            COMMAND_ORBAT_RouteOrders.DeleteWaypoints(next.Waypoints);
            Report(request.requestId,"failed","Route attachment failed; previous waypoints retained or restored",""); return;
        }
        ownedBatch.Routes.Set(request.unitId,next); ownedBatch.Orders.Set(request.unitId,next.Waypoints[0]); if (follow) ownedBatch.Follows.Set(request.unitId,follow); else ownedBatch.Follows.Remove(request.unitId);
        SnapshotRemember(request);
        if (request.kind == "ai-follow") { Report(request.requestId,"executed","Native Follow installed for selected player; bounded duration and authority checks active",""); return; }
        if (request.kind == "ai-route") { Report(request.requestId,"executed","Native route installed in order; travel and arrival are not confirmed",""); return; }
        if (request.kind == "ai-move") Report(request.requestId,"executed","AI move waypoint accepted; arrival is not confirmed","");
        else if (request.kind == "ai-defend") Report(request.requestId,"executed","Native defend waypoint accepted; arrival and combat outcome are unconfirmed","");
        else Report(request.requestId,"executed","Timed AI hold waypoint accepted; combat reactions remain possible","");
    }
    protected void Report(string id, string status, string message, string ids)
    {
        string body = string.Format("{\"token\":\"%1\",\"result\":{\"requestId\":\"%2\",\"status\":\"%3\",\"message\":\"%4\",\"createdIds\":[%5]}}", m_Code,id,status,message,ids);
        m_Results.Insert(id,body); Status = message; Post("result",body);
    }

    protected ref map<string, ref COMMAND_ORBAT_Snapshot> m_SnapshotReviews = new map<string, ref COMMAND_ORBAT_Snapshot>();
    protected ref map<string, string> m_RestoredSnapshots = new map<string, string>();
    protected ref COMMAND_ORBAT_Snapshot m_RestoringSnapshot;
    protected ref JSOC_ORBAT_GMRequest m_RestoreRequest;
    protected ref JSOC_ORBAT_GMSpawnGroup m_RestoreBatch;
    protected float m_RestoreDeadline;
    protected ref array<SCR_AIGroup> m_SnapshotReadyGroups = {};
    protected ref array<SCR_AIGroup> m_SnapshotCapturableGroups = {};
    static bool SnapshotKind(string kind) { return kind == "scenario-save-plan" || kind == "scenario-save-current" || kind == "scenario-review" || kind == "scenario-restore"; }
    protected string SnapshotPath(string name) { return "$profile:COMMAND-Scenarios/" + name + ".json"; }
    protected bool SnapshotPoseValid(COMMAND_ORBAT_SnapshotPose pose)
    {
        return pose && SafeResource(pose.resourceName) && pose.worldX >= 0 && pose.worldX <= 13500 && pose.worldZ >= 0 && pose.worldZ <= 13500 && pose.worldY >= -2000 && pose.worldY <= 2000 && pose.headingDegrees >= 0 && pose.headingDegrees < 360;
    }
    protected void SnapshotPose(IEntity entity, COMMAND_ORBAT_SnapshotPose pose)
    {
        if (entity.GetPrefabData()) pose.resourceName = entity.GetPrefabData().GetPrefabName();
        vector origin = entity.GetOrigin(); pose.worldX = origin[0]; pose.worldY = origin[1]; pose.worldZ = origin[2];
        vector angles = entity.GetAngles(); pose.headingDegrees = Math.Mod(angles[0] + 360,360);
    }
    protected void SnapshotApplyPose(IEntity entity, COMMAND_ORBAT_SnapshotPose pose)
    {
        entity.SetOrigin(Vector(pose.worldX,pose.worldY,pose.worldZ)); entity.SetAngles(Vector(pose.headingDegrees,0,0));
    }
    protected bool SnapshotResource(ResourceName name)
    {
        if (!SafeResource(name)) return false;
        Resource resource = Resource.Load(name);
        return resource && resource.IsValid() && resource.GetResource() && resource.GetResource().ToEntitySource() && resource.GetResource().GetResourceName() == name;
    }
    protected bool SnapshotOrderValid(JSOC_ORBAT_GMRequest order)
    {
        if (!order || order.version != 2) return false;
        if (order.kind == "ai-route") return COMMAND_ORBAT_RouteOrders.Valid(order);
        if (order.kind == "ai-move") return order.worldX >= 0 && order.worldX <= 13500 && order.worldZ >= 0 && order.worldZ <= 13500;
        if (order.kind == "ai-formation") return order.formation == "restore" || !COMMAND_ORBAT_SquadPreferences.FormationName(order.formation).IsEmpty();
        if (order.kind == "ai-stance") return order.stance == "stand" || order.stance == "crouch" || order.stance == "prone" || order.stance == "auto";
        if (order.kind == "ai-combat-mode") return order.combatMode == "open-fire" || order.combatMode == "hold-fire" || order.combatMode == "return-fire" || order.combatMode == "auto";
        return false;
    }
    protected string ValidateSnapshot(COMMAND_ORBAT_Snapshot snapshot)
    {
        if (!snapshot || snapshot.version != 1 || !SafeKey(snapshot.snapshotName) || snapshot.snapshotName.Length() > 40 || (snapshot.mode != "current" && snapshot.mode != "planned") || snapshot.world != GetGame().GetWorldFile() || snapshot.entities.Count() < 1 || snapshot.entities.Count() > 16) return "Invalid snapshot version, world or entity count";
        array<string> loaded = {}; GameProject.GetLoadedAddons(loaded);
        if (snapshot.requiredAddons.Count() < 1 || snapshot.requiredAddons.Count() > 128) return "Invalid required addon manifest";
        foreach (string addon : snapshot.requiredAddons) if (loaded.Find(addon) < 0) return "A required snapshot addon is not loaded";
        array<string> ids = {};
        foreach (COMMAND_ORBAT_SnapshotEntity entity : snapshot.entities)
        {
            if (!SnapshotPoseValid(entity) || !SafeKey(entity.unitId) || ids.Find(entity.unitId) >= 0 || entity.members.Count() > 16 || entity.orders.Count() > 4 || entity.factionKey.Length() > 64) return "Invalid snapshot entity or duplicate stable identity";
            ids.Insert(entity.unitId);
            if (!SnapshotResource(entity.resourceName)) return "Required exact prefab is unavailable";
            if ((!entity.group && entity.members.Count() > 0) || (snapshot.mode == "current" && entity.group && entity.members.Count() == 0)) return "Invalid snapshot group membership";
            foreach (COMMAND_ORBAT_SnapshotPose member : entity.members) if (!SnapshotPoseValid(member) || !SnapshotResource(member.resourceName)) return "Required exact member prefab is unavailable";
            array<string> orderKinds = {};
            foreach (JSOC_ORBAT_GMRequest order : entity.orders)
            {
                string slot = order.kind;
                if (slot == "ai-route" || slot == "ai-move") slot = "movement";
                if (!entity.group || !SnapshotOrderValid(order) || orderKinds.Find(slot) >= 0) return "Unsupported or duplicate saved order";
                orderKinds.Insert(slot);
            }
        }
        JsonSaveContext packageSize = new JsonSaveContext(); packageSize.WriteValue("scenario",snapshot);
        if (packageSize.SaveToString().Length() > 120000) return "Snapshot package exceeds the file budget";
        JsonSaveContext detail = new JsonSaveContext(); detail.WriteValue("snapshot",SnapshotReceipt(snapshot));
        if (detail.SaveToString().Length() > 24000) return "Snapshot review exceeds the detail budget";
        return "";
    }
    protected void SnapshotForgetMovement(JSOC_ORBAT_GMSpawnGroup batch, string unitId)
    {
        COMMAND_ORBAT_SnapshotOrders orders;
        if (batch && batch.SnapshotOrders.Find(unitId,orders) && orders) orders.Values.Remove("movement");
    }
    protected void SnapshotRemember(JSOC_ORBAT_GMRequest request)
    {
        JSOC_ORBAT_GMSpawnGroup batch;
        if (!request || !m_Owned.Find(request.targetRequestId,batch)) return;
        COMMAND_ORBAT_SnapshotOrders orders;
        if (!batch.SnapshotOrders.Find(request.unitId,orders)) { orders = new COMMAND_ORBAT_SnapshotOrders(); batch.SnapshotOrders.Set(request.unitId,orders); }
        string slot = request.kind;
        if (slot == "ai-move" || slot == "ai-route" || slot == "ai-hold" || slot == "ai-defend" || slot == "ai-follow" || slot == "ai-halt") slot = "movement";
        if (request.kind == "ai-halt") orders.Values.Remove(slot);
        else orders.Values.Set(slot,request);
    }
    protected COMMAND_ORBAT_Snapshot CaptureSnapshot(JSOC_ORBAT_GMRequest request, out string problem)
    {
        problem = "Invalid snapshot save request";
        COMMAND_ORBAT_Snapshot snapshot = new COMMAND_ORBAT_Snapshot(); snapshot.version = 1; snapshot.snapshotName = request.requestId; snapshot.world = GetGame().GetWorldFile(); GameProject.GetLoadedAddons(snapshot.requiredAddons);
        if (request.kind == "scenario-save-plan")
        {
            if (request.entities.Count() < 1 || request.entities.Count() > 16 || request.sourceMissionSha256.Length() != 64) return null;
            snapshot.mode = "planned"; snapshot.sourceMissionSha256 = request.sourceMissionSha256;
            foreach (JSOC_ORBAT_GMEntityIntent intent : request.entities)
            {
                if (!intent) return null;
                COMMAND_ORBAT_SnapshotEntity planned = new COMMAND_ORBAT_SnapshotEntity(); planned.unitId = intent.unitId; planned.resourceName = intent.resourceName; planned.worldX = intent.worldX; planned.worldZ = intent.worldZ; planned.worldY = GetGame().GetWorld().GetSurfaceY(intent.worldX,intent.worldZ); planned.headingDegrees = intent.headingDegrees;
                snapshot.entities.Insert(planned);
            }
        }
        else
        {
            if (request.targets.Count() < 1 || request.targets.Count() > 16) return null;
            snapshot.mode = "current";
            foreach (COMMAND_ORBAT_SnapshotTarget target : request.targets)
            {
                JSOC_ORBAT_GMSpawnGroup snapshotBatch;
                if (!target || !m_Owned.Find(target.targetRequestId,snapshotBatch) || snapshotBatch.Recruited || snapshotBatch.Revoked) { problem = "Only bridge-created entities can be captured"; return null; }
                int index = snapshotBatch.UnitIds.Find(target.unitId);
                if (index < 0 || index >= snapshotBatch.Entities.Count()) return null;
                IEntity root = snapshotBatch.Entities[index];
                if (!root || JSOC_ORBAT_AIOrders.PlayerOccupies(root)) { problem = "Missing or human-controlled entities cannot be captured"; return null; }
                COMMAND_ORBAT_SnapshotEntity captured = new COMMAND_ORBAT_SnapshotEntity(); captured.unitId = target.unitId; SnapshotPose(root,captured);
                SCR_AIGroup group = SCR_AIGroup.Cast(root);
                if (group)
                {
                    if (m_SnapshotCapturableGroups.Find(group) < 0) { problem = "Squad creation is not complete; wait before capturing"; return null; }
                    captured.group = true;
                    AIWaypoint ownedPoint; snapshotBatch.Orders.Find(target.unitId,ownedPoint);
                    COMMAND_ORBAT_OwnedRoute ownedRoute; array<AIWaypoint> points = {}; if (snapshotBatch.Routes.Find(target.unitId,ownedRoute) && ownedRoute) points.Copy(ownedRoute.Waypoints);
                    string reason = JSOC_ORBAT_AIOrders.Check(group,ownedPoint,points);
                    if (!reason.IsEmpty()) { problem = reason; return null; }
                    array<AIAgent> agents = {}; group.GetAgents(agents);
                    foreach (AIAgent agent : agents)
                    {
                        IEntity member = agent.GetControlledEntity();
                        FactionAffiliationComponent affiliation = FactionAffiliationComponent.Cast(member.FindComponent(FactionAffiliationComponent));
                        if (!affiliation || !affiliation.GetAffiliatedFaction()) { problem = "Snapshot faction is unresolved"; return null; }
                        string faction = affiliation.GetAffiliatedFaction().GetFactionKey();
                        if (!captured.factionKey.IsEmpty() && captured.factionKey != faction) { problem = "Mixed-faction group cannot be captured"; return null; }
                        captured.factionKey = faction;
                        COMMAND_ORBAT_SnapshotPose pose = new COMMAND_ORBAT_SnapshotPose(); SnapshotPose(member,pose); captured.members.Insert(pose);
                    }
                    COMMAND_ORBAT_SnapshotOrders savedOrders;
                    if (snapshotBatch.SnapshotOrders.Find(target.unitId,savedOrders)) foreach (string orderSlot, JSOC_ORBAT_GMRequest savedOrder : savedOrders.Values)
                    {
                        if (!SnapshotOrderValid(savedOrder)) { problem = "Active timed or follow order is unsupported; halt it before capture"; return null; }
                        captured.orders.Insert(savedOrder);
                    }
                }
                else
                {
                    COMMAND_ORBAT_VehicleInspection vehicle = COMMAND_ORBAT_VehicleInspection.Read(root);
                    if (!vehicle || vehicle.occupied > 0 || vehicle.reserved > 0) { problem = "Current capture supports on-foot squads and empty unreserved vehicles"; return null; }
                    captured.factionKey = COMMAND_ORBAT_TransportLease.VehicleFaction(root);
                    if (captured.factionKey.IsEmpty() || captured.factionKey == "NO_FACTION") { problem = "Vehicle faction is unresolved"; return null; }
                }
                snapshot.entities.Insert(captured);
            }
        }
        problem = ValidateSnapshot(snapshot);
        if (!problem.IsEmpty()) return null;
        return snapshot;
    }
    protected string SnapshotOrdersText(COMMAND_ORBAT_SnapshotEntity entity)
    {
        string text;
        foreach (JSOC_ORBAT_GMRequest order : entity.orders)
        {
            if (!text.IsEmpty()) text += " | ";
            text += order.kind;
            if (order.kind == "ai-formation") text += " " + order.formation;
            else if (order.kind == "ai-stance") text += " " + order.stance;
            else if (order.kind == "ai-combat-mode") text += " " + order.combatMode;
            else if (order.kind == "ai-move") text += string.Format(" X %1 Z %2",order.worldX,order.worldZ);
            else foreach (COMMAND_ORBAT_RoutePoint point : order.waypoints) text += string.Format(" [X %1 Z %2]",point.worldX,point.worldZ);
        }
        return text;
    }
    protected string PreviewSnapshot(JSOC_ORBAT_GMRequest request, int index)
    {
        if (request.kind == "scenario-review") return "READ SERVER SNAPSHOT " + request.snapshotName + ".json from the server profile. This operation validates and freezes the package. Nothing is spawned. Request a separate restore after reviewing the returned entities and orders.";
        if (request.kind == "scenario-save-current")
        {
            if (index < 0 || index >= request.targets.Count()) return "Invalid current-state capture preview";
            COMMAND_ORBAT_SnapshotTarget target = request.targets[index];
            return string.Format("SAVE CURRENT STATE %1 / %2: %3 / %4. Capture supported on-foot squad or empty vehicle to %5.json in the server profile. Inventories, damage and wider game state are excluded. NEXT reviews every owned identity.",index+1,request.targets.Count(),target.targetRequestId,target.unitId,request.requestId);
        }
        if (request.kind == "scenario-save-plan")
        {
            if (index < 0 || index >= request.entities.Count()) return "Invalid planned save preview";
            JSOC_ORBAT_GMEntityIntent entity = request.entities[index];
            return string.Format("SAVE PLANNED DEPLOYMENT %1 / %2: %3. %4 at X %5 / Z %6 / heading %7. Writes %8.json inside the server profile. This does not capture current actors or spawn anything. NEXT reviews every entity.",index+1,request.entities.Count(),entity.unitId,entity.resourceName,entity.worldX,entity.worldZ,entity.headingDegrees,request.requestId);
        }
        COMMAND_ORBAT_Snapshot snapshot;
        if (!m_SnapshotReviews.Find(request.reviewRequestId,snapshot) || index < 0 || index >= snapshot.entities.Count()) return "Completed server review is unavailable. Restore cannot run.";
        COMMAND_ORBAT_SnapshotEntity saved = snapshot.entities[index];
        string addons; foreach (string addon : snapshot.requiredAddons) addons += addon + " ";
        return string.Format("RESTORE FROZEN %1 SNAPSHOT %2: entity %3 / %4, stable ID %5. %6 at X %7 / Y %8 / Z %9.",snapshot.mode,snapshot.snapshotName,index+1,snapshot.entities.Count(),saved.unitId,saved.resourceName,saved.worldX,saved.worldY,saved.worldZ) + string.Format(" Heading %1. Faction %2, members %3. Orders: %4. Required loaded addons: %5. NEXT reviews all entities. Approval spawns fresh supported actors; inventories, damage and wider game state are excluded.",saved.headingDegrees,saved.factionKey,saved.members.Count(),SnapshotOrdersText(saved),addons);
    }
    protected COMMAND_ORBAT_SnapshotReceipt SnapshotReceipt(COMMAND_ORBAT_Snapshot snapshot)
    {
        COMMAND_ORBAT_SnapshotReceipt receipt = new COMMAND_ORBAT_SnapshotReceipt(); receipt.snapshotName = snapshot.snapshotName; receipt.mode = snapshot.mode; receipt.world = snapshot.world; receipt.entityCount = snapshot.entities.Count(); receipt.requiredAddons.Copy(snapshot.requiredAddons);
        foreach (COMMAND_ORBAT_SnapshotEntity saved : snapshot.entities)
        {
            COMMAND_ORBAT_SnapshotReceiptEntity entity = new COMMAND_ORBAT_SnapshotReceiptEntity(); entity.unitId = saved.unitId; entity.resourceName = saved.resourceName; entity.factionKey = saved.factionKey; entity.worldX = saved.worldX; entity.worldY = saved.worldY; entity.worldZ = saved.worldZ; entity.headingDegrees = saved.headingDegrees; entity.memberCount = saved.members.Count(); entity.orderCount = saved.orders.Count(); entity.ordersText = SnapshotOrdersText(saved); receipt.entities.Insert(entity);
        }
        return receipt;
    }
    protected void ReportSnapshot(JSOC_ORBAT_GMRequest request, COMMAND_ORBAT_Snapshot snapshot, string message, array<string> ids = null)
    {
        COMMAND_ORBAT_SnapshotResult result = new COMMAND_ORBAT_SnapshotResult(); result.requestId = request.requestId; result.message = message; result.snapshot = SnapshotReceipt(snapshot); if (ids) result.createdIds.Copy(ids);
        JsonSaveContext json = new JsonSaveContext(); json.WriteValue("token",m_Code); json.WriteValue("result",result); string body = json.SaveToString(); m_Results.Set(request.requestId,body); Status = message; Post("result",body);
    }
    protected void ExecuteSnapshot(JSOC_ORBAT_GMRequest request)
    {
        if (request.version != 3 || m_CapabilityMode < 8 || m_RestoringSnapshot) { Report(request.requestId,"failed","Updated snapshot bridge required",""); return; }
        string problem;
        COMMAND_ORBAT_Snapshot snapshot;
        if (request.kind == "scenario-save-plan" || request.kind == "scenario-save-current")
        {
            snapshot = CaptureSnapshot(request,problem);
            if (!snapshot) { Report(request.requestId,"failed",problem,""); return; }
            FileIO.MakeDirectory("$profile:COMMAND-Scenarios");
            string filename = SnapshotPath(request.requestId);
            if (FileIO.FileExists(filename)) { Report(request.requestId,"failed","Snapshot filename already exists; choose a new request ID",""); return; }
            JsonSaveContext save = new JsonSaveContext();
            if (!save.WriteValue("scenario",snapshot) || !save.SaveToFile(filename)) { Report(request.requestId,"failed","Server snapshot write failed",""); return; }
            ReportSnapshot(request,snapshot,"Saved server profile snapshot: " + request.requestId + ".json"); return;
        }
        if (request.kind == "scenario-review")
        {
            if (!SafeKey(request.snapshotName) || request.snapshotName.Length() > 40) { Report(request.requestId,"failed","Invalid snapshot ID",""); return; }
            FileHandle file = FileIO.OpenFile(SnapshotPath(request.snapshotName),FileMode.READ);
            if (!file) { Report(request.requestId,"failed","Server snapshot was not found",""); return; }
            int length = file.GetLength(); file.Close();
            if (length < 2 || length > 131072) { Report(request.requestId,"failed","Snapshot file size rejected",""); return; }
            JsonLoadContext load = new JsonLoadContext();
            if (!load.LoadFromFile(SnapshotPath(request.snapshotName)) || !load.ReadValue("scenario",snapshot) || !snapshot || snapshot.snapshotName != request.snapshotName) { Report(request.requestId,"failed","Snapshot JSON or identity invalid",""); return; }
            problem = ValidateSnapshot(snapshot);
            if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
            m_SnapshotReviews.Set(request.requestId,snapshot); ReportSnapshot(request,snapshot,"Snapshot reviewed and frozen; separate restore approval required"); return;
        }
        if (request.kind != "scenario-restore" || !SafeKey(request.reviewRequestId) || !m_SnapshotReviews.Find(request.reviewRequestId,snapshot)) { Report(request.requestId,"failed","Completed snapshot review required on this pairing",""); return; }
        problem = ValidateSnapshot(snapshot);
        if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
        string restored;
        if (m_RestoredSnapshots.Find(snapshot.snapshotName,restored) && m_Owned.Contains(restored)) { Report(request.requestId,"failed","Snapshot already restored in this session; remove its prior batch first",""); return; }
        int count;
        foreach (string batchKey, JSOC_ORBAT_GMSpawnGroup batch : m_Owned) count += batch.Entities.Count();
        if (count + snapshot.entities.Count() > 60) { Report(request.requestId,"failed","60 snapshotBatch roots maximum",""); return; }
        m_SnapshotReadyGroups.Clear();
        m_RestoreBatch = new JSOC_ORBAT_GMSpawnGroup(); m_RestoringSnapshot = snapshot; m_RestoreRequest = request;
        foreach (COMMAND_ORBAT_SnapshotEntity saved : snapshot.entities)
        {
            Resource resource = Resource.Load(saved.resourceName); EntitySpawnParams parameters = new EntitySpawnParams(); parameters.TransformMode = ETransformMode.WORLD;
            Math3D.AnglesToMatrix(Vector(saved.headingDegrees,0,0),parameters.Transform); parameters.Transform[3] = Vector(saved.worldX,saved.worldY,saved.worldZ);
            IEntity spawned = GetGame().SpawnEntityPrefab(resource,GetGame().GetWorld(),parameters);
            if (!spawned) { SnapshotRollback("Restore spawn failed; partial batch removed"); return; }
            SCR_AIGroup spawnedGroup = SCR_AIGroup.Cast(spawned);
            if (spawnedGroup) spawnedGroup.GetOnAllDelayedEntitySpawned().Insert(OnSnapshotGroupReady);
            m_RestoreBatch.Entities.Insert(spawned); m_RestoreBatch.UnitIds.Insert(saved.unitId); m_RestoreBatch.Ids.Insert(string.Format("spawn_%1_%2",request.requestId,m_RestoreBatch.Entities.Count()-1));
        }
        m_RestoreDeadline = GetGame().GetWorld().GetWorldTime() + 15000;
        GetGame().GetCallqueue().CallLater(TickSnapshotRestore,100,true);
    }
    protected void SnapshotTrackCreated(IEntity root)
    {
        SCR_AIGroup group = SCR_AIGroup.Cast(root);
        if (group) group.GetOnAllDelayedEntitySpawned().Insert(OnSnapshotOwnedGroupReady);
    }
    protected void OnSnapshotOwnedGroupReady(SCR_AIGroup group)
    {
        if (!group) return;
        if (m_SnapshotCapturableGroups.Find(group) < 0) m_SnapshotCapturableGroups.Insert(group);
        group.GetOnAllDelayedEntitySpawned().Remove(OnSnapshotOwnedGroupReady);
    }
    protected void OnSnapshotGroupReady(SCR_AIGroup group)
    {
        if (group && m_RestoreBatch && m_RestoreBatch.Entities.Find(group) >= 0 && m_SnapshotReadyGroups.Find(group) < 0) m_SnapshotReadyGroups.Insert(group);
    }
    protected void SnapshotRemoveReadyHandlers()
    {
        if (m_RestoreBatch)
        {
            foreach (IEntity entity : m_RestoreBatch.Entities)
            {
                SCR_AIGroup group = SCR_AIGroup.Cast(entity);
                if (group) group.GetOnAllDelayedEntitySpawned().Remove(OnSnapshotGroupReady);
            }
        }
        m_SnapshotReadyGroups.Clear();
    }
    protected void SnapshotRollback(string problem)
    {
        GetGame().GetCallqueue().Remove(TickSnapshotRestore);
        SnapshotRemoveReadyHandlers();
        if (m_RestoreBatch) { ClearPreferences(m_RestoreBatch); foreach (string routeKey, COMMAND_ORBAT_OwnedRoute route : m_RestoreBatch.Routes) if (route) COMMAND_ORBAT_RouteOrders.DeleteWaypoints(route.Waypoints); }
        if (m_RestoreBatch)
        {
            bool protectedActor;
            foreach (IEntity partial : m_RestoreBatch.Entities)
            {
                if (!partial) continue;
                if (JSOC_ORBAT_AIOrders.PlayerOccupies(partial)) { protectedActor = true; continue; }
                SCR_EntityHelper.DeleteEntityAndChildren(partial);
            }
            if (protectedActor) problem = "Restore stopped; human-occupied actors retained for host cleanup";
        }
        if (m_RestoreRequest) Report(m_RestoreRequest.requestId,"failed",problem,"");
        m_RestoreBatch = null; m_RestoringSnapshot = null; m_RestoreRequest = null;
    }
    protected void TickSnapshotRestore()
    {
        if (!m_RestoringSnapshot || !m_RestoreBatch || !m_RestoreRequest) return;
        bool ready = true;
        for (int i = 0; i < m_RestoringSnapshot.entities.Count(); i++)
        {
            if (!m_RestoreBatch.Entities[i] || JSOC_ORBAT_AIOrders.PlayerOccupies(m_RestoreBatch.Entities[i])) { SnapshotRollback("Restored actor became unavailable or human-controlled"); return; }
            COMMAND_ORBAT_SnapshotEntity saved = m_RestoringSnapshot.entities[i]; SCR_AIGroup group = SCR_AIGroup.Cast(m_RestoreBatch.Entities[i]);
            if (saved.group && !group) { SnapshotRollback("Restored entity type differs from snapshot"); return; }
            if (!group) { if (!saved.factionKey.IsEmpty() && COMMAND_ORBAT_TransportLease.VehicleFaction(m_RestoreBatch.Entities[i]) != saved.factionKey) { SnapshotRollback("Restored vehicle faction differs"); return; } continue; }
            array<AIAgent> agents = {}; group.GetAgents(agents);
            if (m_SnapshotReadyGroups.Find(group) < 0 || group.IsInitializing() || group.GetSpawnQueueSize() > 0 || agents.Count() == 0 || (saved.members.Count() > 0 && agents.Count() != saved.members.Count())) { ready = false; continue; }
            if (!saved.factionKey.IsEmpty() && !COMMAND_ORBAT_SquadControl.SameFaction(group,saved.factionKey)) { SnapshotRollback("Restored squad faction differs"); return; }
            for (int j = 0; j < saved.members.Count(); j++)
            {
                IEntity member = agents[j].GetControlledEntity();
                if (!member || !member.GetPrefabData() || member.GetPrefabData().GetPrefabName() != saved.members[j].resourceName) { SnapshotRollback("Restored member prefab differs"); return; }
            }
        }
        if (!ready)
        {
            if (GetGame().GetWorld().GetWorldTime() >= m_RestoreDeadline) SnapshotRollback("Restore membership was not ready; partial batch removed");
            return;
        }
        // All fresh actors are validated before moving members or installing saved orders.
        for (int n = 0; n < m_RestoringSnapshot.entities.Count(); n++)
        {
            COMMAND_ORBAT_SnapshotEntity entry = m_RestoringSnapshot.entities[n]; SCR_AIGroup restoredGroup = SCR_AIGroup.Cast(m_RestoreBatch.Entities[n]);
            if (!restoredGroup) continue;
            array<AIAgent> members = {}; restoredGroup.GetAgents(members);
            for (int k = 0; k < entry.members.Count(); k++) SnapshotApplyPose(members[k].GetControlledEntity(),entry.members[k]);
            foreach (JSOC_ORBAT_GMRequest order : entry.orders)
            {
                if (order.kind == "ai-move" || order.kind == "ai-route")
                {
                    COMMAND_ORBAT_OwnedRoute route;
                    if (order.kind == "ai-route") route = COMMAND_ORBAT_RouteOrders.Create(order,restoredGroup);
                    else { route = new COMMAND_ORBAT_OwnedRoute(); AIWaypoint point = JSOC_ORBAT_AIOrders.Create(order,restoredGroup); if (point) route.Waypoints.Insert(point); }
                    array<AIWaypoint> previous = {};
                    if (!route || !COMMAND_ORBAT_RouteOrders.Replace(restoredGroup,previous,route.Waypoints)) { if (route) COMMAND_ORBAT_RouteOrders.DeleteWaypoints(route.Waypoints); SnapshotRollback("Saved route unavailable; partial restore removed"); return; }
                    m_RestoreBatch.Routes.Set(entry.unitId,route); m_RestoreBatch.Orders.Set(entry.unitId,route.Waypoints[0]);
                }
                else
                {
                    COMMAND_ORBAT_PreferenceLease lease;
                    if (!m_RestoreBatch.Preferences.Find(entry.unitId,lease)) { lease = new COMMAND_ORBAT_PreferenceLease(); m_RestoreBatch.Preferences.Set(entry.unitId,lease); }
                    string error;
                    if (order.kind == "ai-formation") error = COMMAND_ORBAT_SquadPreferences.Formation(restoredGroup,lease,order.formation);
                    else if (order.kind == "ai-stance") error = COMMAND_ORBAT_SquadPreferences.Stance(restoredGroup,lease,order.stance);
                    else error = COMMAND_ORBAT_SquadPreferences.Combat(restoredGroup,lease,order.combatMode);
                    if (!error.IsEmpty()) { SnapshotRollback("Saved squad setting unavailable; partial restore removed"); return; }
                }
                COMMAND_ORBAT_SnapshotOrders remembered;
                if (!m_RestoreBatch.SnapshotOrders.Find(entry.unitId,remembered)) { remembered = new COMMAND_ORBAT_SnapshotOrders(); m_RestoreBatch.SnapshotOrders.Set(entry.unitId,remembered); }
                string slot = order.kind; if (slot == "ai-move" || slot == "ai-route") slot = "movement"; remembered.Values.Set(slot,order);
            }
        }
        foreach (SCR_AIGroup completeGroup : m_SnapshotReadyGroups) if (completeGroup && m_SnapshotCapturableGroups.Find(completeGroup) < 0) m_SnapshotCapturableGroups.Insert(completeGroup);
        GetGame().GetCallqueue().Remove(TickSnapshotRestore); SnapshotRemoveReadyHandlers(); m_Owned.Set(m_RestoreRequest.requestId,m_RestoreBatch); m_RestoredSnapshots.Set(m_RestoringSnapshot.snapshotName,m_RestoreRequest.requestId);
        ReportSnapshot(m_RestoreRequest,m_RestoringSnapshot,"Approved COMMAND snapshot restored; inventory and wider game state are outside this snapshot",m_RestoreBatch.Ids);
        m_RestoreBatch = null; m_RestoringSnapshot = null; m_RestoreRequest = null;
    }

    protected ref COMMAND_ORBAT_VehicleControlLease m_Driving;
    protected ref map<string, ref COMMAND_ORBAT_VehicleControlLease> m_Convoys = new map<string, ref COMMAND_ORBAT_VehicleControlLease>();
    protected string VehicleControlKey(JSOC_ORBAT_GMRequest request) { return request.targetRequestId + "/" + request.unitId; }
    protected bool VehicleControlActiveFor(SCR_AIGroup group)
    {
        if (m_Driving && m_Driving.Group == group) return true;
        foreach (string key, COMMAND_ORBAT_VehicleControlLease convoy : m_Convoys) if (convoy.Group == group) return true;
        return false;
    }
    protected void StopVehicleControl()
    {
        if (GetGame()) GetGame().GetCallqueue().Remove(TickVehicleControl);
        if (m_Driving) { m_Driving.Stop(); }
        m_Driving = null;
        foreach (string key, COMMAND_ORBAT_VehicleControlLease convoy : m_Convoys) convoy.Stop();
        m_Convoys.Clear();
    }
    protected bool ConvoyCycle(IEntity follower, IEntity leader)
    {
        IEntity cursor = leader;
        for (int depth = 0; depth < 60; depth++)
        {
            if (cursor == follower) return true;
            IEntity next = null;
            foreach (string key, COMMAND_ORBAT_VehicleControlLease convoy : m_Convoys) if (convoy.TargetVehicle == cursor) { next = convoy.Leader; break; }
            if (!next) return false;
            cursor = next;
        }
        return true;
    }
    protected COMMAND_ORBAT_VehicleBinding RegisterDrivingVehicle(JSOC_ORBAT_GMSpawnGroup batch, string unit, SCR_AIGroup group, IEntity vehicle)
    {
        SCR_AIGroupUtilityComponent utility = group.GetGroupUtilityComponent();
        SCR_AIVehicleUsageComponent usage = SCR_AIVehicleUsageComponent.Cast(vehicle.FindComponent(SCR_AIVehicleUsageComponent));
        if (!usage || !utility || !utility.m_VehicleMgr) return null;
        COMMAND_ORBAT_VehicleBinding binding;
        if (batch.VehicleBindings.Find(unit,binding) && binding.Usage != usage) return null;
        if (!binding) { binding = new COMMAND_ORBAT_VehicleBinding(); binding.Usage = usage; batch.VehicleBindings.Set(unit,binding); }
        // A completed native boarding activity may remove its registration. Renew it only
        // inside this separately approved driving operation; preserve any foreign assignment.
        if (!utility.IsUsableVehicle(usage)) { utility.AddUsableVehicle(usage); binding.AddedUsable = true; }
        SCR_AIGroupVehicle existing = utility.m_VehicleMgr.FindVehicle(usage);
        if (!existing) binding.OwnedAssignment = utility.m_VehicleMgr.TryAddVehicle(usage);
        else if (existing != binding.OwnedAssignment) binding.OwnedAssignment = null;
        if (!utility.IsUsableVehicle(usage) || !utility.m_VehicleMgr.FindVehicle(usage)) return null;
        return binding;
    }
    protected void ExecuteVehicleControl(JSOC_ORBAT_GMRequest request)
    {
        if (request.kind != "vehicle-route" && m_CapabilityMode < 10) { Report(request.requestId,"failed","Convoy support is disabled pending native acceptance",""); return; }
        if (request.version != 4 || !m_OrdersAllowed || m_CapabilityMode < 9 || m_Driving || m_Transport || m_RestoringSnapshot || !SafeKey(request.targetRequestId) || !SafeKey(request.unitId) || !SafeKey(request.vehicleRequestId) || !SafeKey(request.vehicleUnitId)) { Report(request.requestId,"failed","Vehicle control requires updated paired support and exact owned identities",""); return; }
        JSOC_ORBAT_GMSpawnGroup crewBatch; JSOC_ORBAT_GMSpawnGroup vehicleBatch;
        if (!m_Owned.Find(request.targetRequestId,crewBatch) || !m_Owned.Find(request.vehicleRequestId,vehicleBatch) || crewBatch.Recruited || vehicleBatch.Recruited) { Report(request.requestId,"failed","Vehicle control supports bridge-created crew and vehicles",""); return; }
        int crewIndex = crewBatch.UnitIds.Find(request.unitId); int vehicleIndex = vehicleBatch.UnitIds.Find(request.vehicleUnitId);
        if (crewIndex < 0 || vehicleIndex < 0 || crewIndex >= crewBatch.Entities.Count() || vehicleIndex >= vehicleBatch.Entities.Count()) { Report(request.requestId,"failed","Vehicle control identity is unavailable",""); return; }
        string key = VehicleControlKey(request); COMMAND_ORBAT_VehicleControlLease prior;
        if (request.kind == "convoy-detach")
        {
            if (m_Convoys.Find(key,prior))
            {
                if (prior.TargetVehicle != vehicleBatch.Entities[vehicleIndex]) { Report(request.requestId,"failed","Detach vehicle differs from the attached convoy",""); return; }
                prior.Stop(); m_Convoys.Remove(key);
            }
            Report(request.requestId,"executed","Owned convoy follow detached or already ended; occupants remain aboard",""); return;
        }
        if (m_Convoys.Contains(key)) { Report(request.requestId,"failed","Detach the current convoy before assigning another vehicle order",""); return; }
        if (request.timeoutSeconds < 15 || request.timeoutSeconds > 300) { Report(request.requestId,"failed","Vehicle timeout must be 15 to 300 seconds",""); return; }
        COMMAND_ORBAT_VehicleControlLease lease = new COMMAND_ORBAT_VehicleControlLease(); lease.Request = request; lease.Group = SCR_AIGroup.Cast(crewBatch.Entities[crewIndex]); lease.TargetVehicle = vehicleBatch.Entities[vehicleIndex];
        if (!lease.Group || !lease.TargetVehicle) { Report(request.requestId,"failed","Owned crew group or vehicle is unavailable",""); return; }
        COMMAND_ORBAT_OwnedRoute previousRoute; array<AIWaypoint> previous = {};
        if (crewBatch.Routes.Find(request.unitId,previousRoute) && previousRoute) previous.Copy(previousRoute.Waypoints);
        string problem = JSOC_ORBAT_AIOrders.Check(lease.Group,null,previous,true);
        if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
        array<AIAgent> agents = {}; lease.Group.GetAgents(agents);
        foreach (AIAgent agent : agents) if (agent && agent.GetControlledEntity()) lease.Members.Insert(agent.GetControlledEntity());
        lease.Driver = COMMAND_ORBAT_VehicleControlLease.CurrentDriver(lease.TargetVehicle); lease.ControlFaction = COMMAND_ORBAT_TransportLease.VehicleFaction(lease.TargetVehicle);
        if (request.kind == "convoy-attach")
        {
            JSOC_ORBAT_GMSpawnGroup leadBatch;
            if (!SafeKey(request.leaderRequestId) || !SafeKey(request.leaderUnitId) || !m_Owned.Find(request.leaderRequestId,leadBatch) || leadBatch.Recruited) { Report(request.requestId,"failed","Convoy lead vehicle is not owned",""); return; }
            int leadIndex = leadBatch.UnitIds.Find(request.leaderUnitId);
            if (leadIndex < 0 || leadIndex >= leadBatch.Entities.Count()) { Report(request.requestId,"failed","Convoy lead vehicle identity is unavailable",""); return; }
            lease.Leader = leadBatch.Entities[leadIndex];
            if (ConvoyCycle(lease.TargetVehicle,lease.Leader)) { Report(request.requestId,"failed","Convoy cycles are not allowed",""); return; }
        }
        // Eligibility is checked before touching native vehicle registration.
        if (JSOC_ORBAT_AIOrders.PlayerOccupies(lease.Group) || JSOC_ORBAT_AIOrders.PlayerOccupies(lease.TargetVehicle) || !lease.TargetVehicle.FindComponent(CarControllerComponent) || !lease.Driver || lease.Members.Find(lease.Driver) < 0 || !COMMAND_ORBAT_SquadControl.SameFaction(lease.Group,lease.ControlFaction)) { Report(request.requestId,"failed","A supported same-faction AI crew and wheeled driver are required",""); return; }
        foreach (IEntity member : lease.Members) if (COMMAND_ORBAT_TransportLease.MountedIn(member) != lease.TargetVehicle) { Report(request.requestId,"failed","All crew members must be aboard the exact selected vehicle",""); return; }
        COMMAND_ORBAT_VehicleInspection seats = COMMAND_ORBAT_VehicleInspection.Read(lease.TargetVehicle);
        if (!seats || seats.players > 0 || seats.other > 0 || seats.occupied != lease.Members.Count()) { Report(request.requestId,"failed","Foreign or human occupants are protected",""); return; }
        problem = lease.Validate(false);
        if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
        COMMAND_ORBAT_VehicleBinding binding = RegisterDrivingVehicle(crewBatch,request.unitId,lease.Group,lease.TargetVehicle);
        if (!binding) { Report(request.requestId,"failed","Native vehicle registration unavailable",""); return; }
        lease.Assignment = lease.Group.GetGroupUtilityComponent().m_VehicleMgr.FindVehicle(lease.TargetVehicle);
        problem = lease.Validate();
        if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
        if (!lease.CreateWaypoints()) { Report(request.requestId,"failed","Required native vehicle route or follow waypoint unavailable",""); return; }
        if (!COMMAND_ORBAT_RouteOrders.Replace(lease.Group,previous,lease.Waypoints)) { COMMAND_ORBAT_RouteOrders.DeleteWaypoints(lease.Waypoints); Report(request.requestId,"failed","Vehicle waypoint attachment failed; prior orders retained",""); return; }
        lease.Installed = true;
        SnapshotForgetMovement(crewBatch,request.unitId);
        crewBatch.Routes.Remove(request.unitId); crewBatch.Orders.Remove(request.unitId); crewBatch.Follows.Remove(request.unitId);
        lease.Deadline = GetGame().GetWorld().GetWorldTime() + request.timeoutSeconds*1000;
        if (request.kind == "vehicle-route") { m_Driving = lease; Status = "Vehicle route running; waiting for observed ordered arrivals"; }
        else { m_Convoys.Set(key,lease); Report(request.requestId,"executed",string.Format("Native convoy follow installed for %1 seconds; this is not a live convoy-state report",request.timeoutSeconds),""); }
        GetGame().GetCallqueue().Remove(TickVehicleControl); GetGame().GetCallqueue().CallLater(TickVehicleControl,200,true);
    }
    protected void TickVehicleControl()
    {
        array<string> retired = {};
        foreach (string key, COMMAND_ORBAT_VehicleControlLease convoy : m_Convoys)
        {
            string reason = convoy.Validate();
            if (reason.IsEmpty()) reason = convoy.UpdateConvoy();
            if (!reason.IsEmpty() || GetGame().GetWorld().GetWorldTime() >= convoy.Deadline) { convoy.Stop(); retired.Insert(key); Status = "Convoy follow ended on timeout or changed eligibility"; }
        }
        foreach (string retiredKey : retired) m_Convoys.Remove(retiredKey);
        if (!m_Driving)
        {
            if (m_Convoys.Count() == 0) GetGame().GetCallqueue().Remove(TickVehicleControl);
            return;
        }
        if (m_Busy) return;
        string problem = m_Driving.Validate(); m_Driving.ObserveRoute();
        bool complete = m_Driving.Reached == m_Driving.Request.waypoints.Count();
        bool expired = GetGame().GetWorld().GetWorldTime() >= m_Driving.Deadline;
        if (problem.IsEmpty() && !complete && !expired)
        {
            float now = GetGame().GetWorld().GetWorldTime();
            if (now >= m_Driving.PollAt) { m_Driving.PollAt = now + 1000; Post("poll",string.Format("{\"token\":\"%1\"}",m_Code)); }
            return;
        }
        string id = m_Driving.Request.requestId; string status = "failed";
        if (complete && problem.IsEmpty()) status = "executed";
        string message = string.Format("Observed vehicle route: %1 of %2 points reached in order",m_Driving.Reached,m_Driving.Request.waypoints.Count());
        if (expired) message += "; timed out";
        if (!problem.IsEmpty()) message += "; " + problem;
        m_Driving.Stop(); m_Driving = null; Report(id,status,message,"");
    }

    protected ref COMMAND_ORBAT_HealingLease m_Healing;
    protected void StopHealing()
    {
        if (GetGame()) GetGame().GetCallqueue().Remove(TickHealing);
        if (m_Healing) m_Healing.Stop();
        m_Healing = null;
    }
    protected void BeginHealing(JSOC_ORBAT_GMRequest request)
    {
        if (request.version != 2 || m_CapabilityMode < 11 || !m_OrdersAllowed || m_Healing || m_Transport || m_Driving || m_RestoringSnapshot || request.timeoutSeconds < 15 || request.timeoutSeconds > 120) { Report(request.requestId,"failed","Updated paired healing support and 15 to 120 second timeout required",""); return; }
        JSOC_ORBAT_GMSpawnGroup batch;
        if (!SafeKey(request.targetRequestId) || !SafeKey(request.unitId) || !m_Owned.Find(request.targetRequestId,batch) || batch.Recruited && !LeaseValid(batch)) { Report(request.requestId,"failed","Healing squad ownership unavailable",""); return; }
        int index = batch.UnitIds.Find(request.unitId);
        if (index < 0 || index >= batch.Entities.Count()) { Report(request.requestId,"failed","Healing squad identity unavailable",""); return; }
        SCR_AIGroup group = SCR_AIGroup.Cast(batch.Entities[index]);
        COMMAND_ORBAT_OwnedRoute previousRoute; array<AIWaypoint> previous = {};
        if (batch.Routes.Find(request.unitId,previousRoute) && previousRoute) previous.Copy(previousRoute.Waypoints);
        string problem = JSOC_ORBAT_AIOrders.Check(group,null,previous);
        if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
        COMMAND_ORBAT_HealingLease lease = new COMMAND_ORBAT_HealingLease(); lease.Request = request; lease.Group = group;
        array<AIAgent> agents = {}; group.GetAgents(agents);
        if (agents.Count() < 2) { Report(request.requestId,"failed","Treatment requires a squad mate to provide native medical care",""); return; }
        foreach (AIAgent agent : agents) lease.Members.Insert(agent.GetControlledEntity());
        lease.Patient = COMMAND_ORBAT_HealingLease.WoundedMember(group); lease.InitialBandages = COMMAND_ORBAT_HealingLease.Bandages(group);
        if (!lease.Patient || lease.InitialBandages < 1) { Report(request.requestId,"failed","No supported bleeding patient or bandage in selected squad",""); return; }
        FactionAffiliationComponent affiliation = FactionAffiliationComponent.Cast(lease.Patient.FindComponent(FactionAffiliationComponent));
        if (affiliation && affiliation.GetAffiliatedFaction()) lease.ControlFaction = affiliation.GetAffiliatedFaction().GetFactionKey();
        ResourceName name = "{36ED7C150D5BB654}Prefabs/AI/Waypoints/AIWaypoint_Heal.et"; Resource resource = Resource.Load(name);
        if (!resource || !resource.IsValid() || !resource.GetResource() || resource.GetResource().GetResourceName() != name) { Report(request.requestId,"failed","Native treatment waypoint unavailable",""); return; }
        EntitySpawnParams parameters = new EntitySpawnParams(); parameters.TransformMode = ETransformMode.WORLD; Math3D.AnglesToMatrix(vector.Zero,parameters.Transform); parameters.Transform[3] = lease.Patient.GetOrigin();
        IEntity entity = GetGame().SpawnEntityPrefab(resource,GetGame().GetWorld(),parameters); lease.Waypoint = SCR_EntityWaypoint.Cast(entity);
        if (!lease.Waypoint) { if (entity) SCR_EntityHelper.DeleteEntityAndChildren(entity); Report(request.requestId,"failed","Native treatment target unavailable",""); return; }
        lease.Waypoint.SetEntity(lease.Patient);
        // Eligibility is checked before replacing any prior owned order.
        array<AIWaypoint> before = {}; group.GetWaypoints(before);
        foreach (AIWaypoint point : before) if (point && previous.Find(point) < 0) { SCR_EntityHelper.DeleteEntityAndChildren(entity); Report(request.requestId,"failed","Foreign waypoint protects selected squad",""); return; }
        if (lease.ControlFaction.IsEmpty() || !COMMAND_ORBAT_SquadControl.SameFaction(group,lease.ControlFaction)) { SCR_EntityHelper.DeleteEntityAndChildren(entity); Report(request.requestId,"failed","Treatment requires a resolved same-faction squad",""); return; }
        array<AIWaypoint> next = {lease.Waypoint};
        if (!COMMAND_ORBAT_RouteOrders.Replace(group,previous,next)) { SCR_EntityHelper.DeleteEntityAndChildren(entity); Report(request.requestId,"failed","Treatment waypoint attachment failed",""); return; }
        SnapshotForgetMovement(batch,request.unitId);
        batch.Routes.Remove(request.unitId); batch.Orders.Remove(request.unitId); batch.Follows.Remove(request.unitId);
        lease.Deadline = GetGame().GetWorld().GetWorldTime() + request.timeoutSeconds*1000; m_Healing = lease;
        Status = "Native treatment running for one wounded squad member"; GetGame().GetCallqueue().CallLater(TickHealing,200,true);
    }
    protected void TickHealing()
    {
        if (!m_Healing || m_Busy) return;
        string problem = m_Healing.Validate(); JSOC_ORBAT_GMSpawnGroup batch;
        if (!m_Owned.Find(m_Healing.Request.targetRequestId,batch) || batch.Recruited && !LeaseValid(batch)) problem = "Healing squad authority revoked";
        bool complete = problem.IsEmpty() && m_Healing.Completed();
        float now = GetGame().GetWorld().GetWorldTime(); bool expired = now >= m_Healing.Deadline;
        if (problem.IsEmpty() && !complete && !expired)
        {
            if (now >= m_Healing.PollAt) { m_Healing.PollAt = now+1000; Post("poll",string.Format("{\"token\":\"%1\"}",m_Code)); }
            return;
        }
        string id = m_Healing.Request.requestId; string status = "failed"; string message = "Native treatment did not complete";
        if (complete) { status = "executed"; message = "Observed native treatment: one squad member stopped bleeding and a real bandage was consumed; other injuries may remain"; }
        else if (expired) message += "; timed out";
        if (!problem.IsEmpty()) message += "; " + problem;
        StopHealing(); Report(id,status,message,"");
    }

};
