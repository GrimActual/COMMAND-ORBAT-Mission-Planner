// Optional diagnostic addon only. No entity creation, transforms, mission saves or networking.
class COMMAND_TerrainWorldIdentity
{
    string addonId;
    string guid;
    string path;
};
class COMMAND_TerrainGroundSample
{
    float worldX;
    float worldZ;
    float surfaceY;
};
// One narrowly filtered resource lookup per explicit diagnostic query; never per tick.
class COMMAND_TerrainWorldResolver
{
    protected static string s_LoadedPath;
    protected static string s_RelativePath;
    protected static ResourceName s_Resource;
    protected static int s_Matches;
    static void Observe(ResourceName name, string exactPath)
    {
        string relative=name.GetPath(); relative.Replace("\\","/"); relative.ToLower();
        string actual=exactPath; actual.Replace("\\","/"); actual.ToLower();
        if (relative!=s_RelativePath || actual!=s_LoadedPath) return;
        s_Matches++;
        s_Resource=name;
    }
    static bool Verify(string loadedPath, COMMAND_TerrainWorldIdentity expected)
    {
        // A loose absolute path cannot establish addon ownership from a suffix.
        if (loadedPath.Length()<2 || loadedPath.Substring(0,1)!="$") return false;
        int colon=loadedPath.IndexOf(":");
        string addonName=GameProject.GetAddonID(expected.addonId);
        if (colon<2 || addonName.IsEmpty() || loadedPath.Substring(1,colon-1)!=addonName) return false;
        s_LoadedPath=loadedPath; s_LoadedPath.Replace("\\","/"); s_LoadedPath.ToLower();
        s_RelativePath=expected.path; s_RelativePath.ToLower();
        s_Resource=""; s_Matches=0;
        string registeredPath=loadedPath.Substring(colon+1,loadedPath.Length()-colon-1);
        int slash=registeredPath.LastIndexOf("/");
        string directory=""; string filename=registeredPath;
        if (slash>=0)
        {
            directory=registeredPath.Substring(0,slash);
            filename=registeredPath.Substring(slash+1,registeredPath.Length()-slash-1);
        }
        SearchResourcesFilter filter=new SearchResourcesFilter();
        filter.rootPath="$"+addonName+":"+directory;
        filter.fileExtensions={"ent"};
        filter.searchStr={filename};
        filter.recursive=false;
        if (!ResourceDatabase.SearchResources(filter,Observe) || s_Matches!=1 || s_Resource.Length()<19) return false;
        if (s_Resource.Substring(0,1)!="{" || s_Resource.Substring(17,1)!="}") return false;
        string observedGuid=s_Resource.Substring(1,16); observedGuid.ToUpper();
        string expectedGuid=expected.guid; expectedGuid.ToUpper();
        if (observedGuid!=expectedGuid) return false;
        PrintFormat("[COMMAND TERRAIN] Engine world identity matched: %1",s_Resource);
        return true;
    }
};
class COMMAND_TerrainSampler
{
    static bool HexId(string value)
    {
        if (value.Length()!=16) return false;
        string allowed="0123456789abcdefABCDEF";
        for (int i=0;i<16;i++) if (allowed.IndexOf(value.Substring(i,1))<0) return false;
        return value!="0000000000000000";
    }
    static void Run()
    {
        if (!Replication.IsServer()) return;
        JsonLoadContext input=new JsonLoadContext();
        if (!input.LoadFromFile("$profile:COMMAND-terrain-query.json")) return;
        bool enabled;
        int version;
        ref COMMAND_TerrainWorldIdentity identity;
        ref array<ref COMMAND_TerrainGroundSample> samples={};
        if (!input.ReadValue("enabled",enabled) || !enabled || !input.ReadValue("version",version) || version!=1 || !input.ReadValue("world",identity) || !identity || !input.ReadValue("samples",samples) || samples.Count()<1 || samples.Count()>300) { Print("[COMMAND TERRAIN] Invalid query"); return; }
        if (!HexId(identity.addonId) || !HexId(identity.guid) || identity.path.Length()<5 || identity.path.Length()>512 || identity.path.Contains("..") || identity.path.Contains(":") || identity.path.Contains("\\")) { Print("[COMMAND TERRAIN] Invalid identity"); return; }
        PrintFormat("[COMMAND TERRAIN] Raw world=%1 subscene=%2",GetGame().GetWorldFile(),GetGame().GetWorld().GetSubSceneName(0));
        string rawWorld=GetGame().GetWorldFile();
        rawWorld.Replace("\\","/");
        // Packed worlds are reported as $AddonID:relative/path, not an absolute file.
        // Check the loaded namespace against the expected loaded addon before stripping it.
        bool packedWorld=rawWorld.Length()>0 && rawWorld.Substring(0,1)=="$";
        if (packedWorld)
        {
            int colon=rawWorld.IndexOf(":");
            string addonName=GameProject.GetAddonID(identity.addonId);
            if (colon<2 || addonName.IsEmpty() || rawWorld.Substring(1,colon-1)!=addonName)
            {
                Print("[COMMAND TERRAIN] Loaded addon namespace mismatch");
                return;
            }
            rawWorld=rawWorld.Substring(colon+1,rawWorld.Length()-colon-1);
        }
        rawWorld.ToLower();
        string relative=identity.path; relative.ToLower();
        string suffix="/"+relative;
        bool pathMatches=rawWorld==relative;
        // Packed paths are already addon-relative: never accept a shortened suffix.
        if (!packedWorld && rawWorld.Length()>=suffix.Length())
            pathMatches=pathMatches || rawWorld.Substring(rawWorld.Length()-suffix.Length(),suffix.Length())==suffix;
        if (!pathMatches) { Print("[COMMAND TERRAIN] Loaded world path mismatch"); return; }

        int identityStarted=System.GetTickCount();
        if (!COMMAND_TerrainWorldResolver.Verify(GetGame().GetWorldFile(),identity))
        {
            Print("[COMMAND TERRAIN] World GUID identity rejected or unavailable");
            return;
        }
        PrintFormat("[COMMAND TERRAIN] Identity lookup elapsedMs=%1",System.GetTickCount()-identityStarted);
        string observed=rawWorld.Substring(rawWorld.Length()-identity.path.Length(),identity.path.Length());
        Print("[COMMAND TERRAIN] Loaded world identity matched; imported files remain unattested");
        foreach (COMMAND_TerrainGroundSample sample : samples)
        {
            if (!sample || !(sample.worldX>=0 && sample.worldX<=13450) || !(sample.worldZ>=0 && sample.worldZ<=13450)) { Print("[COMMAND TERRAIN] Coordinate rejected"); return; }
            sample.surfaceY=GetGame().GetWorld().GetSurfaceY(sample.worldX,sample.worldZ);
            if (!(sample.surfaceY>=-1000 && sample.surfaceY<=10000)) { Print("[COMMAND TERRAIN] Height rejected"); return; }
        }
        JsonSaveContext output=new JsonSaveContext();
        output.WriteValue("schema","command-terrain-observation");
        output.WriteValue("version",1);
        output.WriteValue("world",identity);
        output.WriteValue("observedWorldFile",observed);
        output.WriteValue("engineVersion",GetGame().GetBuildVersion());
        output.WriteValue("method","GetSurfaceY");
        output.WriteValue("samples",samples);
        bool saved=output.SaveToFile("$profile:COMMAND-terrain-observation.json");
        PrintFormat("[COMMAND TERRAIN] Export saved=%1 samples=%2",saved,samples.Count());
    }
};
// Runs after world initialization even when the diagnostic terrain has no game mode.
modded class ArmaReforgerScripted
{
    override void OnAfterInit(BaseWorld world)
    {
        super.OnAfterInit(world);
        GetGame().GetCallqueue().CallLater(COMMAND_TerrainSampler.Run,1000,false);
    }
};
