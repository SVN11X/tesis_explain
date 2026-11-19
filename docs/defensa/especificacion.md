# Especificación de la práctica de defensa oral con IA

Esta especificación traduce la propuesta v4 (17 de noviembre de 2026) a archivos, interfaces y pruebas. Cada unidad de trabajo cita su apartado. Lo que no aparece aquí no se implementa en el piloto.

Decisiones del dueño del 18 de noviembre de 2026:

- Rúbricas: solo la estructura y la rúbrica de ejemplo de `p-oe3-parcial`, en estado `candidata`. La IA no evalúa ninguna pregunta hasta que una persona apruebe su rúbrica.
- Dictado privado: la biblioteca, el motor y los pesos se sirven desde el propio sitio, en `voz/`. El navegador no pide nada a terceros.
- Acceso: por ahora solo lo usa el dueño, pero la página y el Worker son públicos. No hay invitaciones. Las sesiones son anónimas y los topes diarios protegen el presupuesto.
- Idioma: como el resto del repositorio, nombres, comentarios y textos en español. Los códigos del contrato (`disagreement`, `quota_exhausted` y los demás) y las interfaces `AIProvider` y `QuotaRepository` conservan el nombre de la propuesta.

## 1. Mapa de archivos

| Archivo | Unidad | Qué es |
|---|---|---|
| `herramientas/catalogo_defensa.py` | Catálogo | Lee las tarjetas de `preguntas.html`, une las rúbricas y escribe el catálogo |
| `datos/defensa/rubricas.json` | Catálogo | Rúbricas editoriales por ID de pregunta |
| `datos/defensa/catalogo.json` | Catálogo | Salida generada, con versión |
| `herramientas/catalogo_defensa.test.mjs` | Catálogo | Pruebas del catálogo con `node --test` |
| `servicio/src/juez.mjs` | Juez | Validación de cada lectura y consenso de tres |
| `servicio/src/cuotas.mjs` | Cuotas | `QuotaRepository` sobre D1 |
| `servicio/migraciones/0001_inicial.sql` | Cuotas | Esquema D1 |
| `servicio/src/proveedores.mjs`, `servicio/src/prompt.mjs` | Proveedores | `AIProvider`, adaptadores y ronda de tres lecturas |
| `servicio/src/api.mjs`, `servicio/src/sesion.mjs`, `servicio/src/index.mjs` | API | Contrato HTTP del Worker |
| `servicio/tests/*.test.mjs`, `servicio/tests/sqlite-d1.mjs` | Todas las del servicio | Pruebas con `node --test` |
| `js/defensa-oral.js`, `js/defensa-config.js` | Panel | Panel de práctica en `preguntas.html` |
| `js/defensa-voz.js`, `js/defensa-whisper-worker.js` | Voz | Dictado privado, dictado externo y lectura en voz alta |
| `herramientas/validacion_defensa.mjs` | Validación | Métricas del piloto a partir de etiquetas humanas guardadas fuera del repositorio |
| `docs/defensa/migracion-proveedores.md`, `docs/defensa/README.md` | Documentación | Anexo de migración y guía de operación |

`servicio/wrangler.toml` y el paso de CI que ejecuta `npm test` los agrega el dueño, porque son archivos de despliegue y de flujo de trabajo.

Reglas comunes:

- El servicio es JavaScript ESM puro (`.mjs`), sin dependencias de npm. Así `npm test` (`node --test --experimental-strip-types`) lo prueba sin instalar nada.
- Toda prueba nueva se llama `*.test.mjs` y vive junto a lo que prueba (`servicio/tests/`, `herramientas/`).
- Ningún archivo guarda claves, respuestas de estudiantes, audio ni etiquetas humanas.
- El tiempo que tarda el estudiante nunca entra en la valoración.

## 2. Catálogo y rúbricas

### 2.1 Lectura de las tarjetas

`herramientas/catalogo_defensa.py` define `leer_tarjetas(soup)`, que recorre `details.pregunta` de `preguntas.html` **antes** de cualquier transformación y devuelve, en el orden de la página, una lista de diccionarios:

```json
{"id": "p-oe3-parcial", "tema": "objetivos", "enunciado": "El OE3 incluye navegación autónoma. ¿Por qué lo declara cumplido solo en parte?",
 "dificultad": "tecnica", "respaldo": "guia", "referencia": "Tabla 5.5 y Conclusiones, OE3 1.",
 "guia": "Porque sus partes quedaron con distinto nivel de evidencia. …", "enlace": "resultados.html#palabras"}
```

