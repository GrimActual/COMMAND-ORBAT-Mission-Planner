// Original COMMAND diagnostic extension. Requires the neutral car fixture owned as "car".
// Not part of the production addon. Invoke after empty/restricted fixture preparation.
modded class JSOC_ORBAT_HostGM
{
 void CheckEmbarkPreflight(string id)
 {
  JSOC_ORBAT_GMSpawnGroup batch;if(!m_Owned.Find("car",batch))return;
  IEntity car=batch.Entities[0];string reason;bool okay;
  if(id=="inspect_empty")
  {
   okay=COMMAND_ORBAT_EmbarkPreflight.Check(car,4,true,false,true,reason);
   PrintFormat("[COMMAND EMBARK TEST] all-seats=%1",okay&&reason=="");
   okay=COMMAND_ORBAT_EmbarkPreflight.Check(car,4,false,false,true,reason);
   PrintFormat("[COMMAND EMBARK TEST] cargo-limit=%1",!okay&&reason=="insufficient-allowed-seats");
   okay=COMMAND_ORBAT_EmbarkPreflight.Check(car,1,false,true,false,reason);
   PrintFormat("[COMMAND EMBARK TEST] absent-gunner=%1",!okay&&reason=="insufficient-allowed-seats");
   okay=COMMAND_ORBAT_EmbarkPreflight.Check(car,1,false,false,false,reason);
   PrintFormat("[COMMAND EMBARK TEST] no-roles=%1",!okay&&reason=="no-seat-roles");
   okay=COMMAND_ORBAT_EmbarkPreflight.Check(car,17,true,true,true,reason);
   PrintFormat("[COMMAND EMBARK TEST] squad-limit=%1",!okay&&reason=="unsupported-squad-size");
   okay=COMMAND_ORBAT_EmbarkPreflight.Check(null,1,true,true,true,reason);
   PrintFormat("[COMMAND EMBARK TEST] missing-vehicle=%1",!okay&&reason=="unsupported-vehicle");
  }
  if(id=="inspect_restricted")
  {
   okay=COMMAND_ORBAT_EmbarkPreflight.Check(car,1,false,false,true,reason);
   PrintFormat("[COMMAND EMBARK TEST] restricted-cargo=%1",!okay&&reason=="insufficient-allowed-seats");
   okay=COMMAND_ORBAT_EmbarkPreflight.Check(car,1,true,false,false,reason);
   PrintFormat("[COMMAND EMBARK TEST] remaining-driver=%1",okay&&reason=="");
  }
 }
};
