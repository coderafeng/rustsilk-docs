# 概述

MongoDB 是一个开源的、面向文档的 NoSQL 数据库，由 MongoDB Inc. 维护。它不用传统的“表/行/列”模型，而是把数据存成类似 JSON 的 **BSON 文档**，因此非常适合数据结构灵活、迭代速度快、读写量大的应用。

# 核心数据模型

层级关系大致是：

- **Database 数据库**
- **Collection 集合**：类似关系型数据库的“表”，但不需要预定义结构
- **Document 文档**：类似“行”，但结构是 JSON 风格
- **Field 字段**：类似“列”
- **`_id`**：每个文档的唯一主键，默认是 ObjectId

示例文档：

```json
{
  "_id": ObjectId("..."),
  "name": "Alice",
  "age": 30,
  "tags": ["mongodb", "database"],
  "address": {
    "city": "Beijing",
    "country": "China"
  }
}
```

同一个集合里的文档可以有不同字段，这叫“灵活模式”或“模式可选”，但实际项目中通常会用应用层校验或 JSON Schema 约束。

# 主要特点

1. **文档模型**
   数据以文档为单位，天然接近对象结构，适合嵌套数组、子文档，减少多表关联。

2. **查询语言强大**
   支持条件查询、范围查询、正则、数组查询、嵌套字段查询等：
   ```js
   db.users.find({ age: { $gt: 20 }, tags: "mongodb" })
   ```

3. **二级索引**
   支持单字段、复合、唯一、稀疏、部分、TTL、文本、地理空间、哈希等索引。默认 `_id` 有索引。

4. **聚合管道**
   通过 `$match`、`$group`、`$sort`、`$project`、`$lookup`、`$unwind` 等阶段做复杂数据处理，类似 SQL 的 GROUP BY、JOIN、窗口分析等。

5. **高可用：副本集**
   副本集通常由 Primary、Secondary、Arbiter 组成。Primary 处理写入，Secondary 复制数据，故障时自动选举切换。支持写关注、读偏好。

6. **水平扩展：分片**
   当单机容量或吞吐不够时，可用分片集群，把数据按分片键分布到多个 Shard。典型组件包括 `mongos` 路由、Config Server 配置服务器和多个 Shard。

7. **事务**
   单文档操作天然原子。多文档 ACID 事务从 4.0 支持副本集，4.2 支持分片集群，但复杂事务不是 MongoDB 最擅长的场景。

8. **其他能力**
    - Change Streams：监听数据变更
    - TTL 索引：自动过期数据
    - GridFS：存储超过 16MB 的大文件
    - WiredTiger：默认存储引擎，支持文档级并发和压缩
    - Atlas：官方全托管云服务，提供 Atlas Search、Vector Search 等

# 和关系型数据库对比

| 关系型       | MongoDB                   |
|--------------|---------------------------|
| 表 Table     | 集合 Collection           |
| 行 Row       | 文档 Document             |
| 列 Column    | 字段 Field                |
| SQL          | MongoDB Query Language    |
| JOIN         | 内嵌文档、`$lookup`、引用 |
| 固定 Schema  | 灵活 Schema               |
| 垂直扩展为主 | 水平分片扩展              |

# 典型使用场景

- 内容管理、博客、评论
- 用户画像、个性化数据
- 产品目录、订单快照
- 物联网、传感器数据
- 日志、事件、实时分析
- 移动端/Web 后端 API
- 需要快速迭代、数据结构经常变化的项目

# 不太适合的场景

- 高度规范化的复杂多表关系
- 大量复杂 JOIN 和跨表事务
- 传统 BI 报表、强 SQL 分析
- 需要严格固定 Schema 和复杂约束的系统

# 简单示例

```js
// 插入
db.users.insertOne({
  name: "Alice",
  age: 30,
  tags: ["mongodb", "nosql"]
})

// 查询
db.users.find({ age: { $gt: 20 } })

// 更新
db.users.updateOne(
  { name: "Alice" },
  { $set: { age: 31 } }
)

// 聚合
db.users.aggregate([
  { $match: { age: { $gt: 20 } } },
  { $group: { _id: "$age", count: { $sum: 1 } } }
])
```

# 总结

MongoDB 的优势是：灵活文档模型、开发效率高、查询和聚合能力强、副本集高可用、分片易扩展、生态和多语言驱动完善。它适合现代应用、海量数据、快速迭代和半结构化数据场景。但如果是强关系、复杂事务、复杂 SQL 报表，关系型数据库通常更合适。

另外注意：MongoDB 服务器端目前使用 SSPL 许可证，驱动多为 Apache 2.0；商业使用前应确认许可证和托管方案。