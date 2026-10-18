// Original bounded controller for one approved, on-foot AI character.
// The physical character remains the owned root; the native group is a helper.
class COMMAND_ORBAT_CharacterGroup
{
    static ResourceName BASE = "{000CD338713F2B5A}Prefabs/AI/Groups/Group_Base.et";
    IEntity Member;
    AIAgent Agent;
    SCR_AIGroup Group;
    string ControlFaction;

    bool Matches(IEntity root)
    {
        if (!root || root != Member || !Agent || !Group || Agent.GetControlledEntity() != Member || Agent.GetParentGroup() != Group) return false;
        array<AIAgent> agents = {}; Group.GetAgents(agents);
        if (agents.Count() != 1 || agents[0] != Agent || Group.GetLeaderEntity() != Member) return false;
        SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(Member.FindComponent(SCR_EditableCharacterComponent));
        return editable && !editable.IsDestroyed() && editable.GetFaction() && editable.GetFaction().GetFactionKey() == ControlFaction;
    }
    // Never remove another member, human control, or a foreign group's assignment.
    bool CanRelease()
    {
        if (!Group) return true;
        if (JSOC_ORBAT_AIOrders.PlayerOccupies(Group) || JSOC_ORBAT_AIOrders.PlayerOccupies(Member)) return false;
        array<AIAgent> members = {}; Group.GetAgents(members);
        return members.Count() == 0 || (members.Count() == 1 && members[0] == Agent);
    }
    bool Release()
    {
        if (!CanRelease()) return false;
        if (!Group) return true;
        if (JSOC_ORBAT_AIOrders.PlayerOccupies(Group) || JSOC_ORBAT_AIOrders.PlayerOccupies(Member)) return false;
        array<AIAgent> agents = {}; Group.GetAgents(agents);
        if (agents.Count() > 1 || (agents.Count() == 1 && agents[0] != Agent)) return false;
        if (Agent && Agent.GetParentGroup() == Group) Group.RemoveAgent(Agent);
        agents.Clear(); Group.GetAgents(agents);
        if (!agents.IsEmpty()) return false;
        SCR_EntityHelper.DeleteEntityAndChildren(Group); Group = null;
        return true;
    }
    static COMMAND_ORBAT_CharacterGroup Create(IEntity member, out string problem)
    {
        problem = "Individual AI requires a living on-foot editable character with a ready AI agent";
        if (!member) return null;
        if (JSOC_ORBAT_AIOrders.PlayerOccupies(member)) { problem = "Human-controlled characters are protected"; return null; }
        if (COMMAND_ORBAT_TransportLease.MountedIn(member)) { problem = "Recruit an individual AI only while it is on foot"; return null; }
        SCR_EditableCharacterComponent editable = SCR_EditableCharacterComponent.Cast(member.FindComponent(SCR_EditableCharacterComponent));
        AIControlComponent control = AIControlComponent.Cast(member.FindComponent(AIControlComponent));
        if (!editable || editable.IsDestroyed() || !editable.GetFaction() || !control || !control.GetAIAgent()) return null;
        AIAgent agent = control.GetAIAgent();
        if (agent.GetControlledEntity() != member) return null;
        if (agent.GetParentGroup()) { problem = "Character already belongs to a group; recruit that existing squad instead"; return null; }
        string faction = editable.GetFaction().GetFactionKey();
        if (faction.IsEmpty() || faction == "NO_FACTION") { problem = "Individual AI faction is unresolved"; return null; }
        Resource resource = Resource.Load(BASE);
        if (!resource || !resource.IsValid() || !resource.GetResource() || resource.GetResource().GetResourceName() != BASE) { problem = "Native individual AI group resource is unavailable"; return null; }
        EntitySpawnParams parameters = new EntitySpawnParams(); parameters.TransformMode = ETransformMode.WORLD;
        Math3D.AnglesToMatrix(vector.Zero,parameters.Transform); parameters.Transform[3] = member.GetOrigin();
        SCR_AIGroup group = SCR_AIGroup.Cast(GetGame().SpawnEntityPrefab(resource,GetGame().GetWorld(),parameters));
        if (!group) { problem = "Native individual AI group could not be created"; return null; }
        group.SetDeleteWhenEmpty(false);
        COMMAND_ORBAT_CharacterGroup lease = new COMMAND_ORBAT_CharacterGroup(); lease.Member = member; lease.Agent = agent; lease.Group = group; lease.ControlFaction = faction;
        if (!group.SetFaction(editable.GetFaction())) { lease.Release(); problem = "Native individual AI faction could not be set"; return null; }
        group.AddAgent(agent);
        if (!lease.Matches(member)) { lease.Release(); problem = "Native individual AI membership did not initialize"; return null; }
        problem = "";
        return lease;
    }
};
