// Bounded metadata query. Separate from Capture; no prefab loads or world edits.
class COMMAND_AircraftQueryRow {string resourceName;string file;};
class COMMAND_AircraftQuery
{
 ref array<ref COMMAND_AircraftQueryRow> rows={};bool truncated;
 void Observe(ResourceName resourceName,string file)
 {
  string lower=file;lower.ToLower();
  if(!lower.Contains("mi8mt") && !lower.Contains("h60") && !lower.Contains("uh60"))return;
  if(rows.Count()>=512){truncated=true;return;}
  COMMAND_AircraftQueryRow row=new COMMAND_AircraftQueryRow();row.resourceName=resourceName;row.file=file;rows.Insert(row);
 }
 void Run()
 {
  SearchResourcesFilter filter=new SearchResourcesFilter();filter.rootPath="$SikorskyMH60DAPProject:";filter.fileExtensions={"et"};filter.searchStr={};
  bool complete=ResourceDatabase.SearchResources(filter,Observe);
  JsonSaveContext save=new JsonSaveContext();save.WriteValue("complete",complete);save.WriteValue("truncated",truncated);save.WriteValue("rows",rows);save.SaveToFile("$profile:COMMAND-AircraftQuery.json");
 }
};
