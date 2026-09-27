#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""为每种数据类型补齐「6 个动画步骤」的 PNG（2× 分辨率，2400×1440）。

命名规则（数字前缀保证与 *_poster.png 排在一起、按步骤顺序排列）：
    <slug>_1_cover.png
    <slug>_2_model.png
    <slug>_3_poster.png     ← 结构海报就是第 3 步（物理布局），保留 poster 名称
    <slug>_4_compare.png
    <slug>_5_ops.png
    <slug>_6_summary.png

例外：第一版 string（redis_string_diagram.py 生成）的海报是第 4 步（三种编码），
放在 string-v1/ 目录：_1_cover / _2_model / _3_layout / _4_poster / _5_ops / _6_summary。

用法：
    python make_steps.py            # 全部类型（幂等，已存在的文件不重画）
    python make_steps.py --force    # 全部重画
    python make_steps.py hash list  # 指定类型
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

import importlib
import os
import shutil
import sys

import engine
import specs

HERE = _ROOT          # 项目根：脚本已移入子目录，见文件顶部的路径自举
STEPS = ["cover", "model", "layout", "compare", "ops", "summary"]

LEGACY_DIR = "string-v1"
LEGACY_FILES = {
    "redis_string_structure.gif": "string-v1.gif",
    "redis_string_structure_overview.png": "string-v1_overview.png",
}


def step_name(slug, i, poster_step):
    """i 从 1 开始；poster 所在步骤保留 poster 字样。"""
    return "%s_%d_poster.png" % (slug, i) if i == poster_step else \
           "%s_%d_%s.png" % (slug, i, STEPS[i - 1])


def step_files(slug, poster_step=3):
    """该类型 6 个步骤 PNG 的文件名，按步骤顺序。"""
    return [step_name(slug, i, poster_step) for i in range(1, len(STEPS) + 1)]


def make_engine_steps(slug, spec, poster_step=3, force=False):
    outdir = os.path.join(HERE, slug)
    os.makedirs(outdir, exist_ok=True)
    old_poster = os.path.join(outdir, "%s_poster.png" % slug)
    target_poster = os.path.join(outdir, step_name(slug, poster_step, poster_step))
    if os.path.exists(old_poster) and not os.path.exists(target_poster):
        os.replace(old_poster, target_poster)          # 保留原海报字节
    made = []
    for i in range(1, len(STEPS) + 1):
        path = os.path.join(outdir, step_name(slug, i, poster_step))
        if os.path.exists(path) and not force:
            continue
        engine.render_scene(spec, i - 1, 99, scale=2.0).save(path)
        made.append(os.path.basename(path))
    return made


def make_legacy_string(force=False):
    """第一次交付的 string 结果：移入独立目录 string-v1/ 并补齐 6 个步骤。"""
    dst = os.path.join(HERE, LEGACY_DIR)
    os.makedirs(dst, exist_ok=True)
    moved = []
    for src_name, dst_name in LEGACY_FILES.items():
        src = os.path.join(HERE, src_name)
        if os.path.exists(src):
            target = os.path.join(dst, dst_name)
            if os.path.exists(target):
                os.remove(target)
            os.replace(src, target)
            moved.append(dst_name)
    old_poster = os.path.join(HERE, "redis_string_structure_poster.png")
    if os.path.exists(old_poster):
        os.remove(old_poster)                          # 由下面重新渲染为清晰的 2× 版本

    legacy = importlib.import_module("redis_string_diagram")
    made = []
    poster_step = 4                                    # 第一版海报 = 第 4 步（三种编码）
    for i in range(1, len(STEPS) + 1):
        path = os.path.join(dst, step_name(LEGACY_DIR, i, poster_step))
        if os.path.exists(path) and not force:
            continue
        legacy.render_scene(i - 1, 99, scale=2.0).save(path)
        made.append(os.path.basename(path))
    return moved, made


def main(targets=None, force=False):
    if targets is None:
        targets = [a for a in sys.argv[1:] if not a.startswith("-")]
    force = force or ("--force" in sys.argv)
    targets = sorted(specs.SPECS) if (not targets or targets == ["all"]) else targets

    moved, made = make_legacy_string(force=force)
    print("[%s] 移动 %d 个文件%s, 补充步骤 PNG %d 张" %
          (LEGACY_DIR, len(moved), ("：" + ", ".join(moved)) if moved else "", len(made)))
    for m in made:
        print("    + %s" % m)

    for slug in targets:
        spec = specs.SPECS.get(slug)
        if spec is None:
            print("[%s] 未注册，跳过" % slug)
            continue
        made = make_engine_steps(slug, spec, poster_step=3, force=force)
        print("[%-18s] 步骤 PNG %d 张%s" % (slug, len(made),
                                          ("：" + ", ".join(made)) if made else "（已齐）"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
