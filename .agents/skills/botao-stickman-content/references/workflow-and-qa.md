# 工作流与已验证技术路径

## 任务推进

1. 读取当前主题、相关可靠来源和已存在项目状态。新建唯一项目目录，保留brief、来源、稿件、角色引用、配音、时间轴和checkpoint。不重复完整环境诊断；仅在相关依赖缺失/出错时检查。
2. 为约60秒撰写准确中文稿，安排有内容的镜头与简体字幕草稿。使用已定风格，不重复询问角色/颜色/声音。健康主题核实重要表述、单位和假设数据，不把案例写成真实产品。若出现必须用户决定的实质歧义再问。
3. 同一选定女声生成连续音轨；必要时交接验证码，生成后立刻下载，避免页面失效。确认新文件而非旧片音轨，完整解码、测时、保存SHA256。未经批准不更换提供方、不收费、不安装依赖。声音原速，按实际语音调整镜头和字幕。
4. 使用统一角色结构生成所需PNG姿态及道具。复用原B1运行时；先只准备开场10–15秒。双语字幕必须出现在要审批的预览中。
5. scoped validate/preview，检查编码帧、人物与道具、文字缺字、字幕边距和实际音画。向用户提供可播放预览，等待明确批准，不擅自调用approve。
6. 记录用户批准的具体样片与设置，再完成余下镜头。对新镜头继续同等质量检查，原速连续配音；调用原运行时approve/render。修改已审看部分或全局声音/画面设置，需要重新审看。
7. pad后应用双语ASS，导出最终MP4及SRT/ASS。完整解码、probe时长/分辨率，检查全片而非只开头。整片听看未完成时明确说明，不把技术pass当作用户验收。
8. 生成同风格竖版封面与发布文案。打包项目文件、角色、素材、声音、字幕、脚本、来源及状态。记录outputs与哈希，不把旧阶段说明当当前状态。

## 原项目工具与本机依赖

仓库根目录下：
- 运行时：`skills/directing-stickman-videos/scripts/autopilot.mjs`。
- Node 24.18.0 / npm11.16.0在本机已运行成功；原要求Node>=20。
- 原Skill package-lock.json锁定@napi-rs/canvas 0.1.100，现已安装。不可为普通制作重复npm ci或安装模型。
- FFmpeg/FFprobe：`autopilot-work/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/`。
- 中文字体为Microsoft YaHei Bold（msyhbd.ttc），英文为Arial（arial.ttf）。辅助工具从SystemRoot/WINDIR下的Fonts发现，或读取BOTAO_CHINESE_FONT/BOTAO_ENGLISH_FONT；详见[字体与首次准备](local-tools.md)。路径只写入被忽略的新片项目，不提交个人字体路径或字体文件。ASS字体族、字号和定位保持原标准。

PowerShell从仓库根设置本次进程路径（不改系统环境变量）：

```powershell
$env:FFMPEG=(Resolve-Path 'autopilot-work/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe').Path
$env:FFPROBE=(Resolve-Path 'autopilot-work/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffprobe.exe').Path
node skills/directing-stickman-videos/scripts/autopilot.mjs validate <新片project.json> --seconds 13.5
node skills/directing-stickman-videos/scripts/autopilot.mjs preview <新片project.json> --seconds 13.5
# 只有获批当前预览并授权后续制作后：
node skills/directing-stickman-videos/scripts/autopilot.mjs approve <新片project.json> --note '<实际用户批准记录>'
node skills/directing-stickman-videos/scripts/autopilot.mjs render <新片project.json>
```

预览长度按完整自然开场选择，13.5秒只是本片实测。覆写新片已有输出需明确使用--replace；避免覆盖基准。沙箱若阻止Node子进程调用FFmpeg，应使用正常工具审批/权限途径，不修改安全设置。

## 双语后期：保持原渲染器不变

原B1只能一套字幕字号，已验证的后期路径为：先pad，再遮住旧字幕带，最后用FFmpeg libass绘制中英文不同样式。不能拿字面换行假装实现大小不同。

pad滤镜：`pad=1080:1920:0:80:color=0xFAF8EE,setsar=1`。
基准双语滤镜：`drawbox=x=0:y=1640:w=iw:h=180:color=0xFAF8EE:t=fill,ass=output/<新片字幕>.ass`。
输出使用`-c:v libx264 -preset fast -crf 18 -c:a copy`；UTF-8字幕，使用新片工作目录与相对ASS路径，避免Windows冒号转义错误。

遮盖矩形只适用于上述1080×1920布局；新片不得在这个区域放人物脚、角标或重要图形。若要改变布局，先重新检查遮盖区，不能盲目沿用。避免重复压制，保存中文原版和最新双语版为不同文件。

SRT与ASS从同一字幕数据生成，cue数/起止/中英对应必须一致。未授权新的强制对齐模型；可用现有工具检查语音停顿并人工校正，不用平均分字冒充对齐。

## 现有案例可复用范围

`autopilot-work/pilot-02/build-preview.mjs`、`build-full.mjs`、`build-cover.mjs`、`build-bilingual.mjs`可作为实现参考，含硬编码鱼油稿件和相对路径，不能直接在新目录运行或声称是通用入口。build-preview会将project.json改回开场项目；不要对已完成项目误运行。使用独立新片项目数据，必要的适配只放在新片/本专属Skill，不改原运行时。

## 检查与停止条件

- 预览审批是每片必经；不存在来自基准的永久完整渲染批准。
- 在线TTS验证码、过期链接、额度或声音不可用时，保留状态，提供一个明确下一步，不静默换声或反复生成。
- 新费用、新服务、安装与重要风格变化先说明并获批。
- 假设值注明假设及单位；中英含义一致；平台文案不添加视频没有的健康承诺。
- 检查所有镜头与切点，主要画面有意义推进；字体缺字、长句溢出、遮罩覆盖内容时修复受影响部分。
- 交付MP4/封面/SRT/ASS/项目素材包/平台文案，明确实际检查范围。不得自动上传、发布或操作GitHub。

## 新克隆仓库的边界

`autopilot-work/`及历史成片、音轨、项目PNG、缓存、FFmpeg本地副本均不随Git提供。baseline.json内的路径和哈希只是可选历史证据，不是新片运行所必需的依赖；文件不存在时标为本地未提供，不复制或下载私人作品。新用户所需工具、字体与安装授权见[本地辅助工具](local-tools.md)。
