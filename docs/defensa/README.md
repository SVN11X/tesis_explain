# Práctica de defensa oral con IA: guía de operación

Esta guía explica cómo funciona la práctica, qué guarda, cuánto cuesta y qué pasos da el dueño para ponerla en marcha. El diseño completo está en `docs/defensa/especificacion.md`. El cambio de proveedor, de modelo o de base está en `docs/defensa/migracion-proveedores.md`.

La IA queda apagada para cada pregunta hasta que una persona apruebe su rúbrica. Mientras tanto, el panel solo ofrece la guía.

## 1. Cómo funciona

- GitHub Pages sirve la página `preguntas.html`, el panel (`js/defensa-oral.js`) y las guías. No ejecuta nada del lado del servidor.
- Un Worker de Cloudflare (`servicio/`) recibe cada respuesta que el estudiante confirmó. No recibe audio.
- Una base D1 admite o rechaza cada solicitud según los topes de cuota y detecta las repetidas.
- El Worker pide al modelo `@cf/google/gemma-4-26b-a4b-it`, sin razonamiento, tres lecturas de la misma respuesta, a temperatura 0,1, 0,2 y 0,3, con el mismo prompt y en paralelo. El modelo se elige con la variable `AI_MODELO` de `servicio/wrangler.toml`, entre los de `MODELOS` en `servicio/src/proveedores.mjs`. Nunca cambia solo.
- Solo se muestra un comentario si las tres lecturas son válidas y coinciden en el veredicto y en el estado de cada criterio (unanimidad). Si no coinciden, el sistema se abstiene: responde `no_evaluable` con `disagreement` y el panel ofrece la guía. Un fallo técnico nunca se convierte en `incorrecta` ni dispara otra ronda.
- Cada lectura debe citar fragmentos literales de la respuesta. Si no, la lectura se descarta. El veredicto de cada lectura lo calcula el servidor con las reglas de la rúbrica a partir de los criterios. El modelo solo puede abstenerse con `indeterminada`.

## 2. Contrato HTTP

Resumen. El detalle y el orden de las comprobaciones están en `docs/defensa/especificacion.md`, apartado 6.

| Ruta | Qué hace |
|---|---|
| `POST /v1/sesiones` | Crea una sesión anónima de dos horas. Responde `201 {token, vence}`. |
| `POST /v1/evaluaciones` | Evalúa una respuesta. Cuerpo `{request_id, question_id, version_catalogo, modo, respuesta}` y cabecera `Authorization: Bearer <token>`. |
| `GET /v1/evaluaciones/<request_id>` | Consulta el estado de un intento. No devuelve fragmentos de texto. |
| `GET /v1/salud` | Proveedor, admisión y versión del catálogo, sin datos de nadie. |

Códigos principales: `200` con `evaluada` o `no_evaluable`, `202` en curso, `400` solicitud inválida, `401` sesión, `404` pregunta, `409` versión o contenido distintos, `410` caducada, `413` cuerpo grande, `429` cupo agotado (con `Retry-After` si es el cupo del día), `503` escritura ambigua. Las causas de `no_evaluable` son `pending_guide`, `ai_unavailable`, `quota_exhausted`, `disagreement` e `insufficient_evidence`.

## 3. Privacidad

- El audio nunca sale de la pestaña. El dictado privado convierte la voz en texto dentro del navegador. El dictado externo del navegador solo se usa si el estudiante acepta un aviso que dice que su proveedor puede procesar el audio.
- El texto confirmado viaja al Worker y al modelo para evaluarlo. El estudiante lo revisa antes de enviarlo.
- El Worker guarda **códigos, no respuestas**: estado, causa, veredicto, ID de criterios con su estado y la posición del fragmento citado. También guarda un HMAC del contenido, que sirve para detectar duplicados y no permite recuperar el texto sin la clave.
- Retención: el resultado guardado dura 30 minutos y después se purga. El registro de la reserva dura 48 horas y después se borra. Las sesiones duran 2 horas. Una limpieza programada (`scheduled`, en lotes de 200) hace las purgas.
- El panel no guarda lo escrito en el navegador. El estado vive en memoria.

## 4. Presupuesto

