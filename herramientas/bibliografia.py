"""Bibliografía de la tesis: valida datos/bibliografia.json y genera tres salidas.

  * El contenido de bibliografia.html, entre los comentarios BIBLIOGRAFIA y FIN BIBLIOGRAFIA: una
    sección por grupo, con su explicación y la lista plegable de sus referencias. Cada referencia es una
    línea de resumen que se abre con cinco bloques: Ficha, De qué trata, Relación con la tesis,
    Referencias relacionadas y Cita.
  * La introducción de recursos.html, entre BIBLIOGRAFIA RESUMEN y FIN BIBLIOGRAFIA RESUMEN.
  * datos/bibliografia.bib, la bibliografía completa en BibTeX.

Lo usa herramientas/datos.py. No requiere bibliotecas externas.
"""
import html, json, os, re

SEPARADOR = re.compile(r';|\s[-–—]\s|–|—')
MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
ETIQUETA_MEDIO = {
    'revista': 'Revista', 'congreso': 'Congreso', 'libro': 'Libro', 'capitulo': 'Libro', 'sitio': 'Sitio',
    'documentacion': 'Documentación', 'repositorio': 'Repositorio', 'preprint': 'Publicado en', 'video': 'Plataforma',
    'tienda': 'Tienda', 'datos': 'Sitio', 'norma': 'Serie', 'modelo': 'Sitio', 'codigo': 'Repositorio',
    'informe': 'Serie',
}
TIPO_BIBTEX = {
    'revista': 'article', 'congreso': 'inproceedings', 'libro': 'book', 'capitulo': 'inbook', 'sitio': 'online',
    'documentacion': 'online', 'repositorio': 'software', 'preprint': 'online', 'video': 'video', 'tienda': 'online',
    'datos': 'online', 'norma': 'online', 'modelo': 'online', 'codigo': 'software', 'informe': 'report',
}
OBLIGATORIOS = ('n', 'tipo', 'autor', 'resumen', 'cita', 'ficha', 'partes', 'contenido', 'relacion', 'diferencia', 'tesis', 'relacionadas')
FICHA_OBLIGATORIOS = ('titulo', 'autores', 'fecha', 'medio', 'idioma', 'acceso', 'revision', 'palabras_clave', 'procedencia')
# Extensión de la explicación de cada referencia, en palabras: los párrafos de «De qué trata» y de «Relación con
# la tesis», la diferencia, el código y los textos de las referencias relacionadas. La ficha y la cita no cuentan.
MIN_PALABRAS, MAX_PALABRAS = 300, 600
# Solo durante la redacción: BIB_TRANSICION=1 admite entradas marcadas «borrador» con el formato anterior.
TRANSICION = os.environ.get('BIB_TRANSICION') == '1'
ENTIDAD = '='   # un autor que empieza con = es una institución: «=Open Robotics»


class ErrorBibliografia(SystemExit):
    pass


def falla(msg):
    raise ErrorBibliografia('bibliografia.json: ' + msg)


def esc(s):
    return html.escape(str(s), quote=True)


def serie(xs):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' y ' + xs[-1]


def texto_plano(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s))


def palabras(s):
    return len(re.findall(r'\w+', texto_plano(s)))


def nombre_visible(autor):
    """«Macenski, Steve» -> «Steve Macenski». Una institución, «=Open Robotics», se muestra sin el signo."""
    if autor.startswith(ENTIDAD):
        return autor[1:]
    apellido, _, nombre = autor.partition(', ')
    return (nombre + ' ' + apellido).strip()


