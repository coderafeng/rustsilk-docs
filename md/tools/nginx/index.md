# 概述

OpenResty 是**把 LuaJIT 与 `ngx_http_lua_module` 等一系列 Lua 扩展模块打包进 Nginx**的高性能动态 Web 平台。它不是一个新 Web 服务器，而是一个"让 Nginx 具备可编程能力"的发行版：你在同一个 worker 进程里用 Lua 直接读写请求/响应、访问上游、拿共享内存，而不用把流量甩到外部应用服务器再兜一圈。

主要特点：

- **动态可编程**：`rewrite_by_lua_block`、`access_by_lua_block`、`content_by_lua_block`、`balancer_by_lua_block` 等指令让 Lua 脚本嵌入 Nginx 的 11 个处理阶段，改配置 reload 即生效，无需重启。
- **非阻塞 IO**：cosocket（`ngx.socket.tcp`）、`ngx.timer`、`ngx.shared.DICT` 让 Lua 里的网络/定时/缓存全部跑在 Nginx 事件循环之上，一个 worker 顶得住上万并发。
- **LuaJIT 加持**：基于 LuaJIT 2.1（OpenResty 分支）而非标准 Lua 5.1，trace JIT 让热路径接近 C 速度。
- **成熟生态**：官方与社区的 `lua-resty-*` 库覆盖 HTTP 客户端、Redis、MySQL、Kafka、Prometheus、OpenTracing、限流熔断等常见场景。
- **生产验证**：堆栈、携程、腾讯云、Adobe 等一线厂商的大流量网关、鉴权、限流场景。

典型用途：

- API 网关（Kong、APISIX 底层）
- 认证鉴权、灰度分流、动态路由
- 动态限流限速、熔断降级
- 边缘渲染与响应改写
- 四层 TCP/UDP 代理（`stream_lua_module`）
- 微服务流量治理与可观测埋点

> [!note]
> OpenResty 的定位是"可编程的流量层"，不是"通用后端应用框架"。业务逻辑复杂到一定程度就该走传统后端；OpenResty 更适合承担那些**必须在流量层就近处理、且要毫秒级动态生效**的职责。

# 章节目录

| 章节 | 内容 | 状态 |
|------|------|------|
| [01.OpenResty起步](./01.OpenResty起步/001.起步概述.md) | 定位、三平台安装、配置骨架、Hello World、请求阶段、包管理 | ✅ 已完成（共 9 篇，含入口） |
| [02.Lua与OpenResty运行时内幕](./02.Lua与OpenResty运行时内幕/001.运行时内幕概述.md) | LuaJIT trace JIT、NYI、FFI、table、字符串、协程、共享内存、Lua 坑 | ✅ 已完成（共 10 篇，含入口） |
| [03.OpenResty核心API](./03.OpenResty核心API/001.核心API概述.md) | 请求响应动态处理、shared dict、cosocket、特权进程、常用 API、四层实战 | ✅ 已完成（共 12 篇，含入口） |
| [04.OpenResty测试](./04.OpenResty测试/001.测试概述.md) | Test::Nginx 语法、mock、性能压测与 wrk | ✅ 已完成（共 6 篇，含入口） |
| [05.OpenResty性能优化](./05.OpenResty性能优化/001.性能优化概述.md) | 阻塞、字符串、table、火焰图、systemtap、缓存与限流 | ✅ 已完成（共 17 篇，含入口） |
| [06.OpenResty网关实战](./06.OpenResty网关实战/001.网关概述.md) | 微服务 API 网关搭建三步曲 | ✅ 已完成（共 5 篇，含入口） |

> [!tip] 写作约定
> 各章入口统一为 `001.xxx概述.md`，文档内部首节固定为 `# 概述` 供跨文档锚点引用。版本口径统一 **OpenResty 1.31.8.1**（对应 nginx core 1.31.8），LuaJIT 采用 OpenResty 维护的 2.1 分支。

# 引用

1. OpenResty 官方站：<https://openresty.org/en/>
2. OpenResty 组件与下载：<https://openresty.org/en/components.html>
3. `ngx_http_lua_module` 文档：<https://github.com/openresty/lua-nginx-module>
4. LuaJIT 文档：<https://luajit.org/>
5. OpenResty 最佳实践：<https://github.com/moonbingbing/openresty-best-practices>
