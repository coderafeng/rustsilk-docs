#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量生成 Redis 数据类型结构图（GIF + PNG）。

用法：
    python build.py --list                     # 列出已注册类型
    python build.py --check <slug> [...]       # 只做校验 + 渲染总览 PNG（快，供迭代）
    python build.py <slug> [...]               # 生成指定类型
    python build.py all [--jobs 6]             # 生成全部类型（多进程）
    python build.py all --skip-existing

产物（每个类型一个目录）：
    <slug>/<slug>.gif              动画结构图（1200x720，约 30 秒循环）
    <slug>/<slug>_poster.png       物理布局海报（2400x1440）
    <slug>/<slug>_overview.png     6 个画面终态拼图
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

import argparse
import os
import shutil
import sys
import traceback
from concurrent.futures import ProcessPoolExecutor

import engine

HERE = _ROOT          # 项目根：脚本已移入子目录，见文件顶部的路径自举
def load_specs():
    sys.path.insert(0, HERE)
    from specs import SPECS
    return SPECS


def build_one(slug, check=False, skip_existing=False, lint=False):
    specs = load_specs()
    if slug not in specs:
        return slug, ["未注册的类型：%s" % slug], "skip"
    spec = specs[slug]
    outdir = os.path.join(HERE, slug)
    os.makedirs(outdir, exist_ok=True)
    gif = os.path.join(outdir, "%s.gif" % slug)
    if skip_existing and os.path.exists(gif):
        return slug, [], "exists, skipped"
    problems = engine.validate_spec(spec)
    if not problems and (lint or check):
        problems = engine.lint_spec(spec)
    lint_file = os.path.join(outdir, "_lint.txt")
    if problems:
        with open(lint_file, "w", encoding="utf-8") as fh:
            fh.write("\n".join(problems) + "\n")
    elif os.path.exists(lint_file):
        os.remove(lint_file)
    if check:
        sheet = os.path.join(outdir, "%s_overview.png" % slug)
        size = engine.render_sheet(spec, sheet)
        return slug, problems, "overview %sx%s" % size
    if lint and not check:
        return slug, problems, "lint clean" if not problems else "lint failed"
    if problems:
        return slug, problems, "aborted (spec problems)"
    frames = os.path.join(outdir, "_frames")
    try:
        n = engine.build_frames(spec, frames)
        engine.build_gif(frames, gif)
        engine.render_sheet(spec, os.path.join(outdir, "%s_overview.png" % slug))
        import make_steps                                    # 6 个步骤 PNG（含 _3_poster.png）
        make_steps.make_engine_steps(slug, spec, poster_step=3, force=True)
    finally:
        shutil.rmtree(frames, ignore_errors=True)
    return slug, problems, "%d frames, %.2f MB" % (n, os.path.getsize(gif) / 1048576)


