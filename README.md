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
SLOW_MO=800 HOLD_MS=15000 npx playwright test tests/inicio.spec.ts --headed
```

- `SLOW_MO` — retraso por acción en ms (`800` se ve bien en una demo; un valor más alto es más lento).
- `HOLD_MS` — cuánto tiempo mantener abierta la pantalla final (por ejemplo, `15000` = 15 s).

O usa el script incluido, que equivale al comando anterior:

```bash
npm run test:demo
```
