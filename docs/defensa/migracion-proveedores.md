# Anexo: migración de proveedores y de datos

Este anexo acompaña a la propuesta v4 y a `docs/defensa/README.md`. Dice cómo cambiar de proveedor de IA, de modelo o de base de datos sin perder el control del presupuesto ni la fiabilidad de las correcciones. El contrato HTTP está en `docs/defensa/especificacion.md`, apartado 6.

## 1. Variables por entorno

El Worker lee su configuración de `env` en `servicio/src/index.mjs`. Hay dos entornos: producción y `preproduccion`.

| Variable | Tipo | Valores | Qué hace |
|---|---|---|---|
| `AI_PROVIDER` | variable | `workers_ai`, `fixture`, `disabled` | Elige el proveedor. Cualquier otro valor equivale a `disabled`. `fixture` es solo para pruebas y no llama a ninguna red. |
| `FALLBACK_MODE` | variable | `practice_only` | Valor acordado en la propuesta: si la IA falla, solo queda la práctica con la guía. El código actual no lee esta variable. El único respaldo que existe es la guía que el panel ya tiene cargada. Se deja declarada para que un cambio futuro no la olvide. |
| `ADMISION` | variable | `abierta`, `cerrada` | Con `cerrada`, las evaluaciones nuevas responden `ai_unavailable` sin reservar cupo ni llamar al modelo. Cualquier otro valor se trata como `abierta`. |
| `ORIGENES` | variable | orígenes separados por coma | Orígenes que reciben cabeceras CORS. Por ejemplo, el de GitHub Pages del sitio y el de las pruebas locales. |
| `HMAC_CLAVE` | secreto | cadena aleatoria larga | Firma el contenido de cada respuesta para detectar duplicados y conflictos. |
| `SESION_CLAVE` | secreto | cadena aleatoria larga | Firma los tokens de sesión. |
| `DB` | binding D1 | base `defensa-oral` | Cuotas, duplicados y resultados temporales. |
| `AI` | binding Workers AI | | Solo lo usa `AI_PROVIDER=workers_ai`. |

Si falta `HMAC_CLAVE` o `SESION_CLAVE`, el Worker responde `503` con `causa: "configuracion"` y no atiende nada.

Los secretos se cargan con `npx wrangler secret put` y nunca se escriben en un archivo del repositorio. Producción y preproducción usan claves distintas, así un token de una no sirve en la otra. La preproducción usa su propia base D1, para que sus pruebas no gasten el cupo de producción.

El Worker tiene un solo valor de modelo: `@cf/ibm-granite/granite-4.0-h-micro`, definido en `crearWorkersAI` de `servicio/src/proveedores.mjs`. No hay variable para cambiarlo, a propósito: cambiar de modelo exige una edición revisada, no un ajuste de configuración.

## 2. Cambiar de modelo

Las únicas alternativas que la propuesta deja para validar son Gemma 4 26B A4B IT y Llama 3.3 70B FP8 Fast. Ninguna se usa mientras no pase la validación.

1. Un modelo nuevo cambia los costes, las latencias y los errores. Aunque el contrato JSON de salida sea idéntico, se repite **toda** la validación del apartado 9 de la especificación: 120 respuestas reservadas, 40 casos críticos, ambiguos, estabilidad con tres rondas y p95.
2. Se recalculan la tarifa y el coste reservado (`costeReservado` en `servicio/src/cuotas.mjs`) y se revisa el tope diario de Neurons.
3. Se agrega el modelo como un valor más de `AI_PROVIDER` o como un adaptador nuevo detrás de la interfaz `AIProvider`, con sus propias pruebas.
4. Nunca se cambia solo. Un modelo secundario no entra si el principal falla, porque eso daría evaluaciones sin validar. Un fallo del modelo principal da `ai_unavailable` y la práctica sigue con la guía.

## 3. Migrar los datos fuera de D1

El repositorio de cuotas es la interfaz `QuotaRepository`. Cualquier reemplazo de D1 (otra base, otro servicio) debe pasar las mismas pruebas de concurrencia y recuperación que hoy pasa `crearRepositorioD1` (`servicio/tests/cuotas.test.mjs`) antes de recibir tráfico. Lo que esas pruebas garantizan y el reemplazo debe repetir:

- `reserve` admite o rechaza en una sola operación atómica, sin que dos solicitudes simultáneas superen el cupo del día, de la sesión o de la pregunta.
- Una solicitud repetida con el mismo `request_id` y el mismo contenido devuelve la misma reserva, nunca una nueva.
- Un contenido distinto con el mismo `request_id` da `conflicto`.
- Una escritura ambigua lanza `escritura_ambigua` y no se inicia ninguna llamada al modelo.
- Purgar un resultado no libera cupo del día ni un intento de la sesión.

### 3.1 Orden de la migración

1. Antes de mover nada, poner `ADMISION=cerrada` y esperar a que terminen las rondas en curso (apartado 6). Una ronda tarda como máximo 20 s de plazo más la escritura.
2. Comprobar que no quedan reservas `en_curso` en la base antigua. Las `indeterminada` se conservan, porque su coste ya se reservó.
3. Copiar las sesiones vigentes y las reservas recientes (apartado 5) a la base nueva.
4. Pasar en la base nueva las pruebas de concurrencia y recuperación, y las pruebas del apartado 4.
5. Cambiar el binding en la configuración del Worker, desplegar en preproducción y probar de punta a punta.
6. Abrir con `ADMISION=abierta`.

## 4. Pruebas antes y después

Antes de cualquier cambio, desde la raíz del repositorio:

```bash
npm test
python herramientas/catalogo_defensa.py --comprobar
```

Después de desplegar en preproducción:

1. `GET /v1/salud` devuelve el proveedor y la admisión esperados.
2. Se crea una sesión (`POST /v1/sesiones`) y se envía una evaluación con una pregunta no aprobada: debe responder `pending_guide` sin gastar cupo.
3. Con una rúbrica aprobada en preproducción, se envía la misma evaluación dos veces con el mismo `request_id`: la segunda devuelve el mismo resultado y no suma cupo.
4. Si cambió el modelo o la base, se corre la validación completa (`herramientas/validacion_defensa.mjs`) con etiquetas humanas guardadas fuera del repositorio.

Solo después de que todo pase se despliega en producción y se repite la prueba de salud.

## 5. Qué conservar para no cobrar dos veces

El día de cuota es el día UTC y cambia a las 00:00 UTC. Una reversión o una migración puede repetir una solicitud que ya se cobró. Para evitarlo:

- Conservar las solicitudes recientes: la tabla `reservas` con sus `request_id`, `content_hmac`, `dia_utc` y `coste_reservado`. El registro dura 48 h (`registroMs`), así que se copian al menos las de las últimas 48 h.
- Conservar los saldos UTC del día en curso: el recuento de respuestas y la suma de `coste_reservado` de `dia_utc`. Si la base nueva empieza vacía, el día arranca con cupo completo y el presupuesto se puede pasar.
- Conservar las reservas `indeterminada`, porque la llamada pudo haberse ejecutado aunque no se haya guardado el resultado.
- Si no se pueden copiar, mantener `ADMISION=cerrada` hasta las 00:00 UTC siguientes y abrir con el día limpio.

## 6. Cierre de admisión

`ADMISION=cerrada` es el interruptor para frenar tráfico sin desplegar código. Bloquea las llamadas nuevas: responden `200` con `ai_unavailable` antes de reservar cupo o invocar al modelo. Las rondas que ya fueron admitidas **terminan normalmente**, porque ya reservaron cupo y su resultado se guarda al final. Las sesiones, `GET /v1/salud` y la consulta de resultados (`GET /v1/evaluaciones/<id>`) siguen funcionando.

Para drenar antes de mover cuotas:

1. Poner `ADMISION=cerrada` y desplegar.
2. Esperar al menos un minuto (el plazo de ronda es de 20 s, y `rondaMs` es de 60 s en `LIMITES_POR_DEFECTO`).
3. Comprobar que no quedan reservas `en_curso` con `vence_ronda` en el futuro.
4. Mover los datos.

## 7. Reversión

1. Poner `ADMISION=cerrada` y desplegar.
2. Si el problema es de código, volver al despliegue anterior con `npx wrangler rollback` desde `servicio/`. Si es de datos, restaurar el binding de la base anterior.
3. Antes de reabrir, aplicar el apartado 5: copiar a la base que queda en servicio las reservas hechas desde la migración, para que sus `request_id` y sus costes no se pierdan.
4. Repetir las pruebas del apartado 4 y abrir con `ADMISION=abierta`.

Si el modelo o el proveedor es lo que falla, la salida más rápida no es una reversión: poner `AI_PROVIDER=disabled`. El panel muestra la guía y el servicio no gasta Neurons.