def write_index():
    """生成 README.md：所有类型的产物清单（含 6 个步骤 PNG）。"""
    import make_steps
    specs = load_specs()
    l1 = ["# Redis 数据类型结构图（GIF + PNG + 样本数据草图）", "",
          "每个数据类型一个目录，统一风格：",
          "",
          "- **`<类型>.gif`** —— 1200×720 动画，6 个画面、约 30 秒循环",
          "- **`<类型>_1_cover.png` … `<类型>_6_summary.png`** —— 6 个动画步骤各一张静态图（2400×1440）",
          "  步骤顺序：`1_cover` 封面 → `2_model` 值模型 → `3_poster` 物理布局（**结构海报就是这一步**）",
          "  → `4_compare` 编码与阈值 → `5_ops` 机制与命令 → `6_summary` 小结；数字前缀保证与 `_poster.png` 排在一起",
          "- **`<类型>_overview.png`** —— 6 个画面终态拼图（1596×1452）",
          "- **`<类型>_sketch.png`** —— 基于 [`SAMPLE_DATA.md`](SAMPLE_DATA.md) 样本数据的**初学者草图**（白底树形图：key → value 明细 → 关联的其它 key → 底层结构，用连线串起来）",
          "",
          "> 样本数据：[`SAMPLE_DATA.md`](SAMPLE_DATA.md)（班级 / 学生 / 科目成绩场景，含 MD 表格与 mermaid ER 图）。",
          "> 例外：`string-v1/` 是**第一次**为 string 生成的版本（独立目录保存），其结构海报落在第 4 步。",
          "",
          "图内所有事实来自 Redis 官方文档与官方源码。", "",
          "| 数据类型 | 说明 | GIF | 6 个步骤 PNG | 样本数据草图 | 总览 PNG |",
          "|---|---|---|---|---|---|"]

    def link(path, label=None):
        if not os.path.exists(path):
            return "—"
        rel = os.path.relpath(path, HERE).replace("\\", "/")
        return "[`%s`](%s)" % (label or os.path.basename(path), rel)

    for slug in sorted(specs):
        outdir = os.path.join(HERE, slug)
        steps = " · ".join(link(os.path.join(outdir, fn), fn.replace(slug + "_", ""))
                           for fn in make_steps.step_files(slug, 3))
        l1.append("| `%s` | %s | %s | %s | %s | %s |" % (
            slug, specs[slug].get("zh", ""), link(os.path.join(outdir, "%s.gif" % slug)),
            steps, link(os.path.join(outdir, "%s_sketch.png" % slug)),
            link(os.path.join(outdir, "%s_overview.png" % slug))))
    if os.path.isdir(os.path.join(HERE, "string-v1")):
        v1 = os.path.join(HERE, "string-v1")
        steps = " · ".join(link(os.path.join(v1, fn), fn.replace("string-v1_", ""))
                           for fn in make_steps.step_files("string-v1", 4))
        l1.append("| `string-v1` | 第一版 string（独立保存） | %s | %s | %s | %s |" % (
            link(os.path.join(v1, "string-v1.gif")), steps,
            link(os.path.join(v1, "string-v1_sketch.png")),
            link(os.path.join(v1, "string-v1_overview.png"))))
    l1 += ["", "## 重新生成", "", "```bash",
           "python build.py all --jobs 6        # 重建全部（GIF + 6 步骤 PNG + 总览；需 ffmpeg）",
           "python build.py hash                # 单个类型",
           "python build_sketch.py all          # 重建全部样本数据草图",
           "python build_sketch.py --check hash # 草图布局自检 + 出图",
           "python make_steps.py                # 只补齐步骤 PNG（幂等）",
           "python build.py --index             # 重新生成本清单",
           "```", "",
           "工具：`engine.py`（动画渲染引擎）、`sketch_engine.py`（草图渲染引擎）、`build.py`（动画 CLI）、"
           "`build_sketch.py`（草图 CLI）、`specs/*.py`（动画内容）、`sketch_specs/*.py`（草图内容）、"
           "`make_steps.py`（步骤 PNG 导出）、`SCHEMA.md` / `SKETCH_SCHEMA.md`（规范）、"
           "`smoke.py`（引擎自检）、`factcheck.py`（事实核查）、`research/group_*.json`（官方事实底稿）。"]
    with open(os.path.join(HERE, "README.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(l1) + "\n")
    print("README.md 已更新，共 %d 个类型" % (len(specs) + 1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("types", nargs="*", help="类型 slug，或 all")
    ap.add_argument("--list", action="store_true", help="列出已注册类型")
    ap.add_argument("--check", action="store_true", help="只校验（含排版自检）并渲染总览 PNG")
    ap.add_argument("--lint", action="store_true", help="只做排版自检（不渲染总览）")
    ap.add_argument("--index", action="store_true", help="生成 README.md 产物清单")
    ap.add_argument("--steps", action="store_true", help="只补齐 6 个步骤 PNG")
    ap.add_argument("--jobs", type=int, default=4)
    ap.add_argument("--skip-existing", action="store_true")
    args = ap.parse_args()

    if args.index:
        write_index()
        return 0

    if args.steps:
        import make_steps
        tg = sorted(specs) if (not args.types or args.types == ["all"]) else args.types
        make_steps.main(targets=tg)
        return 0

    specs = load_specs()
    if args.list or not args.types:
        for slug in sorted(specs):
            print("%-18s %s" % (slug, specs[slug].get("zh", "")))
        return 0

    targets = sorted(specs) if args.types == ["all"] else args.types
    unknown = [t for t in targets if t not in specs]
    if unknown:
        print("未知类型：%s" % ", ".join(unknown), file=sys.stderr)
        return 2

    failed = 0
    use_pool = args.jobs > 1 and len(targets) > 1 and not args.lint
    if use_pool:
        try:
            with ProcessPoolExecutor(max_workers=args.jobs) as ex:
                futs = [ex.submit(build_one, t, args.check, args.skip_existing, args.lint)
                        for t in targets]
                for f in futs:
                    try:
                        slug, problems, note = f.result()
                    except Exception:  # noqa: BLE001
                        slug, problems, note = "?", [traceback.format_exc()], "crashed"
                    print("[%-18s] %s" % (slug, note))
                    for p in problems:
                        print("    ! %s" % p)
                    failed += 1 if problems else 0
            return 1 if failed else 0
        except (OSError, PermissionError) as exc:
            # 沙箱可能禁止命名管道（WinError 5），回退为顺序执行
            print("多进程不可用（%s），改为顺序执行。" % exc, file=sys.stderr)
    for t in targets:
        try:
            slug, problems, note = build_one(t, args.check, args.skip_existing, args.lint)
        except Exception:  # noqa: BLE001
            slug, problems, note = t, [traceback.format_exc()], "crashed"
        print("[%-18s] %s" % (slug, note))
        for p in problems:
            print("    ! %s" % p)
        failed += 1 if problems else 0
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