- `tema` es `data-tema` de la `section.q-tema` que la contiene. `dificultad` es `data-dificultad`. `respaldo` es `data-respuesta` (`guia` o `pendiente`).
- `enunciado` es el texto de `.q-t`. `referencia` es el texto de `.q-respaldo` sin el rótulo en negrita. `enlace` es el `href` del primer enlace de `.q-ver`, o `null`.
- `guia` es el texto plano de `.q-cuerpo` sin `.q-respaldo` ni `.q-ver`, con espacios normalizados.

`herramientas/descarga_preguntas.py` debe reutilizar `leer_tarjetas` para obtener `id`, `titulo` (el enunciado) y `nivel` de cada tarjeta, y seguir usando su propio `absolutos()` solo para el HTML del cuerpo. El PDF no cambia: `python herramientas/descarga_preguntas.py --comprobar` sigue pasando sin regenerar nada.

### 2.2 Rúbricas

`datos/defensa/rubricas.json`:

```json
{
  "version_esquema": 1,
  "rubricas": {
    "p-oe3-parcial": {
      "estado": "candidata",
      "aprobada_por": null,
      "fecha_aprobacion": null,
      "version": 1,
      "fuente": {"referencia": "Tabla 5.5 y Conclusiones, OE3", "enlace": "resultados.html#palabras"},
      "criterios": [
        {"id": "C1", "tipo": "esencial", "texto": "El mapeo y la localización mientras se construye el mapa quedaron verificados en el robot real.", "fuente": "resultados.html#palabras"},
        {"id": "C2", "tipo": "esencial", "texto": "La navegación solo quedó verificada en funcionamiento: faltó medir con números su desempeño al alcanzar destinos.", "fuente": "resultados.html#palabras"}
      ],
      "alternativas_validas": [
        "Decir que Nav2 llevó al robot hacia las metas del explorador, pero que no se midió con qué precisión llegaba, cumple C2.",
        "Omitir la distancia recorrida o el número de corridas no resta."
      ],
      "contradicciones_criticas": [
        {"id": "X1", "texto": "Afirmar que se probó con destinos fijos y se midió el error final de posición.", "fuente": "preguntas.html#p-metas-fijas"}
      ],
      "permite_incorrecta_ajena": true
    }
  }
}
```

- `estado` es `candidata`, `aprobada` o `suspendida`. Solo `aprobada` permite invocar al modelo, y exige `aprobada_por` y `fecha_aprobacion` no nulos.
- Una pregunta con `respaldo` `pendiente` (hoy `p-giro` y `p-frontera-minima`) nunca puede tener una rúbrica `aprobada`.
- Cada `fuente` es una ruta relativa del sitio con ancla, y su archivo existe.

### 2.3 Catálogo generado

`python herramientas/catalogo_defensa.py` escribe `datos/defensa/catalogo.json`:

```json
{"version": "a1b2c3d4e5f6", "total": 106, "pendientes": ["p-giro", "p-frontera-minima"],
 "preguntas": [{"id": "…", "tema": "…", "enunciado": "…", "dificultad": "…", "respaldo": "…", "referencia": "…", "guia": "…", "enlace": "…",
                "rubrica": null, "evaluable": false}]}
```

- `rubrica` es la rúbrica de 2.2 o `null`. `evaluable` es `true` solo con respaldo `guia` y rúbrica `aprobada`.
- `version` son los primeros 12 caracteres hexadecimales del SHA-256 del JSON canónico (`sort_keys`, sin espacios) de `preguntas`. Cubre contenido y rúbrica.
- El archivo se escribe con `ensure_ascii=False`, `indent=1` y salto de línea final. Generarlo dos veces da bytes idénticos.
- `--comprobar` no escribe: compara con el archivo y termina con código 1 si difiere.
- Validaciones que terminan con código 1 y un mensaje: ID duplicado, rúbrica de un ID que no existe, rúbrica `aprobada` en una pregunta pendiente o sin `aprobada_por`, fuente cuyo archivo no existe, total distinto de 106.

## 3. Juez: lecturas y consenso

`servicio/src/juez.mjs` exporta funciones puras.

### 3.1 Salida que se pide al modelo

