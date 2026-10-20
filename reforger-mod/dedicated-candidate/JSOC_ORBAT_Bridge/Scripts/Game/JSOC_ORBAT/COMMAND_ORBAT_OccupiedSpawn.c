// Only explicitly requested newly-created occupied squads use this native materialization request.
modded class SCR_AIGroup
{
 protected bool m_COMMANDDeploymentMembersRequested;
 int COMMAND_DeploymentMemberCount()
 {
  if (!m_aUnitPrefabSlots) return 0;
  return Math.Min(m_aUnitPrefabSlots.Count(),GetMaxUnitsToSpawn());
 }
 void COMMAND_RequestDeploymentMembers()
 {
  if (m_COMMANDDeploymentMembersRequested) return;
  m_COMMANDDeploymentMembersRequested=true;
  RequestSpawn(COMMAND_DeploymentMemberCount(),0);
 }
};
// Original COMMAND direct seating. Creation, approval, timeout and rollback belong to the host request.
class COMMAND_ORBAT_SeatIntent
{
 string unitId;
 string role;
 int managerId=-1;
 int slotId=-1;
};
class COMMAND_ORBAT_OccupiedIntent
{
 string vehicleUnitId;
 int timeoutSeconds;
 ref array<ref COMMAND_ORBAT_SeatIntent> assignments={};
};
class COMMAND_ORBAT_OccupiedSeats
{
 IEntity TargetVehicle;
 ref array<IEntity> Members={};
 ref array<BaseCompartmentSlot> Slots={};
 ref array<SCR_AIGroup> Groups={};
 ref array<int> GroupSizes={};
 ref array<BaseCompartmentSlot> Available={};
 static int Role(string role)
 {
  if(role=="pilot")return ECompartmentType.PILOT;
  if(role=="gunner")return ECompartmentType.TURRET;
  if(role=="cargo")return ECompartmentType.CARGO;
  return -1;
 }
 bool Append(IEntity member,string faction,int role,int managerId,int slotId,out string problem)
 {
  problem="Each occupant must be a distinct living individual character";
  if(!member || Members.Find(member)>=0 || Members.Count()>=15)return false;
  SCR_EditableCharacterComponent editable=SCR_EditableCharacterComponent.Cast(member.FindComponent(SCR_EditableCharacterComponent));
  SCR_CompartmentAccessComponent access=SCR_CompartmentAccessComponent.Cast(member.FindComponent(SCR_CompartmentAccessComponent));
  if(!editable || editable.IsDestroyed() || !editable.GetFaction() || editable.GetFaction().GetFactionKey()!=faction || !access || access.GetCompartment() || JSOC_ORBAT_AIOrders.PlayerOccupies(member))return false;
  BaseCompartmentSlot chosen;
  foreach(BaseCompartmentSlot seat:Available)
  {
   if(!seat || seat.GetType()!=role || Slots.Find(seat)>=0)continue;
   if(managerId!=-1 && (seat.GetCompartmentMgrID()!=managerId || seat.GetCompartmentSlotID()!=slotId))continue;
   if(seat.GetVehicle()!=TargetVehicle || seat.IsOccupied() || seat.GetOccupant() || seat.IsReserved() || seat.IsGetInLocked() || !seat.IsCompartmentAccessible())continue;
   chosen=seat;break;
  }
  if(!chosen){problem="Required seat unavailable, incompatible, locked or reserved";return false;}
  Members.Insert(member);Slots.Insert(chosen);problem="";return true;
 }
 static COMMAND_ORBAT_OccupiedSeats Prepare(array<IEntity> roots,array<string> units,COMMAND_ORBAT_OccupiedIntent intent,out string problem)
 {
  problem="Invalid occupied deployment";
  if(!intent || roots.Count()!=units.Count() || roots.Count()>16 || intent.assignments.Count()<1 || intent.assignments.Count()>15)return null;
  int vehicleIndex=units.Find(intent.vehicleUnitId);
  if(vehicleIndex<0 || !roots[vehicleIndex])return null;
  IEntity vehicle=roots[vehicleIndex];
  if(JSOC_ORBAT_AIOrders.PlayerOccupies(vehicle)){problem="Player occupied vehicle is protected";return null;}
  BaseCompartmentManagerComponent manager=BaseCompartmentManagerComponent.Cast(vehicle.FindComponent(BaseCompartmentManagerComponent));
  if(!manager){problem="Selected root is not a compartment vehicle";return null;}
  COMMAND_ORBAT_OccupiedSeats result=new COMMAND_ORBAT_OccupiedSeats();result.TargetVehicle=vehicle;
  manager.GetCompartments(result.Available);
  if(result.Available.Count()<1 || result.Available.Count()>128){problem="Unsupported vehicle seat count";return null;}
  string faction=COMMAND_ORBAT_TransportLease.VehicleFaction(vehicle);
  if(faction.IsEmpty() || faction=="NO_FACTION"){problem="Vehicle faction unresolved";return null;}
  array<string> assignedRoots={};
  foreach(COMMAND_ORBAT_SeatIntent assignment:intent.assignments)
  {
   if(!assignment)return null;
   int rootIndex=units.Find(assignment.unitId),role=Role(assignment.role);
   if(rootIndex<0 || rootIndex==vehicleIndex || role<0 || assignment.slotId< -1 || (assignment.managerId==-1)!=(assignment.slotId==-1) || assignedRoots.Find(assignment.unitId)>=0)return null;
   assignedRoots.Insert(assignment.unitId);
   IEntity root=roots[rootIndex];
   SCR_AIGroup group=SCR_AIGroup.Cast(root);
   if(group)
   {
    if(role!=ECompartmentType.CARGO || assignment.managerId!=-1 || assignment.slotId!=-1){problem="Passenger squads require cargo role and automatic native seats";return null;}
    if(JSOC_ORBAT_AIOrders.PlayerOccupies(group)){problem="Player controlled squad is protected";return null;}
    int intended=group.COMMAND_DeploymentMemberCount();
    if(intended<1 || intended+result.Members.Count()>15){problem="Passenger squad declaration exceeds the 15-occupant budget or is unavailable";return null;}
    group.COMMAND_RequestDeploymentMembers();
    array<AIAgent> agents={};group.GetAgents(agents);
    if(agents.Count()<intended || group.GetSpawnQueueSize()>0){problem="Passenger squad initializing";return null;}
    if(agents.Count()!=intended){problem="Passenger squad membership differs from its declared deployment";return null;}
    if(agents.Count()+result.Members.Count()>15){problem="15 required occupants maximum, including actual squad members";return null;}
    foreach(AIAgent agent:agents)
    {
     if(!agent || !agent.GetControlledEntity()){problem="Passenger squad initializing";return null;}
     if(agent.GetParentGroup()!=group || !result.Append(agent.GetControlledEntity(),faction,role,-1,-1,problem))return null;
    }
    result.Groups.Insert(group);result.GroupSizes.Insert(agents.Count());
   }
   else if(!result.Append(root,faction,role,assignment.managerId,assignment.slotId,problem))return null;
  }
  if(assignedRoots.Count()!=roots.Count()-1){problem="Every non-vehicle root requires an explicit seat assignment";return null;}
  problem="";return result;
 }
 bool RequestEntry(out string problem)
 {
  problem="";
  for(int i=0;i<Members.Count();i++)
  {
   SCR_CompartmentAccessComponent access=SCR_CompartmentAccessComponent.Cast(Members[i].FindComponent(SCR_CompartmentAccessComponent));
   BaseCompartmentSlot seat=Slots[i];
   if(!access || seat.GetOccupant() || seat.IsReserved() || seat.IsGetInLocked() || !seat.IsCompartmentAccessible() || !access.MoveInVehicle(TargetVehicle,seat.GetType(),true,seat)){problem="Direct seating request rejected";return false;}
  }
  return true;
 }
 bool Verified()
 {
  if(!TargetVehicle || Members.Count()!=Slots.Count() || JSOC_ORBAT_AIOrders.PlayerOccupies(TargetVehicle))return false;
  for(int g=0;g<Groups.Count();g++)
  {
   if(!Groups[g] || JSOC_ORBAT_AIOrders.PlayerOccupies(Groups[g]))return false;
   array<AIAgent> agents={};Groups[g].GetAgents(agents);
   if(agents.Count()!=GroupSizes[g])return false;
   foreach(AIAgent agent:agents)if(!agent || agent.GetParentGroup()!=Groups[g] || Members.Find(agent.GetControlledEntity())<0)return false;
  }
  for(int i=0;i<Members.Count();i++)
  {
   IEntity member=Members[i];BaseCompartmentSlot seat=Slots[i];
   if(!member || !seat || seat.GetVehicle()!=TargetVehicle || seat.GetOccupant()!=member || JSOC_ORBAT_AIOrders.PlayerOccupies(member))return false;
   CompartmentAccessComponent access=CompartmentAccessComponent.Cast(member.FindComponent(CompartmentAccessComponent));
   if(!access || access.GetCompartment()!=seat)return false;
  }
  return true;
 }
};
