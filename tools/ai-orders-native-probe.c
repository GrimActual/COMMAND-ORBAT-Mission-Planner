modded class SCR_AIGroupUtilityComponent
{
 string COMMANDMovementTrace()
 {
  if(m_CurrentActivity)return m_CurrentActivity.Type().ToString();
  return "none";
 }
};
class COMMAND_AllOrdersProbe
{
 static SCR_AIGroup Squad;
 static IEntity FollowTarget;
 static ref array<AIWaypoint> Points={};
 static ref COMMAND_ORBAT_PreferenceLease Preferences;
 static int Phase;
 static int Age;
 static int Total;
 static vector StartPosition;
 static vector TargetPosition;
 static int SettingIndex;
 static bool HoldingStable=true;
 static void Record(string name,bool passed,string detail="")
 {
  PrintFormat("[COMMAND ORDERS] result=%1 passed=%2 detail=%3",name,passed,detail);
 }
 static vector Ground(float x,float z)
 {
  return Vector(x,GetGame().GetWorld().GetSurfaceY(x,z),z);
 }
 static void Start()
 {
  if(!Replication.IsServer())return;
  Resource resource=Resource.Load("{84E5BBAB25EA23E5}Prefabs/Groups/BLUFOR/Group_US_FireTeam.et");
  EntitySpawnParams parameters=new EntitySpawnParams();
  parameters.TransformMode=ETransformMode.WORLD;
  Math3D.AnglesToMatrix(vector.Zero,parameters.Transform);
  parameters.Transform[3]=Ground(4700,11950);
  Squad=SCR_AIGroup.Cast(GetGame().SpawnEntityPrefab(resource,GetGame().GetWorld(),parameters));
  Preferences=new COMMAND_ORBAT_PreferenceLease();
  GetGame().GetCallqueue().CallLater(Tick,1000,true);
 }
 static bool Install(string kind,vector target,int seconds=60)
 {
  array<AIWaypoint> next={};
  JSOC_ORBAT_GMRequest request=new JSOC_ORBAT_GMRequest();
  request.kind=kind;request.worldX=target[0];request.worldZ=target[2];request.holdSeconds=seconds;
  AIWaypoint point;
  if(kind=="ai-defend")point=COMMAND_ORBAT_TacticalOrders.CreateDefend(Squad,null,target[0],target[2],seconds,Points);
  else point=JSOC_ORBAT_AIOrders.Create(request,Squad);
  if(!point)return false;
  next.Insert(point);
  if(!COMMAND_ORBAT_RouteOrders.Replace(Squad,Points,next))return false;
  Points=next;
  return true;
 }
 static void Next(int phase)
 {
  Phase=phase;Age=0;StartPosition=Squad.GetLeaderEntity().GetOrigin();
  PrintFormat("[COMMAND ORDERS] phase=%1 origin=%2",Phase,StartPosition);
 }
 static void Tick()
 {
  Total++;Age++;
  if(Total>400){Record("fixture-timeout",false);Finish();return;}
  array<AIAgent> agents={};
  if(Squad)Squad.GetAgents(agents);
  if(!Squad||agents.Count()!=4||!Squad.GetLeaderEntity())return;
  vector position=Squad.GetLeaderEntity().GetOrigin();
  if(Age%5==0)PrintFormat("[COMMAND ORDERS] phase=%1 age=%2 position=%3 traveled=%4 activity=%5",Phase,Age,position,vector.DistanceXZ(position,StartPosition),Squad.GetGroupUtilityComponent().COMMANDMovementTrace());
  if(Phase==0)
  {
   if(Age<8)return;
   NavmeshWorldComponent nav=GetGame().GetAIWorld().GetNavmeshWorldComponent("Soldiers");
   Record("navigation-fixture",nav&&nav.IsTileLoaded(position)&&nav.IsTileValid(position));
   Record("group-preflight",JSOC_ORBAT_AIOrders.Check(Squad,null).IsEmpty());
   TargetPosition=Ground(4700,11990);
   Record("move-installed",Install("ai-move",TargetPosition));Next(1);return;
  }
  if(Phase==1)
  {
   if(vector.DistanceXZ(position,TargetPosition)>6&&Age<50)return;
   Record("move-travel",vector.DistanceXZ(position,TargetPosition)<=6,vector.DistanceXZ(position,StartPosition).ToString());
   Record("hold-installed",Install("ai-hold",position,30));Next(2);return;
  }
  if(Phase==2)
  {
   if(Age>3&&vector.DistanceXZ(position,StartPosition)>7)HoldingStable=false;
   if(Age<10)return;
   Record("hold-stationary",HoldingStable,vector.DistanceXZ(position,StartPosition).ToString());
   TargetPosition=Ground(4700,12070);
   Record("defend-installed",Install("ai-defend",TargetPosition,60));Next(3);return;
  }
  if(Phase==3)
  {
   if(Age<35)return;
   Record("defend-travel",vector.DistanceXZ(position,StartPosition)>25,vector.DistanceXZ(position,StartPosition).ToString());
   Record("cancel-accepted",COMMAND_ORBAT_RouteOrders.Cancel(Squad,Points));Points={};Next(4);return;
  }
  if(Phase==4)
  {
   if(Age<8)return;
   array<AIWaypoint> installed={};Squad.GetWaypoints(installed);
   Record("cancel-waypoints",installed.IsEmpty());
   Record("cancel-stops-travel",vector.DistanceXZ(position,StartPosition)<10,vector.DistanceXZ(position,StartPosition).ToString());
   JSOC_ORBAT_GMRequest route=new JSOC_ORBAT_GMRequest();route.kind="ai-route";
   COMMAND_ORBAT_RoutePoint first=new COMMAND_ORBAT_RoutePoint();first.worldX=position[0];first.worldZ=position[2]+20;
   COMMAND_ORBAT_RoutePoint second=new COMMAND_ORBAT_RoutePoint();second.worldX=position[0];second.worldZ=position[2]+40;
   route.waypoints.Insert(first);route.waypoints.Insert(second);
   COMMAND_ORBAT_OwnedRoute prepared=COMMAND_ORBAT_RouteOrders.Create(route,Squad);
   bool ok=prepared&&COMMAND_ORBAT_RouteOrders.Replace(Squad,Points,prepared.Waypoints);
   if(ok)Points=prepared.Waypoints;
   Record("route-installed",ok);TargetPosition=Ground(second.worldX,second.worldZ);Next(5);return;
  }
  if(Phase==5)
  {
   if(vector.DistanceXZ(position,TargetPosition)>6&&Age<50)return;
   Record("route-travel",vector.DistanceXZ(position,TargetPosition)<=6,vector.DistanceXZ(position,StartPosition).ToString());
   Resource targetResource=Resource.Load("{26A9756790131354}Prefabs/Characters/Factions/BLUFOR/US_Army/Character_US_Rifleman.et");
   EntitySpawnParams parameters=new EntitySpawnParams();parameters.TransformMode=ETransformMode.WORLD;
   Math3D.AnglesToMatrix(vector.Zero,parameters.Transform);TargetPosition=Ground(position[0],position[2]+35);parameters.Transform[3]=TargetPosition;
   FollowTarget=GetGame().SpawnEntityPrefab(targetResource,GetGame().GetWorld(),parameters);
   AIControlComponent control=AIControlComponent.Cast(FollowTarget.FindComponent(AIControlComponent));
   if(control&&control.GetAIAgent())control.GetAIAgent().DeactivateAI();
   COMMAND_ORBAT_FollowLease lease=COMMAND_ORBAT_SquadControl.CreateFollow(Squad,FollowTarget,"synthetic-target",90);
   array<AIWaypoint> next={};if(lease)next.Insert(lease.Waypoint);
   bool ok=lease&&COMMAND_ORBAT_RouteOrders.Replace(Squad,Points,next);
   if(ok)Points=next;
   Record("follow-installed",ok);Next(6);return;
  }
  if(Phase==6)
  {
   if(vector.DistanceXZ(position,FollowTarget.GetOrigin())>15&&Age<45)return;
   Record("follow-approaches-target",vector.DistanceXZ(position,FollowTarget.GetOrigin())<=15,vector.DistanceXZ(position,StartPosition).ToString());
   TargetPosition=Ground(TargetPosition[0],TargetPosition[2]+25);FollowTarget.SetOrigin(TargetPosition);Next(7);return;
  }
  if(Phase==7)
  {
   if(vector.DistanceXZ(position,FollowTarget.GetOrigin())>15&&Age<40)return;
   Record("follow-moving-target",vector.DistanceXZ(position,FollowTarget.GetOrigin())<=15,vector.DistanceXZ(position,StartPosition).ToString());
   Record("follow-cancel",COMMAND_ORBAT_RouteOrders.Cancel(Squad,Points));Points={};Next(8);return;
  }
  if(Phase==8)
  {
   if(Age<5)return;
   array<string> formations={"column","staggered-column","wedge","line","restore"};
   foreach(string formation:formations)Record("formation-"+formation,COMMAND_ORBAT_SquadPreferences.Formation(Squad,Preferences,formation).IsEmpty());
   array<string> policies={"open-fire","hold-fire","return-fire","auto"};
   foreach(string policy:policies)Record("fire-policy-"+policy,COMMAND_ORBAT_SquadPreferences.Combat(Squad,Preferences,policy).IsEmpty());
   Record("stance-stand-installed",COMMAND_ORBAT_SquadPreferences.Stance(Squad,Preferences,"stand").IsEmpty());Next(9);return;
  }
  if(Phase==9)
  {
   if(Age<5)return;
   array<string> stances={"stand","crouch","prone","auto"};
   int matched;
   foreach(AIAgent agent:agents)
   {
    ChimeraCharacter character=ChimeraCharacter.Cast(agent.GetControlledEntity());
    if(character&&character.GetCharacterController().GetStance()==SettingIndex)matched++;
   }
   if(SettingIndex<3)Record("stance-"+stances[SettingIndex]+"-physical",matched==agents.Count(),matched.ToString());
   SettingIndex++;
   if(SettingIndex<4)
   {
    Record("stance-"+stances[SettingIndex]+"-installed",COMMAND_ORBAT_SquadPreferences.Stance(Squad,Preferences,stances[SettingIndex]).IsEmpty());Age=0;return;
   }
   COMMAND_ORBAT_SquadPreferences.Release(Squad,Preferences);
   Record("cleanup-group-retained",Squad&&Squad.GetLeaderEntity());Finish();
  }
 }
 static void Finish()
 {
  GetGame().GetCallqueue().Remove(Tick);Print("[COMMAND ORDERS] done");
 }
};
modded class ArmaReforgerScripted
{
 override void OnAfterInit(BaseWorld world)
 {
  super.OnAfterInit(world);GetGame().GetCallqueue().CallLater(COMMAND_AllOrdersProbe.Start,2000,false);
 }
};
