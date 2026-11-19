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
