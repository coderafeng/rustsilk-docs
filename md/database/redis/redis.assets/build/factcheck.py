#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""事实核查：spec 里出现的数字与英文标识符，必须能在对应的 research JSON（官方来源）
中找到出处。用于发现作者自行编造的阈值/参数/命令名。

用法：
    python factcheck.py [slug ...]        # 不传则检查全部已注册类型
退出码 1 表示存在可疑项。
"""

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

import glob
import json
import os
import re
import sys

HERE = _ROOT          # 项目根：脚本已移入子目录，见文件顶部的路径自举
# 允许出现在图中的通用词 / 排版用词（不算“事实断言”）
ALLOW = set("""
redis object encoding raw int embstr sds robj key value field fields element elements member members
score rank type len alloc flags bit bits byte bytes b kb mb gb mb kb ttl o n m k p log ln max min
docs latest develop data-types commands github com src lib deps tests index html www io
object encoding memory usage config conf default defaults since version versions client clients
listpack quicklist ziplist hashtable skiplist intset stream array json set hash zset string
and or the of for with from into on at by to in is are be not no yes null true false
info stats size capacity count total used free used_memory
""".split())

NUM = re.compile(r"(?<![\w.$])\d[\d_]*(?:\.\d+)?")
IDENT = re.compile(r"[A-Za-z_][A-Za-z0-9_]*(?:[.\-/][A-Za-z0-9_*]+)*")


def research_index():
    idx = {}
    for path in glob.glob(os.path.join(HERE, "research", "group_*.json")):
        try:
            data = json.load(open(path, encoding="utf-8"))
        except Exception:  # noqa: BLE001
            continue
        if isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, dict):
                    idx[k] = json.dumps(v, ensure_ascii=False)
    return idx


def strings(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from strings(v)
    elif isinstance(obj, (list, tuple)):
        for v in obj:
            yield from strings(v)


def check(slug, spec, text):
    low = text.lower()
    numbers, idents = set(), set()
    for s in strings(spec):
        for n in NUM.findall(s):
            numbers.add(n.rstrip("."))
        for i in IDENT.findall(s):
            idents.add(i)
    bad_nums = sorted(n for n in numbers
                      if n.lower() not in low and n.replace("_", "") not in low
                      and not any(part in low for part in (n,)))
    bad_idents = []
    for i in sorted(idents):
        if i.lower() in ALLOW or len(i) < 3:
            continue
        if i.lower() in low:
            continue
        if i.lower().replace("_", "") in low.replace("_", ""):
            continue
        bad_idents.append(i)
    return bad_nums, bad_idents


def main():
    sys.path.insert(0, HERE)
    import specs  # noqa: E402

    idx = research_index()
    targets = sys.argv[1:] or sorted(specs.SPECS)
    rc = 0
    for slug in targets:
        spec = specs.SPECS.get(slug)
        if spec is None:
            print("[%s] 未注册" % slug)
            continue
        key = slug if slug in idx else None
        if key is None:
            for cand in idx:
                if cand.replace("-", "") == slug.replace("-", ""):
                    key = cand
                    break
        if key is None:
            print("[%s] 无 research 底稿，跳过" % slug)
            continue
        bad_nums, bad_idents = check(slug, spec, idx[key])
        if bad_nums or bad_idents:
            rc = 1
            print("[%s] 可疑 %d 项" % (slug, len(bad_nums) + len(bad_idents)))
            if bad_nums:
                print("   未在官方底稿中找到的数字: %s" % ", ".join(bad_nums))
            if bad_idents:
                print("   未在官方底稿中找到的标识符: %s" % ", ".join(bad_idents))
        else:
            print("[%s] OK（数字与标识符均可追溯）" % slug)
    return rc


if __name__ == "__main__":
    sys.exit(main())