```json
{"veredicto": "correcta|parcial|incorrecta|indeterminada",
 "observaciones": [{"criterio": "C1", "estado": "presente|ausente|contradicho", "evidencia": "fragmento literal o null"}],
 "pista": "una frase para mejorar o null"}
```

Hay una observación por cada criterio esencial y por cada contradicción crítica de la rúbrica. `ausente` lleva `evidencia: null`, así una omisión se marca sin fabricar una cita.

### 3.2 `validarLectura(salida, rubrica, textoConfirmado)`

Devuelve `{valida: true, veredicto, veredictoModelo, coherente, observaciones, pista}` o `{valida: false, motivo}`. Es inválida si:

- falta un campo, sobra una clave, o un valor no es de los enumerados;
- una observación cita un criterio que no está en la rúbrica, o falta la observación de un criterio;
- una evidencia no es un fragmento literal de `textoConfirmado` (comparación exacta tras normalizar espacios), mide más de 300 caracteres, o es `null` con estado `presente` o `contradicho`. El motivo agrega, sin contenido, el tipo de diferencia: puntuación o comillas en los bordes, mayúsculas o tildes, o palabras distintas.

El veredicto de una lectura válida lo calcula el servidor con `veredictoPorReglas`, a partir de los criterios, como dice la propuesta: «El servidor calcula un veredicto por lectura con las mismas reglas y después comprueba el consenso». El modelo solo decide por su cuenta abstenerse: si su etiqueta es `indeterminada`, la lectura queda `indeterminada`. `veredictoModelo` guarda la etiqueta del modelo y `coherente` dice si coincidía con las reglas, para medirlo en la validación y en el registro técnico.

### 3.3 `veredictoPorReglas(observaciones, rubrica, hayContenidoPertinente)`

En este orden:

1. Alguna contradicción crítica `contradicho` con evidencia: `incorrecta`.
2. Todos los esenciales `presente`: `correcta`.
3. Algún esencial `presente`, o contenido pertinente, con algo que falta: `parcial`.
4. Nada pertinente: respuesta claramente ajena a la pregunta, `incorrecta` si `rubrica.permite_incorrecta_ajena`, si no `indeterminada`.

Un esencial `contradicho` cuenta como ausente. `hayContenidoPertinente` es verdadero si alguna observación tiene evidencia, por ejemplo un esencial contradicho. Así una respuesta como «El robot avanzó durante las pruebas» es `parcial`.

### 3.4 `consenso(lecturas)`

Recibe tres elementos, cada uno el resultado de `validarLectura` o `null` si la llamada falló o venció. Devuelve:

| Lecturas | Resultado |
|---|---|
| Alguna `null` o inválida | `{estado: "no_evaluable", causa: "ai_unavailable"}` |
| Veredictos distintos | `{estado: "no_evaluable", causa: "disagreement"}` |
| Tres `indeterminada` | `{estado: "no_evaluable", causa: "insufficient_evidence"}` |
| Mismo veredicto, pero un criterio con estados distintos entre lecturas | `{estado: "no_evaluable", causa: "disagreement"}` |
| Mismo veredicto y mismos estados | `{estado: "evaluada", veredicto, observaciones, pista}` |

En `evaluada`, `observaciones` lleva por criterio el estado común y la evidencia de la lectura a temperatura 0,2. `pista` es la de esa misma lectura.

`votoUnico(lectura)` devuelve el veredicto de una sola lectura con las mismas reglas, para la comparación de la validación.

## 4. Cuotas y duplicados en D1

### 4.1 Esquema `servicio/migraciones/0001_inicial.sql`

```sql
CREATE TABLE sesiones (id TEXT PRIMARY KEY, creada INTEGER NOT NULL, vence INTEGER NOT NULL);
CREATE TABLE reservas (
  session_id TEXT NOT NULL, request_id TEXT NOT NULL, question_id TEXT NOT NULL, content_hmac TEXT NOT NULL,
  dia_utc TEXT NOT NULL, modo TEXT NOT NULL CHECK (modo IN ('entrenar','simular')),
  estado TEXT NOT NULL CHECK (estado IN ('en_curso','completa','indeterminada','purgada')),
  coste_reservado REAL NOT NULL, llamadas_reservadas INTEGER NOT NULL DEFAULT 3,
  creada INTEGER NOT NULL, vence_ronda INTEGER NOT NULL, vence_resultado INTEGER, vence_registro INTEGER NOT NULL,
  resultado TEXT,
  PRIMARY KEY (session_id, request_id));
CREATE INDEX reservas_dia ON reservas (dia_utc);
CREATE INDEX reservas_sesion_pregunta ON reservas (session_id, question_id);
CREATE INDEX reservas_vence ON reservas (vence_registro);
```

