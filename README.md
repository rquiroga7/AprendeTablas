# Aprende✕Tablas 🧮

![Aprende✕Tablas](public/og_aprendetablas.jpg)

Juego educativo para practicar las **tablas de multiplicar** a toda velocidad. Un arcade de aritmética donde no solo hay que acertar, sino resolver la mayor cantidad de cuentas posible antes de que se acabe el tiempo.

Disponible en: https://rquiroga7.github.io/AprendeTablas/

## 🎯 Objetivo

Aprender las tablas de multiplicar de forma interactiva y divertida, por repetición y velocidad: cada nivel agrega más cuentas y exige respuestas más rápidas.

## 🕹️ Modos de juego

| Modo | Tablas |
|------|--------|
| 🌱 Tablas 1–3 | 1 × 1 … 3 × 9 |
| 🌿 Tablas 4–6 | 4 × 1 … 6 × 9 |
| 🌳 Tablas 7–9 | 7 × 1 … 9 × 9 |
| 🎯 Todas las tablas | 1 × 1 … 9 × 9 |

Cada modo tiene **8 niveles progresivos**, con estadísticas guardadas por separado. Las cuentas se muestran al azar y sin repetirse dentro de un nivel.

## ⏱️ Niveles y tiempo

| Nivel | Cuentas | Ventana de puntos (x → y) | Tiempo total |
|------:|--------:|--------------------------:|-------------:|
| 1 | 6 | 7 s → 13 s | 78 s |
| 2 | 8 | 7 s → 12 s | 96 s |
| 3 | 10 | 6 s → 11 s | 110 s |
| 4 | 12 | 6 s → 10 s | 120 s |
| 5 | 14 | 5 s → 9 s | 126 s |
| 6 | 16 | 5 s → 8 s | 128 s |
| 7 | 18 | 4 s → 7 s | 126 s |
| 8 | 20 | 4 s → 6 s | 120 s |

Cada pregunta tiene una ventana de tiempo propia: respondé rápido para sumar más puntos. Si no respondés a tiempo, se muestra la respuesta correcta y avanzás con 0 puntos.

## 🏆 Sistema de puntuación

Los puntos dependen del tiempo de respuesta `t`:

| Respuesta | Puntos |
|-----------|--------|
| `t ≤ x` | 10 |
| `x < t ≤ y` | `round(10 × (y − t) / (y − x))` |
| `t > y` | 0 |

Puntaje máximo por nivel = cuentas × 10. Las respuestas incorrectas se pueden reintentar, pero el tiempo sigue corriendo.

## 🏅 Ranking (por porcentaje)

| % del máximo | Rango |
|-------------|-------|
| < 5% | Bronce I |
| ≥ 5% | Bronce II |
| ≥ 20% | Bronce III |
| ≥ 35% | Plata I |
| ≥ 47% | Plata II |
| ≥ 57% | Plata III |
| ≥ 67% | Oro I |
| ≥ 75% | Oro II |
| ≥ 81% | Oro III |
| ≥ 86% | Diamante |
| ≥ 90% | Campeón |
| ≥ 93% | Gran Campeón |
| ≥ 96% | Leyenda Supersónica |

El rango se calcula sobre el máximo total del juego (último nivel × 10 = 200), por lo que los rangos más altos solo se alcanzan en el último nivel.

## 🛠️ Tecnologías

- React 19 + Vite
- Calculadora arcade en pantalla + soporte de teclado físico (0–9, Enter, Backspace, Delete)
- Contador de tiempo global por nivel + ventana por pregunta
- Sonidos y fuegos artificiales de festejo
- Estadísticas por modo y nivel guardadas en localStorage

## 🚀 Desarrollo

```bash
npm install
npm run dev
```

## 📦 Build y deploy

```bash
npm run build
npm run deploy
```

## 🧪 Tests

```bash
npm run test       # tests unitarios de lógica pura (node --test)
npm run test:ui    # tests con Vitest
npm run lint
```

## 👩‍🏫 Créditos

Hecho con ❤️ para que aprender las tablas sea más divertido. Hermano de AprendeGeoARG, con la misma lógica de puntaje y rango pero su propia identidad de arcade. Por Noelia Maldonado y Rodrigo Quiroga ([@rquiroga777](https://x.com/rquiroga777)).
