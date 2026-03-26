#!/usr/bin/env python3
"""
complexity_analyzer.py — Brooks-Lint 代码质量分析工具

基于《人月神话》七大原则，对代码进行量化评估。

用法：
    python complexity_analyzer.py --mode=file   --path=src/foo.py
    python complexity_analyzer.py --mode=project --path=./src
    python complexity_analyzer.py --mode=debt    --path=./src

输出：JSON 格式的质量报告
"""

import ast
import argparse
import json
import os
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any


# ─────────────────────────────────────────────
# 数据结构
# ─────────────────────────────────────────────

@dataclass
class FunctionMetrics:
    name: str
    line: int
    cyclomatic_complexity: int
    line_count: int
    param_count: int
    nesting_depth: int
    has_docstring: bool


@dataclass
class FileMetrics:
    path: str
    language: str
    line_count: int
    function_metrics: list[FunctionMetrics] = field(default_factory=list)
    class_count: int = 0
    import_count: int = 0
    todo_count: int = 0
    fixme_count: int = 0
    hack_count: int = 0
    magic_numbers: list[int | float] = field(default_factory=list)
    naming_issues: list[str] = field(default_factory=list)
    avg_cyclomatic_complexity: float = 0.0
    max_cyclomatic_complexity: int = 0
    max_function_lines: int = 0
    max_nesting_depth: int = 0


@dataclass
class BrooksScores:
    """七个 Brooks 原则的量化得分（1-5 分，5 分最佳）"""
    conceptual_integrity: float = 0.0      # 概念完整性
    brooks_law_coupling: float = 0.0       # Brooks 定律 — 耦合度
    second_system_effect: float = 0.0      # 第二系统效应
    no_silver_bullet: float = 0.0          # 没有银弹 — 复杂度管理
    surgical_team: float = 0.0             # 外科手术团队 — 模块自治
    plan_to_throw: float = 0.0             # 做好扔掉的准备
    tar_pit: float = 0.0                   # 焦油坑 — 腐化程度
    overall: float = 0.0


@dataclass
class DebtItem:
    category: str
    severity: str   # "high" | "medium" | "low"
    location: str
    description: str
    suggestion: str


# ─────────────────────────────────────────────
# Python AST 分析器
# ─────────────────────────────────────────────