Los tiempos son milisegundos UTC. `resultado` guarda solo códigos y rangos del resultado (estado, causa, veredicto, ID de criterios y sus estados), nunca la respuesta ni el audio.

### 4.2 `crearRepositorioD1(db, limites)` en `servicio/src/cuotas.mjs`

`db` es un binding D1 (`prepare(sql).bind(...).first()/run()/all()`, `batch`). `limites` trae `respuestasDia` (100), `neuronsDia` (7000), `intentosEntrenar` (2), `intentosSimular` (1), `respuestasSesion` (6), `rondaMs` (60 000), `resultadoMs` (30 min), `registroMs` (48 h).

Devuelve un objeto con la interfaz `QuotaRepository`:

- `reserve({sessionId, requestId, questionId, contentHmac, modo, coste, ahora})`. Una sola sentencia `INSERT INTO reservas … SELECT … WHERE …  ON CONFLICT DO NOTHING RETURNING request_id` comprueba a la vez: la sesión existe y no venció, los intentos de la sesión en esa pregunta según el modo, las respuestas de la sesión, las reservas del día UTC y la suma de `coste_reservado` del día más `coste`. Si devuelve fila: `{tipo: "admitida"}`. Si no, una lectura en la base primaria por `(session_id, request_id)` decide:
  - existe con el mismo `content_hmac`: `{tipo: "duplicada", estado, resultado}`; si `estado` es `purgada`: `{tipo: "caducada"}`;
  - existe con otro `content_hmac`: `{tipo: "conflicto"}`;
  - no existe: `{tipo: "sin_cupo", motivo: "sesion|pregunta|dia"}`, con el motivo que falló.
- `complete({sessionId, requestId, resultado, ahora})`: guarda `resultado` como JSON, `estado = 'completa'` y `vence_resultado = ahora + resultadoMs`.
- `marcarIndeterminada({sessionId, requestId})`: la reserva y su coste se conservan.
- `getResult({sessionId, requestId})`: exige los dos campos y devuelve `{estado, resultado}` o `null`.
- `cleanupExpired({ahora, lote})`: en lotes de `lote` filas, pasa a `purgada` y borra `resultado` donde venció `vence_resultado`, y borra las filas con `vence_registro` vencido. Purgar un resultado no libera cupo del día ni un intento de la sesión.
- `crearSesion({id, ahora, duracionMs})` y `sesionValida({id, ahora})`.

Un fallo de escritura o un resultado ambiguo lanza `Error` con `codigo = "escritura_ambigua"`, y la API no inicia inferencias.

### 4.3 Coste reservado

`costeReservado(caracteresPrompt, tarifa)` = 3 × (⌈caracteresPrompt / 2⌉ × entrada + 500 × salida) ÷ 1 000 000 Neurons, con la tarifa publicada del modelo en uso y un tope de 500 tokens de salida. Sin tarifa usa la de Granite 4.0 H Micro (1 542 y 10 158), que con 1 500 tokens de entrada da 22,176 por respuesta, como la propuesta. Con Gemma 4 26B A4B (9 091 y 27 273) da 81,82, así que el tope interno de 7 000 Neurons admite unas 85 respuestas al día.

### 4.4 Adaptador de pruebas

`servicio/tests/sqlite-d1.mjs` exporta `crearD1(ruta = ":memory:")`, que envuelve `node:sqlite` (`DatabaseSync`) con la misma forma que D1: `prepare(sql)` devuelve un objeto con `bind(...valores)` y los métodos asíncronos `first()`, `run()` (devuelve `{meta: {changes}}`) y `all()` (devuelve `{results}`), y `batch(sentencias)`. Aplica la migración `0001_inicial.sql` al crearse.

## 5. Proveedores y ronda de tres lecturas

`servicio/src/proveedores.mjs`:

- Interfaz `AIProvider`: `evaluate({mensajes, temperatura, maxTokens, esquema})` devuelve el texto de la respuesta, y `healthCheck()` devuelve `{ok, modelo}`.
- `MODELOS` lista los modelos que el dueño puede elegir, con su tarifa publicada y sus opciones: Granite 4.0 H Micro, Gemma 4 26B A4B (con `chat_template_kwargs: {enable_thinking: false}`, porque si razona gasta los 500 tokens y se corta sin responder) y Llama 3.3 70B FP8 Fast.
- `crearWorkersAI(ai, modelo = "@cf/ibm-granite/granite-4.0-h-micro")` llama `ai.run(modelo, {...opciones, messages, temperature, max_tokens, response_format: {type: "json_schema", json_schema: esquema}})`. Lee el texto de `respuesta.response` o, en los modelos con formato de OpenAI como Granite y Gemma, de `choices[0].message.content`. Si llega un objeto, lo serializa. Sin texto lanza un error que dice, sin contenido, por qué terminó, cuántos tokens usó y si hubo razonamiento.
- `crearFixture(guion)` devuelve respuestas preparadas por temperatura y simula demora, desacuerdo, indisponibilidad y JSON mal formado sin red.
- `crearDesactivado()`: `evaluate` lanza un error con `codigo = "ai_unavailable"`.
- `crearProveedor(env)` elige por `env.AI_PROVIDER`: `workers_ai`, `fixture` o `disabled`. Cualquier otro valor equivale a `disabled`. Con `workers_ai`, `env.AI_MODELO` elige uno de `MODELOS` (Granite si falta). Un ID fuera de la lista desactiva la IA. Ningún otro modelo se elige solo si el elegido falla, y cada cambio de modelo exige repetir la validación.
- `evaluarConProveedor(proveedor, {rubrica, pregunta, texto}, {temperaturas = [0.1, 0.2, 0.3], plazoMs = 20000})` hace exactamente tres llamadas en paralelo, una por temperatura, con el mismo prompt. Cada una que falla, vence o no es JSON da `null`. Devuelve `{lecturas: [tres elementos validados con validarLectura o null], tecnico: {fallos, vencidas, malformadas}, detalle}`, con el motivo de cada lectura para el registro técnico.

`servicio/src/prompt.mjs` exporta `construirMensajes({rubrica, pregunta, texto})` y `ESQUEMA_SALIDA`. El mensaje de sistema explica las reglas de 3.3, enumera los criterios con su ID, pide copiar la evidencia carácter por carácter y termina con un JSON de ejemplo armado con los ID de la rúbrica. El texto del estudiante va en el mensaje de usuario, entre las marcas `<<<RESPUESTA` y `RESPUESTA>>>`, y el sistema avisa que es material a evaluar, no instrucciones.

### 5.1 Medición de desarrollo del 19 de noviembre de 2026

No es la validación de la sección 9: son 6 casos sintéticos sobre `p-oe3-parcial`, en preproducción y con la rúbrica aprobada solo para la prueba. Los casos son las tres respuestas ilustrativas de la propuesta, una paráfrasis correcta, una respuesta ajena y una que solo cumple C1.

| Modelo | Veredicto esperado | Lecturas válidas | Tiempo por respuesta |
|---|---|---|---|
| Granite 4.0 H Micro | 1 de 6 (marcó `parcial` una contradicción crítica) | 10 de 18 | 5 a 8 s |
| Gemma 4 26B A4B, sin razonamiento | 6 de 6 | 18 de 18 | 3 s |

Por eso la configuración usa Gemma 4. Antes de aprobar una rúbrica se ejecuta la validación de la sección 9 con ese modelo.

## 6. Contrato HTTP del Worker

`servicio/src/index.mjs` exporta `{fetch, scheduled}` y arma las dependencias desde `env`: `env.DB` (D1), `env.AI`, `env.AI_PROVIDER`, `env.FALLBACK_MODE` (`practice_only`), `env.ADMISION` (`abierta` o `cerrada`), `env.ORIGENES` (orígenes permitidos separados por coma), `env.HMAC_CLAVE` y `env.SESION_CLAVE` (secretos). Importa el catálogo con `import catalogo from "../../datos/defensa/catalogo.json" with { type: "json" }`. `scheduled` llama `cleanupExpired` con lotes de 200.

`servicio/src/api.mjs` exporta `crearApi({repo, proveedor, catalogo, claves, config, reloj})` con un método `manejar(request)`, para probarlo sin Workers.

### 6.1 Rutas

