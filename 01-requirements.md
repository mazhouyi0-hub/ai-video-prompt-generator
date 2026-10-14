# 项目需求文档：AI Video Prompt Generator

## 一句话
给不会写镜头语言的 AI 视频创作者用的结构化提示词生成器：填几个选项，拼出一条可以直接粘贴到 Veo / Sora 等模型里的专业提示词。

## 目标关键词
- 主词：ai video prompt generator（首页）
- 子词 1：veo 3 prompt generator（子页，含 JSON 输出意图）
- 子词 2：sora 2 prompt generator（子页）

## 用户与场景
- 人群：用 Veo 3.1、Sora 2、Seedance、MiniMax 等模型做短视频的创作者，多为非影视专业。
- 痛点：只会写一句大白话描述，生成结果镜头乱、风格飘；影视术语（景别、运镜、光线）不会用英文表达。
- 场景：打开页面 → 选模型与模板 → 填主体/动作/场景 → 选镜头与风格 → 复制提示词 → 去生成视频。

## 功能范围（v1）
1. 模型选择：Generic / Veo 3 / Sora 2。切换模型改变时长、画幅选项与输出格式（Veo 额外给 JSON）。
2. 模板预设（6 个）：Cinematic Film、Product Ad、Social Short (9:16)、Documentary、3D Animation、Anime。点模板自动填充一组参数。
3. 结构化表单字段：
   - 核心想法（一句话，必填的引导位）
   - 主体、动作、场景/环境
   - 景别（extreme wide / wide / medium / close-up / extreme close-up / aerial / over-the-shoulder / POV）
   - 运镜（static / slow push-in / pull-back / tracking / pan / tilt / orbit / handheld / drone flyover）
   - 光线（golden hour / soft daylight / neon night / moonlight / studio softbox / overcast / candlelit）
   - 风格、情绪、音频类型（none / ambient / music / dialogue+SFX），对白输入（有对白时出现）
   - 时长、画幅（16:9 / 9:16 / 1:1）、负面提示词（预设 chips + 自定义）
4. 实时输出：随填随拼，英文提示词按「景别+主体+动作+场景+运镜+光线+风格+音频+技术参数」的专业顺序组装；显示词数；空字段自动跳过、不留残句。
5. 输出动作：一键复制文本、复制 JSON（Veo 页）、下载 .txt、随机示例（换个灵感）。
6. 内容区（SEO，全部原创文案）：使用步骤、提示词结构讲解、示例表、FAQ（含 FAQPage 结构化数据）。

## 非范围（v1 不做）
- 不接任何视频生成 API，不在站内生成视频。
- 不做账号、收藏云同步、付费墙。
- 不采集用户输入（纯本地运行，隐私声明写明）。

## 技术约束
- 纯静态 HTML/CSS/JS，无构建步骤，无框架，Vercel 直接托管根目录。
- 组装逻辑与页面解耦，核心函数可用 Node 跑单元测试。
- 页面语言 en；后续可加 /zh/。

## 验收标准
- 三个页面（首页 + 两个模型子页）均可打开、工具可用，子页默认选中对应模型。
- 测试用例覆盖：全字段拼装、空字段跳过、对白开关、JSON 结构合法、负面词合并。
- 每页有独立 title / description / canonical / OG / JSON-LD。
- sitemap.xml 与 robots.txt 就位。
