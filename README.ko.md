<p align="center"><img src="assets/logo.svg" alt="brooks-lint" width="150"></p>

# brooks-lint

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · **한국어** · [Español](README.es.md)

![Source version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![MIT](https://img.shields.io/badge/license-MIT-green.svg)

코드 리뷰, 아키텍처, 기술 부채, 테스트 품질, 상태 대시보드, 범위를 제한한 수정까지 여섯 워크플로를 제공합니다. 열두 권의 소프트웨어 공학 고전에 기반합니다.

공개 버전: [npm](https://www.npmjs.com/package/brooks-lint) · [GitHub Releases](https://github.com/hyhmrright/brooks-lint/releases)

[1.9.1에서 2.0.0으로 마이그레이션](docs/migration-v2.md)
brooks-lint는 Agent Skills, 공통 지침, 작은 결정적 보고 도구의 모음입니다. 진단은 사용자의 코딩 에이전트가 수행합니다. 정적 분석기가 아니며 모델이 모든 결함을 찾는다고 보장하지 않습니다.

## Codex로 시작하기

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

현재 소스를 Codex 전역 스킬 디렉터리에 설치합니다. 인식되지 않으면 새 세션을 시작하세요. 프로젝트 설치는 대상 프로젝트에서 스크립트의 절대 경로와 `codex --project`를 사용합니다. `_shared`를 여섯 스킬 폴더와 같은 깊이에 두세요. [Codex 안내](docs/codex-setup.md).

Node.js 20+에서 최신 공개 버전을 설치하려면: `npx brooks-lint@latest install codex`. 다른 설치 대상은 [시작 안내](docs/getting-started.md)를 참고하세요.

## 작업 범위에 맞는 스킬 선택

| 스킬 | 용도 | 파일 수정 |
|---|---|---|
| `$brooks-review` | diff 또는 지정 코드의 계약, 근거 있는 위험과 동작을 구별하는 예시. | 아니요 |
| `$brooks-audit` | 모듈 의존성, 책임과 경계. 별도 온보딩 안내도 제공합니다. | 아니요 |
| `$brooks-debt` | 유지보수 부채의 분류, 우선순위와 상환 계획. | 아니요 |
| `$brooks-test` | 기존 테스트의 단언이 탐지하거나 놓치는 실패. | 아니요 |
| `$brooks-health` | 네 차원의 간략 평가와 증거 범위를 명시한 대시보드. | 아니요 |
| `$brooks-sweep` | 제한한 범위에서 진단 후 승인되고 검증 가능한 수정. | 예 |

Codex에서는 `$brooks-review`를 사용합니다. 자연어 스킬 발견은 호스트와 모델에 달려 있습니다. Health는 네 번의 완전한 감사를 대신하지 않습니다. Sweep은 편집·검증 기능이 필요하며 기존 승인을 존중합니다. 여러 파일이라는 이유만으로 승인을 다시 묻지 않습니다.

## 보고서 해석

확정된 발견은 **증상 → 출처 → 결과 → 조치**로 설명합니다. 책 인용은 원칙의 출처이며 진단이나 장 번호의 정확성을 증명하지 않습니다. 보호된 동작과 불확실한 의무에 임의 감점을 부여하지 않고, 예측과 실제 실행한 검증을 구별합니다.

점수는 확정된 발견의 설정별 합계이며 **정확성의 확률이 아닙니다**. Health는 단일 장부로 코드 품질·아키텍처·부채·테스트를 처리합니다. 실행이 허용되면 Node 도구가 계산하고 보고서를 확정합니다. 필수 차원에 결정적 증거가 없으면 **unassessed**로 표시하며 수치 종합점을 내지 않습니다. diff가 없는 PR만 **skipped**로 처리하고 가중치를 재분배합니다. 미발견과 미평가는 다릅니다.

전달 도구는 제공된 출력 바이트가 확정 보고서 및 영수증과 일치하는지 검사합니다. 진단의 참 여부, 이후 UI 렌더링이나 전송은 검증하지 않습니다. 실행이 불가하면 한계를 명시하고 영수증을 만들어내지 않습니다. [장부 및 도구 계약](skills/brooks-health/score-ledger.md).

Sweep은 최초 및 Critical 전용 라운드를 포함해 기본 **총 세 번의 수정 라운드**로 제한됩니다. 사용자 시간·도구 예산도 따릅니다. 중단 근거와 미해결 사항을 보고하며, 국소 범위가 깨끗해도 더 넓은 차원은 미평가일 수 있습니다. [안내](skills/brooks-sweep/sweep-guide.md).

## 위험 분류

| 제품 코드 | 테스트 |
|---|---|
| R1 — 인지 과부하 | T1 — 불명확한 테스트 |
| R2 — 변경 전파 | T2 — 취약한 테스트 |
| R3 — 지식 중복 | T3 — 테스트 중복 |
| R4 — 우발적 복잡성 | T4 — Mock 남용 |
| R5 — 의존성 무질서 | T5 — 커버리지 착각 |
| R6 — 도메인 모델 왜곡 | T6 — 아키텍처 불일치 |

## 열두 권의 책

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

[출처 대응표](skills/_shared/source-coverage.md)에 개념, 절충과 오탐 방지 조건이 있습니다. 분류는 프로젝트의 종합이며 저자들의 공동 공식 분류가 아닙니다.

<a id="benchmark"></a>

## Benchmark: 여섯 스킬이 제공하는 것

이미 해야 할 작업 하나로 시작하세요. 구체적 반례가 있는 리뷰, 의존성 진단, 부채 상환 계획, 테스트 빈틈, 범위를 정한 건강 보고서, 검증을 거친 수정입니다. 동률과 퇴보를 포함해 **여섯 스킬 모두** 공개합니다. 워크플로의 용도와 측정된 개선은 별개입니다.

| 실험 | 스킬과 근거 | 기준 → 스킬 | 관측된 변화 |
|---|---|---:|---|
| E1 | [review](docs/benchmark-evidence.md#review) | 6/6 → 6/6 | 추가 통과 없음 |
| E1 | [audit](docs/benchmark-evidence.md#audit) | 6/6 → 6/6 | 추가 통과 없음 |
| E1 | [test](docs/benchmark-evidence.md#test-the-difference-and-the-correction) | 5/6 → 6/6 | **통과 응답 1개 증가**; BV5-23 |
| E2 | [debt](docs/benchmark-evidence.md#debt--older-case-only-baseline) | 11/15 → 12/15 | **완전하고 근거 있는 응답 1개 증가**; 이전 기준 |
| E3 | [health](docs/benchmark-evidence.md#health--adverse-result-remains-visible) | 15/18 → 10/18 | **통과 응답 5개 감소**; 과도한 평가 보류 |
| E3 | [sweep](docs/benchmark-evidence.md#sweep--advantage-limited-to-one-family) | 15/18 → 18/18 | **통과 응답 3개 증가**; 한 사례군의 반복 |

**같은 실험 안에서 비교하고 행 간 순위를 매기지 마세요.** E1: 일반 체크리스트와 집중 지침을 비교하며 스킬당 6개 사례, 그룹별 1회 응답입니다. E2: 과거 사례만 제공한 기준과 지침을 비교하며 debt 5개 사례를 3회 반복했습니다. 완전하고 근거 있는 응답 수이며 E1의 주요 행동 통과 수와 다릅니다. E3: 일반 체크리스트와 전체 지침을 비교한 health/sweep 72개 응답 중 스킬·그룹당 18개입니다. sweep의 이점은 우선순위 라우팅 사례군 하나에 한정됩니다. health의 후속 수정은 오프라인 검증이 있지만 **수정 후 효과 비교는 완료되지 않았습니다**. 전체 정확도나 여섯 스킬 순위로 합산할 수 없습니다.

**E1** — CLI 선택 모델은 `gpt-6.1-terra / low`이며 18개 사례 × 두 그룹, 총 **36개 응답**입니다. 사례와 그룹마다 한 번 응답했습니다. E1 행은 오프라인 재판정 후 주요 행동 기준 통과 수입니다. 진단, 계약 범위, 차이를 구분하는 예시, 개선안, 검증 정직성의 다섯 축을 모두 통과하고 예상 문제 누락이나 확인된 허위 주장이 없어야 합니다.

**실제 차이 — BV5-23:** 계약은 숫자 문자열에 대해 정수를 반환하도록 요구합니다. 스킬 응답은 309자리 입력이 `Infinity`가 되며 기존 두 테스트가 이를 잡지 못함을 보였습니다. 체크리스트 응답의 실패 사유는 요구된 변이 비교 누락입니다. 이 추가 발견을 사후에 필수 탐지 문제로 추가하여 감점한 것이 아닙니다.

**판정 수정 — BV5-24:** 처음 거부했던 체크리스트 응답을 행동상 동등한 단언 실패 예시로 인정했습니다. 원래 판정과 수정 기록을 보존합니다. 재사용한 개발 사례 한 쌍의 우위는 일반적 우수성을 뜻하지 않습니다.

### 내 코드에서 먼저 해 볼 작업

다음은 시작용 프롬프트와 의도한 산출물이며, 추가 benchmark 승리가 아닙니다. 구체적인 범위를 지정하고 조치 전에 근거를 확인하세요.

| 스킬 | 처음 시도할 작업 |
|---|---|
| `$brooks-review` | 이 diff를 계약에 따라 검토하고 결함과 보호할 동작을 구분하는 최소 입력을 보여 줘. |
| `$brooks-audit` | 모듈 경계를 넘는 의존성을 추적하고 위반한 규칙과 소유자를 밝혀 줘. |
| `$brooks-debt` | 변경 영향에 따라 유지보수 문제의 우선순위를 정하고 최소 상환 단계를 제안해 줘. |
| `$brooks-test` | 현재 테스트가 통과시키는 잘못된 구현과 이를 구분할 단언을 보여 줘. |
| `$brooks-health` | 하나의 발견 원장으로 이 범위를 평가하고 근거 있는 문제, 발견 없음, 미확인을 구분해 줘. |
| `$brooks-sweep` | 승인된 범위를 총 3회 이내로 진단·수정하고 가능한 검증을 실행한 뒤 잔여 문제를 보고해 줘. |

관련된 개발용 자체 사례와 비독립 채점을 사용합니다. 반복 응답은 독립 프로젝트가 아닙니다. 정적으로 제공한 지침은 네이티브 스킬 발견, 모든 모델 또는 현재2.0.0 전체를 검증하지 않습니다.

| 근거 | 검증 대상 |
|---|---|
| 제품 회귀 | 설치, 점수 계산, 정확한 전달 및 제한된 중단 픽스처 |
| 30개 보고서 파서 벤치마크 | 심각도·위험 코드와 SARIF, 진단의 진실성은 아님 |
| 모델 비교 | 지정 작업, 모델, 지침 버전과 평가 기준 |

[동결 계획](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/plan.json) · [원본 응답과 기록](https://github.com/hyhmrright/brooks-lint/tree/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live) · [인용 포함 판정 및 수정](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/README.md) · [전체6개 스킬의 근거와 한계](docs/benchmark-evidence.md)

<a id="installation"></a>

## 설치와 호환성

현재 유지보수자 검증 대상은 **Codex**입니다. 다른 통합은 유지되지만 이전 호스트 검증은 과거 기록입니다. 디렉터리 테스트가 전체 호스트 동작을 보장하지 않습니다. 호스트 버전과 재현 절차를 포함한 보고를 환영합니다. 13개 명명 대상과 일반 `agents` 대상을 지원합니다.

`<platform> = opencode · cursor · windsurf · antigravity · pi · kiro · copilot · droid · dsh · gemini · codex · claude · bob · agents`

[Codex](docs/codex-setup.md) · [OpenCode](docs/opencode-setup.md) · [Cursor](docs/cursor-setup.md) · [Windsurf](docs/windsurf-setup.md) · [Antigravity](docs/antigravity-setup.md) · [pi](docs/pi-setup.md) · [GitHub Copilot](docs/copilot-setup.md) · [Kiro](docs/kiro-setup.md) · [Factory Droid](docs/factory-droid-setup.md) · [DeepSeek Harness](docs/dsh-setup.md) · [IBM Bob](docs/bob-setup.md)

기존 Claude Code 명령은 보존되지만 현재 유지보수자의 검증 대상이 아닙니다.

```text
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace
```

## 설정

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

[설정 예시](.brooks-lint.example.yaml)를 참고하세요. 엄격도, 심각도, 경로 제외, `focus`/`disable`, 사용자 `Cx` 위험과 범위별 억제를 설정합니다. T5를 끄면 해당 진단을 생략합니다. T5는 커버리지 백분율만 의미하지 않습니다. [공통 계약](skills/_shared/common.md).

## CI는 별도 실행 경로

GitHub Action은 Codex 로그인이 아닌 **Anthropic 호환 API**를 사용합니다. 수집한 diff의 review만 수행하며 대화형 파일 도구나 수정 기능은 없습니다. 이 과거 제공자 경로는 현재 실시간 검증 대상 밖입니다. 해당 태그가 공개된 후 아래 예제를 사용하세요.

```yaml
- uses: hyhmrright/brooks-lint/.github/actions/brooks-lint@v2.0.0
  with:
    mode: review
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

[실행기 계약](docs/runner-contracts.md)과[전체 템플릿](docs/github-action-example.yml)에 기본 설정, fork 제한, 잘못된 보고서와 권한을 설명합니다. 비용은 제공자·모델·입력에 따라 다릅니다.

## 개발과 기여

오프라인 검증:

```bash
npm run validate
npm test
npm run evals
npm run benchmark
npm run evals:codex:validate
```

실시간 Codex 평가는 별도 모델과 예산을 지정해 명시적으로 실행합니다. 통상 오프라인 검사에 과거 Anthropic 평가를 넣지 마세요. [기여 안내](CONTRIBUTING.md), [변경 기록](CHANGELOG.md), [과거 예시](docs/gallery.md). DSH 통합 [#44](https://github.com/hyhmrright/brooks-lint/pull/44)의 [@Sad-happy](https://github.com/Sad-happy)를 비롯한 기여자에게 감사합니다.

MIT — [LICENSE](LICENSE).

[![Star History](assets/star-history.svg)](https://github.com/hyhmrright/brooks-lint/stargazers)