- `OPTIONS *`: CORS solo para los orígenes de `ORIGENES`, métodos `GET, POST`, cabeceras `content-type, authorization`. Las respuestas con CORS incluyen `Access-Control-Expose-Headers: Retry-After`, porque el panel lee esa cabecera en un `429`.
- `POST /v1/sesiones`: crea una sesión anónima de dos horas. Responde `201 {token, vence}`. `token` es `id.vence.firma`, con `id` de 128 bits aleatorios en hexadecimal, `vence` en milisegundos UTC y `firma` el HMAC-SHA-256 de `id.vence` con `SESION_CLAVE`, en base64url. El vencimiento va dentro del token para que el Worker compruebe la firma sin leer la base, aunque igual verifica que la fila de la sesión exista (`servicio/src/sesion.mjs`, con `crypto.subtle`).
- `POST /v1/evaluaciones`, con `Authorization: Bearer <token>` y cuerpo `{request_id, question_id, version_catalogo, modo, respuesta}`.
- `GET /v1/evaluaciones/<request_id>`, con el mismo token: estado de un intento. Devuelve `fragmento: null` en cada criterio, porque el resultado guardado conserva solo códigos y posiciones, nunca el texto del estudiante. Un `POST` repetido sí reconstruye el fragmento con el texto que recibe.
- `GET /v1/salud`: `{proveedor, admision, version_catalogo}` sin datos de nadie.

### 6.2 `POST /v1/evaluaciones`, en este orden

1. Cuerpo de más de 16 KiB: `413`. JSON inválido, campos que faltan, `modo` distinto de `entrenar` o `simular`, `request_id` que no es un UUID, o `respuesta` vacía o de más de 4 000 caracteres: `400`.
2. Token ausente, mal firmado o vencido: `401`.
3. `question_id` que no está en el catálogo: `404`. `version_catalogo` distinta de la del catálogo: `409` con `causa: "version"`.
4. Pregunta sin `evaluable` (pendiente o sin rúbrica aprobada): `200` con `estado: "no_evaluable", causa: "pending_guide"`, sin reservar ni invocar.
5. `AI_PROVIDER` desactivado o `ADMISION` cerrada: `200` con `causa: "ai_unavailable"`, sin reservar ni invocar.
6. `content_hmac` = HMAC-SHA-256 con `HMAC_CLAVE` de `question_id`, versión y texto confirmado. `repo.reserve(...)`:
   - `duplicada` en curso: `202 {estado: "en_curso"}`; `duplicada` completa: `200` con el resultado guardado; `caducada`: `410`; `conflicto`: `409` con `causa: "contenido"`;
   - `sin_cupo`: `429` con `estado: "no_evaluable", causa: "quota_exhausted"` y, si el motivo es el día, `Retry-After` con los segundos hasta las 00:00 UTC;
   - error `escritura_ambigua`: `503` con `causa: "ai_unavailable"` y cero llamadas.
7. Admitida: `evaluarConProveedor`, `consenso`, `repo.complete`. Responde `200` con `evaluada` o `no_evaluable`. Si la ronda vence, `marcarIndeterminada` y `200` con `causa: "ai_unavailable"`.

Toda respuesta JSON lleva `request_id`, `question_id`, `version_catalogo` y, si aplica, `version_rubrica`, y nunca devuelve la respuesta del estudiante. Un fallo técnico nunca se convierte en `incorrecta` ni dispara otra ronda.

### 6.3 Respuesta `evaluada`

```json
{"estado": "evaluada", "veredicto": "parcial", "request_id": "…", "question_id": "p-oe3-parcial", "version_catalogo": "…", "version_rubrica": 1,
 "criterios": [{"id": "C1", "estado": "presente", "texto": "…", "fragmento": "…", "fuente": "resultados.html#palabras"}],
 "acierto": "C1", "mejorar": "C2", "pista": "…"}
```

`acierto` es el primer criterio presente y `mejorar` el primero ausente o contradicho, o `null`.

## 7. Panel en `preguntas.html`

### 7.1 Punto de entrada

