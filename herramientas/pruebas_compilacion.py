"""Regresiones de la comprobación de salidas, sin dependencias de terceros."""
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from verificar_compilacion import comparar, normalizar_uids_astro


class Compilacion(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.raiz = Path(self.temp.name)
        self.original = {
            'index.html': b'<p>Explicacion y limites.</p><astro-island uid="ZpUPMj" component-url="/_astro/robot.js" props="{}"><p>Robot</p></astro-island>',
            'laboratorios.html': b'<astro-island uid="6VoXU" client="load"><p>LiDAR</p></astro-island>',
            'datos/indice.js': b'window.INDICE=[];',
            '_astro/robot.js': b'export const sensor=230;',
            '_astro/estilo.css': b'body{color:#182825}',
        }
        for nombre, datos in self.original.items():
            self.escribir(nombre, datos)

    def escribir(self, nombre, datos):
        archivo = self.raiz / nombre
        archivo.parent.mkdir(parents=True, exist_ok=True)
        archivo.write_bytes(datos)

    def test_compilacion_identica(self):
        self.assertEqual(comparar(self.original, self.raiz), ([], []))

    def test_uids_de_otro_entorno(self):
        self.escribir('index.html', self.original['index.html'].replace(b'ZpUPMj', b'ZKJbLe'))
        self.escribir('laboratorios.html', self.original['laboratorios.html'].replace(b'6VoXU', b'1XXCE1'))
        self.assertEqual(comparar(self.original, self.raiz), ([], ['index.html', 'laboratorios.html']))

    def test_texto_modificado_sigue_fallando(self):
        self.escribir('index.html', self.original['index.html'].replace(b'ZpUPMj', b'ZKJbLe').replace(b'limites', b'exito'))
        self.assertEqual(comparar(self.original, self.raiz)[0], ['Salida desactualizada: index.html'])

    def test_atributos_y_estructura_siguen_fallando(self):
        for antes, despues in [(b'props="{}"', b'props="{&quot;a&quot;:1}"'),
                               (b'robot.js', b'robot-nuevo.js'),
                               (b'uid="ZpUPMj"', b'id="ZpUPMj"'),
                               (b'<p>Robot</p>', b'<h2>Robot</h2>')]:
            with self.subTest(cambio=antes):
                self.escribir('index.html', self.original['index.html'].replace(antes, despues))
                self.assertTrue(comparar(self.original, self.raiz)[0])

    def test_cambios_en_js_css_e_indice_fallan(self):
        for nombre in ['_astro/robot.js', '_astro/estilo.css', 'datos/indice.js']:
            with self.subTest(archivo=nombre):
                self.escribir(nombre, self.original[nombre] + b' ')
                self.assertEqual(comparar(self.original, self.raiz)[0], [f'Salida desactualizada: {nombre}'])
                self.escribir(nombre, self.original[nombre])

    def test_detecta_recurso_nuevo_no_versionado(self):
        self.escribir('_astro/nuevo.js', b'export const added=true;')
        self.assertEqual(comparar(self.original, self.raiz)[0], ['Recurso nuevo sin versionar: _astro/nuevo.js'])

    def test_detecta_recurso_eliminado(self):
        (self.raiz / '_astro/robot.js').unlink()
        self.assertEqual(comparar(self.original, self.raiz)[0], ['Falta el archivo compilado: _astro/robot.js'])

    def test_no_ignora_uid_en_scripts_comentarios_o_texto(self):
        for html in [b'<script>const a = \'<astro-island uid="Uno">\';</script>',
                     b'<!-- <astro-island uid="Uno"> -->',
                     b'<p>&lt;astro-island uid="Uno"&gt;</p>',
                     b'<div uid="Uno">Texto</div>']:
            with self.subTest(html=html):
                self.assertEqual(normalizar_uids_astro(html), html)
                self.assertNotEqual(normalizar_uids_astro(html), normalizar_uids_astro(html.replace(b'Uno', b'Dos')))

    def test_preserva_unicode_saltos_y_otros_bytes(self):
        html = 'área libre\n<astro-island uid="Uno" props="{}">\n<p>3,50 m²</p></astro-island>\n'
        self.assertEqual(normalizar_uids_astro(html.encode()), html.replace('uid="Uno"', 'uid="__ASTRO_UID__"').encode())

    def test_no_cambia_los_archivos_al_comparar(self):
        nuevo = self.original['index.html'].replace(b'ZpUPMj', b'ZKJbLe')
        self.escribir('index.html', nuevo)
        comparar(self.original, self.raiz)
        self.assertEqual((self.raiz / 'index.html').read_bytes(), nuevo)


if __name__ == '__main__':
    unittest.main(verbosity=2)
