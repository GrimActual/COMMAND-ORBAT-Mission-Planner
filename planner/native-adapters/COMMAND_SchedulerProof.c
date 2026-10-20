class COMMAND_CountJob : COMMAND_MigrationJob
{
 int Runs;
 bool Ready;
 float Started;
 float Elapsed;
 bool StartTracked(IEntity owner, int milliseconds)
 {
  Started = GetGame().GetWorld().GetWorldTime();
  return StartDelay(owner, milliseconds);
 }
 void InjectStaleTick() { Tick(m_Generation - 1); }
 override protected bool IsReady() { return Ready; }
 override protected void Execute() { Runs++; Elapsed = GetGame().GetWorld().GetWorldTime() - Started; }
};
class COMMAND_SchedulerProof
{
 static IEntity Owner;
 static IEntity DeletedOwner;
 static ref COMMAND_MigratedJob_0001 Delay;
 static ref COMMAND_MigratedJob_0001 Cancelled;
 static ref COMMAND_MigratedJob_0001 Deleted;
 static ref COMMAND_MigratedJob_0002 s_WaitJob;
 static ref COMMAND_CountJob Other;
 static ref COMMAND_CountJob Restart;
 static ref COMMAND_CountJob Bounded;
 static ref COMMAND_CountJob Ready;
 static ref COMMAND_CountJob Invalid;
 static ref COMMAND_CountJob Stale;
 static int Cases;
 static int Failures;
 static void Check(bool valid) { Cases++; if (!valid) { Failures++; PrintFormat("[COMMAND SCHEDULE FAIL] CASE=%1", Cases); } }
 static void Run()
 {
  Owner = GetGame().SpawnEntity(GenericEntity, GetGame().GetWorld());
  DeletedOwner = GetGame().SpawnEntity(GenericEntity, GetGame().GetWorld());
  Check(Owner && DeletedOwner);
  if (!Owner || !DeletedOwner) { Finish(); return; }
  Delay = new COMMAND_MigratedJob_0001(); Cancelled = new COMMAND_MigratedJob_0001(); Deleted = new COMMAND_MigratedJob_0001(); s_WaitJob = new COMMAND_MigratedJob_0002();
  Other = new COMMAND_CountJob(); Restart = new COMMAND_CountJob(); Bounded = new COMMAND_CountJob(); Ready = new COMMAND_CountJob(); Invalid = new COMMAND_CountJob(); Stale = new COMMAND_CountJob();
  Check(Delay.Begin(Owner)); Check(Delay.GetStatus() == "waiting");
  Check(s_WaitJob.Begin(Owner) && s_WaitJob.GetStatus() == "completed" && s_WaitJob.GetResult() == "ready");
  Check(Cancelled.Begin(Owner)); Cancelled.Cancel();
  Check(Other.StartTracked(Owner, 200));
  Check(Deleted.Begin(DeletedOwner));
  Check(Restart.StartTracked(Owner, 200)); Check(Restart.StartTracked(Owner, 300));
  Check(Bounded.StartWait(Owner, 100, 3)); Check(Ready.StartWait(Owner, 100, 5));
  Check(!Invalid.StartDelay(null, 200)); Check(!Invalid.StartWait(Owner, 0, 3));
  Check(Stale.StartTracked(Owner, 200)); Stale.InjectStaleTick(); Check(Stale.Runs == 0);
  Check(!Other.StartWait(Owner, 0, 3) && Other.GetStatus() == "waiting");
  SCR_EntityHelper.DeleteEntityAndChildren(DeletedOwner);
  GetGame().GetCallqueue().CallLater(SetReady, 150, false);
  GetGame().GetCallqueue().CallLater(Finish, 1000, false);
 }
 static void SetReady() { Ready.Ready = true; }
 static void Finish()
 {
  Check(Delay && Delay.GetStatus() == "completed" && Delay.GetResult() == "done");
  Check(Cancelled && Cancelled.GetStatus() == "cancelled" && Cancelled.GetResult() == "");
  Check(Other && Other.GetStatus() == "completed" && Other.Runs == 1);
  Check(Deleted && Deleted.GetStatus() == "owner-deleted" && Deleted.GetResult() == "");
  Check(Restart && Restart.Runs == 1 && Restart.Elapsed >= 300);
  Check(Bounded && Bounded.GetStatus() == "timed-out" && Bounded.GetAttempts() == 3 && Bounded.Runs == 0);
  Check(Ready && Ready.GetStatus() == "completed" && Ready.Runs == 1 && Ready.GetAttempts() <= 5);
  Check(Stale && Stale.GetStatus() == "completed" && Stale.Runs == 1);
  if (Delay) Delay.Cancel(); if (s_WaitJob) s_WaitJob.Cancel(); if (Other) Other.Cancel(); if (Restart) Restart.Cancel(); if (Bounded) Bounded.Cancel(); if (Ready) Ready.Cancel(); if (Stale) Stale.Cancel();
  if (Owner) SCR_EntityHelper.DeleteEntityAndChildren(Owner);
  PrintFormat("[COMMAND SCHEDULE] CASES=%1 FAILURES=%2 VERSION=%3", Cases, Failures, GetGame().GetBuildVersion());
 }
};
modded class ArmaReforgerScripted
{
 override void OnAfterInit(BaseWorld world)
 {
  super.OnAfterInit(world);
  GetGame().GetCallqueue().CallLater(COMMAND_SchedulerProof.Run, 500, false);
 }
};