- Un botón `#q-defensa`, «Practicar defensa oral», va en la fila de acciones de `#q-herramientas`, fuera del bloque entre los comentarios `DESCARGA PREGUNTAS` y fuera de las tarjetas.
- `js/defensa-config.js` es la única configuración pública: `window.DEFENSA_CONFIG = {api: ""}`. Con `api` vacía, el panel trabaja solo con la guía. Nunca guarda claves.
- `js/preguntas.js` carga `js/defensa-oral.js` la primera vez que se pulsa el botón (un `<script>` creado al vuelo) y llama `window.DefensaOral.abrir({preguntas, origen})`, donde `preguntas` son las tarjetas visibles con los filtros actuales. Los filtros, la búsqueda, la descarga, los enlaces `#p-…` y el modo práctica siguen igual.
- `js/defensa-oral.js` resuelve sus recursos relativos a la página, así funciona bajo `/tesis_explain/`. Lee `datos/defensa/catalogo.json` solo al abrir, para la versión y la lista de evaluables.

### 7.2 Panel

- Es un `<dialog>` con `aria-labelledby`, abierto con `showModal()`. Escape y el botón «Cerrar» lo cierran y el foco vuelve a `#q-defensa`. El desplazamiento de la página no cambia.
- Primer paso: elegir **Entrenar** (una pregunta) o **Simular** (tres distintas). Elegibles son las tarjetas visibles con `data-respuesta="guia"`. Si en Simular hay menos de tres, el panel dice cuántas hay y ofrece «Ampliar a todos los temas» (quita solo el filtro de tema) o «Practicar con N».
- Cada pregunta muestra el enunciado, un `<textarea>` con su `<label>`, los controles de voz de la unidad Voz y el botón «Revisar antes de enviar». La revisión muestra el texto tal cual y ofrece «Confirmar» o «Seguir editando». Junto al envío siempre está «Seguir solo con la guía».
- Sin API, con la pregunta no evaluable, o tras un fallo, el panel muestra la guía de esa pregunta: una copia del `.q-cuerpo` de la tarjeta ya cargada en la página.
- **Entrenar**: con veredicto, muestra lo acertado (`acierto`), un aspecto que mejorar (`mejorar`) y la pista, con enlaces a las fuentes. Permite un segundo intento. «Ver la respuesta de la guía» revela la guía y marca los intentos siguientes como «práctica asistida».
- **Simular**: un envío por pregunta. Al confirmar la tercera, solicita las tres evaluaciones y muestra los comentarios juntos. Señala cuáles recibieron evaluación y ofrece la guía de las demás.
- El estado vive en memoria. Lo escrito no se guarda en el navegador.

### 7.3 Cliente del contrato

- Crea la sesión con `POST /v1/sesiones` la primera vez que envía y guarda el token en memoria.
- Cada envío lleva un `request_id` de `crypto.randomUUID()`. El botón se desactiva mientras espera, así un doble clic no envía dos veces.
- `200 evaluada`: muestra el veredicto. `200 no_evaluable`: explica la causa en palabras (`disagreement`: «Las tres lecturas no coincidieron», `insufficient_evidence`, `pending_guide`: «Pendiente de confirmación», `ai_unavailable`, `quota_exhausted`) y ofrece la guía o reformular.
- `202`: consulta `GET /v1/evaluaciones/<id>` cada 2 s, hasta 30 s. `409`: explica el conflicto. `410`: «La corrección caducó». `429`: cupo agotado, con la hora de reinicio si llega `Retry-After`.
- `5xx`, red caída o JSON inválido: abre la guía ya cargada y conserva el borrador.

### 7.4 Accesibilidad

Teclado completo y foco visible, anuncios en una región `role="status"`, los dos temas con los colores de `css/marco.css`, 200 % de zoom y 320 px de ancho sin desplazamiento horizontal, y movimiento reducido. Los estilos van en `css/preguntas.css`.

## 8. Voz

### 8.1 Controles

`js/defensa-voz.js` expone `window.DefensaVoz.montar({textarea, enunciado, contenedor})`, que agrega a cada pregunta del panel:

- «Escuchar pregunta», con `speechSynthesis`: elige una voz `es` con `localService === true`, también si la lista llega después con `voiceschanged`. Si no hay, el botón queda oculto y la pregunta sigue visible. Se detiene con «Detener lectura» y antes de cualquier dictado.
- «Dictar en este navegador» (dictado privado, 8.2).
- «Dictado externo», solo si existe `SpeechRecognition` o `webkitSpeechRecognition`. Antes de iniciar muestra: «El audio puede procesarse en servidores del proveedor de tu navegador», con «Aceptar y dictar» y «Seguir escribiendo». Rechazar no crea ningún reconocedor. La elección, la versión del aviso (`1`) y la hora quedan en memoria durante la sesión.

