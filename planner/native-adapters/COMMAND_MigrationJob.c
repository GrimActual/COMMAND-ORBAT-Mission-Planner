// COMMAND owned scheduling adapter. Call Cancel on component/session teardown.
// Owners and instance lifetimes must be bound explicitly by the integrating component.
class COMMAND_MigrationJob
{
 protected IEntity m_Owner;
 protected int m_Generation;
 protected int m_Attempts;
 protected int m_MaxAttempts;
 protected int m_Interval;
 protected float m_Deadline;
 protected bool m_Wait;
 protected bool m_Cancelled = true;
 protected string m_Status = "new";

 string GetStatus() { return m_Status; }
 int GetAttempts() { return m_Attempts; }

 bool StartDelay(IEntity owner, int milliseconds)
 {
  if (!owner || milliseconds < 1 || milliseconds > 600000 || !GetGame()) return false;
  Cancel();
  m_Owner = owner; m_Cancelled = false; m_Wait = false; m_Attempts = 0; m_Status = "waiting";
  m_Deadline = GetGame().GetWorld().GetWorldTime() + milliseconds;
  GetGame().GetCallqueue().CallLater(Tick, milliseconds, false, m_Generation);
  return true;
 }

 bool StartWait(IEntity owner, int intervalMs, int maxAttempts)
 {
  if (!owner || intervalMs < 100 || intervalMs > 60000 || maxAttempts < 1 || maxAttempts > 128 || !GetGame()) return false;
  Cancel();
  m_Owner = owner; m_Cancelled = false; m_Wait = true; m_Attempts = 0; m_Interval = intervalMs; m_MaxAttempts = maxAttempts; m_Status = "waiting";
  m_Deadline = GetGame().GetWorld().GetWorldTime();
  Tick(m_Generation);
  return true;
 }

 void Cancel()
 {
  m_Generation++;
  if (GetGame()) GetGame().GetCallqueue().Remove(Tick);
  m_Cancelled = true; m_Owner = null; m_Status = "cancelled";
 }

 protected bool IsReady() { return true; }
 protected void Execute() {}

 protected void Tick(int generation)
 {
  if (m_Cancelled || generation != m_Generation) return;
  if (!m_Owner) { m_Cancelled = true; m_Status = "owner-deleted"; return; }
  float now = GetGame().GetWorld().GetWorldTime();
  if (now < m_Deadline)
  {
   int remaining = Math.Ceil(m_Deadline - now);
   GetGame().GetCallqueue().CallLater(Tick, remaining, false, generation);
   return;
  }
  m_Attempts++;
  if (m_Wait && !IsReady())
  {
   if (m_Attempts >= m_MaxAttempts) { m_Cancelled = true; m_Owner = null; m_Status = "timed-out"; return; }
   m_Deadline = now + m_Interval;
   GetGame().GetCallqueue().CallLater(Tick, m_Interval, false, generation);
   return;
  }
  m_Cancelled = true; m_Status = "completed";
  Execute();
  m_Owner = null;
 }

 void ~COMMAND_MigrationJob()
 {
  if (GetGame()) GetGame().GetCallqueue().Remove(Tick);
 }
};
