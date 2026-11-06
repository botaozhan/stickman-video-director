import fs from 'node:fs';
import path from 'node:path';

// Locate the same approved font files; never substitute a different family.
export function resolveStudioFonts(env=process.env){
  const windowsRoot=env.SystemRoot||env.WINDIR;
  const locate=(key,filename,label)=>{
    const configured=env[key]?.trim();
    if(configured&&!path.isAbsolute(configured))throw Error(`${key} must be an absolute path to the approved ${label} font`);
    const candidate=configured||(windowsRoot?path.join(windowsRoot,'Fonts',filename):null);
    if(!candidate||!fs.existsSync(candidate)||!fs.statSync(candidate).isFile()){
      throw Error(`Approved ${label} font not found. Set ${key} to your locally licensed ${filename} file; no font is downloaded or substituted.`);
    }
    return fs.realpathSync(candidate);
  };
  return {
    chinese:locate('BOTAO_CHINESE_FONT','msyhbd.ttc','Microsoft YaHei Bold'),
    english:locate('BOTAO_ENGLISH_FONT','arial.ttf','Arial')
  };
}
