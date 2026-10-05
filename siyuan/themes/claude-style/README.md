# Claude 风格

思源笔记主题，配色、字体和圆角取自 `.ai` 前端（Claude 桌面版仿制界面），同时支持明亮和暗黑模式。

![预览](preview.png)

## 特点

- 暖白配色：正文 `#F8F8F6`，侧栏 `#F7F7F4`，边框 `#E8E7E3`，强调色 `#D97757`
- 暗黑模式对应 `.ai` 的深色配色：`#1F1F1E` / `#1A1A19` / `#EDEAE1`
- 界面使用 Figtree，正文使用 Source Serif 4 衬线字体（随主题打包，仅含拉丁字符，中文使用系统字体）
- 侧栏与顶栏同色、正文是一张细边框卡片，列表、页签、菜单、对话框使用 8–16px 圆角
- 为「AI 对话笔记」插件提供配色变量：提问显示为右侧暖色气泡，回答为衬线正文

## 安装

在本仓库 `siyuan/` 目录执行 `node install.mjs <工作空间目录>`，或把本目录复制到 `<工作空间>/conf/appearance/themes/claude-style`，然后在 设置 - 外观 中把明亮和暗黑模式的主题都选为「Claude 风格」。

## 字体许可

`fonts/` 中的 Figtree 与 Source Serif 4 使用 SIL Open Font License 1.1，许可证见同目录的 `OFL-*.txt`。
