// Original experimental COMMAND flight lease. Not enabled in the release candidate.
// No automatic spawning or startup. HostGM must own validated approval and identity resolution.
// Original force/torque controller at EOnSimulate; no pilot-input or pose setters.
class COMMAND_HelicopterFlightSample
{
 float desiredYaw;float commandYaw;float priorCommandedAcceleration;bool accelerationPairValid;float worldTimeMs; string phase; string stage; float requested; float readback;
 float agl; vector position; vector velocity; vector attitude; vector angularVelocity;
 float rpm; bool groundContact; int ordinal; float forceY; float bodyMass; vector bodyVelocity; float targetY; float heightY; float requestedAcceleration; float measuredAcceleration; vector torque; vector totalForceBefore; vector totalForceAfter; float physicsDt; vector force; vector targetPosition; float lateralError; float attitudeError;
};
class COMMAND_HelicopterFlightLease
{
 protected ref COMMAND_ValidatedAircraftProfile Profile;float PriorMainRpm;float PriorTailRpm;float PriorRpmAt;float GroundStableSince;float SpoolReadySince;float LandingPitch;float LandingRoll;float PriorCommandedAcceleration;bool AccelerationPairValid;
 bool CrewOnly;bool GroundCancellation;bool UnrestrictedRoute;string RouteMode="land";int PatrolLaps;string RequestId;bool CancelRequested;bool Handoff;
 IEntity Aircraft; IEntity Pilot;SCR_AIGroup Team;vector Departure;vector LandingPoint;float OriginClearance;float PhaseAt;bool ExitRequested;float NextExitAttempt;string ExitDiagnostic;int UnloadIndex;int Unloaded;float UnloadedSince;bool FlewToLZ;bool LandedAtLZ;int SeatAttempts;bool SpawnRequested;
 ref array<IEntity> Passengers={};
 HelicopterControllerComponent Controller; VehicleHelicopterSimulation Sim;
 ref array<ref COMMAND_HelicopterFlightSample> Trace={};
 bool Active; bool Done; bool TraceTruncated;
 string Phase="initializing";
 float Elapsed; float StartedAt; float Collective;
 float MaxAGL; float InitialAGL; float MaxVerticalSpeed; float ForceY; int ForceWrites;
 float TargetY; float GroundY;float HoverSince;float LandingSince;float StableSeconds;float PriorVy;bool HasPriorVy;float MeasuredAcceleration;float RequestedAcceleration;float HeightY;float LastCapture;vector Torque;vector TotalBefore;vector TotalAfter;vector TargetRight;vector TargetUp;vector TargetForward;vector Anchor;vector Force;float LateralError;float AttitudeError;
 float PhysicsDt;float LastGroundCheck;float CruiseY;float DesiredYaw;float CommandYaw;float RouteDistance;float SpoolFinishedAt;float TranslationStartedAt;float UnloadUnstableSince;float CruiseSpeed=57;float SoftDeadline=240;float HardDeadline=270;int RouteIndex;ref array<vector> Route={};
 int PrepareCalls; int ApplyCalls; int SimulationCalls; int Ordinal;
 bool PilotReady()
 {
  if(!Mounted(Pilot)) {return false;}
  CharacterControllerComponent character=CharacterControllerComponent.Cast(Pilot.FindComponent(CharacterControllerComponent));
  AIControlComponent control=AIControlComponent.Cast(Pilot.FindComponent(AIControlComponent));
  return character && !character.IsDead() && !character.IsUnconscious() && control && control.GetAIAgent();
 }
 bool Mounted(IEntity actor)
 {
  if(!actor || !Aircraft) {return false;}
  CompartmentAccessComponent a=CompartmentAccessComponent.Cast(actor.FindComponent(CompartmentAccessComponent));
  if(!a) {return false;}
  BaseCompartmentSlot slot=a.GetCompartment();
  return slot && slot.GetOccupant()==actor && slot.GetVehicle()==Aircraft;
 }
 // Conservative preflight clearance checks, not a general obstacle-avoidance pilot.
 bool TraceObstacle(notnull IEntity entity,vector start=vector.Zero,vector direction=vector.Zero)
 {
  if(entity==Pilot || Passengers.Find(entity)>=0) {return false;}
  IEntity parent=entity;int depth;
  while(parent && depth<64) {if(parent==Aircraft) {return false;}parent=parent.GetParent();depth++;}
  return true;
 }
 bool CorridorBlocked(vector from,vector to)
 {
  if(from==to) {return false;}
  TraceBox trace=new TraceBox();trace.Start=from;trace.End=to;float radius=8;if(Profile) {radius=Profile.ClearanceRadius();}trace.Mins=Vector(-radius,-2,-radius);trace.Maxs=Vector(radius,4,radius);trace.Flags=TraceFlags.WORLD | TraceFlags.ENTS;trace.LayerMask=0xffffffff;
  return GetGame().GetWorld().TraceMove(trace,TraceObstacle)<0.999;
 }
 // Called only after HostGM validates reviewed request, pairing ownership and exact entity identities.
 string StartApproved(string requestId,IEntity aircraft,IEntity pilot,array<IEntity> passengers,vector lz,COMMAND_ValidatedAircraftProfile validatedProfile)
 {
  if(Active || Done) {return "Flight lease is already used";}
  if(!Replication.IsServer() || requestId.IsEmpty()) {return "Authoritative reviewed request required";}
  if(!validatedProfile || !validatedProfile.Matches(aircraft)) {return "No validated local flight profile for the exact aircraft";}
  Profile=validatedProfile;
  if(!aircraft || !pilot || !passengers) {return "Flight requires an aircraft and seated AI pilot";}

  Aircraft=aircraft;Pilot=pilot;
  if(JSOC_ORBAT_AIOrders.PlayerOccupies(Aircraft)) {return "Human-controlled aircraft is protected";}
  foreach(IEntity actor:passengers)
  {
   if(!actor || actor==pilot || Passengers.Find(actor)>=0) {return "Passenger identity is invalid";}
   Passengers.Insert(actor);
  }
  CrewOnly=Passengers.Count()==0;
  Controller=HelicopterControllerComponent.Cast(Aircraft.FindComponent(HelicopterControllerComponent));
  if(!Controller) {return "Helicopter controller unavailable";}
  Sim=Controller.GetSimulation();Physics body=Aircraft.GetPhysics();
  if(!Sim || !Sim.IsValid() || !body || !body.IsDynamic() || body.GetMass()<=0) {return "Dynamic helicopter simulation unavailable";}
  PilotCompartmentSlot pilotSlot=Controller.GetPilotCompartmentSlot();
  if(!pilotSlot || pilotSlot.GetOccupant()!=Pilot) {return "Exact pilot compartment occupant required";}
  SCR_EditableVehicleComponent aircraftState=SCR_EditableVehicleComponent.Cast(Aircraft.FindComponent(SCR_EditableVehicleComponent));
  if(aircraftState && aircraftState.IsDestroyed()) {return "Aircraft is destroyed";}
  BaseCompartmentManagerComponent compartments=BaseCompartmentManagerComponent.Cast(Aircraft.FindComponent(BaseCompartmentManagerComponent));
  if(!compartments) {return "Compartment manager unavailable";}
  array<BaseCompartmentSlot> slots={};compartments.GetCompartments(slots);
  foreach(BaseCompartmentSlot slot:slots)
  {
   if(!slot) {continue;}
   IEntity occupant=slot.GetOccupant();
   if(occupant && Passengers.Find(occupant)>=0 && slot.GetType()!=ECompartmentType.CARGO) {return "Passengers must occupy cargo seats";}
  }
  if(!PilotReady()) {return "A seated, living, conscious AI pilot is required";}
  if(!Sim.HasAnyGroundContact())
  {
   float originAboveGround=Aircraft.GetOrigin()[1]-GetGame().GetWorld().GetSurfaceY(Aircraft.GetOrigin()[0],Aircraft.GetOrigin()[2]);
   if(!Profile.PrepareGround() || originAboveGround< -1 || originAboveGround>2) {return "Aircraft must be grounded or inside the tested approved ground-preparation envelope";}
  }
  if(!(lz[0]>=0 && lz[0]<=20000 && lz[2]>=0 && lz[2]<=20000)) {return "Landing coordinates invalid";}
  vector delta=lz-Aircraft.GetOrigin();delta[1]=0;
  // Operator selects the LZ. Terrain variation is not a flight rejection.
  vector startPosition=Aircraft.GetOrigin();float departureGround=GetGame().GetWorld().GetSurfaceY(startPosition[0],startPosition[2]);
  float landingGround=GetGame().GetWorld().GetSurfaceY(lz[0],lz[2]);
  Route.Insert(lz);RouteDistance=0;vector previous=startPosition;float highest=Math.Max(departureGround,landingGround);
  float minimumCruiseAGL=Profile.CruiseClearance();
  foreach(vector altitudePoint:Route) {if(!(altitudePoint[1]>=0 && altitudePoint[1]<=19000)) {return "Invalid waypoint minimum clearance";}minimumCruiseAGL=Math.Max(minimumCruiseAGL,altitudePoint[1]);}
  foreach(vector point:Route)
  {
   if(point[0]<0 || point[0]>13500 || point[2]<0 || point[2]>13500) {return "Flight waypoint outside supported world bounds";}
   vector leg=point-previous;leg[1]=0;
   RouteDistance+=leg.Length();
   int samples=Math.Max(1,Math.Ceil(leg.Length()/10));
   for(int sample=0;sample<=samples;sample++) {vector samplePoint=vector.Lerp(previous,point,sample/(float)samples);highest=Math.Max(highest,GetGame().GetWorld().GetSurfaceY(samplePoint[0],samplePoint[2]));}
   previous=point;
  }
  if(RouteMode=="patrol-loop")
  {
   vector closeLeg=Route[0]-lz;closeLeg[1]=0;RouteDistance+=closeLeg.Length();
   int closingSamples=Math.Max(1,Math.Ceil(closeLeg.Length()/10));
   for(int closingSample=0;closingSample<=closingSamples;closingSample++) {vector closingPoint=vector.Lerp(lz,Route[0],closingSample/(float)closingSamples);highest=Math.Max(highest,GetGame().GetWorld().GetSurfaceY(closingPoint[0],closingPoint[2]));}
  }
  if(landingGround<0) {return "Landing zone cannot be below sea level";}
  CruiseY=highest+minimumCruiseAGL+(startPosition[1]-departureGround);
  // A single conservative cruise altitude meets every optional waypoint minimum.
  if(CruiseY>19900) {return "Required cruise altitude exceeds supported world-height coordinates";}
  vector firstLeg=Route[0]-startPosition;firstLeg[1]=0;DesiredYaw=Aircraft.GetYawPitchRoll()[0];if(firstLeg.LengthSq()>0) {DesiredYaw=Math.Atan2(firstLeg[0],firstLeg[2])*Math.RAD2DEG;}
  bool cruiseClear=false;
  float clearanceRise=20;
  for(int heightStep=0;heightStep<12;heightStep++)
  {
   vector priorCruise=Vector(startPosition[0],CruiseY,startPosition[2]);cruiseClear=true;
   foreach(vector routePoint:Route) {vector nextCruise=Vector(routePoint[0],CruiseY,routePoint[2]);if(CorridorBlocked(priorCruise,nextCruise)) {cruiseClear=false;break;}priorCruise=nextCruise;}
   if(cruiseClear && RouteMode=="patrol-loop") {cruiseClear=!CorridorBlocked(Vector(lz[0],CruiseY,lz[2]),Vector(Route[0][0],CruiseY,Route[0][2]));}
   if(cruiseClear) {break;}
   if(CruiseY>=19900) {break;}
   CruiseY=Math.Min(19900,CruiseY+clearanceRise);clearanceRise*=2;
  }
  if(!cruiseClear) {return "No collision-clear cruise corridor found; change route or inspect obstacles";}
  vector departureHigh=Vector(startPosition[0],CruiseY,startPosition[2]);vector landingHigh=Vector(lz[0],CruiseY,lz[2]);
  if(CorridorBlocked(startPosition+Vector(0,3,0),departureHigh)) {return "Takeoff column obstructed; choose an open departure area";}
  if(CorridorBlocked(landingHigh,Vector(lz[0],landingGround+3,lz[2]))) {return "Landing column obstructed; choose an open landing zone";}
  float estimate=RouteDistance/CruiseSpeed+(CruiseY-startPosition[1])/3+(CruiseY-landingGround)/1.2+Route.Count()*8+60;
  // Travel length is not an admission limit. New peers renew authority independently of travel time.
  if(UnrestrictedRoute) {SoftDeadline=90;HardDeadline=120;}
  else {SoftDeadline=Math.Max(SoftDeadline,estimate*2+120);HardDeadline=SoftDeadline+120;}
  if(Profile.PrepareGround()) {body.SetActive(ActiveState.ACTIVE);}
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
  // Preserve enough controlled travel time to reach the reviewed LZ after authority loss.
  float remaining=0;vector prior=Aircraft.GetOrigin();
  for(int i=RouteIndex;i<Route.Count();i++) {vector leg=Route[i]-prior;leg[1]=0;remaining+=leg.Length();prior=Route[i];}
  float reserve=remaining/Math.Max(1,CruiseSpeed*0.5)+Math.Max(0,CruiseY-LandingPoint[1])/0.5+Route.Count()*15+180;
  HardDeadline=Math.Max(HardDeadline,Elapsed+reserve);
  // Airborne cancellation retains the controller and follows the already approved clear route to the LZ.
  if((Phase=="seating" || Phase=="spooling") && Sim && Sim.HasAnyGroundContact() && Aircraft.GetPhysics().GetVelocity().Length()<0.15)
  {
   Controller.StopEngine(false);
   if(RotorsStopped()) {Finish("cancelled: grounded at departure; passengers retained");return;}
   vector restingPose[4];Aircraft.GetPhysics().GetWorldTransform(restingPose);Anchor=restingPose[3];TargetY=Anchor[1];vector restingAngles=Aircraft.GetYawPitchRoll();CommandYaw=restingAngles[0];DesiredYaw=CommandYaw;LandingPitch=restingAngles[1];LandingRoll=restingAngles[2];
   GroundCancellation=true;Phase="descending";StableSeconds=0;LastGroundCheck=Elapsed;
  }
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
  if(Elapsed>SoftDeadline) {RequestCancel();}
  if(Elapsed>HardDeadline) {Finish("failed: flight safety deadline; landing unconfirmed");return;}
  if(Phase=="seating")
  {
   if(!AllSeated())
   {
    if(Elapsed>8) {Finish("failed: actual occupancy");}
    return;
   }
   if(Profile.SpoolHold())
   {
    vector initialPose[4];Aircraft.GetPhysics().GetWorldTransform(initialPose);Anchor=initialPose[3];TargetY=Anchor[1];vector restingAngles=Aircraft.GetYawPitchRoll();CommandYaw=restingAngles[0];LandingPitch=restingAngles[1];LandingRoll=restingAngles[2];
   }
   // Native control configuration remains untouched.
   Controller.StartEngine();Phase="spooling";
  }
  if(!PilotReady()) {Finish("failed: pilot left, died or became unconscious");return;}
  SCR_EditableVehicleComponent aircraftState=SCR_EditableVehicleComponent.Cast(Aircraft.FindComponent(SCR_EditableVehicleComponent));
  if(!Sim.IsValid() || (aircraftState && aircraftState.IsDestroyed())) {Finish("failed: aircraft destroyed or simulation unavailable");return;}
  if(Phase!="unloading")
  {
   // Passenger tasks are optional; dismounted or lost actors do not cancel flight.
   for(int passengerIndex=Passengers.Count()-1;passengerIndex>=0;passengerIndex--)
   {
    if(!Passengers[passengerIndex] || !Mounted(Passengers[passengerIndex])) {Passengers.Remove(passengerIndex);}
   }
   CrewOnly=Passengers.Count()==0;
  }
  if(GroundCancellation)
  {
   Physics groundBody=Aircraft.GetPhysics();vector groundError=Aircraft.GetOrigin()-Anchor;
   bool settled=groundBody && Sim.HasAnyGroundContact() && groundBody.GetVelocity().Length()<0.15 && groundBody.GetAngularVelocity().Length()<0.05 && groundError.Length()<0.7 && RotorsStopped();
   if(settled) {StableSeconds+=Math.Max(0,Elapsed-LastGroundCheck);}else {StableSeconds=0;}LastGroundCheck=Elapsed;
   if(StableSeconds>=2) {Finish("cancelled: grounded at departure; passengers retained");}return;
  }
  float agl=Sim.GetAltitudeAGL();MaxAGL=Math.Max(MaxAGL,agl);
  vector velocity=Sim.GetVelocity();MaxVerticalSpeed=Math.Max(MaxVerticalSpeed,velocity[1]);
  if(Phase=="spooling")
  {
   Collective=0;
   bool rotorReady=Sim.EngineIsOn() && Sim.RotorGetRPM(0)>=Profile.OperatingRpm();
   if(Profile.RotorStableSeconds()>0)
   {
    float tailRpm=0;if(Sim.RotorCount()>1) {tailRpm=Sim.RotorGetRPM(1);}float rpmDt=Elapsed-PriorRpmAt;
    rotorReady=rotorReady && tailRpm>=Profile.OperatingTailRpm() && PriorRpmAt>0 && rpmDt>0 && Math.AbsFloat(Sim.RotorGetRPM(0)-PriorMainRpm)/rpmDt<=1 && Math.AbsFloat(tailRpm-PriorTailRpm)/rpmDt<=8;
    PriorMainRpm=Sim.RotorGetRPM(0);PriorTailRpm=tailRpm;PriorRpmAt=Elapsed;
   }
   if(Profile.SpoolHold()) {rotorReady=rotorReady && Sim.HasAnyGroundContact() && Aircraft.GetPhysics().GetVelocity().Length()<0.15 && Aircraft.GetPhysics().GetAngularVelocity().Length()<0.05;}
   if(!rotorReady) {SpoolReadySince=0;}
   if(Elapsed>=8 && rotorReady)
   {
    if(Profile.SpoolHold()) {if(SpoolReadySince==0) {SpoolReadySince=Elapsed;}if(Elapsed-SpoolReadySince<Profile.RotorStableSeconds()) {return;}}
    if(!Sim.EngineIsOn() || Sim.RotorGetRPM(0)<Profile.OperatingRpm()) {Finish("failed: engine operating state");return;}
    InitialAGL=agl;SpoolFinishedAt=Elapsed;Phase="hover-controller";
    vector pose[4];Physics body=Aircraft.GetPhysics();body.GetWorldTransform(pose);
    Anchor=pose[3];Departure=Anchor;GroundY=pose[3][1];TargetY=CruiseY;
    OriginClearance=GroundY-GetGame().GetWorld().GetSurfaceY(Anchor[0],Anchor[2]);
    LandingPoint[1]=GetGame().GetWorld().GetSurfaceY(LandingPoint[0],LandingPoint[2])+OriginClearance;
    // Ground height still anchors touchdown; no terrain-flatness veto.
    vector desired[4];vector angles=Aircraft.GetYawPitchRoll();CommandYaw=angles[0];LandingPitch=angles[1];LandingRoll=angles[2];Math3D.AnglesToMatrix(Vector(angles[0],0,0),desired);
    TargetRight=desired[0];TargetUp=desired[1];TargetForward=desired[2];
   }
   if(Sim.RotorGetRPM(0)<Profile.OperatingRpm()) {SpoolReadySince=0;}
   if(Elapsed>Profile.SpoolDeadline() && Phase=="spooling") {Finish("failed: engine did not reach operating RPM");}
   return;
  }
  Collective=0;
  if(HeightY>CruiseY+15) {Finish("failed: height envelope");return;}
  if(HoverSince>0 && Elapsed-HoverSince>2 && Phase=="hover-controller")
  {
   Phase="flying";TranslationStartedAt=Elapsed;PhaseAt=Elapsed;Anchor=Route[0];
  }
  if(Phase=="flying")
  {
   vector delta=Route[RouteIndex]-Aircraft.GetOrigin();delta[1]=0;
   if(RouteIndex<Route.Count()-1 && delta.Length()<8) {RouteIndex++;Anchor=Route[RouteIndex];vector nextLeg=Anchor-Aircraft.GetOrigin();nextLeg[1]=0;if(nextLeg.LengthSq()>0) {DesiredYaw=Math.Atan2(nextLeg[0],nextLeg[2])*Math.RAD2DEG;}delta=nextLeg;delta[1]=0;}
   Physics body=Aircraft.GetPhysics();vector v=body.GetVelocity();
   if(RouteIndex==Route.Count()-1 && delta.Length()<0.7 && Vector(v[0],0,v[2]).Length()<0.25 && Math.AbsFloat(TargetY-HeightY)<0.35)
   {
    if(RouteMode!="land" && !CancelRequested)
    {
     if(RouteMode=="patrol-loop") {PatrolLaps++;RouteIndex=0;Anchor=Route[0];vector loopLeg=Anchor-Aircraft.GetOrigin();loopLeg[1]=0;if(loopLeg.LengthSq()>0) {DesiredYaw=Math.Atan2(loopLeg[0],loopLeg[2])*Math.RAD2DEG;}}
    }
    else {FlewToLZ=true;Phase="approaching";PhaseAt=Elapsed;}
   }
  }
  if(Phase=="approaching" && Elapsed-PhaseAt>1) {Phase="descending";LandingSince=Elapsed;LastGroundCheck=Elapsed;GroundY=LandingPoint[1];}
  if(Phase=="descending") {float descentRate=0.5;if(HeightY>GroundY+5) {descentRate=1.5;}TargetY=Math.Max(GroundY-0.12,TargetY-Math.Max(0,Elapsed-LastGroundCheck)*descentRate);}
  if(Phase=="descending")
  {
   Physics body=Aircraft.GetPhysics();vector v=body.GetVelocity();
   bool grounded=Sim.HasAnyGroundContact() && v.Length()<0.15 && body.GetAngularVelocity().Length()<0.05 && LateralError<0.7 && Math.AbsFloat(HeightY-LandingPoint[1])<0.5 && AttitudeError<0.035;
   if(grounded) {StableSeconds+=Math.Max(0,Elapsed-LastGroundCheck);} else {StableSeconds=0;}
   LastGroundCheck=Elapsed;
   if(StableSeconds>=2)
   {
    if(!LandedAtLZ) {LandedAtLZ=true;Controller.StopEngine(false);}
    if(CancelRequested)
    {
     // Keep the sole controller holding the grounded aircraft while residual rotor forces decay.
     if(RotorsStopped()) {Finish("cancelled: landed at approved LZ; passengers retained");}
     return;
    }
    Phase="unloading";PhaseAt=Elapsed;
   }
  }
  if(Phase=="unloading")
  {
   bool unloadStable=Sim.HasAnyGroundContact() && Aircraft.GetPhysics().GetVelocity().Length()<0.5;
   if(!unloadStable) {if(UnloadUnstableSince==0) {UnloadUnstableSince=Elapsed;}if(Elapsed-UnloadUnstableSince>0.5) {Finish("failed: sustained landing instability during unload");}return;}
   UnloadUnstableSince=0;
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
    // A zero-passenger flight has no exit-animation interval to absorb rotor rundown.
    if(CrewOnly && !RotorsStopped()) {UnloadedSince=0;return;}
    if(UnloadedSince==0) {UnloadedSince=Elapsed;}
    if(Elapsed-UnloadedSince>=1) {if(CrewOnly) {Finish("complete: pilot-only flight landed; pilot retained");}else {Finish("complete: insertion landed and passenger team unloaded; pilot retained");}}
   }
   else {UnloadedSince=0;}
  }

 }
 bool RotorsStopped()
 {
  if(!Sim) {return false;}
  for(int rotor=0;rotor<Sim.RotorCount();rotor++) {if(Sim.RotorGetRPM(rotor)>1) {return false;}}
  return true;
 }
 bool AllSeated()
 {
  return PilotReady();
 }
 vector Cross(vector a,vector b)
 {
  return Vector(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]);
 }
 void ForceStep(float timeSlice)
 {
  if(!Active || !Aircraft || !Sim || (Phase!="hover-controller" && Phase!="flying" && Phase!="approaching" && Phase!="descending" && Phase!="unloading" && !(Phase=="spooling" && Profile && Profile.SpoolHold()))) {return;}
  if(ReleaseForHuman()) {return;}
  Physics body=Aircraft.GetPhysics();
  if(!body || !body.IsDynamic() || body.GetMass()<=0) {Finish("failed: no dynamic aircraft body");return;}
  if(timeSlice<=0 || timeSlice>0.2) {Finish("failed: invalid physics timestep");return;}
  PhysicsDt=timeSlice;
  vector pose[4];body.GetWorldTransform(pose);HeightY=pose[3][1];
  vector velocity=body.GetVelocity();vector omega=body.GetAngularVelocity();
  AccelerationPairValid=HasPriorVy;PriorCommandedAcceleration=RequestedAcceleration;
  if(HasPriorVy) {MeasuredAcceleration=(velocity[1]-PriorVy)/timeSlice;}
  PriorVy=velocity[1];HasPriorVy=true;
  // PD height loop. Clamp the commanded additional acceleration, not measured net acceleration.
  float desiredVy=Math.Clamp(Profile.VerticalP()*(TargetY-HeightY),-2.0,Profile.RiseSpeed());RequestedAcceleration=Math.Clamp(Profile.VelocityP()*(desiredVy-velocity[1]),-2.0,Profile.RiseAcceleration());
  vector delta=Anchor-pose[3];delta[1]=0;LateralError=delta.Length();
  vector desiredVelocity=vector.Zero;
  if(LateralError>0.001) {desiredVelocity=delta.Normalized()*Math.Min(CruiseSpeed,Math.Min(LateralError*0.6,Math.Sqrt(4.0*LateralError)));}
  float directionError=DesiredYaw-Math.Atan2(pose[2][0],pose[2][2])*Math.RAD2DEG;while(directionError>180) {directionError-=360;}while(directionError<-180) {directionError+=360;}
  if(Phase=="flying" && Math.AbsFloat(directionError)>12) {desiredVelocity=vector.Zero;}
  vector lateral=Vector((desiredVelocity[0]-velocity[0])*1.8,0,(desiredVelocity[2]-velocity[2])*1.8);
  if(lateral.Length()>2.5) {lateral=lateral.Normalized()*2.5;}
  vector desiredAcceleration=Vector(lateral[0],RequestedAcceleration,lateral[2]);
  TotalBefore=body.GetTotalForce();Force=desiredAcceleration*body.GetMass()-TotalBefore;
  float forceLimit=body.GetMass()*Physics.STANDARD_GRAVITY*3;
  if(Force.Length()>forceLimit) {Force=Force.Normalized()*forceLimit;}
  ForceY=Force[1];
  // Apply at the documented local COM offset transformed to world coordinates.
  vector center=body.GetCenterOfMass().Multiply4(pose);
  body.ApplyForceAt(center,Force);TotalAfter=body.GetTotalForce();ForceWrites++;
  // Slew the level attitude target toward the route; never set the physical pose.
  float headingDelta=DesiredYaw-CommandYaw;while(headingDelta>180) {headingDelta-=360;}while(headingDelta<-180) {headingDelta+=360;}
  if(Phase!="spooling") {CommandYaw+=Math.Clamp(headingDelta,-25*timeSlice,25*timeSlice);}vector desired[4];float pitch=0;float roll=0;if(Profile.DepartureLandingAttitude() && (Phase=="spooling" || Phase=="descending" || Phase=="unloading")) {pitch=LandingPitch;roll=LandingRoll;}Math3D.AnglesToMatrix(Vector(CommandYaw,pitch,roll),desired);TargetRight=desired[0];TargetUp=desired[1];TargetForward=desired[2];
  // Fixed attitude target; no transform/angular-velocity setters or frozen axes.
  vector error=(Cross(pose[0],TargetRight)+Cross(pose[1],TargetUp)+Cross(pose[2],TargetForward))*0.5;
  AttitudeError=error.Length();
  vector gains=Profile.AttitudeP();vector damping=Profile.AttitudeD();
  // Coefficients are mass-scaled torque factors, not angular accelerations or inertia estimates.
  Torque=Vector(error[0]*gains[0]-omega[0]*damping[0],error[1]*gains[1]-omega[1]*damping[1],error[2]*gains[2]-omega[2]*damping[2])*body.GetMass()-body.GetTotalTorque();
  float limit=body.GetMass()*Profile.TorqueCap();float magnitude=Torque.Length();
  if(magnitude>limit) {Torque=Torque*(limit/magnitude);}
  body.ApplyTorque(Torque);
  float routeYawError=DesiredYaw-Math.Atan2(pose[2][0],pose[2][2])*Math.RAD2DEG;while(routeYawError>180) {routeYawError-=360;}while(routeYawError<-180) {routeYawError+=360;}
  if(Phase=="hover-controller" && Math.AbsFloat(routeYawError)<5 && Math.AbsFloat(TargetY-HeightY)<0.35 && Math.AbsFloat(velocity[1])<0.2 && omega.Length()<0.08 && LateralError<0.5 && Vector(velocity[0],0,velocity[2]).Length()<0.3 && AttitudeError<0.01745)
  {
   if(HoverSince==0) {HoverSince=Elapsed;}
  }
  else if(Phase=="hover-controller") {HoverSince=0;}
 }
 void Capture(string stage)
 {
  if(!Active || !Aircraft || !Sim) {return;}
  if(Trace.Count()>=4096) {TraceTruncated=true;for(int discard=Trace.Count()-2;discard>0;discard-=2) {Trace.Remove(discard);}}
  float now=GetGame().GetWorld().GetWorldTime();
  if(stage!="observation" && (now-LastCapture<100 || (!Profile.SpoolHold() && Elapsed<24))) {return;}
  LastCapture=now;
  COMMAND_HelicopterFlightSample s=new COMMAND_HelicopterFlightSample();
  s.desiredYaw=DesiredYaw;s.commandYaw=CommandYaw;s.priorCommandedAcceleration=PriorCommandedAcceleration;s.accelerationPairValid=AccelerationPairValid;
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
  COMMAND_ValidatedAircraftProfile profile=COMMAND_ValidatedAircraftProfile.Resolve(aircraft);
  if(!profile) {return "No validated local flight profile for the exact aircraft";}
  string problem=proposed.StartApproved(requestId,aircraft,pilot,passengers,lz,profile);
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
