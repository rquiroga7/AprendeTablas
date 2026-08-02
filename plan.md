# Plan — Aprende✕Tablas

Juego de práctica de tablas de multiplicar, hermano de **AprendeGeoARG** (misma lógica, mismo sistema de puntaje/rango, misma familia visual) pero con su propia identidad: un **arcade de aritmética** donde el objetivo no es solo acertar, sino resolver la mayor cantidad de cuentas posibles antes de que se acabe el tiempo.

---

## 1. Objetivo y propuesta

- **Audiencia:** chicos en edad escolar que están aprendiendo las tablas de multiplicar.
- **Filosofía:** aprender por repetición y velocidad. La métrica de éxito es *cuántas multiplicaciones se resuelven en el tiempo asignado*, no cuántas se aciertan.
- **Base:** replicar la lógica y estructura de AprendeGeoARG (React 19 + Vite, puntaje por nivel, ranking por porcentaje, sonidos, fuegos artificiales, persistencia en `localStorage`), adaptada a un juego de ingreso de números.

### Diferencias clave con AprendeGeoARG

| | AprendeGeoARG | Aprende✕Tablas |
|---|---|---|
| Interacción | Clic en mapa / elegir opción | Ingreso por teclado numérico o calculadora en pantalla |
| Métrica | Correctas e intentos | Cuentas resueltas en el tiempo asignado |
| Niveles | Variables por provincia (suben de tamaño) | Fijos: 8 niveles por modo |
| Puntaje | Por intento (10/5/2/0) | Lineal según tiempo de respuesta (x→10, y→0) |
| Tiempo | Sin límite global | Contador global por nivel + ventana por pregunta |
| Dificultad | Más departamentos | Más cuentas + ventanas de tiempo más cortas |

---

## 2. Modos de juego

Cuatro modos en la portada, cada uno un rango de tablas:

1. **Tablas 1–3**
2. **Tablas 4–6**
3. **Tablas 7–9**
4. **Todas las tablas** (1–9)

Cada modo tiene sus propios **8 niveles** con estadísticas guardadas por separado en `localStorage`.

### Generación de preguntas

- Una pregunta es `t × f`, con `t` (la "tabla") elegido del rango del modo y `f` un dígito entre 1 y 9.
  - `1-3` → `t ∈ [1,3]`, `f ∈ [1,9]` → 27 combinaciones
  - `4-6` → `t ∈ [4,6]`, `f ∈ [1,9]` → 27 combinaciones
  - `7-9` → `t ∈ [7,9]`, `f ∈ [1,9]` → 27 combinaciones
  - `all` → `t ∈ [1,9]`, `f ∈ [1,9]` → 81 combinaciones
- **Sin repeticiones dentro de un nivel** (muestreo sin reposición; el pool siempre es ≥ N).
- **Orden aleatorio en cada partida** (Fisher–Yates).
- El contenido es uniforme entre niveles: la dificultad sube solo por N (cantidad) y por x/y (velocidad).

---

## 3. Niveles y parámetros

8 niveles por modo. La cantidad de multiplicaciones por nivel y las ventanas de puntaje son fijas:

| Nivel | Cuentas (N) | x (puntos completos) | y (0 puntos) | Tiempo total T = N×y |
|------:|------------:|----------------------:|-------------:|----------------------:|
| 1 | 6 | 4.00 s | 8.00 s | 48 s |
| 2 | 8 | 3.71 s | 7.43 s | 59 s |
| 3 | 10 | 3.43 s | 6.86 s | 69 s |
| 4 | 12 | 3.14 s | 6.29 s | 75 s |
| 5 | 14 | 2.86 s | 5.71 s | 80 s |
| 6 | 16 | 2.57 s | 5.14 s | 82 s |
| 7 | 18 | 2.29 s | 4.57 s | 82 s |
| 8 | 20 | 2.00 s | 4.00 s | 80 s |

Fórmulas (progresión lineal de L1→L8):

```
x(n) = 4 − (n−1) × 2/7
y(n) = 8 − (n−1) × 4/7
T(n) = N(n) × y(n)
```

En la implementación se usan milisegundos (precisión completa); en pantalla se muestran con 1 decimal.

---

## 4. Sistema de puntaje (lineal por tiempo)

Para cada respuesta **correcta**, con `t` = tiempo transcurrido desde que se mostró la pregunta:

```
t ≤ x      → 10 puntos
x < t ≤ y  → round(10 × (y − t) / (y − x))   // lineal descendente
t > y      → 0 puntos
```

- **Máximo por nivel = N × 10** (misma escala que el juego de mapa: 10 pts por respuesta perfecta).
- La pregunta se **cierra sola a los y segundos** si no se respondió: se muestra la respuesta correcta, suma 0 y avanza (refuerza la disciplina de tiempo).

