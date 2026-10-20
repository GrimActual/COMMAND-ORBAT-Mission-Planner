[WorkbenchPluginAttribute(name: "COMMAND read-only vanilla index", wbModules: {"ResourceManager"}, resourceTypes: {"et"})]
class COMMAND_VanillaIndex : WorkbenchPlugin
{
 int m_Count;
 override void Run() { RunCommandline(); }
 override void RunCommandline()
 {
  SearchResourcesFilter filter = new SearchResourcesFilter();
  filter.rootPath = "$ArmaReforger:";
  filter.fileExtensions = {"et"};
  filter.searchStr = {};
  bool found = ResourceDatabase.SearchResources(filter, Observe);
  PrintFormat("[COMMAND VANILLA INDEX] COMPLETE=%1 COUNT=%2", found, m_Count);
  Workbench.Exit(0);
 }
 void Observe(ResourceName name, string file)
 {
  m_Count++;
  PrintFormat("[COMMAND VANILLA INDEX] RESOURCE=%1 FILE=%2", name, file);
 }
};
