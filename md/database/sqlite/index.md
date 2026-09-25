# 概述

SQLite 是一个轻量级、嵌入式、开源的关系型数据库引擎。它不是像 MySQL、PostgreSQL 那样需要独立运行的数据库服务器，而是一个可以直接嵌入到程序中的 C 语言库。程序通过函数调用直接读写一个数据库文件。

# 核心特点

- **无服务器**：不需要单独的数据库进程，也没有客户端/服务器网络协议。
- **零配置**：不用安装、启动、配置账号密码，直接打开文件即可使用。
- **单文件存储**：整个数据库，包括表、索引、触发器、视图等，通常都保存在一个 `.db` 或 `.sqlite` 文件中。
- **ACID 事务**：支持原子性、一致性、隔离性、持久性。
- **跨平台**：数据库文件可在不同操作系统、不同字节序的机器之间复制使用。
- **公共领域**：SQLite 源码属于 public domain，可自由使用。
- **支持标准 SQL**：大部分 SQL-92 语法，支持事务、索引、视图、触发器、外键、窗口函数、CTE、JSON、全文搜索 FTS5、R-Tree 等。
- **动态类型**：列有“类型亲和性”，但值可以存储为 NULL、INTEGER、REAL、TEXT、BLOB 等存储类。
- **体积小**：核心库可以裁剪到几百 KB，非常适合嵌入式环境。

# 工作原理简析

SQLite 的核心大致是：

1. SQL 编译器把 SQL 语句编译成字节码。
2. 虚拟机 VDBE 执行字节码。
3. B-tree 模块负责表和索引的磁盘存储。
4. 页缓存和文件锁负责并发与事务。
5. 通过 journal 或 WAL 日志保证事务和崩溃恢复。

默认情况下，多个读可以并发，但写是串行的。开启 WAL 模式后，读写可以更好地并发，但仍然只允许一个写者。

# 常见使用场景

SQLite 非常适合：

- Android、iOS、macOS、Windows 等平台的应用本地存储
- 桌面软件、嵌入式设备、IoT 设备
- 浏览器、App 的缓存、配置、书签、历史记录
- 测试环境和原型开发
- 小型网站、读多写少的服务
- 数据分析、ETL 中间文件
- 把 `.sqlite` 文件当作应用自定义文件格式

它也被广泛内置在 Android、iOS、macOS、Windows、Firefox、Chrome 等系统中。

# 不适合的场景

SQLite 不适合替代 MySQL / PostgreSQL 处理以下任务：

- 高并发写入，例如大量用户同时下单
- 多用户客户端/服务器架构
- 需要细粒度用户权限、审计、存储过程
- 高可用、主从复制、分布式集群
- 大量网络客户端直接访问同一数据库文件
- 放在 NFS 等网络文件系统上并发访问，因为文件锁可能不可靠

# 基本用法示例

命令行：

```bash
sqlite3 test.db
```

```sql
CREATE TABLE user (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO user (name) VALUES ('Alice');

SELECT * FROM user;
```

Python：

```python
import sqlite3

conn = sqlite3.connect("test.db")
cur = conn.cursor()

cur.execute("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, name TEXT)")
cur.execute("INSERT INTO user (name) VALUES (?)", ("Alice",))
conn.commit()

cur.execute("SELECT * FROM user")
print(cur.fetchall())

conn.close()
```

# 选型建议

一句话总结：**SQLite 是“数据库界的瑞士军刀”**。它极其可靠、简单、轻量，适合本地、嵌入式、单机、读多写少的场景；但如果你的系统需要高并发写入、网络多客户端、权限管理、集群和高可用，就应该选择 MySQL、PostgreSQL 等客户端/服务器型数据库。