Los controles se detienen por separado. El dictado agrega texto al `<textarea>`, nunca lo reemplaza, y el estudiante corrige antes de confirmar. Si el micrófono se niega o algo falla, el panel vuelve a texto sin recargar.

### 8.2 Dictado privado

- Antes de descargar, muestra el tamaño real leído de `voz/manifiesto.json` (`bytes_total`, 71,1 MB) y pide confirmación. Muestra el progreso de la descarga y permite cancelar en cualquier momento. Recién al terminar pide el micrófono.
- `js/defensa-whisper-worker.js` es un Web Worker de módulo: importa `../voz/transformers/transformers.min.js`, fija `env.allowRemoteModels = false`, `env.localModelPath` a la ruta de `voz/` desde la raíz del sitio (`new URL("../voz/", self.location.href).pathname`, no una URL absoluta, porque con una URL absoluta la biblioteca no comprueba los archivos locales y da por perdidos `tokenizer_config.json` y `preprocessor_config.json`) y `env.backends.onnx.wasm.wasmPaths` a `voz/ort/`. Crea `pipeline("automatic-speech-recognition", "whisper-tiny", {dtype: "q8", device})`, primero con `device: "webgpu"` solo si `navigator.gpu.requestAdapter()` devuelve un adaptador. Si aun así falla, el Worker envía `{tipo: "reintentar", dispositivo: "wasm"}` y la pestaña lo termina y crea uno nuevo con `dispositivo: "wasm"`, porque la biblioteca recuerda la carga fallida y el respaldo en el mismo Worker falla igual. Transcribe con `language: "spanish", task: "transcribe"`.
- El audio se graba con `getUserMedia`, se convierte a 16 kHz mono en la pestaña y se envía al Worker como `Float32Array` transferible. Al terminar o salir: detiene las pistas del micrófono, cierra el `AudioContext`, libera los buffers y conserva solo el texto.
- Mensajes del Worker: `{tipo: "progreso", cargado, total}`, `{tipo: "listo", dispositivo}`, `{tipo: "reintentar", dispositivo: "wasm"}`, `{tipo: "texto", texto}`, `{tipo: "error", mensaje}`.
- Con memoria insuficiente, dictado lento o descarga cancelada, la pregunta y lo escrito se mantienen y el panel ofrece escribir o el dictado externo.

## 9. Validación del piloto

`herramientas/validacion_defensa.mjs` lee dos archivos JSONL que viven **fuera** del repositorio (rutas por argumento): las etiquetas humanas (`{caso, question_id, clase, etiqueta}`, con `clase` entre `parafrasis`, `breve`, `omision`, `error_critico`, `contradiccion_critica` y `ambiguo`) y las salidas del servicio (`{caso, ronda, lecturas, resultado, ms}`). Calcula e imprime en JSON, con su umbral y si se cumple:

- acuerdo con la referencia humana (meta ≥ 102 de 120) y matriz por clase con abstención;
- aprobaciones `correcta` en los 40 casos críticos (meta 0);
- abstención en ambiguos (meta ≥ 18 de 20);
- estabilidad: casos con igual resultado en las tres rondas (meta ≥ 36 de 40), sin contar un fallo técnico como estable;
- p95 de extremo a extremo de los completos (meta ≤ 15 s) y fallos técnicos sobre admitidos (meta < 5 %);
- cobertura, abstención por `disagreement`, exactitud entre evaluadas y la comparación con el voto a 0,2 (`votoUnico`), por pregunta.

Nunca escribe en el repositorio. Sin argumentos imprime su uso.

## 10. Lo que queda para el dueño

- Crear la base D1 y el Worker en Cloudflare, agregar `servicio/wrangler.toml` con el `database_id` real, cargar `HMAC_CLAVE` y `SESION_CLAVE` con `wrangler secret put`, aplicar la migración y desplegar.
- Agregar `npm test` a `.github/workflows/verificar.yml`.
- Aprobar o editar la rúbrica de `p-oe3-parcial` y redactar las demás.
- Ejecutar la validación con etiquetas humanas, las pruebas con micrófono real en Windows (Edge y Chrome), Android (Chrome) e iOS (Safari) y la prueba de privacidad del dictado.
