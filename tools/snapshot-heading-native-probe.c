// Original isolated regression probe. Never install in the production bridge or live mission.
modded class JSOC_ORBAT_HostGM
{
 void COMMAND_CaptureHeading(IEntity entity,COMMAND_ORBAT_SnapshotPose pose){SnapshotPose(entity,pose);}
 void COMMAND_RestoreHeading(IEntity entity,COMMAND_ORBAT_SnapshotPose pose){SnapshotApplyPose(entity,pose);}
};
class COMMAND_SnapshotHeadingCase
{
 vector requestedYawPitchRoll;float expectedHeading;float capturedHeading;vector restoredYawPitchRoll;float matrixError;bool fileWritten;bool fileRead;bool headingMatches;bool positionMatches;
};
class COMMAND_SnapshotHeadingProbe
{
 static void Run()
 {
  IEntity source=GetGame().GetWorld().FindEntityByName("COMMAND_HeadingSource"),target=GetGame().GetWorld().FindEntityByName("COMMAND_HeadingTarget");
  ref array<ref COMMAND_SnapshotHeadingCase> results={};bool allPassed=source&&target;
  if(allPassed)
  {
   JSOC_ORBAT_HostGM host=new JSOC_ORBAT_HostGM();array<vector> inputs={"0 0 0","90 0 0","180 0 0","270 0 0","135 20 -10"};
   for(int i=0;i<inputs.Count();i++)
   {
    COMMAND_SnapshotHeadingCase row=new COMMAND_SnapshotHeadingCase();row.requestedYawPitchRoll=inputs[i];row.expectedHeading=Math.Mod(inputs[i][0]+360,360);source.SetYawPitchRoll(inputs[i]);
    COMMAND_ORBAT_SnapshotPose pose=new COMMAND_ORBAT_SnapshotPose();host.COMMAND_CaptureHeading(source,pose);row.capturedHeading=pose.headingDegrees;
    string file=string.Format("$profile:SnapshotHeadingCase%1.json",i);JsonSaveContext save=new JsonSaveContext();row.fileWritten=!FileIO.FileExists(file)&&save.WriteValue("pose",pose)&&save.SaveToFile(file);
    COMMAND_ORBAT_SnapshotPose loaded=new COMMAND_ORBAT_SnapshotPose();JsonLoadContext read=new JsonLoadContext();row.fileRead=row.fileWritten&&read.LoadFromFile(file)&&read.ReadValue("pose",loaded);
    if(row.fileRead)
    {
     host.COMMAND_RestoreHeading(target,loaded);row.restoredYawPitchRoll=target.GetYawPitchRoll();vector expected[3];Math3D.AnglesToMatrix(Vector(row.expectedHeading,0,0),expected);
     row.matrixError=Math.Max(vector.Distance(expected[0],target.GetWorldTransformAxis(0)),Math.Max(vector.Distance(expected[1],target.GetWorldTransformAxis(1)),vector.Distance(expected[2],target.GetWorldTransformAxis(2))));
     float difference=Math.AbsFloat(row.capturedHeading-row.expectedHeading);row.headingMatches=Math.Min(difference,360-difference)<0.001&&row.matrixError<0.0001;row.positionMatches=vector.Distance(source.GetOrigin(),target.GetOrigin())<0.0001;
    }
    if(!row.fileRead||!row.headingMatches||!row.positionMatches)allPassed=false;results.Insert(row);
   }
  }
  JsonSaveContext report=new JsonSaveContext();report.WriteValue("scope","Native production snapshot pose helpers plus real profile JSON save/load; synthetic entities, no paired session or full restore workflow");report.WriteValue("allPassed",allPassed);report.WriteValue("cases",results);bool saved=!FileIO.FileExists("$profile:SnapshotHeadingProbe.json")&&report.SaveToFile("$profile:SnapshotHeadingProbe.json");PrintFormat("[COMMAND SNAPSHOT HEADING] passed=%1 saved=%2 cases=%3",allPassed,saved,results.Count());
 }
};
modded class SCR_BaseGameMode{override void OnGameStart(){super.OnGameStart();GetGame().GetCallqueue().CallLater(COMMAND_SnapshotHeadingProbe.Run,100,false);}};
