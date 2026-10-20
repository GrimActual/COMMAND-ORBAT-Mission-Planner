// Original COMMAND refuelling adapter. Uses the stock support-station action and real provider fuel.
modded class SCR_BaseUseSupportStationAction
{
 SCR_BaseSupportStationComponent COMMAND_RefuelStation(IEntity actor)
 {
  ESupportStationReasonInvalid reason;
  return GetClosestValidSupportStation(GetOwner(),actor,reason);
 }
};
modded class SCR_FuelSupportStationComponent
{
 float COMMAND_ProviderFuel()
 {
  if (!m_SupportStationFuelManager) return -1;
  return m_SupportStationFuelManager.GetTotalFuel();
 }
};
class COMMAND_ORBAT_RefuelLease
{
 IEntity Target; IEntity Provider; IEntity Actor;
 SCR_RefuelAtSupportStationAction Action;
 SCR_FuelSupportStationComponent Station;
 SCR_FuelManagerComponent TargetFuel;
 float TargetBefore; float ProviderBefore; float PerformedAt;
 bool Started; bool Attempted;
 int Scanned;
 void FindAction(IEntity root)
 {
  if (!root || Action || Scanned >= 512) return;
  Scanned++;
  BaseActionsManagerComponent manager = BaseActionsManagerComponent.Cast(root.FindComponent(ActionsManagerComponent));
  if (manager)
  {
   array<BaseUserAction> actions = {}; manager.GetActionsList(actions);
   foreach (BaseUserAction candidate : actions)
   {
    SCR_RefuelAtSupportStationAction refuel = SCR_RefuelAtSupportStationAction.Cast(candidate);
    if (refuel && refuel.CanBeShownScript(Actor)) { Action=refuel; return; }
   }
  }
  IEntity child=root.GetChildren();
  while (child && !Action && Scanned < 512) { FindAction(child); child=child.GetSibling(); }
 }
 static bool BelongsTo(IEntity child,IEntity root)
 {
  int depth;
  while (child && depth < 64) { if (child==root) return true; child=child.GetParent(); depth++; }
  return false;
 }
 string Validate()
 {
  if (!Target || !Provider || !Actor || !Action || !TargetFuel || Target==Provider) return "Refuel identity or supported action unavailable";
  if (JSOC_ORBAT_AIOrders.PlayerOccupies(Target) || JSOC_ORBAT_AIOrders.PlayerOccupies(Provider) || JSOC_ORBAT_AIOrders.PlayerOccupies(Actor)) return "Player-controlled or player-occupied refuel targets are protected";
  SCR_EditableCharacterComponent character=SCR_EditableCharacterComponent.Cast(Actor.FindComponent(SCR_EditableCharacterComponent));
  string faction=COMMAND_ORBAT_TransportLease.VehicleFaction(Target);
  if (!character || character.IsDestroyed() || !character.GetFaction() || faction.IsEmpty() || faction=="NO_FACTION" || character.GetFaction().GetFactionKey()!=faction || COMMAND_ORBAT_TransportLease.VehicleFaction(Provider)!=faction) return "Refuel operator, provider and vehicle factions must match";
  return "";
 }
 // 0 waits for stock readiness, 1 is an observed transfer, -1 is a refusal/failure.
 int Tick(out string problem)
 {
  problem=Validate(); if (!problem.IsEmpty()) return -1;
  if (!Started) { Action.OnActionStart(Actor); Started=true; return 0; }
  if (!Attempted)
  {
   if (!Action.CanBeShownScript(Actor) || !Action.CanBePerformedScript(Actor)) return 0;
   Station=SCR_FuelSupportStationComponent.Cast(Action.COMMAND_RefuelStation(Actor));
   SCR_FuelSupportStationComponent selectedProvider=SCR_FuelSupportStationComponent.Cast(SCR_BaseSupportStationComponent.FindSupportStation(Provider));
   if (!Station || Station!=selectedProvider) { problem="Selected tanker is not the stock action's available support station"; return -1; }
   if (!Station.IsEnabled() || Station.COMMAND_ProviderFuel()<=0) { problem="Selected support station has no available physical fuel"; return -1; }
   TargetBefore=TargetFuel.GetTotalFuel(); ProviderBefore=Station.COMMAND_ProviderFuel();
   // The game action performs its own range, fuel, equipment and scenario-supply checks.
   Action.PerformAction(Action.GetOwner(),Actor);
   Attempted=true; PerformedAt=GetGame().GetWorld().GetWorldTime();
  }
  float targetAfter=TargetFuel.GetTotalFuel(), providerAfter=Station.COMMAND_ProviderFuel();
  float received=targetAfter-TargetBefore, consumed=ProviderBefore-providerAfter;
  if (received>0.01 && consumed>0.01 && Math.AbsFloat(received-consumed)<0.25)
  {
   problem=string.Format("Observed refuel: target %1 -> %2 L; provider %3 -> %4 L",TargetBefore,targetAfter,ProviderBefore,providerAfter);
   return 1;
  }
  if (GetGame().GetWorld().GetWorldTime()-PerformedAt>3000) { problem="Stock refuel action produced no verified matching fuel transfer; inspect current fuel before retrying"; return -1; }
  return 0;
 }
 void Stop() { if (Started && Action && Actor) Action.OnActionCanceled(Action.GetOwner(),Actor); }
};
modded class JSOC_ORBAT_HostGM
{
 protected ref JSOC_ORBAT_GMRequest m_RefuelRequest;
 protected float m_RefuelDeadline; protected float m_RefuelPollAt;
 override void Post(string action,string body)
 {
  if (action=="poll" && m_CapabilityMode>=15) body.Replace("\"entity-control-v1\"","\"entity-control-v1\",\"logistics-refuel-v1\"");
  super.Post(action,body);
 }
 override bool CanApprove()
 {
  if (m_Refuel) { return false; }
  return super.CanApprove();
 }
 override void Poll() { if (m_Refuel) { TickRefuel(); return; } super.Poll(); }
 IEntity RefuelOwned(string requestId,string unit)
 {
  JSOC_ORBAT_GMSpawnGroup batch;
  if (!SafeKey(requestId) || !SafeKey(unit) || !m_Owned.Find(requestId,batch) || !batch || batch.Recruited || batch.RetiredPairing) return null;
  int index=batch.UnitIds.Find(unit);
  if (index<0 || index>=batch.Entities.Count()) return null;
  return batch.Entities[index];
 }
 override string Preview(int index)
 {
  if (Pending && Pending.request && Pending.request.kind=="logistics-refuel")
  {
   JSOC_ORBAT_GMRequest r=Pending.request;
   return string.Format("REFUEL ONCE\nVehicle %1 / %2\nTanker %3 / %4\nAI operator %5 / %6\nOne stock refuelling interaction. Native range, equipment and scenario supplies remain enforced. Success requires observed vehicle gain and provider fuel consumption.",r.targetRequestId,r.unitId,r.vehicleRequestId,r.vehicleUnitId,r.actorRequestId,r.actorUnitId);
  }
  return super.Preview(index);
 }
 override void ExecuteApproved(JSOC_ORBAT_GMRequest request)
 {
  if (!request || request.kind!="logistics-refuel")
  {
   if (m_Refuel) { if (request) Report(request.requestId,"failed","A refuel interaction owns the execution slot",""); return; }
   super.ExecuteApproved(request); return;
  }
  if (!Replication.IsServer() || !SafeKey(request.requestId) || request.requestId.Length()>40) return;
  string cached;
  if (m_Results.Find(request.requestId,cached)) { Post("result",cached); return; }
  if (m_RefuelRequest && m_RefuelRequest.requestId==request.requestId) return;
  if (m_Refuel || m_OccupiedRequest || m_Flight || m_Transport || m_Driving || m_Healing || m_RestoringSnapshot || !m_OrdersAllowed || m_CapabilityMode<15 || request.version!=2 || request.timeoutSeconds<5 || request.timeoutSeconds>30 || m_Results.Count()>=100) { Report(request.requestId,"failed","Refuel requires current support, bounded timeout and an idle execution slot",""); return; }
  COMMAND_ORBAT_RefuelLease lease=new COMMAND_ORBAT_RefuelLease();
  lease.Target=RefuelOwned(request.targetRequestId,request.unitId);
  lease.Provider=RefuelOwned(request.vehicleRequestId,request.vehicleUnitId);
  lease.Actor=RefuelOwned(request.actorRequestId,request.actorUnitId);
  if (lease.Target) lease.TargetFuel=SCR_FuelManagerComponent.Cast(lease.Target.FindComponent(SCR_FuelManagerComponent));
  lease.FindAction(lease.Target);
  string problem=lease.Validate();
  if (!problem.IsEmpty()) { Report(request.requestId,"failed",problem,""); return; }
  m_Refuel=lease; m_RefuelRequest=request;
  m_RefuelDeadline=GetGame().GetWorld().GetWorldTime()+request.timeoutSeconds*1000; m_RefuelPollAt=0;
  GetGame().GetCallqueue().CallLater(TickRefuel,100,true);
  Status="Refuel waiting for native support-station readiness";
 }
 protected void StopRefuel()
 {
  if (m_Refuel) m_Refuel.Stop();
  m_Refuel=null; m_RefuelRequest=null;
  if (GetGame()) GetGame().GetCallqueue().Remove(TickRefuel);
 }
 protected void TickRefuel()
 {
  if (!m_Refuel || !m_RefuelRequest || m_Busy) return;
  string id=m_RefuelRequest.requestId; float now=GetGame().GetWorld().GetWorldTime();
  if (now>=m_RefuelDeadline) { StopRefuel(); Report(id,"failed","Refuel timed out; no verified fuel transfer",""); return; }
  if (now>=m_RefuelPollAt) { m_RefuelPollAt=now+500; Post("poll",string.Format("{\"token\":\"%1\"}",m_Code)); return; }
  string problem; int outcome=m_Refuel.Tick(problem);
  if (outcome==0) return;
  StopRefuel();
  if (outcome>0) Report(id,"executed",problem,""); else Report(id,"failed",problem,"");
 }
 override void Complete(string action,int code,string data)
 {
  if (action!="poll" || !m_Refuel) { super.Complete(action,code,data); return; }
  m_Busy=false;
  if (code==401 || code==423) { Stop(); return; }
  if (code!=200) return;
  JsonLoadContext json=new JsonLoadContext(); JSOC_ORBAT_GMRecord record;
  if (!json.LoadFromString(data) || !json.ReadValue("record",record) || !record || !record.request || record.phase!="approved" || record.request.requestId!=m_RefuelRequest.requestId)
  { StopRefuel(); Pending=null; Status="Refuel cancelled or expired; existing entities retained"; }
 }
 override void Stop() { StopRefuel(); super.Stop(); }
};