class PythonAnalyzer(ast.NodeVisitor):
    """使用 AST 深度分析 Python 文件"""

    # 增加圈复杂度的 AST 节点类型
    COMPLEXITY_NODES = (
        ast.If, ast.While, ast.For, ast.ExceptHandler,
        ast.With, ast.Assert, ast.comprehension,
        ast.BoolOp,
    )

    def __init__(self):
        self.functions: list[FunctionMetrics] = []
        self.class_count = 0
        self.import_count = 0
        self.magic_numbers: list[int | float] = []
        self.naming_issues: list[str] = []
        self._current_depth = 0
        self._func_stack: list[dict] = []

    def visit_ClassDef(self, node: ast.ClassDef):
        self.class_count += 1
        self.generic_visit(node)

    def visit_Import(self, node: ast.Import):
        self.import_count += len(node.names)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        self.import_count += len(node.names)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        self._analyze_function(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self._analyze_function(node)

    def _analyze_function(self, node):
        complexity = 1 + sum(
            1 for child in ast.walk(node)
            if isinstance(child, self.COMPLEXITY_NODES)
        )
        line_count = (node.end_lineno or node.lineno) - node.lineno + 1
        param_count = len(node.args.args) + len(node.args.posonlyargs) + len(node.args.kwonlyargs)
        nesting_depth = self._max_nesting(node)
        has_docstring = (
            isinstance(node.body[0], ast.Expr)
            and isinstance(node.body[0].value, ast.Constant)
            and isinstance(node.body[0].value.value, str)
        ) if node.body else False

        # 检查命名规范（函数名应为 snake_case）
        if not re.match(r'^[a-z_][a-z0-9_]*$', node.name) and not node.name.startswith('_'):
            self.naming_issues.append(f"函数名 '{node.name}' 不符合 snake_case 规范（行 {node.lineno}）")

        self.functions.append(FunctionMetrics(
            name=node.name,
            line=node.lineno,
            cyclomatic_complexity=complexity,
            line_count=line_count,
            param_count=param_count,
            nesting_depth=nesting_depth,
            has_docstring=has_docstring,
        ))
        self.generic_visit(node)

    def _max_nesting(self, root) -> int:
        """计算节点内最大嵌套深度"""
        NESTING_NODES = (ast.If, ast.For, ast.While, ast.With, ast.Try)
        max_depth = [0]

        def walk(node, depth):
            if isinstance(node, NESTING_NODES):
                depth += 1
                max_depth[0] = max(max_depth[0], depth)
            for child in ast.iter_child_nodes(node):
                walk(child, depth)

        walk(root, 0)
        return max_depth[0]

    def visit_Constant(self, node: ast.Constant):
        if isinstance(node.value, (int, float)):
            if node.value not in (0, 1, -1, 2, True, False):
                self.magic_numbers.append(node.value)
        self.generic_visit(node)

    def visit_Name(self, node: ast.Name):
        # 检测单字母变量名（循环变量 i/j/k 除外）
        if len(node.id) == 1 and node.id not in ('i', 'j', 'k', 'x', 'y', 'z', 'n', '_'):
            self.naming_issues.append(f"单字母变量 '{node.id}' 可能影响可读性")
        self.generic_visit(node)


# ─────────────────────────────────────────────
# 通用正则分析器（非 Python 文件）
# ─────────────────────────────────────────────

class RegexAnalyzer:
    FUNCTION_PATTERNS = {
        'javascript': r'\b(?:function\s+\w+|\w+\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))',
        'typescript': r'\b(?:function\s+\w+|\w+\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))',
        'java':       r'\b(?:public|private|protected|static)\s+\w+\s+\w+\s*\([^)]*\)\s*\{',
        'go':         r'\bfunc\s+\w+\s*\(',
        'rust':       r'\bfn\s+\w+\s*\(',
        'ruby':       r'\bdef\s+\w+',
        'php':        r'\bfunction\s+\w+\s*\(',
        'default':    r'\b(?:function|def|func)\s+\w+\s*\(',
    }

    COMPLEXITY_KEYWORDS = ['if ', 'else ', 'elif ', 'for ', 'while ', 'switch ', 'case ', 'catch ', '&&', '||', '?? ']

    def analyze(self, content: str, language: str) -> dict[str, Any]:
        lines = content.splitlines()
        pattern = self.FUNCTION_PATTERNS.get(language, self.FUNCTION_PATTERNS['default'])
        function_count = len(re.findall(pattern, content, re.MULTILINE))

        # 估算圈复杂度（关键字计数法）
        total_complexity = 1
        for line in lines:
            for kw in self.COMPLEXITY_KEYWORDS:
                total_complexity += line.count(kw)

        avg_complexity = round(total_complexity / max(function_count, 1), 1)

        # 嵌套深度估算（连续缩进）
        max_depth = 0
        for line in lines:
            stripped = line.lstrip()
            if stripped:
                indent = len(line) - len(stripped)
                depth = indent // 4 if '    ' in line else indent // 2
                max_depth = max(max_depth, depth)

        return {
            'function_count': function_count,
            'estimated_avg_complexity': avg_complexity,
            'estimated_max_nesting': max_depth,
        }


# ─────────────────────────────────────────────
# 核心分析逻辑
# ─────────────────────────────────────────────

LANGUAGE_MAP = {
    '.py': 'python', '.js': 'javascript', '.ts': 'typescript',
    '.jsx': 'javascript', '.tsx': 'typescript', '.java': 'java',
    '.go': 'go', '.rs': 'rust', '.rb': 'ruby', '.php': 'php',
    '.cs': 'csharp', '.cpp': 'cpp', '.c': 'c', '.swift': 'swift',
    '.kt': 'kotlin',
}

SKIP_DIRS = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build', '.tox'}


def analyze_file(path: str) -> FileMetrics:
    p = Path(path)
    ext = p.suffix.lower()
    language = LANGUAGE_MAP.get(ext, 'unknown')

    try:
        content = p.read_text(encoding='utf-8', errors='replace')
    except OSError as e:
        return FileMetrics(path=path, language='error', line_count=0)

    lines = content.splitlines()
    line_count = len(lines)

    metrics = FileMetrics(path=path, language=language, line_count=line_count)

    # 注释标记统计（所有语言通用）
    for line in lines:
        upper = line.upper()
        if 'TODO' in upper:
            metrics.todo_count += 1
        if 'FIXME' in upper:
            metrics.fixme_count += 1
        if 'HACK' in upper or 'XXX' in upper:
            metrics.hack_count += 1

    if language == 'python':
        try:
            tree = ast.parse(content)
            analyzer = PythonAnalyzer()
            analyzer.visit(tree)
            metrics.function_metrics = analyzer.functions
            metrics.class_count = analyzer.class_count
            metrics.import_count = analyzer.import_count
            metrics.magic_numbers = list(set(analyzer.magic_numbers))
            metrics.naming_issues = list(set(analyzer.naming_issues))
        except SyntaxError:
            pass
    else:
        regex_analyzer = RegexAnalyzer()
        extra = regex_analyzer.analyze(content, language)
        metrics.class_count = extra.get('function_count', 0)  # 用函数数近似

    # 聚合函数指标
    if metrics.function_metrics:
        complexities = [f.cyclomatic_complexity for f in metrics.function_metrics]
        metrics.avg_cyclomatic_complexity = round(sum(complexities) / len(complexities), 2)
        metrics.max_cyclomatic_complexity = max(complexities)
        metrics.max_function_lines = max(f.line_count for f in metrics.function_metrics)
        metrics.max_nesting_depth = max(f.nesting_depth for f in metrics.function_metrics)

    return metrics


def analyze_project(root: str) -> dict[str, Any]:
    root_path = Path(root)
    all_metrics: list[FileMetrics] = []

    for dirpath, dirnames, filenames in os.walk(root_path):
        # 跳过无关目录
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            ext = Path(fname).suffix.lower()
            if ext in LANGUAGE_MAP:
                fpath = os.path.join(dirpath, fname)
                all_metrics.append(analyze_file(fpath))

    if not all_metrics:
        return {'error': '未找到可分析的源文件', 'path': root}

    brooks_scores = _calculate_brooks_scores(all_metrics)
    summary = _build_project_summary(all_metrics, brooks_scores)
    return summary


def analyze_debt(root: str) -> dict[str, Any]:
    root_path = Path(root)
    all_metrics: list[FileMetrics] = []

    for dirpath, dirnames, filenames in os.walk(root_path):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            ext = Path(fname).suffix.lower()
            if ext in LANGUAGE_MAP:
                fpath = os.path.join(dirpath, fname)
                all_metrics.append(analyze_file(fpath))

    debt_items: list[DebtItem] = []

    for fm in all_metrics:
        rel_path = fm.path

        # 高复杂度函数
        for func in fm.function_metrics:
            if func.cyclomatic_complexity >= 10:
                debt_items.append(DebtItem(
                    category='complexity',
                    severity='high',
                    location=f'{rel_path}:{func.line} ({func.name})',
                    description=f'圈复杂度 {func.cyclomatic_complexity}，远超推荐值 10',
                    suggestion='拆分函数，提取独立的逻辑单元',
                ))
            elif func.cyclomatic_complexity >= 6:
                debt_items.append(DebtItem(
                    category='complexity',
                    severity='medium',
                    location=f'{rel_path}:{func.line} ({func.name})',
                    description=f'圈复杂度 {func.cyclomatic_complexity}，需要关注',
                    suggestion='考虑提取辅助函数',
                ))

        # 超长函数
        for func in fm.function_metrics:
            if func.line_count > 80:
                debt_items.append(DebtItem(
                    category='maintainability',
                    severity='high',
                    location=f'{rel_path}:{func.line} ({func.name})',
                    description=f'函数长度 {func.line_count} 行',
                    suggestion='按单一职责原则拆分函数',
                ))

        # 参数过多
        for func in fm.function_metrics:
            if func.param_count > 5:
                debt_items.append(DebtItem(
                    category='design',
                    severity='medium',
                    location=f'{rel_path}:{func.line} ({func.name})',
                    description=f'参数数量 {func.param_count}，超过推荐值 5',
                    suggestion='引入参数对象（Parameter Object）模式',
                ))

        # TODO/FIXME 堆积
        total_markers = fm.todo_count + fm.fixme_count + fm.hack_count
        if total_markers > 5:
            debt_items.append(DebtItem(
                category='todo_debt',
                severity='medium' if total_markers <= 15 else 'high',
                location=rel_path,
                description=f'包含 {fm.todo_count} TODO + {fm.fixme_count} FIXME + {fm.hack_count} HACK/XXX',
                suggestion='清理过期标记，未解决的转为 issue tracker',
            ))

        # 魔法数字
        if len(fm.magic_numbers) > 5:
            debt_items.append(DebtItem(
                category='readability',
                severity='low',
                location=rel_path,
                description=f'包含 {len(fm.magic_numbers)} 个魔法数字',
                suggestion='提取为命名常量',
            ))

    # 按严重程度排序
    severity_order = {'high': 0, 'medium': 1, 'low': 2}
    debt_items.sort(key=lambda d: severity_order[d.severity])

    counts = defaultdict(int)
    for item in debt_items:
        counts[item.severity] += 1

    return {
        'mode': 'debt',
        'root': root,
        'total_debt_items': len(debt_items),
        'by_severity': dict(counts),
        'by_category': dict(
            (cat, sum(1 for d in debt_items if d.category == cat))
            for cat in set(d.category for d in debt_items)
        ),
        'items': [asdict(d) for d in debt_items],
    }


# ─────────────────────────────────────────────
# Brooks 评分计算
# ─────────────────────────────────────────────

def _calculate_brooks_scores(metrics_list: list[FileMetrics]) -> BrooksScores:
    scores = BrooksScores()

    if not metrics_list:
        return scores

    all_funcs = [f for m in metrics_list for f in m.function_metrics]

    # 1. 概念完整性：命名问题数量
    total_naming_issues = sum(len(m.naming_issues) for m in metrics_list)
    scores.conceptual_integrity = max(1.0, 5.0 - total_naming_issues * 0.1)

    # 2. Brooks 定律（耦合度）：import 密度
    avg_imports = sum(m.import_count for m in metrics_list) / len(metrics_list)
    scores.brooks_law_coupling = max(1.0, 5.0 - (avg_imports - 5) * 0.2) if avg_imports > 5 else 5.0

    # 3. 第二系统效应：平均函数复杂度
    if all_funcs:
        avg_cc = sum(f.cyclomatic_complexity for f in all_funcs) / len(all_funcs)
        scores.second_system_effect = max(1.0, 5.0 - (avg_cc - 2) * 0.5) if avg_cc > 2 else 5.0
    else:
        scores.second_system_effect = 5.0

    # 4. 没有银弹（复杂度管理）：最大圈复杂度
    max_cc = max((m.max_cyclomatic_complexity for m in metrics_list), default=0)
    scores.no_silver_bullet = max(1.0, 5.0 - (max_cc - 5) * 0.3) if max_cc > 5 else 5.0

    # 5. 外科手术团队（模块自治）：平均文件大小
    avg_lines = sum(m.line_count for m in metrics_list) / len(metrics_list)
    scores.surgical_team = max(1.0, 5.0 - (avg_lines - 200) * 0.005) if avg_lines > 200 else 5.0

    # 6. 做好扔掉的准备：TODO/HACK 密度
    total_markers = sum(m.todo_count + m.fixme_count + m.hack_count for m in metrics_list)
    total_lines = sum(m.line_count for m in metrics_list)
    marker_density = total_markers / max(total_lines, 1) * 1000  # 每千行标记数
    scores.plan_to_throw = max(1.0, 5.0 - marker_density * 0.2)

    # 7. 焦油坑（腐化）：最大嵌套深度
    max_nesting = max((m.max_nesting_depth for m in metrics_list), default=0)
    scores.tar_pit = max(1.0, 5.0 - (max_nesting - 3) * 0.5) if max_nesting > 3 else 5.0

    # 综合评分（加权平均）
    weights = [0.20, 0.15, 0.15, 0.15, 0.10, 0.10, 0.15]
    values = [
        scores.conceptual_integrity,
        scores.brooks_law_coupling,
        scores.second_system_effect,
        scores.no_silver_bullet,
        scores.surgical_team,
        scores.plan_to_throw,
        scores.tar_pit,
    ]
    scores.overall = round(sum(w * v for w, v in zip(weights, values)), 2)

    # 四舍五入各项得分
    for attr in ['conceptual_integrity', 'brooks_law_coupling', 'second_system_effect',
                 'no_silver_bullet', 'surgical_team', 'plan_to_throw', 'tar_pit']:
        setattr(scores, attr, round(getattr(scores, attr), 2))

    return scores


def _build_project_summary(metrics_list: list[FileMetrics], scores: BrooksScores) -> dict[str, Any]:
    all_funcs = [f for m in metrics_list for f in m.function_metrics]
    total_lines = sum(m.line_count for m in metrics_list)
    total_todos = sum(m.todo_count for m in metrics_list)
    total_fixmes = sum(m.fixme_count for m in metrics_list)
    total_hacks = sum(m.hack_count for m in metrics_list)

    lang_counts: dict[str, int] = defaultdict(int)
    for m in metrics_list:
        lang_counts[m.language] += 1

    hotspots = sorted(
        [m for m in metrics_list if m.max_cyclomatic_complexity > 0],
        key=lambda m: m.max_cyclomatic_complexity,
        reverse=True,
    )[:5]

    return {
        'mode': 'project',
        'summary': {
            'total_files': len(metrics_list),
            'total_lines': total_lines,
            'total_functions': len(all_funcs),
            'languages': dict(lang_counts),
            'comment_markers': {
                'todo': total_todos,
                'fixme': total_fixmes,
                'hack_xxx': total_hacks,
            },
        },
        'brooks_scores': asdict(scores),
        'score_interpretation': _interpret_scores(scores),
        'hotspots': [
            {
                'file': m.path,
                'max_complexity': m.max_cyclomatic_complexity,
                'max_function_lines': m.max_function_lines,
                'max_nesting': m.max_nesting_depth,
            }
            for m in hotspots
        ],
    }


def _interpret_scores(scores: BrooksScores) -> dict[str, str]:
    def level(score: float) -> str:
        if score >= 4.5:
            return '优秀'
        elif score >= 3.5:
            return '良好'
        elif score >= 2.5:
            return '需要关注'
        elif score >= 1.5:
            return '较差'
        else:
            return '危险'

    return {
        'conceptual_integrity': level(scores.conceptual_integrity),
        'brooks_law_coupling': level(scores.brooks_law_coupling),
        'second_system_effect': level(scores.second_system_effect),
        'no_silver_bullet': level(scores.no_silver_bullet),
        'surgical_team': level(scores.surgical_team),
        'plan_to_throw': level(scores.plan_to_throw),
        'tar_pit': level(scores.tar_pit),
        'overall': level(scores.overall),
    }


# ─────────────────────────────────────────────
# 单文件模式输出
# ─────────────────────────────────────────────

def format_file_report(metrics: FileMetrics) -> dict[str, Any]:
    report: dict[str, Any] = {
        'mode': 'file',
        'path': metrics.path,
        'language': metrics.language,
        'line_count': metrics.line_count,
        'class_count': metrics.class_count,
        'import_count': metrics.import_count,
        'comment_markers': {
            'todo': metrics.todo_count,
            'fixme': metrics.fixme_count,
            'hack_xxx': metrics.hack_count,
        },
        'magic_numbers': metrics.magic_numbers[:20],  # 最多展示 20 个
        'naming_issues': metrics.naming_issues[:10],
    }

    if metrics.function_metrics:
        report['function_summary'] = {
            'count': len(metrics.function_metrics),
            'avg_cyclomatic_complexity': metrics.avg_cyclomatic_complexity,
            'max_cyclomatic_complexity': metrics.max_cyclomatic_complexity,
            'max_function_lines': metrics.max_function_lines,
            'max_nesting_depth': metrics.max_nesting_depth,
        }
        # 最复杂的 5 个函数
        top_funcs = sorted(
            metrics.function_metrics,
            key=lambda f: f.cyclomatic_complexity,
            reverse=True,
        )[:5]
        report['top_complex_functions'] = [asdict(f) for f in top_funcs]

    return report


# ─────────────────────────────────────────────
# 入口
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Brooks-Lint: 基于《人月神话》原则的代码质量分析工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument('--mode', choices=['file', 'project', 'debt'], required=True,
                        help='分析模式：file=单文件，project=项目级，debt=技术债务')
    parser.add_argument('--path', required=True,
                        help='文件路径（file 模式）或目录路径（project/debt 模式）')
    parser.add_argument('--pretty', action='store_true',
                        help='美化 JSON 输出')

    args = parser.parse_args()

    if args.mode == 'file':
        if not Path(args.path).is_file():
            print(json.dumps({'error': f'文件不存在: {args.path}'}))
            sys.exit(1)
        metrics = analyze_file(args.path)
        result = format_file_report(metrics)

    elif args.mode == 'project':
        if not Path(args.path).is_dir():
            print(json.dumps({'error': f'目录不存在: {args.path}'}))
            sys.exit(1)
        result = analyze_project(args.path)

    else:  # debt
        if not Path(args.path).is_dir():
            print(json.dumps({'error': f'目录不存在: {args.path}'}))
            sys.exit(1)
        result = analyze_debt(args.path)

    indent = 2 if args.pretty else None
    print(json.dumps(result, ensure_ascii=False, indent=indent))


if __name__ == '__main__':
    main()