- Con Gemma 4, cada llamada cuesta (1.500 × 9.091 + 500 × 27.273) ÷ 1.000.000 = 27,27 Neurons, con 1.500 tokens de entrada y 500 de salida. Cada respuesta hace tres llamadas, así que reserva 81,82 Neurons (`costeReservado` en `servicio/src/cuotas.mjs`, con la tarifa del modelo en uso). Con Granite serían 22,176.
- Topes: 100 respuestas por día UTC y 7.000 Neurons por día como tope interno. La asignación diaria gratuita de Workers AI es de 10.000 Neurons y se reinicia a las 00:00 UTC. A 81,82 por respuesta, el tope de Neurons llega primero: unas 85 respuestas al día, como prevé la tabla de la propuesta para Gemma 4.
- Escenario de 200 respuestas por día: con Granite serían unos 4.435 Neurons. Con Gemma 4 no cabe bajo el tope interno. Se activaría más adelante con un cambio revisado: `servicio/src/index.mjs` hoy crea el repositorio con los límites por defecto (`LIMITES_POR_DEFECTO` en `servicio/src/cuotas.mjs`) y habría que pasarle `respuestasDia: 200`. Hoy no está activo.
- Una sola cuenta de producción. Una segunda cuenta gratuita no agrega capacidad para la misma aplicación y el Self-Serve Subscription Agreement, apartado 2.2.1(c), prohíbe usar cuentas adicionales para esquivar los límites sin permiso escrito de Cloudflare.
- Por qué Gemma 4 y no Granite: en una medición de desarrollo con 6 casos sintéticos, Granite acertó 1 de 6 y marcó `parcial` una contradicción crítica, mientras Gemma 4 acertó 6 de 6 en unos 3 s (especificación, apartado 5.1). No reemplaza la validación del apartado 7. Llama 3.3 70B FP8 Fast queda como alternativa a validar.

## 5. Despliegue paso a paso

Solo lo hace el dueño. Ninguna clave se escribe en el repositorio. Los comandos se ejecutan desde la carpeta `servicio/`, con una cuenta de Cloudflare ya iniciada (`npx wrangler login`).

`servicio/wrangler.toml` no está en el repositorio y lo agrega el dueño. Una base mínima, con los nombres que lee el código:

```toml
name = "defensa-oral"
main = "src/index.mjs"
compatibility_date = "2026-11-01"

[vars]
AI_PROVIDER = "workers_ai"
FALLBACK_MODE = "practice_only"
ADMISION = "abierta"
ORIGENES = "https://<usuario>.github.io"

[ai]
binding = "AI"

[[d1_databases]]
binding = "DB"
database_name = "defensa-oral"
database_id = "<id de d1 create>"
migrations_dir = "migraciones"

[triggers]
crons = ["*/30 * * * *"]

[env.preproduccion]
name = "defensa-oral-preproduccion"
vars = { AI_PROVIDER = "workers_ai", FALLBACK_MODE = "practice_only", ADMISION = "abierta", ORIGENES = "http://localhost:8000" }
ai = { binding = "AI" }
d1_databases = [{ binding = "DB", database_name = "defensa-oral-preproduccion", database_id = "<id de la base de preproducción>", migrations_dir = "migraciones" }]
triggers = { crons = ["*/30 * * * *"] }
```

Wrangler no hereda variables ni bindings entre entornos, por eso `preproduccion` los repite. Para la preproducción se usa una base propia.

Producción:

```bash
npx wrangler d1 create defensa-oral
```

Copiar el `database_id` que imprime en `servicio/wrangler.toml`. Después:

```bash
npx wrangler d1 migrations apply defensa-oral --remote
npx wrangler secret put HMAC_CLAVE
npx wrangler secret put SESION_CLAVE
npx wrangler deploy
```

Preproducción (primero la base propia, con su `database_id` en el bloque `[env.preproduccion]`):

```bash
npx wrangler d1 create defensa-oral-preproduccion
npx wrangler d1 migrations apply defensa-oral-preproduccion --remote --env preproduccion
npx wrangler secret put HMAC_CLAVE --env preproduccion
npx wrangler secret put SESION_CLAVE --env preproduccion
npx wrangler deploy --env preproduccion
```

Cada `secret put` pide el valor por teclado. Usar valores aleatorios largos y distintos para cada entorno.

Por último, poner la dirección del Worker en `js/defensa-config.js`:

```js
window.DEFENSA_CONFIG = { api: "https://defensa-oral.<subdominio>.workers.dev" };
```

La dirección debe coincidir con un origen de `ORIGENES` del lado del Worker, y `ORIGENES` debe incluir el origen donde se sirve la página. Con `api` vacía, el panel trabaja solo con la guía y no hace llamadas a la red.

Comprobar con `GET <dirección>/v1/salud`.

## 6. Aprobar una rúbrica

La IA solo evalúa una pregunta cuya rúbrica en `datos/defensa/rubricas.json` esté `aprobada`. La rúbrica de `p-oe3-parcial` está en `candidata`.

1. Leer la rúbrica contra la tesis. Revisar criterios, alternativas válidas y contradicciones críticas, y editar lo que haga falta.
2. En `datos/defensa/rubricas.json`, cambiar `estado` a `aprobada` y completar `aprobada_por` y `fecha_aprobacion`. Una pregunta con respaldo `pendiente` no puede aprobarse.
3. Regenerar el catálogo, desde la raíz del repositorio:

```bash
python herramientas/catalogo_defensa.py
```

4. Confirmar los dos archivos con un commit (`datos/defensa/rubricas.json` y `datos/defensa/catalogo.json`) y publicar. La versión del catálogo cambia, y los paneles abiertos con la versión anterior reciben `409` hasta que recarguen.

Antes de aprobar rúbricas para uso real, correr la validación del apartado 7.

