# FDSA Arcade — Hall of Fame

Ranking de los minijuegos de Discord del equipo: resultados por fecha, clasificación agregada y estadísticas.

## Añadir una jornada

Edita `data/results.json` y añade un objeto a `events`:

```json
{
  "date": "2026-08-01",
  "game": "Putt Party Paradise",
  "mode": "Classic",
  "results": [
    { "player": "Nombre", "wins": 1 }
  ]
}
```

La web recalcula automáticamente ranking, récords y estadísticas. Se publica con GitHub Pages desde la rama `main`.
