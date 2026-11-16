<p align="center"><img src="assets/logo.svg" alt="brooks-lint" width="150"></p>

# brooks-lint

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **Español**

![Source version — unreleased](https://img.shields.io/badge/version-1.10.0-blue.svg)
![MIT](https://img.shields.io/badge/license-MIT-green.svg)

Seis flujos para revisión de código, arquitectura, deuda técnica, calidad de pruebas, un panel de salud y reparaciones acotadas, basados en doce libros clásicos de ingeniería de software.

**Estado del código fuente:** el árbol declara `1.10.0`, pero se retiraron su etiqueta y GitHub Release mientras se decide la versión. La última versión publicada en GitHub/npm sigue siendo **1.9.1**. Este README describe **main**, con cambios que no están en 1.9.1; la insignia no demuestra una publicación.

brooks-lint reúne Agent Skills, instrucciones compartidas y pequeñas herramientas deterministas para informes. Tu agente de programación realiza el diagnóstico. No es un analizador estático ni garantiza que el modelo encuentre todos los defectos.

## Empezar con Codex

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

Esto instala el código actual en el directorio global de habilidades de Codex. Abre una sesión nueva si no aparecen. Para instalar en otro proyecto, ejecuta el script por su ruta absoluta desde ese proyecto con `codex --project`. Mantén `_shared` al mismo nivel que las seis habilidades. Consulta la [guía de Codex](docs/codex-setup.md).

Para el paquete **publicado 1.9.1**, usa Node.js 20+ y `npx brooks-lint@1.9.1 install codex`. Instala la versión anterior, no todas las funciones de main. Consulta [primeros pasos](docs/getting-started.md) para otros destinos.

## Elegir el flujo más acotado para la tarea

| Habilidad | Uso | ¿Modifica archivos? |
|---|---|---|
| `$brooks-review` | Un diff o código indicado: contrato, riesgos sustentados y un ejemplo que distinga comportamientos. | No |
| `$brooks-audit` | Dependencias, responsabilidades y límites entre módulos; incluye una guía de incorporación. | No |
| `$brooks-debt` | Clasificación de deuda de mantenimiento, prioridades y plan de pago. | No |
| `$brooks-test` | Una suite existente: fallos que sus aserciones detectan o dejan pasar. | No |
| `$brooks-health` | Evaluación abreviada de cuatro dimensiones y un panel limitado por la evidencia. | No |
| `$brooks-sweep` | Diagnosticar y aplicar reparaciones autorizadas y verificables dentro de un alcance definido. | Sí |

Codex usa `$brooks-review`; los demás entornos tienen su propia sintaxis. La activación por lenguaje natural depende del entorno y del modelo. Health no sustituye cuatro auditorías exhaustivas. Sweep necesita herramientas de edición y verificación, respeta la autorización existente y no vuelve a pedir permiso solo porque cambien varios archivos.

## Cómo interpretar un informe

Un hallazgo retenido sigue **Síntoma → Fuente → Consecuencia → Remedio**. Las referencias a libros explican principios; no prueban el diagnóstico ni la exactitud de una atribución a un capítulo. Los comportamientos protegidos y las obligaciones sin resolver no deben generar deducciones inventadas. Se distinguen las predicciones de las comprobaciones ejecutadas.

La puntuación resume los hallazgos retenidos según la configuración; **no es una probabilidad de corrección**. Health usa un único registro para calidad de código, arquitectura, deuda y pruebas. Si se permite ejecutar herramientas, las utilidades Node calculan y finalizan el informe. Una dimensión necesaria sin evidencia decisiva es **unassessed** y bloquea la puntuación compuesta numérica. Solo PR sin diff puede ser **skipped**, redistribuyendo su peso. No hallar problemas no equivale a no haber evaluado.

La herramienta de entrega compara los bytes proporcionados con el informe finalizado y su recibo. No verifica la verdad del diagnóstico, la presentación posterior en una interfaz ni el transporte. Si no se puede ejecutar, deben declararse los límites sin inventar recibos. [Registro y contrato de herramientas](skills/brooks-health/score-ledger.md).

Sweep permite por defecto **tres rondas de reparación en total**, incluida la inicial y las dedicadas solo a Critical. También respeta los presupuestos de tiempo y herramientas. Explica la causa de parada y lo pendiente. Un alcance local limpio puede coexistir con dimensiones más amplias desconocidas. [Guía](skills/brooks-sweep/sweep-guide.md).

## Vocabulario de riesgos

| Código de producción | Pruebas |
|---|---|
| R1 — Sobrecarga cognitiva | T1 — Pruebas oscuras |
| R2 — Propagación de cambios | T2 — Pruebas frágiles |
| R3 — Duplicación de conocimiento | T3 — Duplicación de pruebas |
| R4 — Complejidad accidental | T4 — Abuso de mocks |
| R5 — Desorden de dependencias | T5 — Ilusión de cobertura |
| R6 — Distorsión del modelo de dominio | T6 — Desajuste arquitectónico |

## Los doce libros

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

La [matriz de fuentes](skills/_shared/source-coverage.md) documenta conceptos, compromisos y protección frente a falsos positivos. Esta clasificación es una síntesis del proyecto, no una taxonomía oficial conjunta de los autores.

<a id="benchmark"></a>

## Qué se ha evaluado

Conviene separar tres tipos de evidencia:

- **Pruebas de producto sin conexión:** Instalación, cálculo, entrega, contratos del parser y estructura de casos. No prueban la calidad del juicio del modelo.
- **Fidelidad del parser:** 30 informes congelados: recuentos de severidad, códigos y SARIF. Se evalúa el parser, no la verdad de los hallazgos.
- **Comparaciones de comportamiento:** Respuestas de Codex con modelos y prompts definidos, juzgadas por rúbricas. Limitadas por casos, canal de ejecución y revisores.

En la última comparación de **instrucciones estáticas**, tras la revisión sin conexión, review y audit obtuvieron **6/6 en ambos grupos**, lista genérica y habilidad; test obtuvo **5/6 frente a 6/6**. Es una ventaja en un único par de casos reutilizados y escritos durante el desarrollo, no prueba independiente de superioridad general. Se corrigió la evaluación después de ejecutar. No mide el descubrimiento nativo de habilidades ni todos los modelos.

[Registro y revisión preservados](https://github.com/hyhmrright/brooks-lint/tree/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/README.md) · [Diseño de evaluación Codex](docs/codex-behavior-evals.md). Los archivos de investigación permanecen en su rama; el producto incluye pequeños extractos de regresión.

Modelo: `gpt-6.1-terra / low`; una respuesta por caso y grupo. Aprobar exige superar los cinco ejes principales, no omitir problemas esperados y no presentar afirmaciones falsas confirmadas. No es una estimación de exactitud general.

[Evidencia y límites de las seis habilidades](docs/benchmark-evidence.md)

<a id="installation"></a>

## Instalación y compatibilidad

La verificación actual del mantenedor cubre **Codex**. Las demás integraciones siguen disponibles, pero su verificación anterior es histórica. Comprobar el directorio de instalación no equivale a probar cada entorno de extremo a extremo. Los informes comunitarios deben incluir versión y reproducción. Hay 13 destinos con nombre más el genérico `agents`.

`<platform> = opencode · cursor · windsurf · antigravity · pi · kiro · copilot · droid · dsh · gemini · codex · claude · bob · agents`

[Codex](docs/codex-setup.md) · [OpenCode](docs/opencode-setup.md) · [Cursor](docs/cursor-setup.md) · [Windsurf](docs/windsurf-setup.md) · [Antigravity](docs/antigravity-setup.md) · [pi](docs/pi-setup.md) · [GitHub Copilot](docs/copilot-setup.md) · [Kiro](docs/kiro-setup.md) · [Factory Droid](docs/factory-droid-setup.md) · [DeepSeek Harness](docs/dsh-setup.md) · [IBM Bob](docs/bob-setup.md)

Se conservan estos comandos de Claude Code; esta vía no se verifica actualmente por el mantenedor:

```text
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace
```

## Configuración

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

Empieza con [`.brooks-lint.example.yaml`](.brooks-lint.example.yaml). El contrato compartido define rigor, severidad, exclusiones, `focus`/`disable`, riesgos `Cx` y supresiones acotadas. Desactivar T5 omite deliberadamente su diagnóstico; T5 no es solo un porcentaje de cobertura. [Contrato común](skills/_shared/common.md).

## CI es una vía independiente

La GitHub Action usa una **API compatible con Anthropic**, no el inicio de sesión de Codex. Solo revisa el diff recopilado, sin herramientas interactivas ni reparaciones. Esta vía histórica no forma parte de la verificación actual en vivo. El ejemplo es una plantilla de la versión fuente para una publicación futura: **no lo ejecutes mientras la etiqueta esté retirada**. Para una versión publicada, cambia a `v1.9.1` y sigue sus capacidades documentadas.

```yaml
# Source-version template only: this tag is currently withdrawn.
- uses: hyhmrright/brooks-lint/.github/actions/brooks-lint@v1.10.0
  with:
    mode: review
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Los [contratos del ejecutor](docs/runner-contracts.md) y la [plantilla completa](docs/github-action-example.yml) explican configuración de base, forks, informes inválidos y permisos. No se promete un precio fijo: depende del proveedor, modelo y entrada.

## Desarrollo y contribuciones

Validación sin conexión:

```bash
npm run validate
npm test
npm run evals
npm run benchmark
npm run evals:codex:validate
```

La evaluación Codex en vivo requiere elegir modelo y presupuesto explícitamente. No ejecutes la evaluación histórica de Anthropic como una comprobación rutinaria sin conexión. Consulta [CONTRIBUTING.md](CONTRIBUTING.md), [cambios](CHANGELOG.md) y [ejemplos históricos](docs/gallery.md). Gracias a quienes contribuyen, incluido [@Sad-happy](https://github.com/Sad-happy) por la integración DSH de [#44](https://github.com/hyhmrright/brooks-lint/pull/44).

MIT — [LICENSE](LICENSE).

[![Star History](assets/star-history.svg)](https://github.com/hyhmrright/brooks-lint/stargazers)
