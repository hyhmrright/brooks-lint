<p align="center"><img src="assets/logo.svg" alt="brooks-lint" width="150"></p>

# brooks-lint

[English](README.md) · [简体中文](README.zh-CN.md) · **繁體中文** · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

![Source version — unreleased](https://img.shields.io/badge/version-1.10.0-blue.svg)
![MIT](https://img.shields.io/badge/license-MIT-green.svg)

六個工作流程，覆蓋程式碼審查、架構、技術債、測試品質、健康看板與限定範圍的修復，以十二本經典軟體工程書籍為基礎。

**原始碼狀態：** 目前原始碼仍宣告 `1.10.0`，但對應標籤與 GitHub Release 已撤回，版本號等待確認。GitHub/npm 最近的已發布版本仍為 **1.9.1**。本文描述 **main**，其中部分功能尚未包含在 1.9.1；徽章表示原始碼版本，不表示已發布。

brooks-lint 由 Agent Skills、共享指導和小型確定性報告工具組成。診斷由你的編碼代理執行；專案提供工作流程、風險分類和報告約定。它不是靜態分析器，也不保證模型能發現所有缺陷。

## 從 Codex 開始

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

以上命令將目前原始碼安裝到 Codex 的全域技能目錄。如果沒有發現技能，請啟動新會話。專案級安裝應在目標專案中通過絕對路徑執行安裝指令稿，並使用 `codex --project`。保留 `_shared` 與六個技能目錄的同級關係。詳見 [Codex 指南](docs/codex-setup.md)。

安裝**已發布的 1.9.1** 可使用 Node.js 20+：`npx brooks-lint@1.9.1 install codex`。它安裝舊版，不包含 main 的全部新功能。更多平台與自訂目錄見[入門指南](docs/getting-started.md)。

## 選擇符合任務範圍的技能

| 技能 | 適用任務 | 是否修改檔案？ |
|---|---|---|
| `$brooks-review` | 審查 diff 或指定程式碼：契約、證據支援的風險及區分性見證。 | 否 |
| `$brooks-audit` | 模組依賴、職責歸屬和邊界完整性；另有團隊入門指南。 | 否 |
| `$brooks-debt` | 識別維護債務、排序並制定償還計畫。 | 否 |
| `$brooks-test` | 審查現有測試：斷言能偵測和遺漏哪些失敗。 | 否 |
| `$brooks-health` | 四個維度的簡要評估和有證據範圍限制的看板。 | 否 |
| `$brooks-sweep` | 在限定範圍內診斷並執行已授權、可驗證的修復。 | 是 |

Codex 使用 `$brooks-review`；其他宿主使用自己的呼叫方式。自然語言觸發取決於宿主和模型。Health 是摘要，不是四次窮盡式審計。Sweep 需要編輯和驗證能力，並沿用現有授權；不會僅因修改多個檔案就再次要求確認。

## 如何理解報告

保留的問題應遵循 **現象 → 來源 → 後果 → 修復**：可觀察證據、相關工程原則、影響和適當範圍內的建議。書籍引用解釋框架，不是診斷正確或章節對應準確的證明。受保護行為與未決義務應如實說明，不憑空扣分；預測結果必須與實際執行的檢查區分。

分數是依設定彙總已保留問題的結果，**不是程式碼正確的機率**。Health 從同一份清單計算程式碼品質、架構、技術債和測試品質。允許執行工具時，隨附 Node 工具產生分數並定稿。必要維度缺少決定性證據時標為 **unassessed**，不輸出數值綜合分。僅無 diff 的 PR 維度可以 **skipped** 並重新分配權重。已評估且未發現問題不等於未知。

交付工具檢查提供的輸出位元組是否與定稿和憑據一致，不驗證診斷正確性、後續介面渲染或傳輸。無法執行工具時必須說明驗證限制，不得虛構憑據。詳見[評分清單與工具約定](skills/brooks-health/score-ledger.md)。

Sweep 預設最多 **三輪修復總計**，包括首輪及僅處理 Critical 的輪次；同時遵守使用者的時間和工具預算。停止時報告有證據支援的原因與未解決項。局部範圍已乾淨，可以與更廣維度仍未知同時成立。詳見 [Sweep 指南](skills/brooks-sweep/sweep-guide.md)。

## 風險分類

| 正式環境程式碼 | 測試 |
|---|---|
| R1 — 認知過載 | T1 — 測試晦澀 |
| R2 — 變更傳播 | T2 — 測試脆弱 |
| R3 — 知識重複 | T3 — 測試重複 |
| R4 — 意外複雜性 | T4 — Mock 濫用 |
| R5 — 依賴失序 | T5 — 覆蓋幻覺 |
| R6 — 領域模型失真 | T6 — 架構失配 |

## 十二本書

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

[來源映射](skills/_shared/source-coverage.md)記錄概念、權衡和誤報保護。這套風險分類是專案對書中思想的綜合，不是這些作者共同制定的官方分類。

<a id="benchmark"></a>

## 評測能說明什麼

以下三類證據不能混為一談：

- **離線產品檢查:** 安裝、計分、交付、解析器約定和案例結構；不證明模型診斷品質。
- **解析器保真度:** 30 份凍結報告的嚴重度計數、風險代碼與 SARIF；驗證解析器，不判斷發現是否真實。
- **行為對照:** 指定提示和模型下的 Codex 回答，按案例標準評判；結論受案例、執行通道和評審限制。

最新一輪**靜態指令對照**經離線覆核後：review 和 audit 的通用清單組、技能組均為 **6/6**；test 為 **5/6 對 6/6**。優勢只有一個配對案例，案例由同一開發流程編寫並重用，不能證明普遍優越。評分在執行後做過修正，也未測量原生技能發現能力或所有模型。

[完整記錄與覆核](https://github.com/hyhmrright/brooks-lint/tree/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/README.md) · [Codex 行為評測設計](docs/codex-behavior-evals.md)。歷史研究保留在研究分支，產品儲存庫只攜帶精簡回歸範例。

模型為 `gpt-6.1-terra / low`，每個案例每組回答一次。通過要求五個主要行為維度全部通過、沒有遺漏預期問題、沒有已確認的虛假聲明；這些計數不是普遍正確率估計。

<a id="installation"></a>

## 安裝與相容性

維護者目前驗證 **Codex**。其他整合繼續保留，但以往的宿主驗證屬於歷史記錄；安裝目錄測試不代表完整執行相容性。歡迎附帶宿主版本和重現步驟的社群報告。安裝器支援 13 個具名目標和通用 `agents` 目錄。

`<platform> = opencode · cursor · windsurf · antigravity · pi · kiro · copilot · droid · dsh · gemini · codex · claude · bob · agents`

[Codex](docs/codex-setup.md) · [OpenCode](docs/opencode-setup.md) · [Cursor](docs/cursor-setup.md) · [Windsurf](docs/windsurf-setup.md) · [Antigravity](docs/antigravity-setup.md) · [pi](docs/pi-setup.md) · [GitHub Copilot](docs/copilot-setup.md) · [Kiro](docs/kiro-setup.md) · [Factory Droid](docs/factory-droid-setup.md) · [DeepSeek Harness](docs/dsh-setup.md) · [IBM Bob](docs/bob-setup.md)

保留的 Claude Code 市集命令如下；此路徑目前未經維護者持續驗證：

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

從 [`.brooks-lint.example.yaml`](.brooks-lint.example.yaml) 開始。共享約定定義嚴格度、嚴重度覆蓋、忽略路徑、`focus`/`disable`、自訂 `Cx` 風險和範圍化抑制。停用 T5 会主動省略其診斷；T5 不只是覆蓋率百分比檢查。詳見[設定與報告約定](skills/_shared/common.md)。

## CI 是另一條執行路徑

現有 GitHub Action 使用 **Anthropic 相容 API**，不使用 Codex 登錄額度。它只審查收集的 diff，沒有互動式儲存庫工具或修復能力；該歷史提供者路徑不屬於目前維護者的即時驗證範圍。以下是未來發布的原始碼版本模板；**標籤撤回期間不能直接執行**。若使用已發布版本，請改為 `v1.9.1` 並遵循其對應功能說明。

```yaml
# Source-version template only: this tag is currently withdrawn.
- uses: hyhmrright/brooks-lint/.github/actions/brooks-lint@v1.10.0
  with:
    mode: review
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

[執行器約定](docs/runner-contracts.md)與[完整工作流程模板](docs/github-action-example.yml)說明基礎分支設定、fork 限制、無效報告及權限。費用取決於提供者、模型和輸入，不承諾固定單次價格。

## 開發與貢獻

離線驗證命令：

```bash
npm run validate
npm test
npm run evals
npm run benchmark
npm run evals:codex:validate
```

即時 Codex 評測必須明確選擇模型和預算；日常離線檢查不要執行歷史 Anthropic 評測。參見[貢獻指南](CONTRIBUTING.md)、[變更記錄](CHANGELOG.md)及[歷史示例](docs/gallery.md)。感謝貢獻者，包括在 [#44](https://github.com/hyhmrright/brooks-lint/pull/44) 提供原生 DSH 整合的 [@Sad-happy](https://github.com/Sad-happy)。

MIT — [授權條款](LICENSE)。

[![Star History](assets/star-history.svg)](https://github.com/hyhmrright/brooks-lint/stargazers)