### Respuestas incorrectas

- **Se permite reintentar; el tiempo sigue corriendo** (decisión confirmada). El costo de equivocarse es el tiempo perdido.
- Feedback: sacudida roja en el marcador, sonido de error, se limpia el ingreso.
- Sin reducción de puntos por intento (el puntaje ya es tiempo-dependiente).

### Estructura de tiempo

- **Contador global del nivel:** cuenta regresiva de T. Al llegar a 0, el nivel termina y las cuentas sin responder valen 0.
- **Contador por pregunta:** ventana de y segundos; se pausa durante el feedback (breve, ~500–600 ms) y transiciones, para que el tiempo no penalice el ritmo del juego.
- Los dos contadores corren en paralelo y se pausan juntos durante feedback.

---

## 5. Niveles: aprobación y avance (igual que el juego de mapa)

Con `score` y `levelMaxScore = N × 10`:

| Condición | Resultado |
|---|---|
| `score ≥ 80% × levelMaxScore` | **Paso** → sube al siguiente nivel (o queda en 8) + fuegos artificiales + sonido de victoria |
| `score ≥ 50% × levelMaxScore` | **Bien** → se queda en el nivel |
| `< 50%` | **Sigue practicando** → repite el nivel |

- Selector de nivel libre en el header (como en GeoARG), con iconos progresivos de nivel.
- Botones al final: **Menú**, **Repetir nivel**, y **Siguiente nivel** (si pasó y no es el último).

---

## 6. Ranking (idéntico a AprendeGeoARG, normalizado contra el máximo del juego)

- Mismo `RANKS` y mismos umbrales por porcentaje: Bronce I → Leyenda Supersónica.
- El rango se calcula sobre el **máximo total del juego** (`gameMaxScore` = último nivel × 10 = 200), no sobre el máximo del nivel jugado:
  - `rango = getRank(score, gameMaxScore)`
- Consecuencia deseada: **Leyenda Supersónica** (≥ 96% de ese máximo) solo es alcanzable en el **último nivel**, porque es el único con suficientes cuentas para acumular ese porcentaje global. En los primeros niveles, 60/60 de ese nivel es apenas un 30% del máximo del juego.
- El % de aprobación del nivel (paso/bien/repite) sí se calcula sobre el máximo del **nivel jugado** (`levelMaxScore`), igual que antes.
- En el menú se muestra el **mejor rango** y la **última partida** de cada modo, igual que GeoARG por provincia.

---

## 7. Ingreso: calculadora en pantalla + teclado

### Calculadora en pantalla (mobile-first)

Teclado estilo arcade, botones grandes y táctiles (≥ 56 px):

```
┌───┬───┬───┬───┐
│ 7 │ 8 │ 9 │ ⌫ │
├───┼───┼───┼───┤
│ 4 │ 5 │ 6 │ C │
├───┼───┼───┼───┤
│ 1 │ 2 │ 3 │   │
├───┴───┼───┼───┤
│   0   │ ⏎ │   │
└───────┴───┴───┘
```

- `⌫` retroceder un dígito, `C` limpiar todo, `⏎` confirmar respuesta (verde, prominente).
- Sin dependencia de hover para que funcione bien con el dedo; feedback táctil visual.
- Límite de 3 dígitos en el ingreso (máximo producto 9×9 = 81).

### Teclado (desktop)

- `0–9` y teclado numérico (`NumPad`), `Backspace` = ⌫, `Delete` = C, `Enter` = ⏎.
- Evento `keydown` a nivel `window`, ignorado si el foco está en un `<select>`.
- Los botones y el teclado se deshabilitan durante feedback y al terminar el nivel.

### Readout del marcador

- La cuenta se muestra grande: `7 ✕ 8 = _`, con el número tipeado apareciendo en la ranura de la respuesta (estilo pantalla de calculadora).

---

## 8. Pantallas y componentes

```
src/
├─ main.jsx
├─ index.css              // reset + body + fuente
├─ App.jsx                // enrutado simple menu/game + persistencia
├─ App.css                // tokens de diseño + estilos base
├─ data/
│  └─ levels.js           // config de 8 niveles, modos, fórmulas x/y/T
├─ utils/
│  ├─ ranks.js            // copia de GeoARG (RANKS, getRank, getRankIndex)
│  ├─ questions.js        // generación de preguntas (pool + shuffle sin repetición)
│  ├─ scoring.js          // puntos lineales por tiempo (puro, testeable)
│  ├─ stats.js            // carga/guarda localStorage por modo y nivel
│  ├─ sound.js            // copia de GeoARG
│  └─ fireworks.js        // copia de GeoARG
└─ components/
   ├─ Menu.jsx / Menu.css         // portada con 4 tarjetas de modo + stats
   ├─ Game.jsx                    // header, timer, marcador, flujo, resultado
   └─ Calculator.jsx              // keypad en pantalla + manejo de teclado
```

