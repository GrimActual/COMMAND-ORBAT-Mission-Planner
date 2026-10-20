modded class JSOC_ORBAT_GMRequest { float cruiseSpeedMps; string flightMode; };
// Original optional COMMAND experimental flight integration. Does not modify spawning/schema classes.
class COMMAND_HelicopterProgress
{
 string phase;float elapsed;bool landed;bool grounded;int unloaded;bool pilotAboard;int passengersAboard;float worldX;float worldY;float worldZ;
};
class COMMAND_HelicopterSyncRecord
{
 ref JSOC_ORBAT_GMRequest request;string phase;bool cancelRequested;ref COMMAND_HelicopterProgress progress;
};
modded class JSOC_ORBAT_HostGM
{
 protected ref COMMAND_HelicopterFlightLease m_Flight;
 protected ref JSOC_ORBAT_GMRequest m_FlightRequest;
 protected bool m_FlightDetached;
 protected float m_FlightSyncAt;
 override void Post(string action,string body)
 {
  if(action=="poll" && m_CapabilityMode>=14) {body.Replace("\"entity-control-v1\"","\"entity-control-v1\",\"helicopter-insert-experimental-v1\",\"helicopter-profile-v2\"");}
  super.Post(action,body);
 }
 override bool CanApprove()
 {
  if(m_Flight) {return false;}
  return super.CanApprove();
 }
 override void Poll()
 {
  if(m_Flight) {TickFlight();return;}
  super.Poll();
 }
 override string Preview(int index)
 {
  if(Pending && Pending.request && Pending.request.kind=="helicopter-insert")
  {
   JSOC_ORBAT_GMRequest r=Pending.request;
   string summary=string.Format("EXPERIMENTAL HELICOPTER INSERTION\nAircraft %1 / %2\nPassengers %3 / %4\nClear flat LZ X %5 Z %6\nVanilla UH-1H; one AI pilot and four seated cargo passengers. Reviewed route up to 1000 m total. Travel speed and route are validated separately. Operator must inspect departure and LZ; general obstacle avoidance remains experimental. Host must verify route and LZ.\nApproval starts actual flight. Success requires sustained landing and four completed exits. Airborne cancellation lands at this LZ and retains passengers. Any human entering the aircraft immediately releases assistance.",r.vehicleRequestId,r.vehicleUnitId,r.targetRequestId,r.unitId,r.worldX,r.worldZ)+string.Format("\nReviewed travel speed: %1 m/s; intermediate waypoints: %2",r.cruiseSpeedMps,r.waypoints.Count());
   summary+="\nFlight ending: "+r.flightMode+". Patrol stays airborne while this authorized session is alive; cancellation follows the reviewed route to the LZ and retains passengers.";
   foreach(int i,COMMAND_ORBAT_RoutePoint point:r.waypoints) {summary+=string.Format("\nWP %1: X %2 Z %3",i+1,point.worldX,point.worldZ);}
   return summary;
  }
  return super.Preview(index);
 }
 override void ExecuteApproved(JSOC_ORBAT_GMRequest request)
 {
  if(!request || request.kind!="helicopter-insert")
  {
   if(m_Flight) {if(request) {Report(request.requestId,"failed","A helicopter flight still owns the execution slot","");}return;}
   super.ExecuteApproved(request);return;
  }
  if(!Replication.IsServer() || !SafeKey(request.requestId) || request.requestId.Length()>40) {return;}
  if(m_Flight && m_FlightRequest && request.requestId==m_FlightRequest.requestId) {return;}
  string cached;if(m_Results.Find(request.requestId,cached)) {Post("result",cached);return;}
  if(m_Flight || m_Refuel || m_OccupiedRequest || m_Transport || m_Driving || m_Healing || m_RestoringSnapshot || m_Results.Count()>=100 || request.version!=2 || !m_OrdersAllowed || m_CapabilityMode<14 || (request.timeoutSeconds!=300 && request.timeoutSeconds!=600))
  {Report(request.requestId,"failed","Experimental flight requires current negotiated support and an idle execution slot","");return;}
  if(!SafeKey(request.targetRequestId) || !SafeKey(request.unitId) || !SafeKey(request.vehicleRequestId) || !SafeKey(request.vehicleUnitId) || !(request.worldX>=0 && request.worldX<=13500 && request.worldZ>=0 && request.worldZ<=13500))
  {Report(request.requestId,"failed","Invalid flight target identities or landing zone","");return;}
  JSOC_ORBAT_GMSpawnGroup squadBatch;JSOC_ORBAT_GMSpawnGroup aircraftBatch;
  if(!m_Owned.Find(request.targetRequestId,squadBatch) || !m_Owned.Find(request.vehicleRequestId,aircraftBatch) || squadBatch.Recruited || aircraftBatch.Recruited || squadBatch.RetiredPairing || aircraftBatch.RetiredPairing)
  {Report(request.requestId,"failed","Flight requires current pairing-owned deployments","");return;}
  int squadIndex=squadBatch.UnitIds.Find(request.unitId);int aircraftIndex=aircraftBatch.UnitIds.Find(request.vehicleUnitId);
  if(squadIndex<0 || squadIndex>=squadBatch.Entities.Count() || aircraftIndex<0 || aircraftIndex>=aircraftBatch.Entities.Count())
  {Report(request.requestId,"failed","Flight target identity unavailable","");return;}
  SCR_AIGroup squad=squadBatch.ControlGroup(squadIndex);IEntity aircraftEntity=aircraftBatch.Entities[aircraftIndex];
  string reason=JSOC_ORBAT_AIOrders.Check(squad,null,null,true);
  if(!reason.IsEmpty()) {Report(request.requestId,"failed",reason,"");return;}
  if(!aircraftEntity || squadBatch.Entities[squadIndex]==aircraftEntity || !COMMAND_ORBAT_SquadControl.SameFaction(squad,COMMAND_ORBAT_TransportLease.VehicleFaction(aircraftEntity)))
  {Report(request.requestId,"failed","Passenger squad and aircraft identities or faction differ","");return;}
  HelicopterControllerComponent controller=HelicopterControllerComponent.Cast(aircraftEntity.FindComponent(HelicopterControllerComponent));
  PilotCompartmentSlot pilotSlot;if(controller) {pilotSlot=controller.GetPilotCompartmentSlot();}
  if(!pilotSlot || !pilotSlot.GetOccupant()) {Report(request.requestId,"failed","A seated AI pilot is required","");return;}
  array<AIAgent> agents={};squad.GetAgents(agents);array<IEntity> passengers={};
  foreach(AIAgent agent:agents) {if(!agent || !agent.GetControlledEntity()) {Report(request.requestId,"failed","Passenger member unavailable","");return;}passengers.Insert(agent.GetControlledEntity());}
  if(request.cruiseSpeedMps!=0 && request.cruiseSpeedMps!=4 && request.cruiseSpeedMps!=8 && request.cruiseSpeedMps!=12) {Report(request.requestId,"failed","Unsupported reviewed cruise speed","");return;}
  ref COMMAND_HelicopterFlightLease lease=new COMMAND_HelicopterFlightLease();
  if(!request.flightMode.IsEmpty() && request.flightMode!="land" && request.flightMode!="patrol" && request.flightMode!="patrol-loop") {Report(request.requestId,"failed","Invalid flight ending","");return;}
  if(!request.flightMode.IsEmpty()) {lease.RouteMode=request.flightMode;}
  if(lease.RouteMode!="land" && (request.timeoutSeconds!=600 || request.waypoints.Count()<1)) {Report(request.requestId,"failed","Patrol requires reviewed route points","");return;}
  lease.CruiseSpeed=4;if(request.cruiseSpeedMps>0) {lease.CruiseSpeed=request.cruiseSpeedMps;}
  lease.HardDeadline=request.timeoutSeconds-30;lease.SoftDeadline=lease.HardDeadline-30;
  foreach(COMMAND_ORBAT_RoutePoint routePoint:request.waypoints) {if(!routePoint) {Report(request.requestId,"failed","Invalid flight route point","");return;}lease.Route.Insert(Vector(routePoint.worldX,0,routePoint.worldZ));}
  reason=COMMAND_HelicopterFlightDispatcher.StartReviewed(lease,request.requestId,aircraftEntity,pilotSlot.GetOccupant(),passengers,Vector(request.worldX,0,request.worldZ));
  if(!reason.IsEmpty()) {Report(request.requestId,"failed",reason,"");return;}
  m_Flight=lease;m_FlightRequest=request;m_FlightDetached=false;m_FlightSyncAt=0;
  Status="Experimental helicopter flight preparing; waiting for physical progress";
  GetGame().GetCallqueue().CallLater(TickFlight,250,true);
 }
 protected bool FlightTargetsCurrent()
 {
  if(!m_Flight || !m_FlightRequest) {return false;}
  JSOC_ORBAT_GMSpawnGroup squadBatch;JSOC_ORBAT_GMSpawnGroup aircraftBatch;
  if(!m_Owned.Find(m_FlightRequest.targetRequestId,squadBatch) || !m_Owned.Find(m_FlightRequest.vehicleRequestId,aircraftBatch)) {return false;}
  int si=squadBatch.UnitIds.Find(m_FlightRequest.unitId);int vi=aircraftBatch.UnitIds.Find(m_FlightRequest.vehicleUnitId);
  if(si<0 || vi<0 || si>=squadBatch.Entities.Count() || vi>=aircraftBatch.Entities.Count() || aircraftBatch.Entities[vi]!=m_Flight.Aircraft || squadBatch.RetiredPairing || aircraftBatch.RetiredPairing) {return false;}
  SCR_AIGroup group=squadBatch.ControlGroup(si);if(!group) {return false;}
  array<AIAgent> agents={};group.GetAgents(agents);if(agents.Count()!=m_Flight.Passengers.Count()) {return false;}
  foreach(AIAgent agent:agents) {if(!agent || m_Flight.Passengers.Find(agent.GetControlledEntity())<0) {return false;}}
  return true;
 }
 protected void TickFlight()
 {
  if(!m_Flight) {return;}
  if(m_Flight.Active && !m_FlightDetached && !FlightTargetsCurrent()) {m_Flight.RequestCancel();}
  Status=m_Flight.Phase;
  if(m_FlightDetached)
  {
   if(m_Flight.Done) {m_Outcome=m_Flight.Phase;m_Flight=null;m_FlightRequest=null;GetGame().GetCallqueue().Remove(TickFlight);}
   return;
  }
  float now=GetGame().GetWorld().GetWorldTime();if(m_Busy || now<m_FlightSyncAt || !m_Context) {return;}
  m_FlightSyncAt=now+1000;
  ref COMMAND_HelicopterProgress p=new COMMAND_HelicopterProgress();p.phase=m_Flight.Phase;p.elapsed=m_Flight.Elapsed;p.landed=m_Flight.LandedAtLZ;p.grounded=m_Flight.Sim && m_Flight.Sim.HasAnyGroundContact();p.unloaded=m_Flight.Unloaded;p.pilotAboard=m_Flight.Mounted(m_Flight.Pilot);
  foreach(IEntity actor:m_Flight.Passengers) {if(m_Flight.Mounted(actor)) {p.passengersAboard++;}}
  if(m_Flight.Aircraft) {vector position=m_Flight.Aircraft.GetOrigin();p.worldX=position[0];p.worldY=position[1];p.worldZ=position[2];}
  JsonSaveContext j=new JsonSaveContext();j.WriteValue("token",m_Code);j.WriteValue("requestId",m_FlightRequest.requestId);j.WriteValue("progress",p);string output=j.SaveToString();Post("flight-sync",output);
 }
 override void Complete(string action,int code,string data)
 {
  if(action!="flight-sync") {super.Complete(action,code,data);return;}
  m_Busy=false;
  if(!m_Flight) {return;}
  if(code==401 || code==423) {Stop();return;}
  if(code!=200) {Status="Flight progress delivery failed; physical controller remains active";return;}
  JsonLoadContext json=new JsonLoadContext();COMMAND_HelicopterSyncRecord record;
  if(data.Length()>32768 || !json.LoadFromString(data) || !json.ReadValue("record",record) || !record || !record.request || record.phase!="approved" || record.request.requestId!=m_FlightRequest.requestId)
  {m_Flight.RequestCancel();m_FlightDetached=true;Status="Flight authority changed; landing at approved LZ with remaining passengers";return;}
  if(record.cancelRequested) {m_Flight.RequestCancel();}
  else if(m_Flight.RouteMode!="land" && !m_Flight.CancelRequested && m_Flight.Elapsed<85800) {m_Flight.SoftDeadline=m_Flight.Elapsed+420;m_Flight.HardDeadline=m_Flight.Elapsed+450;}
  if(m_Flight.Done)
  {
   // Only report against the terminal progress actually acknowledged by the relay.
   if(!record.progress || record.progress.phase!=m_Flight.Phase) {m_FlightSyncAt=0;return;}
   string status="failed";string message=m_Flight.Phase;
   if(message.IndexOf("complete:")==0) {status="executed";}
   else if(message.IndexOf("cancelled:")==0) {status="cancelled";}
   string id=m_FlightRequest.requestId;m_Flight=null;m_FlightRequest=null;GetGame().GetCallqueue().Remove(TickFlight);Report(id,status,message,"");
  }
 }
 override void Stop()
 {
  if(m_Flight) {m_FlightDetached=true;m_Flight.RequestCancel();}
  super.Stop();
 }
 override void Pair(string endpoint,string code)
 {
  if(m_Flight && m_Flight.Active) {Status="Wait for the existing helicopter flight to land before a new pairing";return;}
  super.Pair(endpoint,code);
 }
};
