// Original experimental COMMAND flight lease. Not enabled in the release candidate.
// No automatic spawning or startup. HostGM must own validated approval and identity resolution.
// Original force/torque controller at EOnSimulate; no pilot-input or pose setters.
class COMMAND_HelicopterFlightSample
{
 float worldTimeMs; string phase; string stage; float requested; float readback;
 float agl; vector position; vector velocity; vector attitude; vector angularVelocity;
 float rpm; bool groundContact; int ordinal; float forceY; float bodyMass; vector bodyVelocity; float targetY; float heightY; float requestedAcceleration; float measuredAcceleration; vector torque; vector totalForceBefore; vector totalForceAfter; float physicsDt; vector force; vector targetPosition; float lateralError; float attitudeError;
};
class COMMAND_HelicopterFlightLease
{
 string RequestId;bool CancelRequested;bool Handoff;
 IEntity Aircraft; IEntity Pilot;SCR_AIGroup Team;vector Departure;vector LandingPoint;float OriginClearance;float PhaseAt;bool ExitRequested;float NextExitAttempt;string ExitDiagnostic;int UnloadIndex;int Unloaded;float UnloadedSince;bool FlewToLZ;bool LandedAtLZ;int SeatAttempts;bool SpawnRequested;
 ref array<IEntity> Passengers={};
 HelicopterControllerComponent Controller; VehicleHelicopterSimulation Sim;
 ref array<ref COMMAND_HelicopterFlightSample> Trace={};
 bool Active; bool Done; bool TraceTruncated;
 string Phase="initializing";
 float Elapsed; float StartedAt; float Collective;
 float MaxAGL; float InitialAGL; float MaxVerticalSpeed; float ForceY; int ForceWrites;
 float TargetY; float GroundY;float HoverSince;float LandingSince;float StableSeconds;float PriorVy;bool HasPriorVy;float MeasuredAcceleration;float RequestedAcceleration;float HeightY;float LastCapture;vector Torque;vector TotalBefore;vector TotalAfter;vector TargetRight;vector TargetUp;vector TargetForward;vector Anchor;vector Force;float LateralError;float AttitudeError;
 float PhysicsDt;float LastGroundCheck;
 int PrepareCalls; int ApplyCalls; int SimulationCalls; int Ordinal;
 bool Mounted(IEntity actor)
 {
  if(!actor || !Aircraft) {return false;}
  CompartmentAccessComponent a=CompartmentAccessComponent.Cast(actor.FindComponent(CompartmentAccessComponent));
  if(!a) {return false;}
  BaseCompartmentSlot slot=a.GetCompartment();
  return slot && slot.GetOccupant()==actor && slot.GetVehicle()==Aircraft;
 }
 // Called only after HostGM validates reviewed request, pairing ownership and exact entity identities.
 string StartApproved(string requestId,IEntity aircraft,IEntity pilot,array<IEntity> passengers,vector lz)
 {
  if(Active || Done) {return "Flight lease is already used";}
  if(!Replication.IsServer() || requestId.IsEmpty()) {return "Authoritative reviewed request required";}
  if(!aircraft || !pilot || !passengers || passengers.Count()!=4) {return "Huey pilot and four passengers required";}
  if(!aircraft.GetPrefabData() || aircraft.GetPrefabData().GetPrefabName()!="{70BAEEFC2D3FEE64}Prefabs/Vehicles/Helicopters/UH1H/UH1H.et") {return "Only the verified vanilla UH-1H profile is supported";}
  Aircraft=aircraft;Pilot=pilot;
  if(JSOC_ORBAT_AIOrders.PlayerOccupies(Aircraft)) {return "Human-controlled aircraft is protected";}
  foreach(IEntity actor:passengers)
  {
   if(!actor || actor==pilot || Passengers.Find(actor)>=0) {return "Passenger identity is invalid";}
   Passengers.Insert(actor);
  }
  Controller=HelicopterControllerComponent.Cast(Aircraft.FindComponent(HelicopterControllerComponent));
  if(!Controller) {return "Helicopter controller unavailable";}
  Sim=Controller.GetSimulation();Physics body=Aircraft.GetPhysics();
  if(!Sim || !Sim.IsValid() || !body || !body.IsDynamic() || body.GetMass()<=0) {return "Dynamic helicopter simulation unavailable";}
  PilotCompartmentSlot pilotSlot=Controller.GetPilotCompartmentSlot();
  if(!pilotSlot || pilotSlot.GetOccupant()!=Pilot) {return "Exact pilot compartment occupant required";}
  BaseCompartmentManagerComponent compartments=BaseCompartmentManagerComponent.Cast(Aircraft.FindComponent(BaseCompartmentManagerComponent));
  if(!compartments) {return "Compartment manager unavailable";}
  array<BaseCompartmentSlot> slots={};compartments.GetCompartments(slots);
  foreach(BaseCompartmentSlot slot:slots)
  {
   if(!slot) {continue;}
   IEntity occupant=slot.GetOccupant();
   if(occupant && occupant!=Pilot && Passengers.Find(occupant)<0) {return "Unreviewed aircraft occupant";}
   if(occupant && Passengers.Find(occupant)>=0 && slot.GetType()!=ECompartmentType.CARGO) {return "Passengers must occupy cargo seats";}
  }
  if(!AllSeated() || !Sim.HasAnyGroundContact() || body.GetVelocity().Length()>0.15) {return "Start requires seated occupants and stationary grounded aircraft";}
  if(!(lz[0]>=0 && lz[0]<=20000 && lz[2]>=0 && lz[2]<=20000)) {return "Landing coordinates invalid";}
  vector delta=lz-Aircraft.GetOrigin();delta[1]=0;
  if(delta.Length()>100.1 || delta.Length()<20) {return "Initial flight profile requires a clear 20-100 metre route";}
  float low=100000;float high=-100000;
  for(int ix=-1;ix<=1;ix++)
  {
   for(int iz=-1;iz<=1;iz++)
   {
    float h=GetGame().GetWorld().GetSurfaceY(lz[0]+ix*5,lz[2]+iz*5);low=Math.Min(low,h);high=Math.Max(high,h);
   }
  }
  if(high-low>0.6) {return "Selected landing zone is not sufficiently flat";}
  vector startPosition=Aircraft.GetOrigin();float departureGround=GetGame().GetWorld().GetSurfaceY(startPosition[0],startPosition[2]);
  float landingGround=GetGame().GetWorld().GetSurfaceY(lz[0],lz[2]);
  if(Math.AbsFloat(landingGround-departureGround)>0.3) {return "Initial profile requires the selected LZ at approximately departure elevation";}
  LandingPoint=lz;RequestId=requestId;Active=true;StartedAt=GetGame().GetWorld().GetWorldTime();Phase="seating";
  Aircraft.SetEventMask(EntityEvent.SIMULATE | EntityEvent.POSTSIMULATE);
  GetGame().GetCallqueue().CallLater(Tick,50,true);GetGame().GetCallqueue().CallLater(Observe,1000,true);
  return "";
 }
 void RequestCancel()
 {
  if(!Active || ReleaseForHuman() || CancelRequested) {return;}
  if(Phase=="unloading") {return;} // Already committed exits cannot be recalled.
  CancelRequested=true;
  // Airborne cancellation retains the controller and follows the already approved clear route to the LZ.
  if((Phase=="seating" || Phase=="spooling") && Sim && Sim.HasAnyGroundContact() && Aircraft.GetPhysics().GetVelocity().Length()<0.15) {Finish("cancelled: grounded; remaining passengers retained");}
 }
 bool ReleaseForHuman()
 {
  if(Aircraft && JSOC_ORBAT_AIOrders.PlayerOccupies(Aircraft))
  {
   Handoff=true;Finish("handoff: human control detected; flight assistance released");return true;
  }
  return false;
 }
 void Tick()
 {
  if(!Active || ReleaseForHuman()) {return;}
  Elapsed=(GetGame().GetWorld().GetWorldTime()-StartedAt)*0.001;
  if(!Aircraft || !Pilot || !Sim) {Finish("failed: entity lost");return;}
  if(Elapsed>180) {CancelRequested=true;}
  if(Elapsed>270) {Finish("failed: flight safety deadline; landing unconfirmed");return;}
  if(Phase=="seating")
  {
   if(!AllSeated())
   {
    if(Elapsed>8) {Finish("failed: actual occupancy");}
    return;
   }
   // Native control configuration remains untouched.
   Controller.StartEngine();Phase="spooling";
  }
  if(!Mounted(Pilot)) {Finish("failed: pilot left");return;}
  SCR_EditableCharacterComponent pilotState=SCR_EditableCharacterComponent.Cast(Pilot.FindComponent(SCR_EditableCharacterComponent));
  if(!pilotState || pilotState.IsDestroyed()) {Finish("failed: pilot unavailable");return;}
  if(Phase!="unloading")
  {
   foreach(IEntity passenger:Passengers)
   {
    SCR_EditableCharacterComponent character;
    if(passenger) {character=SCR_EditableCharacterComponent.Cast(passenger.FindComponent(SCR_EditableCharacterComponent));}
    if(!character || character.IsDestroyed() || !Mounted(passenger)) {Finish("failed: passenger changed before landing");return;}
   }
  }
  float agl=Sim.GetAltitudeAGL();MaxAGL=Math.Max(MaxAGL,agl);
  vector velocity=Sim.GetVelocity();MaxVerticalSpeed=Math.Max(MaxVerticalSpeed,velocity[1]);
  if(Phase=="spooling")
  {
   Collective=0;
   if(Elapsed>=25)
   {
    if(!Sim.EngineIsOn() || Sim.RotorGetRPM(0)<300) {Finish("failed: engine operating state");return;}
    InitialAGL=agl;Phase="hover-controller";
    vector pose[4];Physics body=Aircraft.GetPhysics();body.GetWorldTransform(pose);
    Anchor=pose[3];Departure=Anchor;GroundY=pose[3][1];TargetY=GroundY+8;
    OriginClearance=GroundY-GetGame().GetWorld().GetSurfaceY(Anchor[0],Anchor[2]);
    LandingPoint[1]=GetGame().GetWorld().GetSurfaceY(LandingPoint[0],LandingPoint[2])+OriginClearance;
    // A preselected, clear route on EmptyEden. Verify the marked LZ terrain is flat.
    float low=100000;float high=-100000;
    for(int ix=-1;ix<=1;ix++)
    {
     for(int iz=-1;iz<=1;iz++)
     {
      float x=LandingPoint[0]+ix*5;float z=LandingPoint[2]+iz*5;
      float h=GetGame().GetWorld().GetSurfaceY(x,z);low=Math.Min(low,h);high=Math.Max(high,h);
     }
    }
    if(high-low>0.6) {Finish("failed: marked LZ terrain is not sufficiently flat");return;}
    vector desired[4];vector angles=Aircraft.GetYawPitchRoll();Math3D.AnglesToMatrix(Vector(angles[0],0,0),desired);
    TargetRight=desired[0];TargetUp=desired[1];TargetForward=desired[2];
   }
   return;
  }
  Collective=0;
  if(HeightY>GroundY+15) {Finish("failed: height envelope");return;}
  if(HoverSince>0 && Elapsed-HoverSince>5 && Phase=="hover-controller")
  {
   Phase="flying";PhaseAt=Elapsed;Anchor=LandingPoint;
  }
  if(Phase=="flying")
  {
   vector delta=LandingPoint-Aircraft.GetOrigin();delta[1]=0;
   Physics body=Aircraft.GetPhysics();vector v=body.GetVelocity();
   if(delta.Length()<0.7 && Vector(v[0],0,v[2]).Length()<0.25 && Math.AbsFloat(TargetY-HeightY)<0.35)
   {
    FlewToLZ=true;Phase="approaching";PhaseAt=Elapsed;
   }
  }
  if(Phase=="approaching" && Elapsed-PhaseAt>3) {Phase="descending";LandingSince=Elapsed;LastGroundCheck=Elapsed;GroundY=LandingPoint[1];}
  if(Phase=="descending") {TargetY=Math.Max(GroundY-0.12,Departure[1]+8-(Elapsed-LandingSince)*0.35);}
  if(Phase=="descending")
  {
   Physics body=Aircraft.GetPhysics();vector v=body.GetVelocity();
   bool grounded=Sim.HasAnyGroundContact() && v.Length()<0.15 && body.GetAngularVelocity().Length()<0.05 && LateralError<0.7 && Math.AbsFloat(HeightY-LandingPoint[1])<0.5 && AttitudeError<0.035;
   if(grounded) {StableSeconds+=Math.Max(0,Elapsed-LastGroundCheck);} else {StableSeconds=0;}
   LastGroundCheck=Elapsed;
   if(StableSeconds>=2)
   {
    LandedAtLZ=true;Controller.StopEngine(false);
    if(CancelRequested) {Finish("cancelled: landed at approved LZ; passengers retained");return;}
    Phase="unloading";PhaseAt=Elapsed;
   }
  }
  if(Phase=="unloading")
  {
   if(!Sim.HasAnyGroundContact() || Aircraft.GetPhysics().GetVelocity().Length()>0.5) {Finish("failed: landing stability lost during unload");return;}
   if(Elapsed-PhaseAt>60) {Finish("failed: passenger unload deadline");return;}
   if(UnloadIndex<Passengers.Count())
   {
    IEntity actor=Passengers[UnloadIndex];
    if(!actor) {Finish("failed: passenger lost");return;}
    CompartmentAccessComponent access=CompartmentAccessComponent.Cast(actor.FindComponent(CompartmentAccessComponent));
    if(!access) {Finish("failed: no passenger access component");return;}
    ExtBaseCompartmentSlot slot=ExtBaseCompartmentSlot.Cast(access.GetCompartment());
    if(ExitRequested)
    {
     if(!slot && !access.IsGettingOut()) {UnloadIndex++;ExitRequested=false;NextExitAttempt=Elapsed+0.5;}
    }
    else if(!slot || !Mounted(actor)) {Finish("failed: designated passenger occupancy changed");return;}
    else if(!ExitRequested && Elapsed>=NextExitAttempt)
    {
     array<int> doors={};int doorCount=slot.GetAvailableDoorIndices(doors);
     ExitDiagnostic=string.Format("passenger=%1 doorCount=%2 canGetOut=%3",UnloadIndex,doorCount,access.CanGetOutVehicle());
     foreach(int door:doors)
     {
      bool canExit=access.CanGetOutVehicleViaDoor(door);bool accepted=false;
      if(canExit) {accepted=access.GetOutVehicle(EGetOutType.ANIMATED,door,ECloseDoorAfterActions.LEAVE_OPEN,false);}
      ExitDiagnostic+=string.Format(" door=%1 can=%2 accepted=%3",door,canExit,accepted);
      if(accepted) {ExitRequested=true;break;}
     }
     NextExitAttempt=Elapsed+0.5;
    }
   }
   Unloaded=0;
   foreach(IEntity actor:Passengers)
   {
    if(!actor) {Finish("failed: passenger unavailable");return;}
    SCR_EditableCharacterComponent editable=SCR_EditableCharacterComponent.Cast(actor.FindComponent(SCR_EditableCharacterComponent));
    if(!editable || editable.IsDestroyed()) {Finish("failed: passenger unavailable");return;}
    CompartmentAccessComponent access=CompartmentAccessComponent.Cast(actor.FindComponent(CompartmentAccessComponent));
    if(access && !access.GetCompartment() && !access.IsGettingOut() && vector.Distance(actor.GetOrigin(),Aircraft.GetOrigin())<15) {Unloaded++;}
   }
   if(Unloaded==Passengers.Count())
   {
    if(UnloadedSince==0) {UnloadedSince=Elapsed;}
    if(Elapsed-UnloadedSince>=1) {Finish("complete: insertion landed and passenger team unloaded; pilot retained");}
   }
   else {UnloadedSince=0;}
  }

 }
 bool AllSeated()
 {
  if(!Mounted(Pilot) || Passengers.Count()!=4) {return false;}
  foreach(IEntity actor:Passengers) {if(!Mounted(actor)) {return false;}}
  return true;
 }
 vector Cross(vector a,vector b)
 {
  return Vector(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]);
 }
 void ForceStep(float timeSlice)
 {
  if(!Active || !Aircraft || !Sim || (Phase!="hover-controller" && Phase!="flying" && Phase!="approaching" && Phase!="descending")) {return;}
  if(ReleaseForHuman()) {return;}
  Physics body=Aircraft.GetPhysics();
  if(!body || !body.IsDynamic() || body.GetMass()<=0) {Finish("failed: no dynamic aircraft body");return;}
  if(timeSlice<=0 || timeSlice>0.2) {Finish("failed: invalid physics timestep");return;}
  PhysicsDt=timeSlice;
  vector pose[4];body.GetWorldTransform(pose);HeightY=pose[3][1];
  vector velocity=body.GetVelocity();vector omega=body.GetAngularVelocity();
  if(HasPriorVy) {MeasuredAcceleration=(velocity[1]-PriorVy)/timeSlice;}
  PriorVy=velocity[1];HasPriorVy=true;
  // PD height loop. Clamp the commanded additional acceleration, not measured net acceleration.
  RequestedAcceleration=Math.Clamp(1.2*(TargetY-HeightY)-2.8*velocity[1],-1.5,2.0);
  vector delta=Anchor-pose[3];delta[1]=0;LateralError=delta.Length();
  vector desiredVelocity=vector.Zero;
  if(LateralError>0.001) {desiredVelocity=delta.Normalized()*Math.Min(4.0,LateralError*0.6);}
  vector lateral=Vector((desiredVelocity[0]-velocity[0])*1.8,0,(desiredVelocity[2]-velocity[2])*1.8);
  if(lateral.Length()>1.5) {lateral=lateral.Normalized()*1.5;}
  vector desiredAcceleration=Vector(lateral[0],RequestedAcceleration,lateral[2]);
  TotalBefore=body.GetTotalForce();Force=desiredAcceleration*body.GetMass()-TotalBefore;
  float forceLimit=body.GetMass()*Physics.STANDARD_GRAVITY*3;
  if(Force.Length()>forceLimit) {Force=Force.Normalized()*forceLimit;}
  ForceY=Force[1];
  // Apply at the documented local COM offset transformed to world coordinates.
  vector center=body.GetCenterOfMass().Multiply4(pose);
  body.ApplyForceAt(center,Force);TotalAfter=body.GetTotalForce();ForceWrites++;
  // Fixed attitude target; no transform/angular-velocity setters or frozen axes.
  vector error=(Cross(pose[0],TargetRight)+Cross(pose[1],TargetUp)+Cross(pose[2],TargetForward))*0.5;
  AttitudeError=error.Length();
  Torque=(error*12.0-omega*8.0)*body.GetMass()-body.GetTotalTorque();
  float limit=body.GetMass()*30.0;float magnitude=Torque.Length();
  if(magnitude>limit) {Torque=Torque*(limit/magnitude);}
  body.ApplyTorque(Torque);
  if(Phase=="hover-controller" && Math.AbsFloat(TargetY-HeightY)<0.35 && Math.AbsFloat(velocity[1])<0.2 && omega.Length()<0.08 && LateralError<0.5 && Vector(velocity[0],0,velocity[2]).Length()<0.3 && AttitudeError<0.01745)
  {
   if(HoverSince==0) {HoverSince=Elapsed;}
  }
  else if(Phase=="hover-controller") {HoverSince=0;}
 }
 void Capture(string stage)
 {
  if(!Active || !Aircraft || !Sim) {return;}
  if(Trace.Count()>=4096) {TraceTruncated=true;return;}
  float now=GetGame().GetWorld().GetWorldTime();
  if(stage!="observation" && (now-LastCapture<100 || Elapsed<24)) {return;}
  LastCapture=now;
  COMMAND_HelicopterFlightSample s=new COMMAND_HelicopterFlightSample();
  s.worldTimeMs=GetGame().GetWorld().GetWorldTime();s.stage=stage;s.phase=Phase;s.ordinal=++Ordinal;s.requested=Collective;

  s.agl=Sim.GetAltitudeAGL();s.position=Aircraft.GetOrigin();s.velocity=Sim.GetVelocity();s.attitude=Aircraft.GetYawPitchRoll();s.angularVelocity=Sim.GetAngularVelocity();Physics body=Aircraft.GetPhysics(); if(body) {s.bodyMass=body.GetMass();s.bodyVelocity=body.GetVelocity();} s.forceY=ForceY;s.targetY=TargetY;s.heightY=HeightY;s.requestedAcceleration=RequestedAcceleration;s.measuredAcceleration=MeasuredAcceleration;s.torque=Torque;s.totalForceBefore=TotalBefore;s.totalForceAfter=TotalAfter;s.physicsDt=PhysicsDt;s.force=Force;s.targetPosition=Vector(Anchor[0],TargetY,Anchor[2]);s.lateralError=LateralError;s.attitudeError=AttitudeError;s.rpm=Sim.RotorGetRPM(0);s.groundContact=Sim.HasAnyGroundContact();Trace.Insert(s);
 }
 void Finish(string reason)
 {
  if(Done) {return;}
  Capture("observation");Phase=reason;Active=false;Done=true;
  GetGame().GetCallqueue().Remove(Tick);GetGame().GetCallqueue().Remove(Observe);
  ForceY=0; // Active guard stops all further external-force injection.
  // Completion releases only COMMAND assistance. Human handoff never stops the engine.
  if(!Handoff && Controller && Sim && Sim.HasAnyGroundContact() && Sim.GetVelocity().Length()<0.5) {Controller.StopEngine(false);}
 }

 void Observe()
 {
  if(!Active) {return;}
  Capture("observation");
 }
};

// One active experimental lease initially. No OnGameStart hook and no spawning.
class COMMAND_HelicopterFlightDispatcher
{
 static ref COMMAND_HelicopterFlightLease Lease;
 static string StartReviewed(COMMAND_HelicopterFlightLease proposed,string requestId,IEntity aircraft,IEntity pilot,array<IEntity> passengers,vector lz)
 {
  if(Lease && Lease.Active) {return "Another experimental helicopter flight is running";}
  string problem=proposed.StartApproved(requestId,aircraft,pilot,passengers,lz);
  if(problem.IsEmpty()) {Lease=proposed;}
  return problem;
 }
};
modded class Vehicle
{
 override protected void EOnSimulate(IEntity owner,float timeSlice)
 {
  super.EOnSimulate(owner,timeSlice);
  COMMAND_HelicopterFlightLease flight=COMMAND_HelicopterFlightDispatcher.Lease;
  if(flight && flight.Active && this==flight.Aircraft) {flight.ForceStep(timeSlice);flight.Capture("physics-force-step");}
 }
};
