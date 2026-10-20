/* Integration aids remain manual examples; they do not extend native mapping evidence. */
'use strict';
function attach(output){const report=output.report;if(!report?.jobs?.length)return output;const jobs=report.jobs;for(const job of jobs)if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(job.className))throw Error('Invalid generated job class');
 const first=jobs[0].className;
 const lines=['# Explicit owned-job integration','', 'This package is generated source, not a completed component integration. Nothing starts automatically. Compile this project before integrating it into a scenario.','', 'For each job, retain one instance in its chosen owner/component. Call Begin(owner) explicitly, inspect GetStatus(), and read GetResult() only after completed. Call Cancel() on owner/component/session teardown and before replacing the retained instance. Owner deletion and bounded timeout are distinct terminal outcomes.','', '## Jobs',''];
 for(const job of jobs){lines.push('### '+job.className,'', '- Start: `Begin(owner)` with your explicitly chosen entity.', '- Mode: '+job.mode+'.',job.mode==='delay'?'- Requested minimum delay: '+job.delayMs+' ms.':'- Reviewed polling: '+job.policy.pollIntervalMs+' ms, at most '+job.policy.maxPollAttempts+' attempts.','- Completion: `GetStatus() == "completed"`; result type: `'+job.action.returnType+'`.','- Cancellation: `Cancel()`; do not consume the default result.','- Other terminal outcomes: `owner-deleted` and `timed-out`.','- Authority and engine component lifecycle: developer review required.','');}
 lines.push('## Scheduling differences','','Bounded polling is a reviewed policy change from unbounded SQF waitUntil. Frame timing and owner lifetimes do not establish source runtime equivalence. There is no auto-registration, auto-start or inferred network authority.','', 'The .c.example file is an ownership pattern outside Scripts/Game, not a compiled component. Choose the correct native component hooks yourself. The validation helper only launches the selected diagnostic executable when you run it manually. Exit status alone does not prove compilation or runtime behavior; inspect the isolated profile logs.');
 const example='// MANUAL OWNERSHIP PATTERN ONLY. Not compiled or registered by this package.\n// Integrate StartReviewedJob and StopReviewedJob into your explicit component lifecycle.\nclass COMMAND_JobOwnerExample\n{\n protected ref '+first+' m_Job;\n bool StartReviewedJob(IEntity owner)\n {\n  StopReviewedJob();\n  m_Job = new '+first+'();\n  return m_Job.Begin(owner);\n }\n void StopReviewedJob()\n {\n  if (m_Job) m_Job.Cancel();\n  m_Job = null;\n }\n // Check completed before reading GetResult; bind this cleanup to actual teardown.\n};\n';
 const script=`param([Parameter(Mandatory=$true)][string]$WorkbenchPath,[string]$AddonsDir)
$ErrorActionPreference='Stop'
$tool=Get-Item -LiteralPath $WorkbenchPath
if($tool.PSIsContainer -or $tool.Name -cne 'ArmaReforgerWorkbenchSteamDiag.exe'){throw 'Choose the Workbench diagnostic executable, not the game client.'}
$project=Join-Path $PSScriptRoot 'addon.gproj'
if(!(Test-Path -LiteralPath $project -PathType Leaf)){throw 'Generated addon.gproj is missing.'}
$profile=Join-Path ([IO.Path]::GetTempPath()) ('COMMAND-NativeReview-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $profile | Out-Null
$arguments=@('-gproj',$project,'-profile',$profile,'-wbsilent','-wbModule=ScriptEditor','-validate=PC')
if($AddonsDir){$addons=(Resolve-Path -LiteralPath $AddonsDir).Path;$arguments+=@('-addonsDir',$addons)}
Write-Output 'Open local Steam at the Library before running this helper. No game client is launched by this script.'
& $tool.FullName @arguments
$nativeExit=$LASTEXITCODE
Write-Output ('Diagnostic exit: '+$nativeExit+'; inspect logs under '+$profile)
Write-Output 'Exit status alone is not compilation or runtime proof. Preserve the logs and review them.'
exit $nativeExit
`;
 output.files.push({path:'INTEGRATION.md',text:lines.join('\n')+'\n'},{path:'Integration/COMMAND_JobOwner.c.example',text:example},{path:'Validate-GeneratedProject.ps1',text:script});return output;
}
module.exports={attach};
