// Sesiones anónimas y firmas HMAC (especificación, 6.1). Solo usa crypto.subtle.
// Formato del token: `id.vence.firma`. La firma es el HMAC-SHA-256 de `id.vence` en base64url.
// El vencimiento va dentro del token para poder firmarlo y comprobarlo sin consultar la base.

const codificador = new TextEncoder();

function aBase64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function importar(clave) {
  return crypto.subtle.importKey("raw", codificador.encode(clave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

/** HMAC-SHA-256 de `texto` con `clave`, en base64url. */
export async function hmacBase64url(clave, texto) {
  const firma = await crypto.subtle.sign("HMAC", await importar(clave), codificador.encode(texto));
  return aBase64url(new Uint8Array(firma));
}

/** Comparación en tiempo constante respecto al contenido (la longitud sí se puede deducir). */
export function igualesConstante(a, b) {
  const x = codificador.encode(String(a));
  const y = codificador.encode(String(b));
  let diferencia = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diferencia |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diferencia === 0;
}

/** Id de 128 bits aleatorios en hexadecimal. */
export function idAleatorio() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Crea el token de una sesión que vence en `vence` (ms UTC). */
export async function firmarToken({ id, vence }, clave) {
  const firma = await hmacBase64url(clave, `${id}.${vence}`);
  return `${id}.${vence}.${firma}`;
}

/**
 * Comprueba firma y vencimiento. Devuelve `{id, vence}` o `null` si falta, está mal firmado o venció.
 * @param {string|null|undefined} token
 */
export async function verificarToken(token, clave, ahora) {
  if (typeof token !== "string") return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const [id, vence, firma] = partes;
  if (!/^[0-9a-f]{32}$/.test(id) || !/^\d{1,15}$/.test(vence)) return null;
  const esperada = await hmacBase64url(clave, `${id}.${vence}`);
  if (!igualesConstante(firma, esperada)) return null;
  if (Number(vence) <= ahora) return null;
  return { id, vence: Number(vence) };
}
