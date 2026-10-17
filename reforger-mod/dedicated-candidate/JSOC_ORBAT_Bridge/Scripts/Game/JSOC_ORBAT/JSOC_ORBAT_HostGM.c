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
    string unitId;
    string sourceEntityId;
    string followEntityId;
    string formation;
    string stance;
    string combatMode;
    float worldX;
    float worldZ;
    int holdSeconds;
    ref array<ref COMMAND_ORBAT_RoutePoint> waypoints = {};
    ref array<ref JSOC_ORBAT_GMEntityIntent> entities = {};
};
class JSOC_ORBAT_GMRecord
{
    ref JSOC_ORBAT_GMRequest request;
    string phase;
};
class JSOC_ORBAT_GMSpawnGroup
{
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
    protected bool m_Busy;
    protected bool m_LegacyRelay;
    protected bool m_OrdersAllowed;
    protected int m_CapabilityMode;
    protected string m_Expected;
    ref JSOC_ORBAT_GMRecord Pending;
    string Status = "No GM request loaded";
    void Pair(string endpoint, string code) { Stop(); m_LegacyRelay = false; m_OrdersAllowed = false; m_CapabilityMode = 5; m_Context = GetGame().GetRestApi().GetContext(endpoint); if (m_Context) m_Context.SetTimeout(5); m_Code = code; GetGame().GetCallqueue().CallLater(MaintainControl,1000,true); }
    void Stop() { if (GetGame()) GetGame().GetCallqueue().Remove(MaintainControl); array<string> releasedLeases = {}; foreach (string releaseKey, JSOC_ORBAT_GMSpawnGroup releaseBatch : m_Owned) { ClearPreferences(releaseBatch); if (releaseBatch.Recruited || releaseBatch.Follows.Count() > 0) ClearControlledOrders(releaseBatch); if (releaseBatch.Recruited) releasedLeases.Insert(releaseKey); } foreach (string retiredLease : releasedLeases) m_Owned.Remove(retiredLease); if (m_Callback) { m_Callback.Stopped = true; m_Callback.Owner = null; } m_Callback = null; m_Context = null; m_Code = ""; m_Busy = false; m_OrdersAllowed = false; Pending = null; }
    void Post(string action, string body)
    {
        if (!Replication.IsServer() || !m_Context || m_Busy) return;
        m_Busy = true; m_Callback = new JSOC_ORBAT_GMCallback(); m_Callback.Owner = this; m_Callback.Action = action;
        m_Context.POST(m_Callback, "gm-" + action, body);
    }
    void Poll()
    {
        Status = "Checking paired GM requests";
        if (m_LegacyRelay) Post("poll",string.Format("{\"token\":\"%1\"}",m_Code));
        else if (m_CapabilityMode == 1) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\"]}",m_Code));
        else if (m_CapabilityMode == 2) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\"]}",m_Code));
        else if (m_CapabilityMode == 3) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\"]}",m_Code));
        else if (m_CapabilityMode == 4) Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\"]}",m_Code));
        else Post("poll",string.Format("{\"token\":\"%1\",\"capabilities\":[\"ai-orders-v1\",\"ai-tactical-v1\",\"ai-routes-v1\",\"ai-squad-control-v1\",\"ai-follow-v1\",\"ai-formation-v1\",\"ai-stance-v1\",\"ai-fire-policy-v1\"]}",m_Code));
    }
    bool CanApprove() { return Pending && Pending.request && !m_Busy; }
    int PreviewCount() { if (!Pending || !Pending.request) { return 0; } if (Pending.request.kind == "ai-route") { return Pending.request.waypoints.Count(); } else { return Pending.request.entities.Count(); } }
    string Preview(int index)
    {
        if (!Pending || !Pending.request) return Status;
        JSOC_ORBAT_GMRequest request = Pending.request;
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
        if (!Pending || !Pending.request) return;
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
        if (code != 200) { Status = "GM relay rejected request or connection unavailable"; return; }
        if (action == "poll" && !m_LegacyRelay) m_OrdersAllowed = true;
        if (action == "result") { Status = "GM result acknowledged by Companion relay"; Pending = null; return; }
        if (data.Length() > 32768) { Status = "Oversized GM response rejected"; return; }
        JsonLoadContext json = new JsonLoadContext(); JSOC_ORBAT_GMRecord record;
        if (!json.LoadFromString(data) || !json.ReadValue("record", record) || !record || !record.request) { Pending = null; Status = "No pending GM request"; return; }
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
        if (!Replication.IsServer() || !request || (request.version != 1 && request.version != 2) || !SafeKey(request.requestId) || request.requestId.Length() > 40) return;
        string cached;
        if (m_Results.Find(request.requestId, cached)) { Post("result", cached); return; }
        if (m_Results.Count() >= 100) { Status = "Scene GM command budget reached"; return; }
        if (request.kind == "ai-recruit") { Recruit(request); return; }
        if (request.kind == "ai-move" || request.kind == "ai-hold" || request.kind == "ai-defend" || request.kind == "ai-halt" || request.kind == "ai-route" || request.kind == "ai-release" || request.kind == "ai-follow" || request.kind == "ai-formation" || request.kind == "ai-stance" || request.kind == "ai-combat-mode") { ExecuteAIOrder(request); return; }
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
            created.Entities.Insert(spawned); created.Ids.Insert(createdId); created.UnitIds.Insert(entity.unitId);
            if (!resultIds.IsEmpty()) resultIds += ","; resultIds += "\"" + createdId + "\"";
        }
        m_Owned.Insert(request.requestId, created); Report(request.requestId, "executed", "Approved prefab batch spawned", resultIds);
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
            if (batch.Recruited && !LeaseValid(batch)) { ClearControlledOrders(batch); batch.Revoked = true; continue; }
            if (!batch.Recruited && batch.Follows.Count() == 0 && batch.Preferences.Count() == 0) continue;
            foreach (int index, IEntity root : batch.Entities)
            {
                string unit = batch.UnitIds[index];
                COMMAND_ORBAT_FollowLease follow; batch.Follows.Find(unit,follow);
                if (!batch.Recruited && !follow && !batch.Preferences.Contains(unit)) continue;
                SCR_AIGroup group = SCR_AIGroup.Cast(root); AIWaypoint point; batch.Orders.Find(unit,point);
                COMMAND_ORBAT_OwnedRoute route; batch.Routes.Find(unit,route); array<AIWaypoint> points = {}; if (route) points = route.Waypoints;
                bool invalidControl = !JSOC_ORBAT_AIOrders.Check(group,point,points).IsEmpty(); bool invalid = invalidControl;
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
        if (ownedBatch.Recruited && !LeaseValid(ownedBatch)) { ClearControlledOrders(ownedBatch); ownedBatch.Revoked = true; Report(request.requestId,"failed","Recruited control expired or faction/selection changed",""); return; }
        SCR_AIGroup group = SCR_AIGroup.Cast(ownedBatch.Entities[index]); AIWaypoint previous;
        ownedBatch.Orders.Find(request.unitId,previous);
        COMMAND_ORBAT_OwnedRoute ownedRoute; ownedBatch.Routes.Find(request.unitId,ownedRoute);
        array<AIWaypoint> previousPoints = {};
        if (ownedRoute) { foreach (AIWaypoint ownedPoint : ownedRoute.Waypoints) if (ownedPoint) previousPoints.Insert(ownedPoint); }
        else if (previous) previousPoints.Insert(previous);
        string problem = JSOC_ORBAT_AIOrders.Check(group,previous,previousPoints);
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
            Report(request.requestId,"executed","Native squad setting applied; physical movement and combat outcome are not confirmed",""); return;
        }
        if ((request.kind == "ai-defend" || request.kind == "ai-halt") && m_CapabilityMode < 2) { Report(request.requestId,"failed","Paired relay did not negotiate tactical AI support",""); return; }
        if (request.kind == "ai-route" && (m_CapabilityMode < 3 || !COMMAND_ORBAT_RouteOrders.Valid(request))) { Report(request.requestId,"failed","Route requires negotiated support and 1 to 16 valid points",""); return; }
        if (request.kind == "ai-halt")
        {
            if (!COMMAND_ORBAT_RouteOrders.Cancel(group,previousPoints)) { Report(request.requestId,"failed","Owned route cancellation could not be confirmed",""); return; }
            ownedBatch.Orders.Remove(request.unitId); ownedBatch.Routes.Remove(request.unitId); ownedBatch.Follows.Remove(request.unitId);
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
};
