# 本地辅助工具

从仓库根目录运行（用户通常只需给主题，由助手执行）：

```powershell
node .agents/skills/botao-stickman-content/scripts/studio.mjs init <新片目录名> <主题>
node .agents/skills/botao-stickman-content/scripts/studio.mjs captions <新片目录名>
```

init在字体就绪后安全创建缺失的`autopilot-work/`，再创建新片目录；工作目录为符号链接/重解析路径或项目已存在时停止，不覆盖或删除已有文件。复制角色、项目模板及实际默认配置，创建brief和checkpoint。共享project-template.json不保存机器绝对字体路径；init发现字体后仅将实际路径填入本地新片project.json。shots/captions为空，必须由助手按新主题创作；不把空模板称作可渲染视频。project.captionSize=58是原B1中间中文字幕层，最终双语标准来自78/50px ASS后期，不混为旧46/32px。

captions读取新片的`bilingual-captions.json`数组：`[{"start":0.35,"end":2.0,"text":"中文短句","en":"English phrase"}]`。时间已包含lead，须来自实际音轨/审听，工具不自动识别声音。使用现有@napi-rs/canvas及本机字体测990px上限，检测重叠/ASS控制符并拒绝覆盖已有输出；通过后写output/bilingual-v1.ass和.srt。长句由助手按自然语义调整，不自动均分时间或缩字。

原B1的validate/preview/approve/render和FFmpeg后期命令见[工作流](workflow-and-qa.md)。init/captions不运行收费服务、不渲染成片、不代替预览审批。

## 每个新片目录中的数据

- brief.json：主题、版本与制作范围。
- sources.json：事实表与查证日期（健康主题参照核查规则）。
- narration-approved.txt / narration-ttsmaker-input.txt / narration-ttsmaker-204.mp3：准确稿件、TTS拼读稿和真实音轨。
- project.json / bilingual-captions.json / shot-ledger.json：渲染数据、双语时间轴、动作事件与来源。
- character.mjs / assets/：本片角色副本与匹配道具。
- output/：原渲染结果、双语ASS/SRT、最终MP4与封面。
- publishing/metadata.md / checkpoint.json / delivery-qa.json：发布文案、阶段审批与检查结果。

工具只提供新建项目和稳定字幕变换，完整流程仍由Codex按Skill编排。TTS验证码、自然发音/同步与关键事实可能需要人工操作；未验证无人值守一键API。

## 字体与首次准备

固定字体族保持Microsoft YaHei（中文加粗）和Arial（英文普通），不静默使用替代字体。Windows自动从SystemRoot或WINDIR所指系统目录的Fonts寻找msyhbd.ttc与arial.ttf。其他位置可在当前PowerShell会话配置：

```powershell
$env:BOTAO_CHINESE_FONT='<本机已授权的msyhbd.ttc绝对路径>'
$env:BOTAO_ENGLISH_FONT='<本机已授权的arial.ttf绝对路径>'
```

这些值只放本机，不保存到共享Skill配置或Git。显式配置缺失或错误时立即给出对应变量提示，不退回另一字体。工具不会下载/安装字体。FFmpeg/libass实际渲染时也须能找到同一字体族；如文件不在系统字体目录，可用ass滤镜的fontsdir指向本机包含这两种已授权字体的目录，且检查编码帧。更换字体族需要另行确认，不属于本次路径配置。

全新克隆后需自行准备Node>=20、原Skill锁定依赖@napi-rs/canvas、FFmpeg/FFprobe和上述合法字体。npm依赖按原Skill锁文件安装，FFmpeg通过FFMPEG/FFPROBE指定本机位置或PATH；旧文档的项目内FFmpeg路径仅是原电脑部署例子。init本身不需要FFmpeg或Canvas，但要求已批准字体存在；captions需要Canvas。任何安装仍遵守当前用户授权，工具不会自动安装依赖或调用服务。

## 公开仓库与本地资源

- 必须随Git保存：本Skill的说明、规则、JSON配置/模板、agents元数据、scripts、MIT LICENSE及作为可复用源代码的assets/character.mjs。
- 仅供本机使用：autopilot-work内的完成视频、配音、参考截图、逐项目角色副本/PNG姿态、道具、缓存、报告及工具副本；不要提交成片、字体文件、私人素材或密钥。
- baseline.json仅是历史项目的相对路径和SHA256证据索引；GitHub不提供对应作品。缺少历史视频不会阻止新建项目。新主题的音轨/道具由新用户在许可和费用范围内制作。
- 模板与配置提供数值标准，不要求下载任何旧参考图片。既有MIT许可针对代码，不自动授权第三方字体、TTS输出或截图。
