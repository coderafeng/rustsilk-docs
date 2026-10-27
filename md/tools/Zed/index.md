# 概述

Zed 是一款用 Rust 从零编写的高性能开源代码编辑器，主打「速度」「协作」与「AI 原生」。它充分利用多核 CPU 与 GPU 渲染，启动速度、输入延迟、界面响应都远快于传统基于 Electron 的编辑器，同时内置了实时协作、Agent 智能体、Edit Prediction（编辑预测）等现代能力。

本系列笔记面向**第一次接触 Zed 的中文用户**，目标是把「装好 → 会用 → 用顺」这条路走通。

## 为什么需要这份笔记

Zed 官方目前**没有本地化 / 国际化（i18n）计划**，整个编辑器界面、菜单、命令面板、设置项全部是英文，短期内不会提供中文语言包。这对中文用户带来了两道门槛：

1. **界面全英文**：菜单、命令、设置项都需要对照理解，找不到「熟悉的那句中文」。
2. **操作方式与常见编辑器完全不同**：Zed 默认快捷键自成一套，并深度借鉴了 Vim 的模态编辑理念。很多从 VS Code / IDEA 过来的用户第一次上手会发现——**复制文本居然不是 `Ctrl+C`**（在启用 Vim 模式后，复制是 `y`（yank）、粘贴是 `p`），保存、查找、多光标的按键也和习惯不一样，一时手足无措。

因此，这份笔记以官方文档为主要来源，结合源码仓库与社区分析，用**简体中文**系统梳理 Zed 的使用方法，并对 `gpui`、`mcp`、`ai`、`skills`、`agent`、`tree-sitter`、`lsp` 等专业名词**保留英文原文不翻译**，方便与官方文档、设置项、命令面板一一对应。

## 内容来源

- 官网文档：<https://zed.dev/docs/>
- 源代码仓库：<https://github.com/zed-industries/zed>
- 第三方源码分析（deepwiki）：<https://deepwiki.com/zed-industries/zed>

## 章节目录

| 章节 | 内容 | 状态 |
|------|------|------|
| [01.起步与安装](./01.起步与安装/001.起步概述.md) | 设计理念、安装更新、首次启动、从其它编辑器迁移 | ✅ 已完成 |
| [02.界面与核心操作](./02.界面与核心操作/001.界面与操作概述.md) | 界面布局、命令面板、窗口与项目、核心快捷键速查 | ✅ 已完成 |
| [03.配置与键位自定义](./03.配置与键位自定义/001.配置概述.md) | settings 配置体系、主题外观、Keybindings、Vim / Helix 模式 | ✅ 已完成 |
| [04.代码编辑与导航](./04.代码编辑与导航/001.编辑与导航概述.md) | 多光标、补全与编辑预测、诊断、查找导航、Multibuffers、Snippets | ✅ 已完成 |
| [05.运行调试与Git](./05.运行调试与Git/001.运行调试概述.md) | 集成终端、Tasks、Debugger、REPL、Git 集成 | ✅ 已完成 |
| [06.AI与Agent](./06.AI与Agent/001.AI概述.md) | Agent Panel、Zed Agent、MCP、Skills、Inline Assistant、LLM Providers | ✅ 已完成 |
| [07.扩展与语言支持](./07.扩展与语言支持/001.扩展概述.md) | 扩展安装管理、语言配置、扩展开发 | ✅ 已完成 |
| [08.协作远程与参考](./08.协作远程与参考/001.协作远程概述.md) | 实时协作、远程开发、Dev Containers、设置/动作参考、gpui 架构 | ✅ 已完成 |

> [!tip] 写作约定
> 各章入口统一为 `001.xxx概述.md`，文档内部以 `# 概述` 作为首节标题供跨文档锚点引用。截图统一存放于 `Zed.assets/` 目录并使用相对路径引用。快捷键默认给出 **Windows / Linux** 与 **macOS** 两套写法（本机以 Windows 为主）。

> [!note] 快捷键约定
> 本笔记中 `Ctrl` 对应 macOS 的 `Cmd`（⌘），`Alt` 对应 macOS 的 `Option`（⌥）。表格中若未特别说明，左列为 Windows / Linux，右列为 macOS。

# 引用

1. Zed 官方文档：<https://zed.dev/docs/>
2. Zed 源码仓库：<https://github.com/zed-industries/zed>
3. deepwiki 源码分析：<https://deepwiki.com/zed-industries/zed>
