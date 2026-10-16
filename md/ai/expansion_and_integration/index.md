# 概述

AI 系统的扩展机制层：Rules 负责行为约束、MCP 负责能力扩展、Skills 负责流程复用，外加插件/连接器与第三方平台集成。分工约定：Agent 编排原理在 Agent 与自动化章，本章只写集成协议与使用方式。

# 章节目录

## Rules与指令

- [Rules原理与作用域](./01.Rules与指令/001.Rules原理与作用域.md)
- [Cursor](./01.Rules与指令/005.Cursor.md)
- [Claude-Code](./01.Rules与指令/010.Claude-Code.md)
- [Codex](./01.Rules与指令/015.Codex.md)
- [Qoder](./01.Rules与指令/020.Qoder.md)
- [最佳实践](./01.Rules与指令/025.最佳实践.md)
- [编写与调试](./01.Rules与指令/030.编写与调试.md)
- [优先级与冲突](./01.Rules与指令/035.优先级与冲突.md)
- [与MCP-Skills-Agent关系](./01.Rules与指令/040.与MCP-Skills-Agent关系.md)
- [案例与踩坑](./01.Rules与指令/045.案例与踩坑.md)

## MCP

- [MCP总览](./02.MCP/001.MCP总览.md)
- [协议核心](./02.MCP/005.协议核心.md)
- [Spring-AI-MCP](./02.MCP/010.Spring-AI-MCP.md)
- [LangChain4j-MCP](./02.MCP/015.LangChain4j-MCP.md)
- [Java实现MCP-Server](./02.MCP/020.Java实现MCP-Server.md)
- [常用MCP-Server实战](./02.MCP/025.常用MCP-Server实战.md)
- [调试与安全](./02.MCP/030.调试与安全.md)

## Skills

- [Skills总览](./03.Skills/001.Skills总览.md)
- [Skills格式与触发](./03.Skills/005.Skills格式与触发.md)
- [自定义Skill](./03.Skills/010.自定义Skill.md)
- [Skills-Rules-MCP对比](./03.Skills/015.Skills-Rules-MCP对比.md)
- [生态与复用](./03.Skills/020.生态与复用.md)

## 插件与连接器

- [插件体系总览](./04.插件与连接器/001.插件体系总览.md)
- [编码Agent插件](./04.插件与连接器/005.编码Agent插件.md)
- [IDE与编辑器集成](./04.插件与连接器/010.IDE与编辑器集成.md)
- [连接器与外部系统](./04.插件与连接器/015.连接器与外部系统.md)

## 第三方集成

- [Dify](./05.第三方集成/001.Dify.md)
- [n8n](./05.第三方集成/005.n8n.md)
- [Coze与Bot平台](./05.第三方集成/010.Coze与Bot平台.md)
- [SaaS-API接入Agent](./05.第三方集成/015.SaaS-API接入Agent.md)

# 引用

- [Agent 与自动化](../agent_and_automation/index.md)
- [Function-Calling 与工具调用](../fundamentals_of_ai_applications/01.LLM基础与模型API/010.Function-Calling与工具调用.md)
- [Java AI 技术栈](../java_ai_technology_stack/index.md)
