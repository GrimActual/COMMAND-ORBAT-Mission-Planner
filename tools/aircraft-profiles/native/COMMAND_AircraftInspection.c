// Original COMMAND read-only helper. No hooks, polling, actuators, spawning or seating.
// Caller must already hold the specifically selected, authorized entity.
class COMMAND_AircraftSeatObservation
{
 int managerId; int slotId; string role; bool occupied; bool reserved; bool belongsToSelected;bool controllerPilot;
};
class COMMAND_AircraftNativeObservation
{
 string schema="command-aircraft-native-observation";int version=2;
 string resourceName;string environment;bool selectedEntityPresent;bool truncated;
 ref array<string> components={};ref array<string> unavailable={};
 ref array<ref COMMAND_AircraftSeatObservation> compartments={};
 vector positionM;vector attitudeDeg;vector velocityMps;vector angularVelocityRadps;
 bool simulationAvailable;bool physicsAvailable;bool engineOn;bool groundContact;
 ref array<float> rotorRpm={};float physicsBodyMassKg;
 bool bodyDynamic;bool bodyActive;vector centerOfMassLocalM;
 float worldTimeMs;float originAboveTerrainM;
 string massSemantics="physics-body-only; fuel/occupant inclusion unknown";
};
class COMMAND_AircraftInspection
{
 static void AddComponent(COMMAND_AircraftNativeObservation report,string name)
 {
  if(report.components.Find(name)>=0) { return; }
  if(report.components.Count()>=256) { report.truncated=true;return; }
  report.components.Insert(name);
 }
 static COMMAND_AircraftNativeObservation Capture(IEntity selected,string environment)
 {
  COMMAND_AircraftNativeObservation report=new COMMAND_AircraftNativeObservation();
  report.environment=environment;
  if(!selected){report.unavailable.Insert("Selected entity unavailable");return report;}
  report.selectedEntityPresent=true;
  EntityPrefabData data=selected.GetPrefabData();
  if(data)report.resourceName=data.GetPrefabName();
  else report.unavailable.Insert("Exact prefab identity unavailable");
  report.positionM=selected.GetOrigin();report.attitudeDeg=selected.GetYawPitchRoll();
  report.worldTimeMs=GetGame().GetWorld().GetWorldTime();
  report.originAboveTerrainM=report.positionM[1]-GetGame().GetWorld().GetSurfaceY(report.positionM[0],report.positionM[2]);
  array<Managed> components={};selected.FindComponents(GenericComponent,components);
  if(components.Count()>256)report.truncated=true;
  for(int c=0;c<Math.Min(components.Count(),256);c++)
  {
   if(components[c])AddComponent(report,components[c].Type().ToString());
  }
  HelicopterControllerComponent controller=HelicopterControllerComponent.Cast(selected.FindComponent(HelicopterControllerComponent));
  if(controller)
  {
   AddComponent(report,"HelicopterControllerComponent");
   VehicleHelicopterSimulation simulation=controller.GetSimulation();
   if(simulation && simulation.IsValid())
   {
    report.simulationAvailable=true;report.velocityMps=simulation.GetVelocity();report.angularVelocityRadps=simulation.GetAngularVelocity();
    report.engineOn=simulation.EngineIsOn();report.groundContact=simulation.HasAnyGroundContact();
    int rotors=simulation.RotorCount();if(rotors>16)report.truncated=true;
    for(int r=0;r<Math.Min(rotors,16);r++)report.rotorRpm.Insert(simulation.RotorGetRPM(r));
   }
  }
  if(!report.simulationAvailable)report.unavailable.Insert("Valid helicopter simulation unavailable; velocity/engine/rotor/contact unavailable");
  Physics body=selected.GetPhysics();
  if(body){report.physicsAvailable=true;report.physicsBodyMassKg=body.GetMass();report.bodyDynamic=body.IsDynamic();report.bodyActive=body.IsActive();report.centerOfMassLocalM=body.GetCenterOfMass();}
  else report.unavailable.Insert("Physics body mass unavailable");
  BaseCompartmentManagerComponent manager=BaseCompartmentManagerComponent.Cast(selected.FindComponent(BaseCompartmentManagerComponent));
  if(manager)
  {
   AddComponent(report,"BaseCompartmentManagerComponent");
   array<BaseCompartmentSlot> slots={};manager.GetCompartments(slots);if(slots.Count()>128)report.truncated=true;
   for(int i=0;i<Math.Min(slots.Count(),128);i++)
   {
    BaseCompartmentSlot slot=slots[i];if(!slot)continue;
    COMMAND_AircraftSeatObservation seat=new COMMAND_AircraftSeatObservation();
    seat.managerId=slot.GetCompartmentMgrID();seat.slotId=slot.GetCompartmentSlotID();seat.role="other";
    if(slot.GetType()==ECompartmentType.PILOT)seat.role="pilot";
    else if(slot.GetType()==ECompartmentType.TURRET)seat.role="gunner";
    else if(slot.GetType()==ECompartmentType.CARGO)seat.role="cargo";
    seat.occupied=slot.GetOccupant()!=null;seat.reserved=slot.IsReserved();seat.belongsToSelected=slot.GetVehicle()==selected;
    if(controller)seat.controllerPilot=controller.GetPilotCompartmentSlot()==slot;
    report.compartments.Insert(seat);
   }
  }
  else report.unavailable.Insert("Compartment manager unavailable; capacity unknown");
  return report;
 }
};
