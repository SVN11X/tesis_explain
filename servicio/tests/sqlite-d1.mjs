// Adaptador de pruebas con la forma del binding D1, sobre node:sqlite.
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

const MIGRACION = new URL("../migraciones/0001_inicial.sql", import.meta.url);

export function crearD1(ruta = ":memory:") {
  const bd = new DatabaseSync(ruta);
  bd.exec(readFileSync(MIGRACION, "utf8"));

  function sentencia(sql, valores = []) {
    return {
      bind: (...nuevos) => sentencia(sql, nuevos),
      async first() {
        return bd.prepare(sql).get(...valores) ?? null;
      },
      async run() {
        const r = bd.prepare(sql).run(...valores);
        return { success: true, meta: { changes: Number(r.changes) } };
      },
      async all() {
        return { results: bd.prepare(sql).all(...valores) };
      },
    };
  }

  return {
    prepare: (sql) => sentencia(sql),
    async batch(sentencias) {
      const salida = [];
      bd.exec("BEGIN");
      try {
        for (const s of sentencias) salida.push(await s.run());
        bd.exec("COMMIT");
      } catch (e) {
        bd.exec("ROLLBACK");
        throw e;
      }
      return salida;
    },
    close: () => bd.close(),
  };
}
