/* Advisory close guard; never persists queue state or grants execution authority. */
'use strict';
const words={
 en:{title:'Unfinished deployment',message:'Close COMMAND with deployment work unfinished?',keep:'Keep COMMAND open',close:'Close COMMAND',unsent:'Unsent batches',queue:'These will not be sent after closing. Reopening does not automatically resume the queue.',uncertain:'Delivery is uncertain. Check the original request result before sending a replacement.',running:'A request is awaiting approval or running. Closing is not cancellation or an aircraft emergency stop.',connection:'Closing stops a Quick connection. Server-managed sessions may continue. Saved mission plans remain on disk.'},
 fr:{title:'Déploiement inachevé',message:'Fermer COMMAND avec un déploiement inachevé ?',keep:'Garder COMMAND ouvert',close:'Fermer COMMAND',unsent:'Lots non envoyés',queue:'Ils ne seront pas envoyés après fermeture. La réouverture ne reprend pas automatiquement la file.',uncertain:'Envoi incertain. Vérifiez le résultat de la demande initiale avant d’en envoyer une autre.',running:'Une demande attend une approbation ou est en cours. Fermer ne constitue ni une annulation ni un arrêt d’urgence d’un appareil.',connection:'Fermer arrête la connexion rapide. Les sessions gérées par le serveur peuvent continuer. Les plans sauvegardés restent sur disque.'},
 de:{title:'Unvollständige Aufstellung',message:'COMMAND mit unvollständiger Aufstellung schließen?',keep:'COMMAND geöffnet lassen',close:'COMMAND schließen',unsent:'Ungesendete Pakete',queue:'Diese werden nach dem Schließen nicht gesendet. Erneutes Öffnen setzt die Warteschlange nicht automatisch fort.',uncertain:'Übertragung ungewiss. Ergebnis der ursprünglichen Anfrage prüfen, bevor eine Ersatzanfrage gesendet wird.',running:'Eine Anfrage wartet auf Genehmigung oder läuft. Schließen ist weder Abbruch noch Notstopp eines Luftfahrzeugs.',connection:'Schließen beendet eine Schnellverbindung. Serververwaltete Sitzungen können weiterlaufen. Gespeicherte Missionspläne bleiben auf dem Datenträger.'}
};
function install({app,ipcMain,getWindow,indexURL,dialog}){
 let state={unsent:0,uncertain:false,running:false,language:'en'},bypass=false,showing=false,revision=0;
 const risky=()=>state.unsent>0||state.uncertain||state.running;
 function reset(){bypass=false;state={unsent:0,uncertain:false,running:false,language:'en'};revision++;}
 ipcMain.on('command-deployment-close-state',(event,raw)=>{
  const win=getWindow();if(!win||event.sender!==win.webContents||event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==indexURL)return;
  if(!raw||!Number.isSafeInteger(raw.unsent)||raw.unsent<0||raw.unsent>10000||typeof raw.uncertain!=='boolean'||typeof raw.running!=='boolean'||!Object.hasOwn(words,raw.language))return;
  const next={unsent:raw.unsent,uncertain:raw.uncertain,running:raw.running,language:raw.language};if(JSON.stringify(next)!==JSON.stringify(state)){state=next;revision++;bypass=false;}
 });
 function guard(event,kind){
  if(bypass||!risky())return;event.preventDefault();if(showing)return;const win=getWindow();if(!win||win.isDestroyed())return;
  const at=revision,w=words[state.language],detail=[state.unsent?w.unsent+': '+state.unsent+'. '+w.queue:'',state.uncertain?w.uncertain:'',state.running?w.running:'',w.connection].filter(Boolean).join('\n\n');showing=true;
  Promise.resolve().then(()=>dialog.showMessageBox(win,{type:'warning',title:w.title,message:w.message,detail,buttons:[w.keep,w.close],defaultId:0,cancelId:0,noLink:true})).then(({response})=>{
   if(response!==1||getWindow()!==win||win.isDestroyed()||at!==revision&&risky())return;bypass=true;if(kind==='quit')app.quit();else win.close();
  }).catch(()=>{}).finally(()=>{showing=false;});
 }
 app.on('before-quit',event=>guard(event,'quit'));
 return{attach(win){bypass=false;reset();win.on('close',event=>guard(event,'close'));},reset};
}
module.exports={install};