class Bibliografia:
    def __init__(self, datos, destino):
        """datos: el JSON ya leído. destino(href): enlace HTML a una sección de la guía, o falla si no existe."""
        self.datos = datos
        self.destino = destino
        self.refs = datos['referencias']
        self.grupos = datos['grupos']
        self.validar()

    # ── validación ──────────────────────────────────────────────────────────
    def revisar_texto(self, rid, campo, texto):
        if not isinstance(texto, str) or not texto.strip():
            falla('%s: el campo %s está vacío' % (rid, campo))
        plano = texto_plano(texto)
        if SEPARADOR.search(plano):
            falla('%s usa punto y coma o guiones como separadores en %s: %s' % (rid, campo, SEPARADOR.search(plano).group(0)))
        for m in re.finditer(r'\{(r-[a-z0-9-]+)(?:\|[^}]*)?\}', texto):
            if m.group(1) not in self.refs:
                falla('%s: %s enlaza una referencia inexistente %s' % (rid, campo, m.group(1)))
        if re.search(r'[{}]', re.sub(r'\{r-[a-z0-9-]+(?:\|[^}]*)?\}', '', texto)):
            falla('%s: %s tiene llaves sueltas' % (rid, campo))

    def validar(self):
        en_grupos = [r for g in self.grupos for r in g['referencias']]
        if sorted(en_grupos) != sorted(self.refs) or len(set(en_grupos)) != len(en_grupos):
            falla('cada referencia debe estar en un solo grupo')
        if sorted(r['n'] for r in self.refs.values()) != list(range(1, len(self.refs) + 1)):
            falla('los números deben ir de 1 a %d sin repetirse' % len(self.refs))
        for g in self.grupos:
            for c in ('id', 'titulo', 'descripcion', 'tema', 'referencias'):
                if not g.get(c):
                    falla('al grupo %s le falta %s' % (g.get('id'), c))
            if not isinstance(g['descripcion'], list) or (len(g['descripcion']) < 2 and not TRANSICION):
                falla('la descripción del grupo %s debe tener al menos dos párrafos' % g['id'])
            for i, p in enumerate(g['descripcion']):
                self.revisar_texto(g['id'], 'descripcion[%d]' % i, p)
            self.destino(g['tema'])
        for rid, r in self.refs.items():
            if not re.fullmatch(r'r-[a-z0-9-]+', rid):
                falla('identificador no válido ' + rid)
            if r.get('borrador'):
                if not TRANSICION:
                    falla('%s sigue en borrador' % rid)
                continue
            for c in OBLIGATORIOS:
                if r.get(c) in (None, '', []):
                    falla('faltan datos en %s: %s' % (rid, c))
            for c in ('autor', 'resumen', 'tipo', 'partes', 'diferencia') + (('codigo',) if r.get('codigo') else ()):
                self.revisar_texto(rid, c, r[c])
            if len(r['resumen']) > 80:
                falla('el resumen de %s supera los 80 caracteres' % rid)
            self.revisar_texto(rid, 'cita', r['cita'])
            for c in ('contenido', 'relacion'):
                if not isinstance(r[c], list):
                    falla('%s: %s debe ser una lista de párrafos' % (rid, c))
                for i, p in enumerate(r[c]):
                    self.revisar_texto(rid, '%s[%d]' % (c, i), p)
            if len(r['contenido']) < 2:
                falla('%s: «De qué trata» necesita al menos dos párrafos' % rid)
            for lugar in r['tesis']:
                if not re.fullmatch(r'Introducción|Conclusiones|\d+(\.\d+)*|A\d+(\.\d+)*', lugar):
                    falla('%s: lugar de la tesis no válido %s' % (rid, lugar))
            for e in r.get('elementos', []):
                self.revisar_texto(rid, 'elementos', e)
            for h in r.get('guia', []):
                self.destino(h)
            vistos = set()
            for x in r['relacionadas']:
                if x.get('id') not in self.refs or x['id'] == rid or x['id'] in vistos:
                    falla('%s: referencia relacionada no válida %s' % (rid, x.get('id')))
                vistos.add(x['id'])
                self.revisar_texto(rid, 'relacionadas', x.get('texto', ''))
            ct = r.get('cita_textual')
            if ct:
                for c in ('texto', 'pagina') + (() if ct.get('lengua') == 'es' else ('traduccion',)):
                    self.revisar_texto(rid, 'cita_textual.' + c, ct.get(c, ''))
                if palabras(ct['texto']) > 30:
                    falla('%s: la cita textual supera las 30 palabras' % rid)
            f = r['ficha']
            for c in FICHA_OBLIGATORIOS:
                if c == 'autores' and f.get('editores') and not f.get('autores'):
                    continue   # obra sin autor declarado, solo con editores: «Cantwell, H. (Ed.)»
                if f.get(c) in (None, '', [], {}):
                    falla('%s: a la ficha le falta %s' % (rid, c))
            if f['medio'].get('clase') not in ETIQUETA_MEDIO or not f['medio'].get('nombre'):
                falla('%s: medio de publicación no válido' % rid)
            for c in ('titulo', 'titulo_es', 'titulo_original', 'fecha', 'idioma', 'acceso', 'revision', 'version', 'procedencia', 'edicion',
                      'editorial', 'serie', 'lugar', 'paginas', 'articulo', 'volumen', 'numero'):
                if f.get(c):
                    self.revisar_texto(rid, 'ficha.' + c, str(f[c]))
            self.revisar_texto(rid, 'ficha.medio', f['medio']['nombre'])
            for a in f.get('autores', []) + f.get('editores', []) + f.get('traductores', []):
                self.revisar_texto(rid, 'ficha.autores', a)
                if not a.startswith(ENTIDAD) and ', ' not in a:
                    falla('%s: el autor «%s» debe escribirse «Apellido, Nombre» o «=Institución»' % (rid, a))
            for k in f['palabras_clave']:
                self.revisar_texto(rid, 'ficha.palabras_clave', k)
            for c in ('url', 'url_abierta'):
                if f.get(c) and not re.fullmatch(r'https://[^\s"<>]+', f[c]):
                    falla('%s: enlace externo no válido en ficha.%s' % (rid, c))
            if f.get('doi') and not re.fullmatch(r'10\.\d{4,9}/\S+', f['doi']):
                falla('%s: DOI no válido' % rid)
            n = self.extension(r)
            if not MIN_PALABRAS <= n <= MAX_PALABRAS:
                falla('%s tiene %d palabras de explicación y deben ser entre %d y %d' % (rid, n, MIN_PALABRAS, MAX_PALABRAS))

    def extension(self, r):
        """Palabras de la explicación de una referencia, contadas como se leen en la página."""
        textos = r['contenido'] + r['relacion'] + [r['diferencia'], r.get('codigo', '')] + [x['texto'] for x in r['relacionadas']]
        return sum(len(texto_plano(self.plano(t)).split()) for t in textos)

    # ── texto con enlaces a otras referencias ───────────────────────────────
    def enlazar(self, texto):
        """Escapa el texto y convierte {r-id} o {r-id|texto} en un enlace a esa referencia."""
        partes, pos = [], 0
        for m in re.finditer(r'\{(r-[a-z0-9-]+)(?:\|([^}]*))?\}', texto):
            partes.append(esc(texto[pos:m.start()]))
            etiqueta = m.group(2) if m.group(2) else self.refs[m.group(1)]['autor']
            partes.append('<a href="#%s">%s</a>' % (m.group(1), esc(etiqueta)))
            pos = m.end()
        partes.append(esc(texto[pos:]))
        return ''.join(partes)

    def plano(self, texto):
        """El mismo texto sin enlaces, para el buscador y el BibTeX."""
        return re.sub(r'\{(r-[a-z0-9-]+)(?:\|([^}]*))?\}', lambda m: m.group(2) or self.refs[m.group(1)]['autor'], texto)

    # ── dónde aparece ───────────────────────────────────────────────────────
    @staticmethod
    def en_tesis(lugares, elementos=()):
        """['Introducción', '4.4.3', 'A3.1'] -> 'Introducción. Sección 4.4.3. Anexo 3.1.'"""
        secs = [x for x in lugares if x[0].isdigit()]
        anexos = [x[1:] for x in lugares if x.startswith('A')]
        partes = [x for x in ('Introducción', 'Conclusiones') if x in lugares]
        if secs:
            partes.append(('Sección ' if len(secs) == 1 else 'Secciones ') + serie(secs))
        if anexos:
            partes.append(('Anexo ' if len(anexos) == 1 else 'Anexos ') + serie(anexos))
        if elementos:
            partes.append(serie(elementos))
        return '. '.join(partes) + '.'

    def donde(self, r):
        out = '<span>En la tesis: ' + esc(self.en_tesis(r['tesis'], r.get('elementos', []))) + '</span>'
        if r.get('guia'):
            out += ' <span>En esta guía: ' + serie([self.destino(h) for h in r['guia']]) + '.</span>'
        return out

    # ── ficha ───────────────────────────────────────────────────────────────
    @staticmethod
    def fila(etiqueta, valor_html, clase=''):
        return '<div%s><dt>%s</dt><dd>%s</dd></div>' % (' class="%s"' % clase if clase else '', esc(etiqueta), valor_html)

    @staticmethod
    def corto(url):
        u = re.sub(r'^https://(www\.)?', '', url)
        return u if len(u) <= 48 else u[:46].rsplit('/', 1)[0] + '/…'

    def ficha_html(self, r):
        f = r['ficha']
        lengua = f.get('lengua', 'en')
        if f.get('titulo_original'):
            # traducción: el título de la edición consultada y el de la obra original, en inglés
            filas = [self.fila('Título', '<span lang="%s">%s</span>' % (lengua, esc(f['titulo']))),
                     self.fila('Título original', '<span lang="en">%s</span>' % esc(f['titulo_original']))]
        else:
            filas = [self.fila('Título original', '<span lang="%s">%s</span>' % (lengua, esc(f['titulo'])))]
        if f.get('titulo_es'):
            filas.append(self.fila('En español', esc(f['titulo_es'])))
        if f.get('autores'):
            filas.append(self.fila('Autoría', esc(serie(nombre_visible(a) for a in f['autores']))))
        if f.get('editores'):
            filas.append(self.fila('Edición a cargo de', esc(serie(nombre_visible(a) for a in f['editores']))))
        if f.get('traductores'):
            filas.append(self.fila('Traducción', esc(serie(nombre_visible(a) for a in f['traductores']))))
        filas.append(self.fila('Fecha', esc(f['fecha'])))
        filas.append(self.fila(ETIQUETA_MEDIO[f['medio']['clase']], esc(f['medio']['nombre'])))
        vn = [x for x in (('volumen ' + str(f['volumen'])) if f.get('volumen') else '', ('número ' + str(f['numero'])) if f.get('numero') else '') if x]
        if vn:
            filas.append(self.fila('Volumen y número', esc(', '.join(vn).capitalize())))
        if f.get('paginas'):
            filas.append(self.fila('Páginas', esc(f['paginas'])))
        if f.get('articulo'):
            filas.append(self.fila('Artículo', esc(f['articulo'])))
        for c, et in (('edicion', 'Edición'), ('serie', 'Colección'), ('editorial', 'Editorial'), ('lugar', 'Lugar')):
            if f.get(c):
                valor = f[c] + (', volumen %s' % f['serie_numero'] if c == 'serie' and f.get('serie_numero') else '')
                filas.append(self.fila(et, esc(valor)))
        ids = []
        if f.get('doi'):
            ids.append('DOI <a href="https://doi.org/%s">%s</a>' % (esc(f['doi']), esc(f['doi'])))
        for isbn in ([f['isbn']] if isinstance(f.get('isbn'), str) else f.get('isbn') or []):
            ids.append('ISBN ' + esc(isbn))
        if f.get('arxiv'):
            ids.append('arXiv <a href="https://arxiv.org/abs/%s">%s</a>' % (esc(f['arxiv']), esc(f['arxiv'])))
        if ids:
            filas.append(self.fila('Identificador' if len(ids) == 1 else 'Identificadores', '. '.join(ids)))
        enl = []
        doi_url = 'https://doi.org/' + f['doi'] if f.get('doi') else None
        if f.get('url') and f['url'] != doi_url:
            enl.append('<a href="%s">%s</a>' % (esc(f['url']), esc(self.corto(f['url']))))
        if f.get('url_abierta'):
            enl.append('Versión abierta en <a href="%s">%s</a>' % (esc(f['url_abierta']), esc(self.corto(f['url_abierta']))))
        if enl:
            filas.append(self.fila('Enlaces', '. '.join(enl), 'bib-enlaces'))
        filas.append(self.fila('Idioma', esc(f['idioma'])))
        filas.append(self.fila('Acceso', esc(f['acceso'])))
        filas.append(self.fila('Revisión de pares', esc(f['revision'])))
        if f.get('version'):
            filas.append(self.fila('Versión consultada', esc(f['version'])))
        clave = 'Palabras clave' if f.get('palabras_clave_fuente', 'documento') == 'documento' else 'Temas, según esta guía'
        filas.append(self.fila(clave, esc(', '.join(f['palabras_clave']))))
        filas.append(self.fila('Partes que usa la tesis', esc(r['partes'])))
        filas.append(self.fila('De dónde sale este detalle', esc(f['procedencia'])))
        return '<dl class="bib-dl">' + ''.join(filas) + '</dl>'

    # ── bloques ─────────────────────────────────────────────────────────────
    @staticmethod
    def plegable(parrafos_html, que):
        n = len(parrafos_html)
        return ('<details class="bib-mas"><summary><span class="bib-mas-ver">Seguir leyendo: %s</span>'
                '<span class="bib-mas-plegar">Plegar %s</span></summary>%s</details>'
                % ('un párrafo más' if n == 1 else '%d párrafos más' % n, que, ''.join(parrafos_html)))

    def bloque(self, clase, titulo, cuerpo):
        return '<section class="bib-bloque %s"><h3>%s</h3>%s</section>' % (clase, esc(titulo), cuerpo)

    def trata_html(self, r):
        ps = ['<p>%s</p>' % self.enlazar(p) for p in r['contenido']]
        visibles, resto = ps[:2], ps[2:]
        return ''.join(visibles) + (self.plegable(resto, 'estos párrafos') if resto else '')

    def relacion_html(self, r):
        ps = ['<p>%s</p>' % self.enlazar(p) for p in r['relacion']]
        visibles = [ps[0], '<p class="bib-donde"><b>Dónde aparece.</b> %s</p>' % self.donde(r)]
        resto = ps[1:] + ['<p class="bib-diferencia"><b>En qué se diferencia.</b> %s</p>' % self.enlazar(r['diferencia'])]
        if r.get('codigo'):
            resto.append('<p class="bib-codigo"><b>En el código.</b> %s</p>' % self.enlazar(r['codigo']))
        if len(resto) <= 1:
            return ''.join(visibles + resto)
        return ''.join(visibles) + self.plegable(resto, 'estos párrafos')

    def relacionadas_html(self, r):
        items = []
        for x in r['relacionadas']:
            o = self.refs[x['id']]
            items.append('<li><a href="#%s"><span class="bib-rel-n">%d</span>%s</a>. %s</li>'
                         % (x['id'], o['n'], esc(o['autor']), self.enlazar(x['texto'])))
        return '<ul class="bib-rel">' + ''.join(items) + '</ul>'

    def cita_html(self, rid, r):
        out = ''
        ct = r.get('cita_textual')
        if ct:
            lengua = ct.get('lengua', r['ficha'].get('lengua', 'en'))
            pie = esc(ct['pagina']) + ('.' if lengua == 'es' else '. En español: «%s»' % esc(ct['traduccion']))
            out += ('<figure class="bib-textual"><blockquote lang="%s"><p>%s</p></blockquote><figcaption>%s</figcaption></figure>'
                    % (esc(lengua), esc(ct['texto']), pie))
        out += ('<p class="bib-cita-tesis" data-clave="%s"><b>Cómo la cita la tesis.</b> <span class="bib-cita-texto">%s</span></p>'
                % (esc(self.clave(rid)), r['cita']))
        return out

    def borrador_html(self, rid, r):
        return (self.bloque('bib-trata', 'De qué trata', ''.join('<p>%s</p>' % esc(p) for p in r['contenido'])) +
                self.bloque('bib-relacion', 'Relación con la tesis', ''.join('<p>%s</p>' % esc(p) for p in r['relacion']) +
                            '<p class="bib-donde"><b>Dónde aparece.</b> %s</p>' % self.donde(r)) +
                self.bloque('bib-cita', 'Cita', '<p class="bib-cita-tesis" data-clave="%s"><b>Cómo la cita la tesis.</b> '
                            '<span class="bib-cita-texto">%s</span></p>' % (esc(self.clave(rid)), r['cita'])))

    def ref_html(self, rid):
        r = self.refs[rid]
        cuerpo = self.borrador_html(rid, r) if r.get('borrador') else (
            self.bloque('bib-ficha', 'Ficha', self.ficha_html(r)) +
            self.bloque('bib-trata', 'De qué trata', self.trata_html(r)) +
            self.bloque('bib-relacion', 'Relación con la tesis', self.relacion_html(r)) +
            self.bloque('bib-relacionadas', 'Referencias relacionadas', self.relacionadas_html(r)) +
            self.bloque('bib-cita', 'Cita', self.cita_html(rid, r)))
        return ('<li><details class="bib-ref" id="%s"><summary><span class="bib-num"><span class="sr">Referencia </span>%d</span>'
                '<span class="bib-linea"><span class="bib-autor">%s</span> <span class="tipo-ref">%s</span> '
                '<span class="bib-resumen">%s</span></span></summary>\n<div class="bib-detalle">'
                % (rid, r['n'], esc(r['autor']), esc(r['tipo']), esc(r['resumen'])) + cuerpo +
                '</div></details></li>')

    def mapa_html(self, prefijo=''):
        return ('<nav aria-label="Grupos de la bibliografía"><ul class="bib-mapa">' + ''.join(
            '<li><a href="%s#%s">%s <span class="bib-n">%d<span class="sr"> referencias</span></span></a></li>'
            % (prefijo, g['id'], esc(g['titulo']), len(g['referencias'])) for g in self.grupos) + '</ul></nav>')

    # ── salidas ─────────────────────────────────────────────────────────────
    def pagina(self):
        """Contenido de bibliografia.html entre BIBLIOGRAFIA y FIN BIBLIOGRAFIA."""
        secciones = []
        for g in self.grupos:
            n = len(g['referencias'])
            desc = ''.join('<p>%s</p>' % self.enlazar(p) for p in g['descripcion'])
            secciones.append(
                '<section class="bib-grupo" aria-labelledby="%s"><h2 id="%s">%s</h2>\n<div class="bib-desc">%s'
                '<p class="bib-tema">En la guía: %s.</p></div>\n'
                '<details class="detalle"><summary>Ver %s</summary>\n<ol class="bib">\n%s\n</ol>\n</details></section>'
                % (g['id'], g['id'], esc(g['titulo']), desc, self.destino(g['tema']),
                   'la referencia' if n == 1 else 'las %d referencias' % n,
                   '\n'.join(self.ref_html(r) for r in g['referencias'])))
        return ('<!-- BIBLIOGRAFIA: generado por herramientas/datos.py desde datos/bibliografia.json -->\n' +
                '\n'.join(secciones) + '\n<!-- FIN BIBLIOGRAFIA -->')

    def mapa_pagina(self):
        return ('<!-- BIBLIOGRAFIA MAPA: generado por herramientas/datos.py desde datos/bibliografia.json -->\n' +
                self.mapa_html() + '\n<!-- FIN BIBLIOGRAFIA MAPA -->')

    def resumen(self):
        """Introducción de recursos.html entre BIBLIOGRAFIA RESUMEN y FIN BIBLIOGRAFIA RESUMEN."""
        return ('<!-- BIBLIOGRAFIA RESUMEN: generado por herramientas/datos.py desde datos/bibliografia.json -->\n'
                '<p>Las %d referencias de la tesis tienen su propia página, agrupadas según para qué las usa el trabajo. '
                'Cada una se abre con su ficha, de qué trata el documento, qué toma la tesis de él y dónde, en qué se '
                'diferencia este trabajo, sus referencias relacionadas y la cita lista para copiar.</p>\n'
                '<p class="bib-acciones"><a class="btn prim" href="bibliografia.html">Abrir la bibliografía de la tesis</a> '
                '<a class="btn" href="datos/bibliografia.bib" download>Descargar en BibTeX</a></p>\n'
                % len(self.refs) + self.mapa_html('bibliografia.html') +
                '\n<!-- FIN BIBLIOGRAFIA RESUMEN -->')

    def ids(self):
        """Anclas que tuvo recursos.html y que ahora están en bibliografia.html."""
        return ['bibliografia'] + [g['id'] for g in self.grupos] + list(self.refs)

    def traslado(self):
        """Script para la cabecera de recursos.html: lleva a bibliografia.html los enlaces antiguos a la
        bibliografía, a un grupo o a una referencia, antes de que se dibuje la página."""
        return ('<!-- TRASLADO BIBLIOGRAFIA: generado por herramientas/datos.py desde datos/bibliografia.json -->\n'
                '<script>(function(){var h=location.hash.slice(1);try{h=decodeURIComponent(h)}catch(e){}'
                'if(h&&" %s ".indexOf(" "+h+" ")>=0)location.replace("bibliografia.html"+(h==="bibliografia"?"":"#"+h))})()</script>\n'
                '<!-- FIN TRASLADO BIBLIOGRAFIA -->' % ' '.join(self.ids()))

    # ── índice del buscador ─────────────────────────────────────────────────
    def texto_indice(self, rid):
        """Lo que el buscador lee de una referencia: el resumen, los datos clave y todo el texto salvo la ficha."""
        r = self.refs[rid]
        if r.get('borrador'):
            return ' '.join([r['resumen']] + r['contenido'] + r['relacion'] + [texto_plano(r['cita'])])
        f = r['ficha']
        datos = [r['resumen'], f['titulo'], f.get('titulo_es', ''),
                 serie([nombre_visible(a) for a in f.get('autores') or f.get('editores')]),
                 f['fecha'], f['medio']['nombre'], 'DOI ' + f['doi'] if f.get('doi') else '', ', '.join(f['palabras_clave'])]
        cuerpo = [self.plano(p) for p in r['contenido'] + r['relacion']]
        cuerpo += [self.plano(r['diferencia']), self.plano(r.get('codigo', ''))]
        cuerpo += [self.refs[x['id']]['autor'] + '. ' + self.plano(x['texto']) for x in r['relacionadas']]
        ct = r.get('cita_textual')
        if ct:
            cuerpo += [ct['texto'], ct['pagina'], ct.get('traduccion', '')]
        cuerpo.append(texto_plano(r['cita']))
        return ' '.join(x for x in datos + cuerpo if x)

    # ── BibTeX ──────────────────────────────────────────────────────────────
    @staticmethod
    def clave(rid):
        return rid[2:].replace('-', '')

    @staticmethod
    def tex(s):
        s = str(s)
        for a, b in (('\\', r'\textbackslash{}'), ('&', r'\&'), ('%', r'\%'), ('$', r'\$'), ('#', r'\#'), ('_', r'\_')):
            s = s.replace(a, b)
        return s

    def bibtex(self, fecha):
        lineas = ['% Bibliografía de la tesis «Navegación y exploración autónoma de interiores utilizando un robot móvil',
                  '% de tracción diferencial» (Valderas Neculqueo, 2026), en revisión por comité.',
                  '% Generado por herramientas/datos.py desde datos/bibliografia.json el ' + fecha + '. No editar a mano.',
                  '% Cada entrada va precedida de un comentario con su número en la tesis. Codificación UTF-8, pensado',
                  '% para biblatex con biber. Los títulos van entre llaves dobles para conservar sus mayúsculas.', '']
        orden = sorted(self.refs, key=lambda k: self.refs[k]['n'])
        for rid in orden:
            if self.refs[rid].get('borrador'):
                continue
            r, f = self.refs[rid], self.refs[rid]['ficha']
            clase = f['medio']['clase']
            tipo = r.get('bibtex_tipo', TIPO_BIBTEX[clase])
            campos = []

            def poner(nombre, valor, llaves=1):
                if valor not in (None, '', []):
                    campos.append('  %s = %s%s%s' % (nombre, '{' * llaves, valor, '}' * llaves))
            def nombres(lista):
                return ' and '.join('{' + self.tex(a[1:]) + '}' if a.startswith(ENTIDAD) else self.tex(a) for a in lista)
            poner('author', nombres(f.get('autores', [])))
            poner('editor', nombres(f.get('editores', [])))
            poner('title', self.tex(f['titulo']), 2)
            if f.get('traductores'):
                poner('translator', nombres(f['traductores']))
            poner('origdate', f.get('fecha_original'))
            if clase == 'informe':
                poner('type', self.tex(f['medio']['nombre']))
            if clase == 'revista':
                poner('journaltitle', self.tex(f['medio']['nombre']))
            elif clase == 'congreso':
                poner('booktitle', self.tex(f['medio']['nombre']))
            elif clase == 'capitulo':
                poner('booktitle', self.tex(f['medio']['nombre']))
            elif clase in ('repositorio', 'codigo') and 'github.com/' in f.get('url', ''):
                poner('publisher', 'GitHub')
            poner('volume', f.get('volumen'))
            poner('number', f.get('numero') or f.get('serie_numero'))
            if f.get('paginas'):
                poner('pages', re.sub(r'\s+a\s+', '-', str(f['paginas'])))
            poner('eid', f.get('articulo'))
            poner('edition', f.get('edicion_bibtex'))
            poner('series', self.tex(f['serie']) if f.get('serie') else None)
            poner('institution' if clase == 'informe' else 'publisher', self.tex(f['editorial']) if f.get('editorial') else None)
            poner('location', self.tex(f['lugar']) if f.get('lugar') else None)
            poner('date', f.get('fecha_iso') or f.get('anio'))
            poner('doi', f.get('doi'))
            poner('isbn', f['isbn'] if isinstance(f.get('isbn'), str) else (f['isbn'][0] if f.get('isbn') else None))
            if f.get('arxiv'):
                poner('eprint', f['arxiv'])
                poner('eprinttype', 'arxiv')
            poner('url', f.get('url'))
            poner('urldate', f.get('consulta_iso'))
            poner('langid', 'english' if f['idioma'].startswith('Inglés') else 'spanish' if f['idioma'].startswith('Español') else None)
            if r.get('bibtex_nota'):
                poner('note', self.tex(r['bibtex_nota']))
            lineas.append('%% [%d] %s' % (r['n'], r['autor']))
            lineas.append('@%s{%s,' % (tipo, self.clave(rid)))
            lineas.append(',\n'.join(campos))
            lineas.append('}')
            lineas.append('')
        return '\n'.join(lineas)


def fecha_texto(iso):
    y, m, d = (int(x) for x in iso.split('-'))
    return '%d de %s de %d' % (d, MESES[m - 1], y)


if __name__ == '__main__':
    print(__doc__)
