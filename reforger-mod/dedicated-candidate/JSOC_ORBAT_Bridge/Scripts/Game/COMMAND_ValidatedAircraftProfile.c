// Trusted local aircraft configuration only. Never deserialize this class from a request or plan.
// Protected fields have no mutators; the registry creates a fresh per-flight snapshot.
class COMMAND_ValidatedAircraftProfile
{
 protected string m_Resource;protected string m_ProfileId;protected string m_Evidence;
 protected int m_CargoCount=4;protected float m_OperatingRpm=300;protected float m_SpoolDeadline=25;
 protected vector m_AttitudeP="12 12 12";protected vector m_AttitudeD="8 8 8";protected float m_TorqueCap=30;
 protected float m_RiseSpeed=4;protected float m_VerticalP=1;protected float m_VelocityP=2;protected float m_RiseAcceleration=3;
 protected float m_OperatingTailRpm;protected float m_RotorStableSeconds;
 protected bool m_PrepareGround;protected bool m_SpoolHold;protected float m_CruiseClearance=40;
 protected bool m_DepartureLandingAttitude;protected float m_ClearanceRadius=8;
 float OperatingTailRpm() {return m_OperatingTailRpm;}float RotorStableSeconds() {return m_RotorStableSeconds;}
 bool PrepareGround() {return m_PrepareGround;}bool SpoolHold() {return m_SpoolHold;}float CruiseClearance() {return m_CruiseClearance;}
 string Resource() {return m_Resource;}string ProfileId() {return m_ProfileId;}string Evidence() {return m_Evidence;}
 int CargoCount() {return m_CargoCount;}float OperatingRpm() {return m_OperatingRpm;}float SpoolDeadline() {return m_SpoolDeadline;}
 vector AttitudeP() {return m_AttitudeP;}vector AttitudeD() {return m_AttitudeD;}float TorqueCap() {return m_TorqueCap;}
 float RiseSpeed() {return m_RiseSpeed;}float VerticalP() {return m_VerticalP;}float VelocityP() {return m_VelocityP;}float RiseAcceleration() {return m_RiseAcceleration;}
 bool DepartureLandingAttitude() {return m_DepartureLandingAttitude;}float ClearanceRadius() {return m_ClearanceRadius;}
 bool Matches(IEntity aircraft)
 {
  return aircraft && aircraft.GetPrefabData() && aircraft.GetPrefabData().GetPrefabName()==m_Resource && !m_Evidence.IsEmpty();
 }
 static bool Mi8Accepted() {return true;} // Experimental local profile; candidate publication requires native insertion and cancellation gates.
 static COMMAND_ValidatedAircraftProfile Resolve(IEntity aircraft)
 {
  if(!aircraft || !aircraft.GetPrefabData()) {return null;}
  string resource=aircraft.GetPrefabData().GetPrefabName();
  if(resource=="{98225ED6D5F724D7}Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_armed_gunship_empty.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-98225ed6d5f724d7";p.m_Evidence="native-short-flight-f2809a2977cd6ca1ef7a";p.m_OperatingRpm=194;p.m_OperatingTailRpm=1260;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=45;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;return p;
  }
  if(resource=="{3C6B3ED0C3AC30D5}Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_armed_gunship_HE.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-3c6b3ed0c3ac30d5";p.m_Evidence="native-short-flight-7b9b815885887002b3d9";p.m_OperatingRpm=194;p.m_OperatingTailRpm=1260;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=45;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;return p;
  }
  if(resource=="{DBEC63C9DEE4358C}Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_armed_gunship_HEDP.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-dbec63c9dee4358c";p.m_Evidence="native-short-flight-18642a93c7ee40d04033";p.m_OperatingRpm=194;p.m_OperatingTailRpm=1260;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=45;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;return p;
  }
  if(resource=="{7BD282AF716ED639}Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_armed.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-7bd282af716ed639";p.m_Evidence="native-short-flight-3f1e79866d5cc9ccddd2";p.m_OperatingRpm=194;p.m_OperatingTailRpm=1260;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=45;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;return p;
  }
  if(resource=="{AB9ED3A33EE1B630}Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_unarmed_civ_blue.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-ab9ed3a33ee1b630";p.m_Evidence="native-short-flight-ab12dac8eb23cf7f3b00";p.m_OperatingRpm=194;p.m_OperatingTailRpm=1260;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=45;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;p.m_CargoCount=0;return p;
  }
  if(resource=="{8175FCADFA2FB904}Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_unarmed_civ_red.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-8175fcadfa2fb904";p.m_Evidence="native-short-flight-9877d29fb586c7431fb2";p.m_OperatingRpm=194;p.m_OperatingTailRpm=1260;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=45;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;p.m_CargoCount=0;return p;
  }
  if(resource=="{DF5CCB7C0FF049F4}Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_unarmed_transport.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-df5ccb7c0ff049f4";p.m_Evidence="native-short-flight-f386fd3ab12dda64caeb";p.m_OperatingRpm=194;p.m_OperatingTailRpm=1260;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=45;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;return p;
  }
  if(resource=="{BDE43262FC05B4D7}Prefabs/Vehicles/Helicopters/UH1H/UH1H_armed_gunship_empty_sharkNose.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-bde43262fc05b4d7";p.m_Evidence="native-short-flight-bb2a6bd81bb84980f60d";return p;
  }
  if(resource=="{137DCF41459A89BE}Prefabs/Vehicles/Helicopters/UH1H/UH1H_armed_gunship_empty.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-137dcf41459a89be";p.m_Evidence="native-short-flight-04db78a4b0739a410119";return p;
  }
  if(resource=="{350492BE6F09A847}Prefabs/Vehicles/Helicopters/UH1H/UH1H_armed_gunship_HE_sharkNose.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-350492be6f09a847";p.m_Evidence="native-short-flight-c2ddd9fb815af446b535";return p;
  }
  if(resource=="{21E9A875C0A3C409}Prefabs/Vehicles/Helicopters/UH1H/UH1H_armed_gunship_HE.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-21e9a875c0a3c409";p.m_Evidence="native-short-flight-960231cbafd3840f9714";return p;
  }
  if(resource=="{3133602B406D131C}Prefabs/Vehicles/Helicopters/UH1H/UH1H_armed_gunship_HEDP_sharkNose.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-3133602b406d131c";p.m_Evidence="native-short-flight-7f9ea827dc08624865f3";return p;
  }
  if(resource=="{CB4D4CF7E887B2D0}Prefabs/Vehicles/Helicopters/UH1H/UH1H_armed_gunship_HEDP.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-cb4d4cf7e887b2d0";p.m_Evidence="native-short-flight-b8918494d9ef49f48545";return p;
  }
  if(resource=="{00BC1E407D536A34}Prefabs/Vehicles/Helicopters/UH1H/UH1H_armed_sharkNose.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-00bc1e407d536a34";p.m_Evidence="native-short-flight-0d976e9dc591e56ffd80";return p;
  }
  if(resource=="{DDDD9B51F1234DF3}Prefabs/Vehicles/Helicopters/UH1H/UH1H_armed.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-dddd9b51f1234df3";p.m_Evidence="native-short-flight-e5f90830ce149fcd3dc4";return p;
  }
  if(resource=="{7A29940A71EF5F5C}Prefabs/Vehicles/Helicopters/UH1H/UH1H_civ_livery_v1.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-7a29940a71ef5f5c";p.m_Evidence="native-short-flight-e8eb4960e864cc04eaac";p.m_CargoCount=0;return p;
  }
  if(resource=="{EEE291940A9DA42A}Prefabs/Vehicles/Helicopters/UH1H/UH1H_sharkNose.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-eee291940a9da42a";p.m_Evidence="native-short-flight-1e13b8ec2360cdbdc52a";return p;
  }
  if(resource=="{70BAEEFC2D3FEE64}Prefabs/Vehicles/Helicopters/UH1H/UH1H.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-70baeefc2d3fee64";p.m_Evidence="native-short-flight-4fe4fe9f115826fd1bba";return p;
  }
  if(resource=="{48F288F5BFF10D8B}Prefabs/Vehicles/Helicopters/AUS_MH60/AUS_UH60_armed.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-48f288f5bff10d8b";p.m_Evidence="native-short-flight-97da4e0944627328143e";p.m_OperatingRpm=255;p.m_OperatingTailRpm=1390;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=120;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;return p;
  }
  if(resource=="{847A4C8E73A7C186}Prefabs/Vehicles/Helicopters/AUS_MH60/AUS_UH60_Medical.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-847a4c8e73a7c186";p.m_Evidence="native-short-flight-134e409b3690eff5d2e5";p.m_OperatingRpm=255;p.m_OperatingTailRpm=1390;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=120;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;return p;
  }
  if(resource=="{1529FD2C6A8162A1}Prefabs/Vehicles/Helicopters/AUS_MH60/AUS_UH60_Pylon_Quad_Hydra.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-1529fd2c6a8162a1";p.m_Evidence="native-short-flight-4b5eef41b1471f36973f";p.m_OperatingRpm=255;p.m_OperatingTailRpm=1390;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=120;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;p.m_CargoCount=0;return p;
  }
  if(resource=="{47F2921E0DACA300}Prefabs/Vehicles/Helicopters/AUS_MH60/AUS_UH60_Supply.et")
  {
   COMMAND_ValidatedAircraftProfile p=new COMMAND_ValidatedAircraftProfile();p.m_Resource=resource;p.m_ProfileId="command-47f2921e0daca300";p.m_Evidence="native-short-flight-002089e48205eb9963e3";p.m_OperatingRpm=255;p.m_OperatingTailRpm=1390;p.m_RotorStableSeconds=2;p.m_SpoolDeadline=120;p.m_PrepareGround=true;p.m_SpoolHold=true;p.m_DepartureLandingAttitude=true;p.m_CruiseClearance=40;p.m_ClearanceRadius=12;p.m_CargoCount=0;return p;
  }
  return null;
 }
};
