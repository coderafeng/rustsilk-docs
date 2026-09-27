
# ---------------------------------------------------------------------------
# 路径自举：脚本位于子目录，需把「项目根」与「渲染引擎目录」加入 sys.path，
# 否则 import engine / sketch_engine / specs / sketch_specs 会失败。
# ---------------------------------------------------------------------------
import os as _os
import sys as _sys
_HERE = _os.path.dirname(_os.path.abspath(__file__))
_ROOT = _os.path.dirname(_HERE)
for _p in (_ROOT, _os.path.join(_ROOT, "render"), _HERE):
    if _p not in _sys.path:
        _sys.path.insert(0, _p)
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""引擎自检：覆盖 specs 作者会用到的主要排版形式（layers / items / flow / rules / 2-4 列）。"""

import os
import sys

import engine
from engine import (BLUE, CYAN, GREEN, GREEN_D, AMBER, AMBER_D, PURPLE, PURPLE_D,
                    TEAL, MUTED, DIM, TEXT, GRID)

HERE = _ROOT          # 项目根：脚本已移入子目录，见文件顶部的路径自举
BASE = {
    "slug": "_smoke",
    "zh": "自检",
    "header_title": "Redis Smoke 结构自检",
    "title": "Redis Smoke 结构自检",
    "subtitle": "layers / items / flow / rules / compare 全形式",
    "footer_note": "引擎自检用，不对外交付",
    "chips": [("layers", BLUE), ("items", CYAN), ("flow / rules", GREEN)],
    "cover_lines": [("mono line: OBJECT ENCODING  ·  smoke = 1", "m", DIM),
                    ("说明行：仅用于验证引擎排版能力", "r", DIM)],
    "model": {
        "heading": "① 值模型：自检",
        "sub": "覆盖 model 场景的多行 rows 与 box",
        "accent": BLUE,
        "left": {"title": "一次写入", "steps": [("A", "第一步", BLUE), ("B", "第二步", MUTED),
                                            ("C", "第三步", GREEN)],
                 "notes": ["第一行说明文字", "第二行说明文字"],
                 "box": {"title": "core_function()", "lines": ["第一行", "第二行"]}},
        "right": {"title": "struct smokeObject", "sub": "src/smoke.c", "badge": "16 字节",
                  "rows": [("field_a", "8 bit", "字段说明文字", GREEN),
                           ("field_b", "16 bit", "字段说明文字", AMBER),
                           ("field_c", "32 bit", "字段说明文字", PURPLE),
                           ("field_d", "指针", "字段说明文字", BLUE),
                           ("field_e", "计数", "字段说明文字", CYAN),
                           ("field_f", "标志", "字段说明文字", TEAL),
                           ("field_g", "长度", "字段说明文字", MUTED)],
                  "footer": "底部补充说明文字"},
    },
    "layout": {
        "heading": "② 物理布局：layers 形式",
        "sub": "分层结构：索引层 + 数据层 + 元数据",
        "blocks": {"title": "多层结构自检", "right": "右侧说明", "accent": BLUE,
                   "layers": [
                       {"label": "索引层", "lcolor": BLUE,
                        "items": [{"label": "rax", "w": 200, "color": BLUE},
                                  {"label": "key -> node", "w": 260, "color": BLUE}]},
                       {"label": "数据层", "lcolor": CYAN,
                        "items": [{"label": "listpack A", "w": 220, "color": CYAN},
                                  {"label": "listpack B", "w": 220, "color": CYAN},
                                  {"label": "listpack C", "w": 220, "color": CYAN}]},
                       {"label": "元数据", "lcolor": GREEN,
                        "items": [{"label": "last_id", "w": 180, "color": GREEN},
                                  {"label": "groups", "w": 180, "color": GREEN}]},
                   ]},
        "table": {"title": "编码与阈值", "right": "config.c",
                  "cols": [("类型", 20, "la"), ("阈值", 150, "la"), ("说明", 280, "la"),
                           ("默认值", 540, "ra")],
                  "col_style": [("mb", GREEN), ("m", TEXT), ("m", MUTED), ("m", AMBER)],
                  "rows": [["listpack", "元素数", "连续内存，缓存友好", "128"],
                           ["hashtable", "元素数", "哈希表，O(1) 查找", "—"],
                           ["skiplist", "元素数", "多层链表，范围查询", "—"]],
                  "note": "底部注释文字"},
        "list": {"title": "关键机制", "right": "smoke.c", "color": BLUE, "kcolor": CYAN,
                 "gap": 110,
                 "items": [("机制一", "说明文字，控制在 32 字以内"),
                           ("机制二", "说明文字，控制在 32 字以内"),
                           ("机制三", "说明文字，控制在 32 字以内"),
                           ("机制四", "说明文字，控制在 32 字以内")]},
        "footnote": "整幅底部补充说明（≤ 90 字）",
    },
    "compare": {
        "heading": "③ 两列对比形式",
        "sub": "2 列时列宽 550，可以写更长的文案",
        "columns": [
            {"name": "listpack", "badge": "≤ 128 元素", "color": GREEN, "dark": GREEN_D,
             "diagram": {"rows": [[{"t": "listpack", "w": 1.0, "color": GREEN, "hi": True,
                                    "sub": "header + entries"}]],
                         "caption": "caption 第一行", "caption2": "caption 第二行", "color": GREEN},
             "cond": "元素数 ≤ 128 且单值 ≤ 64 字节\n（hash-max-listpack-entries / -value）",
             "notes": ["第一条说明文字，长度可以到 60 字左右，超长会自动换行显示",
                       "第二条说明文字", "第三条说明文字"],
             "cmds": [("HSET h f v", TEXT), ("OBJECT ENCODING h", TEXT), ('"listpack"', GREEN)]},
            {"name": "hashtable", "badge": "> 128 元素", "color": PURPLE, "dark": PURPLE_D,
             "diagram": {"rows": [[{"t": "dict", "w": 1.0, "color": PURPLE, "hi": True,
                                    "sub": "dictEntry 链表"}],
                                  [{"t": "key sds", "w": 0.5, "color": BLUE},
                                   {"t": "value sds", "w": 0.5, "color": AMBER}]],
                         "arrows": [{"from": 0, "label": "哈希查找"}],
                         "caption": "两次分配，O(1) 查找", "color": PURPLE},
             "cond": "超过任一阈值后自动转换，且不可逆",
             "notes": ["第一条说明文字", "第二条说明文字", "第三条说明文字"],
             "cmds": [("HSET h f v", TEXT), ("OBJECT ENCODING h", TEXT), ('"hashtable"', PURPLE)]},
        ],
        "footnote": "两列对比的底部说明",
    },
    "ops": {
        "heading": "④ 机制与命令：flow + rules 两种形式",
        "sub": "left 用 flow 或 rules，right 是命令表，底部两个终端",
        "left": {"title": "编码转换规则", "right": "src/smoke.c", "kind": "rules",
                 "rules": [{"tag": "listpack → hashtable", "text": "超过阈值后自动转换，且不会回退",
                            "color": AMBER},
                           {"tag": "共享整数", "text": "0 – 9999 复用同一批对象，refcount 固定",
                            "color": GREEN},
                           {"tag": "raw 不回落", "text": "长度变短也不会回到嵌入式编码", "color": PURPLE}]},
        "right": {"title": "常用命令", "right": "OBJECT ENCODING 可验证",
                  "cols": [("命令", 20, "la"), ("复杂度", 170, "la"), ("说明", 280, "la")],
                  "col_style": [("mb", CYAN), ("m", MUTED), ("r", MUTED)],
                  "rows": [["HSET", "O(1)", "写入字段"],
                           ["HGET", "O(1)", "读取字段"],
                           ["HGETALL", "O(N)", "读取全部字段"],
                           ["HDEL", "O(1)", "删除字段"],
                           ["HLEN", "O(1)", "字段数量"],
                           ["HINCRBY", "O(1)", "整数自增"],
                           ["HSCAN", "O(1) 每次", "增量遍历"],
                           ["HRANDFIELD", "O(N)", "随机字段"]]},
        "terminals": [
            {"x": 40, "t0": 0.90, "title": "示例 A：flow / rules 形式",
             "lines": [("HSET h f v", "(integer) 1", MUTED),
                       ("OBJECT ENCODING h", '"listpack"', GREEN),
                       ("HSET h big <70 字节>", "(integer) 1", MUTED),
                       ("OBJECT ENCODING h", '"hashtable"', PURPLE)]},
            {"x": 600, "t0": 1.02, "title": "示例 B：终端排版",
             "lines": [("HLEN h", "(integer) 2", MUTED),
                       ("HGETALL h", "1) \"f\"", MUTED),
                       ("", "2) \"v\"", MUTED),
                       ("TYPE h", '"hash"', GREEN)]},
        ],
    },
    "summary": {
        "heading": "⑤ 小结：自检",
        "sub": "覆盖 cards / recap / sources 三种形式",
        "cards": [("128", "默认阈值\n（hash-max-listpack-entries）", GREEN),
                  ("O(1)", "字段读写\n哈希表查找", BLUE),
                  ("2^32-1", "单个 hash 的\n字段数量上限", AMBER),
                  ("listpack", "小对象省内存\n连续内存布局", PURPLE)],
        "recap": [("listpack", "≤ 128 字段｜连续内存", GREEN),
                  ("hashtable", "> 128 字段｜O(1) 查找", PURPLE),
                  ("共享整数", "0 – 9999｜refcount 固定", BLUE)],
        "sources": [("redis.io/docs/latest/develop/data-types/hashes/", "哈希类型总览", BLUE),
                    ("github.com/redis/redis → src/t_hash.c", "编码与阈值实现", GREEN),
                    ("redis.io/docs/latest/commands/?group=hash", "命令与复杂度", AMBER)],
        "closing": "引擎自检：确认 layers / items / flow / rules / compare 全部可渲染",
    },
}

FLOW_SPEC = dict(BASE)
FLOW_SPEC["ops"] = dict(BASE["ops"])
FLOW_SPEC["ops"]["left"] = {
    "title": "判定流程", "right": "t_smoke.c", "kind": "flow",
    "flow": {"start": "HSET key f v",
             "decisions": [{"q": "字段数 ≤ 128？", "label": "是",
                            "yes": {"t": "listpack", "sub": "连续内存", "color": GREEN,
                                    "dark": GREEN_D}},
                           {"q": "单值 ≤ 64 字节？", "label": "是",
                            "yes": {"t": "listpack", "sub": "同上", "color": AMBER,
                                    "dark": AMBER_D}}],
             "fallback": {"t": "hashtable", "sub": "dict 编码", "color": PURPLE,
                          "dark": PURPLE_D},
             "fallback_label": "否"},
}

VARIANTS = {"items": BASE, "flow": FLOW_SPEC}


def main():
    rc = 0
    for name, spec in VARIANTS.items():
        probs = engine.validate_spec(spec) + engine.lint_spec(spec)
        out = os.path.join(HERE, "_smoke", name)
        os.makedirs(out, exist_ok=True)
        engine.render_sheet(spec, os.path.join(out, "overview.png"), scale=0.5)
        print("[%s] %s" % (name, "OK" if not probs else "%d 个问题" % len(probs)))
        for p in probs:
            print("   !", p)
        rc |= 1 if probs else 0
    return rc


if __name__ == "__main__":
    sys.exit(main())
