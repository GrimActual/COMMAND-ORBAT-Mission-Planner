'use strict';
// Explicit, read-only terrain diagnostic. Never launched by Companion startup.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const {promisify} = require('node:util');
const execFile = promisify(cp.execFile);
const Receipt = require('./diagnostic-receipt.cjs');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function confirmWorldIdentity(log, world) {
  const expected=`{${world.guid}}${world.path}`.toLowerCase();
  const names=log.split('\n').map(line=>line.trimEnd().match(/\[COMMAND TERRAIN\] Engine world identity matched: (.+)$/)?.[1]).filter(Boolean);
  if (names.length!==1 || names[0].toLowerCase()!==expected) throw Error('Native world GUID was not confirmed for this query.');
  return names[0];
}

async function run(options) {
  const Terrain = require('../../planner/terrain-context');
  if (process.platform !== 'win32') throw Error('This diagnostic runner requires Windows.');
  for (const key of ['serverExe', 'addonsDir', 'queryFile', 'workDir']) {
    if (typeof options[key] !== 'string' || !path.isAbsolute(options[key])) throw Error(`${key} must be an absolute path.`);
  }
  const memoryLimitMiB = options.memoryLimitMiB ?? 1000;
  if (!Number.isInteger(memoryLimitMiB) || memoryLimitMiB < 500 || memoryLimitMiB > 2000) throw Error('Memory limit must be 500–2000 MiB.');
  if (path.basename(options.serverExe).toLowerCase() !== 'armareforgerserverdiag.exe') throw Error('Select ArmaReforgerServerDiag.exe; game clients and Workbench are not supported.');
  if (!fs.statSync(options.serverExe).isFile() || !fs.statSync(options.addonsDir).isDirectory()) throw Error('Diagnostic server or addons directory unavailable.');
  if (fs.statSync(options.queryFile).size > 256 * 1024) throw Error('Query exceeds 256 KiB.');
  const query = Terrain.query(JSON.parse(fs.readFileSync(options.queryFile, 'utf8')));
  fs.mkdirSync(options.workDir, {recursive:true});
  const attempt = fs.mkdtempSync(path.join(options.workDir, 'terrain-'));
  const candidate = path.join(attempt, 'candidate'), profile = path.join(attempt, 'profile');
  fs.mkdirSync(candidate);
  fs.mkdirSync(path.join(profile, 'profile'), {recursive:true});
  fs.copyFileSync(path.join(__dirname, 'addon.gproj'), path.join(candidate, 'addon.gproj'));
  fs.cpSync(path.join(__dirname, 'Scripts'), path.join(candidate, 'Scripts'), {recursive:true});
  fs.writeFileSync(path.join(profile, 'profile', 'COMMAND-terrain-query.json'), JSON.stringify(query));
  const result = {success:false, gameClientLaunched:false, tunnel:false, memoryLimitMiB, timeoutSeconds:90, peakWorkingSetMiB:0, querySha256:Receipt.querySha256(query), nativeSourceSha256:Receipt.sourceSha256(candidate), worldGuidVerified:false, liveSessionAttested:false};
  let child, log = '', nextMemoryCheck = 0;
  try {
    child = cp.spawn(options.serverExe, ['-gproj', path.join(candidate, 'addon.gproj'), '-addonsDir', options.addonsDir,
      '-profile', profile, '-server', `{${query.world.guid}}${query.world.path}`, '-port', '29991',
      '-maxFPS', '10', '-noSound', '-noSplash', '-noThrow'], {cwd:path.dirname(options.serverExe), windowsHide:true, stdio:'ignore'});
    let spawnError;
    child.on('error', error => {spawnError = error;});
    const deadline = Date.now() + 90000;
    let finished = false;
    while (Date.now() < deadline && child.exitCode === null && child.signalCode === null) {
      if (spawnError) throw spawnError;
      const logs = path.join(profile, 'logs');
      if (fs.existsSync(logs)) {
        const latest = fs.readdirSync(logs).sort().at(-1);
        const scriptLog = path.join(logs, latest || '', 'script.log');
        if (fs.existsSync(scriptLog)) log = fs.readFileSync(scriptLog, 'utf8');
      }
      if (/SCRIPT\s*\(E\)/.test(log)) throw Error('Native script error; inspect the isolated profile logs.');
      if (/\[COMMAND TERRAIN\].*(Export saved|mismatch|rejected|Invalid)/.test(log)) {finished = true; break;}
      if (Date.now() >= nextMemoryCheck) {
        const stat = await execFile('powershell.exe', ['-NoProfile', '-Command',
          `$p=Get-Process -Id ${child.pid} -ErrorAction SilentlyContinue; if($p){[math]::Round($p.WorkingSet64/1MB,2)}`],
          {windowsHide:true, timeout:5000});
        const memory = Number(stat.stdout.trim());
        if (!Number.isFinite(memory)) throw Error('Memory monitor returned invalid data.');
        result.peakWorkingSetMiB = Math.max(result.peakWorkingSetMiB, memory);
        if (memory > memoryLimitMiB) throw Error('Stopped at the sampled working-memory limit.');
        nextMemoryCheck = Date.now() + 2000;
      }
      await wait(250);
    }
    if (spawnError) throw spawnError;
    if (!finished) throw Error('World did not complete the sampler within the time bound.');
    const engineWorldResource=confirmWorldIdentity(log,query.world);
    const report = Terrain.observation(JSON.parse(fs.readFileSync(path.join(profile, 'profile', 'COMMAND-terrain-observation.json'), 'utf8')));
    if (JSON.stringify(Terrain.world(report.world)) !== JSON.stringify(Terrain.world(query.world))) throw Error('Report identity differs from query.');
    if (report.samples.length !== query.samples.length || report.samples.some((sample, i) =>
      Math.abs(sample.worldX-query.samples[i].worldX)>0.01 || Math.abs(sample.worldZ-query.samples[i].worldZ)>0.01)) throw Error('Report positions differ from query.');
    fs.writeFileSync(path.join(attempt, 'COMMAND-terrain-observation.json'), JSON.stringify(report, null, 2));
    result.success = true;
    result.reportValidatedByDesktop = true;
    result.worldGuidVerified = true;
    result.engineWorldResource = engineWorldResource;
    result.worldIdentityMethod = "ResourceDatabase.SearchResources with exact loaded addon/path";
    result.observationSha256 = Receipt.fileSha256(path.join(attempt, "COMMAND-terrain-observation.json"));
    result.liveSessionAttested = false;
    result.sampleCount = report.samples.length;
    result.engineVersion = report.engineVersion;
  } catch (error) {
    result.error = error.message;
  } finally {
    if (child && child.pid && child.exitCode === null && child.signalCode === null) {
      child.kill();
      await Promise.race([new Promise(resolve => child.once('exit', resolve)), wait(3000)]);
    }
    result.serverStopped = !child || !child.pid || child.exitCode !== null || child.signalCode !== null;
    result.lines = log.split('\n').filter(line => line.includes('[COMMAND TERRAIN]'));
    fs.writeFileSync(path.join(attempt, 'result.json'), JSON.stringify(result, null, 2));
  }
  return {attempt, ...result};
}

if (require.main === module) {
  const [serverExe, addonsDir, queryFile, workDir, memory] = process.argv.slice(2);
  run({serverExe, addonsDir, queryFile, workDir, memoryLimitMiB:memory === undefined ? undefined : Number(memory)})
    .then(result => {console.log(JSON.stringify(result, null, 2)); if (!result.success || !result.serverStopped) process.exitCode = 1;})
    .catch(error => {console.error(error.message); process.exitCode = 1;});
}
module.exports = {run,confirmWorldIdentity};