## 7. Protocolo de validación

Esta es la validación de la propuesta v4. La herramienta `herramientas/validacion_defensa.mjs` calcula las métricas, pero no genera los datos. Los archivos con etiquetas y salidas se guardan fuera del repositorio.

Conjuntos:

- 60 respuestas de ajuste sobre 10 preguntas, para afinar rúbricas y prompt.
- 120 respuestas reservadas sobre otras 20 preguntas, con seis clases por pregunta: `parafrasis`, `breve`, `omision`, `error_critico`, `contradiccion_critica` y `ambiguo`. Dos revisores las etiquetan de forma independiente **antes** de ver la salida del modelo.
- 40 casos de estabilidad, con tres rondas completas cada uno.
- 5 estudiantes que usan la práctica.

Total de la corrida: 280 rondas, es decir 840 llamadas, unos 6.209 Neurons (840 × 7,392). Se reparte en al menos tres ventanas diarias para respetar el tope diario. La lectura humana de resultados y comentarios toma entre 10 y 15 horas.

Umbrales de aceptación:

| Métrica | Umbral |
|---|---|
| Acuerdo con la referencia humana | al menos 102 de 120 |
| Aprobaciones `correcta` en los 40 casos críticos | 0 |
| Ambiguos con abstención | al menos 18 de 20 |
| Comentario fiel a la respuesta | al menos 108 de 120 |
| Citas inventadas | 0 |
| Casos estables en las tres rondas | al menos 36 de 40 |
| Estudiantes que lo encuentran útil | al menos 4 de 5 |
| Latencia p95 de extremo a extremo | 15 s o menos |
| Fallos técnicos sobre solicitudes admitidas | menos de 5 % |

Para calcular lo que sí es automático, desde la raíz del repositorio:

```bash
node herramientas/validacion_defensa.mjs <etiquetas.jsonl> <salidas.jsonl>
```

La herramienta imprime JSON con cada métrica, su umbral y si se cumple. Calcula acuerdo, aprobaciones falsas críticas, abstención en ambiguos, estabilidad, p95 y fallos técnicos, además de cobertura, abstención por `disagreement` y exactitud por pregunta, con la comparación contra una sola lectura a 0,2. Un fallo técnico no cuenta como estable, el p95 mide solo rondas completas y los fallos técnicos se miden sobre las solicitudes admitidas. No calcula el comentario fiel, las citas inventadas ni la opinión de los estudiantes, porque requieren lectura humana. No escribe ningún archivo.

Formato de entrada:

- Etiquetas: una línea por caso, `{"caso","question_id","clase","etiqueta"}`.
- Salidas: una línea por ronda, `{"caso","ronda","lecturas","resultado","ms"}`. `lecturas` son las tres lecturas validadas o `null`, y `resultado` es el del consenso.

## 8. Qué falta y no está probado

Desplegado el 19 de noviembre de 2026: las bases `defensa-oral` y `defensa-oral-preproduccion` con la migración 0001, los Workers `tesis-explain-defensa` y `tesis-explain-defensa-preproduccion` con sus secretos y la limpieza cada 15 minutos. Producción responde en `https://tesis-explain-defensa.valde-transfer.workers.dev` y el sitio ya apunta ahí. Contra el Worker real se comprobaron salud, CORS solo para el sitio, sesiones, `pending_guide`, 401, 404, 409 y, en preproducción, rondas completas con Workers AI.

Las pruebas automáticas (`npm test`) cubren el juez, las cuotas sobre SQLite, los proveedores y la API con proveedores simulados, el catálogo y la herramienta de validación. No se ha probado:

- La concurrencia sobre la base D1 real. Las pruebas automáticas usan un adaptador sobre `node:sqlite`.
- El coste efectivo en Neurons por respuesta, que se debe leer en el panel de Cloudflare.
- El micrófono real en Windows con Edge y Chrome, en Android con Chrome y en iOS con Safari.
- La validación humana del apartado 7: etiquetas, estabilidad, comentarios y estudiantes.
- La aprobación de rúbricas: solo existe la candidata de `p-oe3-parcial`.
- Los archivos de datos de `voz/` (biblioteca, motor y pesos del dictado privado) todavía no están en `main`. Están en la rama local `defensa-oral/voz`, y GitHub bloquea su subida por un falso positivo de la protección de envíos que el dueño debe descartar. Sin ellos, el dictado privado no funciona en el sitio publicado. El código (`js/defensa-voz.js` y `js/defensa-whisper-worker.js`) sí está en `main`.
- El dictado privado con el modelo real se verificó en Chromium sin interfaz, en Windows, con WebAssembly: 8 s de audio en español se transcribieron en unos 3 s y las solicitudes fueron solo al propio sitio. Eso no prueba WebGPU real ni un micrófono real.
- WebGPU real: el dictado solo lo usa si existe un adaptador, y con WebAssembly como respaldo en un Worker nuevo. No se probó con una tarjeta real.