### Flujo del juego (`Game.jsx`)

1. Cargar modo → generar N preguntas aleatorias → arrancar nivel en nivel 1 (selector libre).
2. Mostrar pregunta 1 → correr timer global + ventana de y.
3. Ingreso por keypad o teclado → `⏎` valida.
   - Incorrecto → shake, sonido, limpiar, reintentar (sigue el tiempo).
   - Correcto → calcular puntos por tiempo, sonido, popup `+N`, pausa breve, avanzar.
   - Se agotó y → revelar respuesta, 0 pts, pausa, avanzar.
4. Repetir hasta N o hasta que el timer global llegue a 0.
5. Resultado: `levelMaxScore = N×10`, paso/bien/repite, rango, guardar stats, fuegos artificiales si pasó.

---

## 9. Persistencia (`localStorage`, clave `aprendeTablas_stats`)

Por modo (`1-3`, `4-6`, `7-9`, `all`):

```
{
  best, maxPossible, bestRankIdx,   // mejor partida y su rango
  last, lastMax, lastLevel,         // última partida
  levels: { [nivel]: { best, max, bestRankIdx, last, plays } }
}
```

El menú muestra **mejor rango** y **última partida** de cada modo (igual que GeoARG).

---

## 10. Diseño visual (frontend-design)

### Dirección: "Arcade de aritmética"

Una máquina de arcade / calculadora retro de escritorio: el área de juego es la cara de una cabina — **marcador LED arriba, consola de botones abajo**. Mantiene el ADN de la familia (fondo oscuro, tarjetas redondeadas, emojis de rango, brillos) pero con paleta e identidad propias, ancladas al mundo de las tablas: cuaderno de matemática, tiza, arcade, velocímetro de récord.

### Tokens de color

| Token | Hex | Uso |
|---|---|---|
| `--ink` | `#0E1120` | fondo base (índigo profundo, más frío que el morado de GeoARG) |
| `--panel` | `#171B30` | tarjetas / paneles |
| `--coral` | `#FF5C4D` | acento primario (botón principal, foco) |
| `--amber` | `#FFB400` | resaltados, trofeos, rango oro |
| `--teal` | `#23D5AB` | acierto / confirmar |
| `--danger` | `#FF4D5E` | error / tiempo agotado |
| `--violet` | `#8B7CF6` | acento secundario (guarda vínculo con GeoARG) |

### Tipografía (3 roles)

- **Display:** *Baloo 2* (600/800) — redondeada, amigable, con carácter; título, la cuenta, los dígitos del keypad.
- **Cuerpo/UI:** *Poppins* — mantiene el vínculo de familia con AprendeGeoARG.
- **Datos:** *Space Mono* (400/700) — timer y puntaje estilo marcador de arcade.

### Layout

```
Menu:                       Game:
┌───────────────────────┐   ┌───────────────────────┐
│  Aprende✕Tablas       │   │ ← Menú  [Modo] [Nivel] │
│  subtítulo            │   │ ⏱ 0:42  ✕ 12/20  🏆 90 │
│  [rango | mejor rango]│   ├───────────────────────┤
│  ┌─────┐ ┌─────┐      │   │  ▓▓▓▓▓▓░░░  (timer)   │
│  │ 1–3 │ │ 4–6 │      │   │  ▓▓▓░░░░░░  (progreso)│
│  └─────┘ └─────┘      │   │                       │
│  ┌─────┐ ┌─────┐      │   │   MARCADOR             │
│  │ 7–9 │ │ TODAS│     │   │   7 ✕ 8 = 56_          │
│  └─────┘ └─────┘      │   │                       │
└───────────────────────┘   │  KEYPAD (deck arcade) │
                            └───────────────────────┘
```

### Elemento firma

**El keypad-consola + marcador brillante** es lo memorable: el keypad se ve como una consola física con teclas gruesas, y el marcador de la cuenta es un display que "se enciende" al cargar. El fondo usa una retícula tenue de signos `✕` (motivo del producto) en tinta baja. Todo lo demás se mantiene sobrio.

### Riesgo estético justificado

No se usa el arcoíris morado/rosa de GeoARG ni el cliché "página cálida con serif"; se elige **coral + ámbar + verde sobre índigo profundo** con la metáfora de arcade/calculadora, que nace del propio tema (multiplicar a contrarreloj) y del público (chicos). El motivo `✕` se repite en logo, favicon y fondo como patrón estructural, no decorativo.

