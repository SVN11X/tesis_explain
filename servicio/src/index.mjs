// Entrada del Worker (especificación, apartado 6). Arma las dependencias desde `env`.
import catalogo from "../../public/datos/defensa/catalogo.json" with { type: "json" };
import { crearApi } from "./api.mjs";
import { crearRepositorioD1 } from "./cuotas.mjs";
import { crearProveedor } from "./proveedores.mjs";

export function construirApi(env, reloj = () => Date.now(), catalogoUsado = catalogo) {
  return crearApi({
    repo: crearRepositorioD1(env.DB),
    proveedor: crearProveedor(env),
    catalogo: catalogoUsado,
    claves: { hmac: env.HMAC_CLAVE, sesion: env.SESION_CLAVE },
    config: { aiProvider: env.AI_PROVIDER, admision: env.ADMISION, origenes: env.ORIGENES },
    reloj,
  });
}

export default {
  async fetch(request, env) {
    if (!env.HMAC_CLAVE || !env.SESION_CLAVE) {
      return new Response(JSON.stringify({ estado: "error", causa: "configuracion" }), {
        status: 503,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
    return construirApi(env).manejar(request);
  },

  async scheduled(_evento, env) {
    await crearRepositorioD1(env.DB).cleanupExpired({ ahora: Date.now(), lote: 200 });
  },
};
