import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {resolveStudioFonts} from './fonts.mjs';

const skill=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(skill,'../../..');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const save=(file,data)=>fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
const [command,id,...rest]=process.argv.slice(2);
if(!['init','captions'].includes(command)||!id||!/^[a-z0-9][a-z0-9-]{2,79}$/.test(id))throw Error('Usage: studio.mjs init <unique-lowercase-id> <topic> | captions <id>');
const work=path.resolve(repo,'autopilot-work');
const target=path.resolve(work,id);
// Existing/reparse-point parents must not redirect writes outside the project root.
const checkWork=()=>{
  if(!fs.existsSync(work)||!fs.statSync(work).isDirectory()||fs.lstatSync(work).isSymbolicLink()||fs.realpathSync(work)!==work)throw Error('Expected a local autopilot-work directory, not a linked path');
};
if(fs.existsSync(work))checkWork();
else if(command!=='init')throw Error('autopilot-work is missing. Run studio.mjs init <new-id> <topic> first.');
if(path.dirname(target)!==work)throw Error('Project path escapes workspace');

if(command==='init'){
  const topic=rest.join(' ').trim();
  if(!topic)throw Error('Provide a topic');
  const defaults=read(path.join(skill,'assets/production-defaults.json'));
  const template=read(path.join(skill,'assets/project-template.json'));
  if(fs.existsSync(target))throw Error('Project already exists; refusing to overwrite');
  const fonts=resolveStudioFonts();
  template.font=fonts.chinese;
  template.captionFont=fonts.chinese;
  if(!fs.existsSync(work))fs.mkdirSync(work);
  checkWork();
  fs.mkdirSync(target);fs.mkdirSync(path.join(target,'assets'));fs.mkdirSync(path.join(target,'output'));fs.mkdirSync(path.join(target,'publishing'));
  fs.copyFileSync(path.join(skill,'assets/character.mjs'),path.join(target,'character.mjs'),fs.constants.COPYFILE_EXCL);
  save(path.join(target,'project.json'),template);
  save(path.join(target,'production-defaults.json'),defaults);
  save(path.join(target,'bilingual-captions.json'),[]);
  save(path.join(target,'sources.json'),[]);
  save(path.join(target,'brief.json'),{topic,skill:'botao-stickman-content',version:'1.0',targetSeconds:60});
  save(path.join(target,'checkpoint.json'),{stage:'initialized_not_renderable',previewApproved:false,fullProductionAuthorized:false,published:false,unverified:['facts','voice','timing','shot coverage','final review']});
  console.log(JSON.stringify({project:target,stage:'Template only; author facts, voice, shots and captions before preview'}));
}else{
  if(!fs.existsSync(target)||fs.lstatSync(target).isSymbolicLink()||fs.realpathSync(target)!==target)throw Error('Expected an existing local project');
  const output=path.join(target,'output');
  if(!fs.existsSync(output)||fs.lstatSync(output).isSymbolicLink()||fs.realpathSync(output)!==output)throw Error('Expected a local output directory');
  const assFile=path.join(output,'bilingual-v1.ass'),srtFile=path.join(output,'bilingual-v1.srt');
  if([assFile,srtFile].some(f=>fs.existsSync(f)))throw Error('Subtitle output exists; preserve it and use a new revision directory');
  const preset=read(path.join(skill,'assets/botao-bilingual-subtitle-preset-v1.0.json'));
  const cues=read(path.join(target,'bilingual-captions.json'));
  if(!Array.isArray(cues)||!cues.length)throw Error('Timed bilingual cues required');
  const req=createRequire(path.join(repo,'skills/directing-stickman-videos/package.json'));
  const {createCanvas,GlobalFonts}=req('@napi-rs/canvas');
  const fonts=resolveStudioFonts();
  for(const [file,name] of [[fonts.chinese,'StudioChinese'],[fonts.english,'StudioEnglish']])if(!GlobalFonts.registerFromPath(file,name))throw Error('Required font unavailable: '+file);
  const g=createCanvas(1080,1920).getContext('2d');let end=0;
  for(const [i,c] of cues.entries()){
    if(!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<end||c.start<0||c.end<=c.start)throw Error('Invalid/overlapping cue '+i);
    end=c.end;
    for(const [field,font,size,bold] of [['text','StudioChinese',preset.chinese.fontSize,true],['en','StudioEnglish',preset.english.fontSize,false]]){
      if(typeof c[field]!=='string'||!c[field].trim()||/[{}\\\r\n]/.test(c[field]))throw Error('Cue '+i+' needs plain single-line '+field);
      g.font=`${bold?'bold ':''}${size}px ${font}`;
      if(g.measureText(c[field]).width>preset.layout.maxWidthPx)throw Error(`Cue ${i} ${field} exceeds ${preset.layout.maxWidthPx}px; split at real semantic/speech boundaries`);
    }
  }
  const stamp=(t,ass)=>{const b=ass?100:1000;let n=Math.round(t*b),h=Math.floor(n/(3600*b));n%=3600*b;const m=Math.floor(n/(60*b));n%=60*b;return `${ass?h:String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(Math.floor(n/b)).padStart(2,'0')}${ass?'.':','}${String(n%b).padStart(ass?2:3,'0')}`;};
  const color=s=>'&H00'+s.slice(5,7)+s.slice(3,5)+s.slice(1,3);
  const style=(name,s)=>`Style: ${name},${s.font},${s.fontSize},${color(s.color)},${color(s.color)},&H00EEF8FA,&H00000000,${s.bold?-1:0},0,0,0,100,100,0,0,1,1,0,8,45,45,0,1`;
  const ass=['[Script Info]','ScriptType: v4.00+','PlayResX: 1080','PlayResY: 1920','WrapStyle: 2','ScaledBorderAndShadow: yes','','[V4+ Styles]','Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',style('Chinese',preset.chinese),style('English',preset.english),'','[Events]','Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'];
  for(const c of cues)for(const [name,s,text] of [['Chinese',preset.chinese,c.text],['English',preset.english,c.en]])ass.push(`Dialogue: 0,${stamp(c.start,true)},${stamp(c.end,true)},${name},,0,0,0,,{\\pos(${s.x},${s.y})}${text}`);
  fs.writeFileSync(assFile,ass.join('\n')+'\n',{flag:'wx'});
  fs.writeFileSync(srtFile,cues.map((c,i)=>`${i+1}\n${stamp(c.start,false)} --> ${stamp(c.end,false)}\n${c.text}\n${c.en}\n`).join('\n'),{flag:'wx'});
  console.log(JSON.stringify({cues:cues.length,ass:assFile,srt:srtFile,preset:preset.name,note:'Width checks passed; timing and encoded playback still require review'}));
}
