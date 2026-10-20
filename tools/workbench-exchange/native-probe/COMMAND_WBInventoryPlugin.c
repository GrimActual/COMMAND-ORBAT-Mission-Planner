// Original read-only Workbench diagnostic. No scene edits, resource imports or game startup.
class COMMAND_WBInventoryRow
{
 string sourceId;string name;string sourceClass;int subscene;int layerId;string layerPath;string resourceName;string ancestorResource;string parentSourceId;bool nativeEntity;vector worldPosition;vector yawPitchRoll;vector rotationXYZ;float reconstructionError;bool sourceAnglesRead;vector sourceAngles;vector worldAxisX;vector worldAxisY;vector worldAxisZ;
};
class COMMAND_WBInventoryReport
{
 string schema="command-workbench-inventory-probe";int version=1;string status="unverified";string worldPath;bool scanComplete;bool editsPerformed;bool identityPersistenceVerified;bool editorClosedBeforeExit;ref array<string> errors={};ref array<ref COMMAND_WBInventoryRow> entities={};
};
[WorkbenchPluginAttribute(name:"COMMAND read-only scene inventory",wbModules:{"WorldEditor"})]
class COMMAND_WBInventoryPlugin : WorkbenchPlugin
{
 override void RunCommandline()
 {
  COMMAND_WBInventoryReport result=new COMMAND_WBInventoryReport();WorldEditor editor=Workbench.GetModule(WorldEditor);
  if(!editor){result.errors.Insert("WorldEditor module unavailable");Finish(result);return;}
  WorldEditorAPI api=editor.GetApi();if(!api){result.errors.Insert("WorldEditor API unavailable");Finish(result);return;}
  api.GetWorldPath(result.worldPath);
  if(result.worldPath.IsEmpty()||!api.GetWorld()){result.errors.Insert("No loaded world; no scan performed");Finish(result);return;}
  int count=api.GetEditorEntityCount();if(count<0||count>10000){result.errors.Insert("Scene inventory exceeds diagnostic limit");Finish(result);return;}
  ref array<string> seen={};
  for(int i=0;i<count;i++)
  {
   IEntitySource source=api.GetEditorEntity(i);if(!source){result.errors.Insert("Missing source in complete-scene enumeration");continue;}
   COMMAND_WBInventoryRow row=new COMMAND_WBInventoryRow();row.sourceId=source.GetID().ToString();row.name=source.GetName();row.sourceClass=source.GetClassName();row.subscene=source.GetSubScene();row.layerId=source.GetLayerID();row.layerPath=api.GetEntitySubsceneLayer(row.subscene,source);row.resourceName=source.GetResourceName();row.sourceAnglesRead=source.Get("angles",row.sourceAngles);
   string key=string.Format("%1:%2",row.subscene,row.sourceId);if(seen.Find(key)>=0)result.errors.Insert("Duplicate source ID within subscene");seen.Insert(key);
   BaseContainer ancestor=source.GetAncestor();if(ancestor)row.ancestorResource=ancestor.GetResourceName();
   IEntitySource parent=IEntitySource.Cast(source.GetParent());if(parent)row.parentSourceId=parent.GetID().ToString();
   IEntity entity=api.SourceToEntity(source);row.nativeEntity=entity!=null;if(entity){row.worldPosition=entity.GetOrigin();row.rotationXYZ=entity.GetAngles();row.yawPitchRoll=entity.GetYawPitchRoll();row.worldAxisX=entity.GetWorldTransformAxis(0);row.worldAxisY=entity.GetWorldTransformAxis(1);row.worldAxisZ=entity.GetWorldTransformAxis(2);vector rotation[3];Math3D.AnglesToMatrix(row.yawPitchRoll,rotation);row.reconstructionError=Math.Max(vector.Distance(rotation[0],row.worldAxisX),Math.Max(vector.Distance(rotation[1],row.worldAxisY),vector.Distance(rotation[2],row.worldAxisZ)));if(row.reconstructionError>0.0001)result.errors.Insert("Yaw/pitch/roll did not reconstruct native world matrix");}else result.errors.Insert("Source has no instantiated native entity");
   result.entities.Insert(row);source=null;ancestor=null;parent=null;entity=null;
  }
  if(api.GetEditorEntityCount()!=count)result.errors.Insert("Scene count changed during read-only scan");
  result.scanComplete=result.errors.IsEmpty();if(result.scanComplete)result.status="observed-read-only";api=null;editor=null;Finish(result);
 }
 void Finish(COMMAND_WBInventoryReport result)
 {
  string target="$profile:COMMANDWorkbenchInventory.json";
  if(FileIO.FileExists(target)){Print("[COMMAND WB INVENTORY] Existing report retained; use a fresh isolated profile",LogLevel.ERROR);Workbench.Exit(3);return;}
  result.editorClosedBeforeExit=Workbench.CloseModule(WorldEditor);
  JsonSaveContext save=new JsonSaveContext();bool written=save.WriteValue("report",result);bool saved=written&&save.SaveToFile(target);
  PrintFormat("[COMMAND WB INVENTORY] saved=%1 complete=%2 entities=%3 errors=%4 edits=0",saved,result.scanComplete,result.entities.Count(),result.errors.Count());
  int code=2;if(saved&&result.scanComplete)code=0;Workbench.Exit(code);
 }
};
