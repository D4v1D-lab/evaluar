# evaluar
Desafío de testing para Evaluar

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

Los tests `inicio` y `matricial` comparten una sola ventana de navegador: primero se registra un candidato y luego el flujo continúa desde la página de Evaluaciones, sin abrir una ventana nueva.

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