### Movimiento

- Carga del marcador: encendido breve (flicker) al empezar nivel; tarjetas del menú aparecen con fade-up en secuencia.
- Acierto: flash verde + chip `+N` que flota y sube.
- Error: sacudida del marcador. Tiempo agotado: flash ámbar.
- Resultado: fuegos artificiales si pasó (reutiliza `fireworks.js`).
- **`prefers-reduced-motion`:** se desactivan flicker, shake, float y confetti.

### Copys (español, imperativo, del lado del chico)

- Título: **Aprende✕Tablas** · Subtítulo: *"Practicá las tablas a toda velocidad y batí tu récord."*
- Modos: *Tablas 1–3 / 4–6 / 7–9 / Todas las tablas*
- Pregunta: **¿Cuánto es?** · Confirmar: **⏎** · Borrar: **C / ⌫**
- Acierto: `+10` · Error: *¡Otra vez!* · Tiempo: *¡Se acabó el tiempo!*
- Resultado: *¡Felicitaciones!* / *¡Bien!* / *¡Seguí practicando!* · Rango: *Rango: Oro I*
- Botones: *Menú · Repetir nivel · Siguiente nivel*

---

## 11. Tech stack y scaffolding

- **React 19 + Vite 8**, copiando configuración de AprendeGeoARG:
  - `package.json` (sin `sharp`), `eslint.config.js`, `vite.config.js` con `base: '/AprendeTablas/'`, `index.html` (lang es, favicon ✕, fuentes Baloo 2 + Poppins + Space Mono, sin GA de GeoARG).
  - Se elimina `scripts/`, `public/og-image`, `src/data/provinces/*` (no hacen falta datos geográficos).
- Sin framework de tests en el base → **tests unitarios de lógica pura con `node --test`** (utilidades de niveles, scoring, preguntas, ranks).

---

## 12. Tareas de implementación

1. **Scaffold:** copiar config base, adaptar `index.html`, `vite.config.js`, `package.json`, `eslint.config.js`, `index.css`, `main.jsx`.
2. **Utilidades puras:** `data/levels.js`, `utils/questions.js`, `utils/scoring.js`, `utils/ranks.js`, `utils/stats.js` + tests `node --test`.
3. **App + persistencia:** `App.jsx` (menú/juego, guardado de stats).
4. **Menu:** 4 tarjetas de modo con stats, diseño arcade, responsive.
5. **Calculator:** keypad en pantalla + manejo de teclado (desktop + móvil).
6. **Game:** marcador, timer global + ventana por pregunta, flujo de acierto/error/timeout, feedback, resultado, avance de nivel.
7. **Estilos finales:** tokens, retícula ✕, animaciones, `prefers-reduced-motion`, foco visible, responsive.
8. **Verificación:** `npm run lint`, `npm run build`, tests, QA manual (desktop teclado + emulación móvil táctil).

---

## 13. Plan de pruebas

- **Unit (node --test):**
  - Parámetros por nivel: N y fórmulas x/y/T (L1 = 4/8/48, L8 = 2/4/80).
  - Scoring: `t≤x→10`, punto medio, `t=y→0`, `t>y→0`, monotonicidad.
  - Generación: pool correcto por modo, sin repeticiones, 8 niveles llenan N.
  - Ranks: umbrales de porcentaje (Bronce I → Leyenda Supersónica).
- **Lint + build:** `npm run lint` y `npm run build` sin errores.
- **QA manual:**
  - Ingreso por keypad táctil (emulación móvil) y por teclado físico; ambos siempre disponibles.
  - Comportamiento de errores (reintento, tiempo corriendo) y timeout por pregunta.
  - Fin de nivel por timer global y por completar todas las cuentas.
  - Paso/repite entre niveles y selector libre de nivel.
  - Persistencia de stats entre recargas; mejor rango en el menú.
  - Reducir el ancho a 320 px sin romper el layout; tocar sin hover.
  - `prefers-reduced-motion: reduce` desactiva animaciones.

---

## 14. Decisiones confirmadas

- Contador global por nivel **+** ventana por pregunta. ✔
- Presupuesto de tiempo `T = N × y`. ✔
- Error = reintentar con el tiempo corriendo. ✔
- Rango sobre el máximo del nivel jugado (`N × 10`). ✔

## 15. Pendiente de confirmar (no bloqueante)

- `base` de Vite para deploy (`/AprendeTablas/` por defecto; ajustable).
- Nombre visible del juego: **Aprende✕Tablas** (a confirmar).
- Si se quiere analítica (GA) propia más adelante.
