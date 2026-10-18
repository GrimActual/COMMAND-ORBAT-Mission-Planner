// Original neutral diagnostic fixture. Automatic host approval is isolated-test-only.
// Do not compile this probe into the production addon. Uses a separately supplied loopback profile config.
modded class SCR_AIGroupUtilityComponent
{
 string COMMANDTransportActivityTrace()
 {
  if(m_CurrentActivity)return m_CurrentActivity.GetActionDebugInfo();
  return "none";
 }
};
modded class JSOC_ORBAT_HostGM
{
 int DiagnosticTicks;
 void TraceTransport()
 {
  if(!m_Transport)return;
  DiagnosticTicks++;
  if(DiagnosticTicks%5!=0)return;
  SCR_AIGroupUtilityComponent groupUtility=m_Transport.Group.GetGroupUtilityComponent();
  string activity="none";
  activity=groupUtility.COMMANDTransportActivityTrace();
  PrintFormat("[COMMAND TRANSPORT] activity=%1 usable=%2",activity,groupUtility.IsUsableVehicle(m_Transport.Target));
  array<AIAgent> agents={};m_Transport.Group.GetAgents(agents);
  foreach(AIAgent agent:agents)
  {
   SCR_AIUtilityComponent utility=SCR_AIUtilityComponent.Cast(agent.FindComponent(SCR_AIUtilityComponent));
   string behavior="none";
   if(utility&&utility.GetCurrentBehavior())behavior=utility.GetCurrentBehavior().GetActionDebugInfo();
   PrintFormat("[COMMAND TRANSPORT] member=%1 behavior=%2",agent.GetControlledEntity().GetOrigin(),behavior);
  }
  COMMAND_ORBAT_VehicleInspection snapshot=COMMAND_ORBAT_VehicleInspection.Read(m_Transport.Target);
  array<AIWaypoint> points={};m_Transport.Group.GetWaypoints(points);
  PrintFormat("[COMMAND TRANSPORT] completed=%1 occupied=%2 waypoints=%3 problem=%4 leader=%5 vehicle=%6",m_Transport.CompletedMembers(),snapshot.occupied,points.Count(),m_Transport.Validate(false),m_Transport.Group.GetLeaderEntity().GetOrigin(),m_Transport.Target.GetOrigin());
 }
};
class COMMAND_TransportRuntime
{
 static ref JSOC_ORBAT_HostGM Host;static string Approved;
 static void Start()
 {
  JsonLoadContext config=new JsonLoadContext();string endpoint,code;
  if(!config.LoadFromFile("$profile:RouteTest.json")||!config.ReadValue("endpoint",endpoint)||!config.ReadValue("code",code))return;
  Host=new JSOC_ORBAT_HostGM();Host.Pair(endpoint,code);GetGame().GetCallqueue().CallLater(Poll,200,true);
 }
 static void Poll()
 {
  Host.TraceTransport();
  if(Host.CanApprove()&&Host.Pending.request.requestId!=Approved){Approved=Host.Pending.request.requestId;Host.Approve();}
  else if(!Host.Pending)Host.Poll();
 }
};
modded class SCR_BaseGameMode{override void OnGameStart(){super.OnGameStart();COMMAND_TransportRuntime.Start();}};
