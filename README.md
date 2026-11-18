# Evaluar — Framework de Testing

Framework de automatización E2E con Playwright + TypeScript para el proceso de evaluación de candidatos.

## Architecture

```text
evaluar/
├── config/env.ts                  # Configuración por entorno (BASE_URL, PROCESS_ID, HEADLESS)
├── fixtures/candidate.factory.ts  # Factory de datos de prueba (buildCandidate)
├── pages/                         # Page Objects (una clase por pantalla, extienden BasePage)
│   ├── base.page.ts
│   ├── registration.page.ts
│   ├── assessments.page.ts
│   ├── question.page.ts
│   └── survey.page.ts
├── tests/                         # Specs + fixtures de Playwright
│   ├── fixtures.ts                # sharedPage + fixtures de page objects
│   ├── 01-inicio.spec.ts
│   ├── 02-matricial.spec.ts
│   └── 03-multiple.spec.ts
├── playwright.config.ts           # Configuración del runner (worker, retries, env)
├── tsconfig.json
├── package.json
└── .github/workflows/playwright.yml
```

## Adding a new test in 5 minutes

1. Agrega o extiende un page object en `pages/` (hereda de `BasePage`; locators en el constructor y acciones como métodos).
2. Regístralo como fixture en `tests/fixtures.ts` (envolviendo `sharedPage`).
3. Crea `tests/04-<nombre>.spec.ts` e importa `{ test, expect }` desde `./fixtures`.
4. Toma las URLs desde `config/env.ts` (`env.PROCESS_URL` / `env.PROCESS_PAGE_URL`) y los datos desde `fixtures/candidate.factory.ts` cuando haga falta.
5. Ejecuta `npx playwright test` (o `npx playwright test --headed` para una demo) y revisa el reporte HTML.

## Decisions

- **Single worker**: `workers: 1` + `fullyParallel: false` mantiene la suite secuencial en un solo worker; el fixture `sharedPage` (scope worker) comparte un único contexto/página, así todo el flujo corre en una sola ventana con una sola sesión autenticada.
- **Chained tests**: `01` registra al candidato y `02`/`03` continúan desde esa sesión. Refleja el recorrido real del candidato y evita reautenticarse; el costo es una dependencia explícita del orden.
- **Retries**: `retries: process.env.CI ? 2 : 0`. En local 0 para feedback rápido y determinista; en CI 2 para absorber fallos transitorios de la app en vivo o de la red. `trace: 'on-first-retry'` guarda evidencia en el primer reintento. Como los tests están encadenados y comparten página, un reintento continúa sobre la sesión actual en lugar de reiniciar el flujo.

## Known limitations

- **Positional selectors**: `phoneCountryCode` usa `getByRole('combobox').nth(1)`, `answerDiagonal()` usa `radios.nth(i * 5 + i)` (asume 5 columnas) y la encuesta usa `input[type="radio"][value="10"]`. Cambios de layout u orden los rompen.
- **Execution-order dependency**: `02`/`03` requieren `01` (y `03` se beneficia de que `02` complete Personalidad) en el mismo worker. Ejecutar `03` solo redirige a Keycloak; paralelizar, reordenar o renombrar archivos rompe la cadena.
- **Expiring links**: la URL del proceso controlado (`PROCESS_URL`) y la sesión/tokens del candidato tienen vencimiento, y la encuesta de Tally está atada a `processPersonId`. Si expiran, actualiza `PROCESS_ID`/`PROCESS_URL` en el entorno.

## Ejecución de tests

Instala las dependencias y los navegadores de Playwright una vez:

```bash
npm install
npx playwright install
```

Ejecuta toda la suite y luego abre el reporte:

```bash
npx playwright test
npx playwright show-report
```

Los tests `01-inicio.spec.ts`, `02-matricial.spec.ts` y `03-multiple.spec.ts` comparten una sola ventana de navegador: primero se registra un candidato y luego el flujo continúa desde la página de Evaluaciones, sin abrir una ventana nueva.

Para ver la ejecución en el navegador (headed):

```bash
npx playwright test --headed
```

## Modo presentación

Ejecuta toda la suite más lento y deja la pantalla final visible para una demo en vivo:

```bash
SLOW_MO=1500 HOLD_MS=30000 npx playwright test --headed
```

- `SLOW_MO` — retraso por acción en ms (`1500` se ve bien en una demo; un valor más alto es más lento).
- `HOLD_MS` — cuánto tiempo mantener abierta la pantalla final (por ejemplo, `30000` = 30 s).

O usa el script incluido, que equivale al comando anterior:

```bash
npm run test:demo
```

## Factory de candidatos y fixtures

- `fixtures/candidate.factory.ts` genera datos únicos por ejecución con `buildCandidate()`.
- `tests/fixtures.ts` expone una sola ventana (`sharedPage`) y los page objects (`registrationPage`, `assessmentsPage`, `questionPage`, `surveyPage`).
