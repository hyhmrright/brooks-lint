<p align="center"><img src="assets/logo.svg" alt="brooks-lint" width="150"></p>

# brooks-lint

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · **日本語** · [한국어](README.ko.md) · [Español](README.es.md)

![Source version — unreleased](https://img.shields.io/badge/version-1.10.0-blue.svg)
![MIT](https://img.shields.io/badge/license-MIT-green.svg)

コードレビュー、アーキテクチャ、技術的負債、テスト品質、ヘルスダッシュボード、範囲を限定した修正の六つのワークフロー。十二冊のソフトウェア工学の古典に基づきます。

**ソースの状態：** ソースのバージョンは `1.10.0` ですが、そのタグと GitHub Release は取り下げられ、バージョンは再検討中です。公開済みの GitHub/npm 最新版は **1.9.1**。この README は **main** の説明であり、バッジは公開済みであることを示しません。

brooks-lint は Agent Skills、共通ガイド、小さな決定的レポートツールの集合です。診断するのは利用者のコーディングエージェントです。静的解析器ではなく、すべての欠陥を発見する保証もありません。

## Codex で始める

```bash
# Source checkout: Git + Bash
git clone https://github.com/hyhmrright/brooks-lint.git
cd brooks-lint
bash scripts/install.sh codex
```

```text
$brooks-review Review the current diff and identify supported maintainability risks.
$brooks-health Assess this repository; distinguish missing evidence from clean dimensions.
```

現在のソースを Codex のグローバルなスキルディレクトリにインストールします。認識されなければ新しいセッションを開始してください。プロジェクトへのインストールは対象プロジェクトからスクリプトの絶対パスを使い `codex --project` を指定します。`_shared` は六つのスキルと同じ階層に置きます。[Codex ガイド](docs/codex-setup.md)。

**公開済み 1.9.1** は Node.js 20+ で `npx brooks-lint@1.9.1 install codex`。これは main の新機能をすべて含むものではありません。[入門ガイド](docs/getting-started.md)。

## 目的に合う最小のワークフローを選ぶ

| スキル | 用途 | ファイル変更 |
|---|---|---|
| `$brooks-review` | 差分や指定コードの契約、根拠のあるリスク、振る舞いを区別する例。 | なし |
| `$brooks-audit` | モジュール依存、責任の所在、境界。オンボーディング用ガイドもあります。 | なし |
| `$brooks-debt` | 保守上の負債の分類、優先順位、返済計画。 | なし |
| `$brooks-test` | 既存テストのアサーションが検出できる失敗と見逃す失敗。 | なし |
| `$brooks-health` | 四つの観点を簡潔に評価し、証拠の範囲を明示したダッシュボード。 | なし |
| `$brooks-sweep` | 限定した範囲で診断し、許可済みかつ検証可能な修正を実施。 | あり |

Codex は `$brooks-review` を使用します。自然言語による起動はホストとモデルに依存します。Health は四つの完全な監査の代替ではありません。Sweep は編集・検証機能を必要とし、既存の許可を尊重します。複数ファイルという理由だけで再確認しません。

## レポートの読み方

確定した指摘は **症状 → 出典 → 影響 → 対処** で説明します。書籍の引用は考え方を示すもので、診断や章番号の正しさを証明しません。保護されている振る舞いや未確定の要件には架空の減点を付けず、予測と実行済みの検証を区別します。

スコアは確定した指摘の集計であり、**正しさの確率ではありません**。Health は一つの台帳でコード品質・アーキテクチャ・負債・テストを扱います。許可された環境では Node ツールで計算・確定します。重要な証拠が不足する必須観点は **unassessed** とし、数値の総合点を出しません。差分のない PR 観点だけが **skipped** となり、重みを再配分します。問題なしと不明は別です。

交付ツールは渡されたバイト列が確定済みレポートと証跡に一致するかを確認します。診断の正しさ、後の UI 描画、通信は検証しません。ツールを実行できなければ制限を明示し、証跡を捏造しません。[台帳とツール](skills/brooks-health/score-ledger.md)。

Sweep は初回と Critical のみの回も含めて、既定で**合計三回の修正ラウンド**です。時間・ツール予算にも従い、停止理由と未解決項目を報告します。局所的に問題がなくても、広い観点が未評価のままという状態は許されます。[ガイド](skills/brooks-sweep/sweep-guide.md)。

## リスク分類

| 製品コード | テスト |
|---|---|
| R1 — 認知負荷 | T1 — 不明瞭なテスト |
| R2 — 変更の波及 | T2 — 壊れやすいテスト |
| R3 — 知識の重複 | T3 — テストの重複 |
| R4 — 偶発的複雑性 | T4 — Mock の乱用 |
| R5 — 依存の乱れ | T5 — カバレッジの錯覚 |
| R6 — ドメインモデルの歪み | T6 — アーキテクチャの不一致 |

## 十二冊の書籍

| Book | Author |
|---|---|
| *The Mythical Man-Month* | Frederick P. Brooks Jr. |
| *Code Complete* | Steve McConnell |
| *Refactoring* | Martin Fowler |
| *Clean Architecture* | Robert C. Martin |
| *The Pragmatic Programmer* | Andrew Hunt & David Thomas |
| *Domain-Driven Design* | Eric Evans |
| *A Philosophy of Software Design* | John Ousterhout |
| *Software Engineering at Google* | Titus Winters, Tom Manshreck & Hyrum Wright |
| *The Art of Unit Testing* | Roy Osherove |
| *How Google Tests Software* | James Whittaker, Jason Arbon & Jeff Carollo |
| *Working Effectively with Legacy Code* | Michael Feathers |
| *xUnit Test Patterns* | Gerard Meszaros |

[出典対応表](skills/_shared/source-coverage.md)には概念、トレードオフ、誤検出を防ぐ条件があります。この分類は本プロジェクトの統合であり、著者たちの共同の公式分類ではありません。

<a id="benchmark"></a>

## 評価で分かること

三種類の証拠を区別します。

- **オフライン製品テスト:** インストール、計算、交付、パーサー、ケース構造。モデルの判断品質は証明しません。
- **パーサー忠実度:** 30 件の固定レポートの重大度数、リスクコード、SARIF。指摘の真偽ではなく解析処理の検証です。
- **行動比較:** 指定モデルとプロンプトの Codex 回答をケース基準で評価。ケース、実行経路、評価者の制限があります。

最新の**静的指示比較**をオフライン再評価した結果、review と audit は汎用チェックリスト群・スキル群とも **6/6**、test は **5/6 対 6/6** でした。同じ開発過程で作成・再利用したケースで、一組の優位が見られただけです。実行後の評価修正を含み、一般的優位や独立検証、ネイティブのスキル発見、全モデルを証明しません。

[保存記録と再評価](https://github.com/hyhmrright/brooks-lint/tree/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/README.md) · [Codex 評価設計](docs/codex-behavior-evals.md)。研究記録は研究ブランチに保持し、製品には小さな回帰用抜粋を含めます。

モデルは `gpt-6.1-terra / low`、各ケース・各群で回答は一回です。合格には五つの主要行動軸すべての合格、期待する問題の見逃しなし、確定した虚偽の主張なしが必要です。一般的な正解率の推定ではありません。

<a id="installation"></a>

## インストールと互換性

現在のメンテナー検証は **Codex** が対象です。他の統合は残していますが、以前のホスト検証は過去の記録です。配置テストはホスト全体の動作保証ではありません。ホストのバージョンと再現手順を添えた報告を歓迎します。13 の名前付き対象と汎用 `agents` に対応します。

`<platform> = opencode · cursor · windsurf · antigravity · pi · kiro · copilot · droid · dsh · gemini · codex · claude · bob · agents`

[Codex](docs/codex-setup.md) · [OpenCode](docs/opencode-setup.md) · [Cursor](docs/cursor-setup.md) · [Windsurf](docs/windsurf-setup.md) · [Antigravity](docs/antigravity-setup.md) · [pi](docs/pi-setup.md) · [GitHub Copilot](docs/copilot-setup.md) · [Kiro](docs/kiro-setup.md) · [Factory Droid](docs/factory-droid-setup.md) · [DeepSeek Harness](docs/dsh-setup.md) · [IBM Bob](docs/bob-setup.md)

既存の Claude Code コマンドは残していますが、現在のメンテナー検証対象ではありません。

```text
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace
```

## 設定

```yaml
version: 1
strictness: balanced
ignore:
  - "**/vendor/**"
sweep:
  max_iterations: 3
# Optional: deliberately omit a risk from this review.
# disable:
#   - T5
```

[設定例](.brooks-lint.example.yaml)から始めてください。厳格度、重大度、除外、`focus`/`disable`、独自 `Cx` リスク、限定的な抑制を設定できます。T5 を無効にするとその診断を省略します。T5 はカバレッジの百分率だけではありません。[共通契約](skills/_shared/common.md)。

## CI は別の実行経路

GitHub Action は Codex ログインではなく **Anthropic 互換 API** を使います。収集した diff の review のみで、対話型のファイル操作や修正はありません。この過去の提供者経路は現在のライブ検証対象外です。以下は将来のソース版テンプレートです。**タグ撤回中はそのまま実行しないでください**。公開版を使う場合は `v1.9.1` に変更し、その版の機能説明に従ってください。

```yaml
# Source-version template only: this tag is currently withdrawn.
- uses: hyhmrright/brooks-lint/.github/actions/brooks-lint@v1.10.0
  with:
    mode: review
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

[実行契約](docs/runner-contracts.md)と[完全なテンプレート](docs/github-action-example.yml)を参照してください。ベース設定、fork 制限、不正なレポート、権限を説明しています。料金は提供者・モデル・入力によって異なります。

## 開発と貢献

オフライン検証：

```bash
npm run validate
npm test
npm run evals
npm run benchmark
npm run evals:codex:validate
```

ライブ Codex 評価はモデルと予算を指定した明示的な実行です。通常のオフライン検証に過去の Anthropic 評価を含めないでください。[貢献ガイド](CONTRIBUTING.md)、[変更履歴](CHANGELOG.md)、[過去の例](docs/gallery.md)。DSH 統合 [#44](https://github.com/hyhmrright/brooks-lint/pull/44) の [@Sad-happy](https://github.com/Sad-happy) をはじめ、貢献者に感謝します。

MIT — [LICENSE](LICENSE)。

[![Star History](assets/star-history.svg)](https://github.com/hyhmrright/brooks-lint/stargazers)
