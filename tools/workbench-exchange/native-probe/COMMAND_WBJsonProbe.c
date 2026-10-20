class COMMAND_WBJsonCase
{
 string label;bool loadedString;bool readString;string stringValue;bool stringContextValid;bool loadedInt;bool readInt;int intValue;bool intContextValid;
};
class COMMAND_WBJsonProbe
{
 static ref array<ref COMMAND_WBJsonCase> Results={};
 static void Probe(string label,string document)
 {
  COMMAND_WBJsonCase item=new COMMAND_WBJsonCase();item.label=label;item.stringValue="unchanged";item.intValue=-123456;
  JsonLoadContext strings=new JsonLoadContext();item.loadedString=strings.LoadFromString(document);if(item.loadedString)item.readString=strings.ReadValue("unitId",item.stringValue);item.stringContextValid=strings.IsValid();
  JsonLoadContext integers=new JsonLoadContext();item.loadedInt=integers.LoadFromString(document);if(item.loadedInt)item.readInt=integers.ReadValue("unitId",item.intValue);item.intContextValid=integers.IsValid();
  Results.Insert(item);
 }
 static void Run()
 {
  Probe("numeric","{\"unitId\":1}");
  Probe("text-numeric","{\"unitId\":\"1\"}");
  Probe("text-id","{\"unitId\":\"unit-1\"}");
  Probe("missing","{}");
  Probe("null","{\"unitId\":null}");
  Probe("boolean","{\"unitId\":true}");
  Probe("fractional","{\"unitId\":1.25}");
  JsonSaveContext save=new JsonSaveContext();bool written=save.WriteValue("cases",Results);bool saved=written&&save.SaveToFile("$profile:WorkbenchJsonProbe.json");PrintFormat("[COMMAND JSON PROBE] saved=%1 cases=%2",saved,Results.Count());
 }
};
modded class SCR_BaseGameMode {override void OnGameStart(){super.OnGameStart();GetGame().GetCallqueue().CallLater(COMMAND_WBJsonProbe.Run,100,false);}};
