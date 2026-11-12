# evaluar
Desafío de testing para Evaluar

## Ejecución de tests

Instala las dependencias y los navegadores de Playwright una vez:

```bash
npm install
npx playwright install
```

Ejecuta el test de registro en modo headed para verlo:

```bash
npx playwright test tests/inicio.spec.ts --headed
```

## Modo presentación

Ejecuta el test más lento y deja la pantalla final visible para una demo en vivo:

```bash
SLOW_MO=1500 HOLD_MS=30000 npx playwright test tests/inicio.spec.ts --headed
```

- `SLOW_MO` — retraso por acción en ms (`1500` se ve bien en una demo; un valor más alto es más lento).
- `HOLD_MS` — cuánto tiempo mantener abierta la pantalla final (por ejemplo, `30000` = 30 s).

O usa el script incluido, que equivale al comando anterior:

```bash
npm run test:demo
```
