# Modelo 3D del prototipo

`robot.glb` es el robot de la portada. Sale del ensamblaje del prototipo en Autodesk Fusion, exportado a STEP (`tesis_v2.stp`), y lo genera `herramientas/modelo_robot.py`:

```bash
pip install cascadio==0.1.1 trimesh==5.2.0 numpy==2.5.3
python3 herramientas/modelo_robot.py RUTA/tesis_v2.stp
```

El STEP pesa unos 45 MB y no va en el repositorio. El archivo web pesa unos 380 KB. Con el mismo STEP y estas versiones, la conversión da el mismo archivo, byte a byte.

## Qué hace la conversión

1. Pasa el STEP a triángulos con Open CASCADE, mediante `cascadio`.
2. Agrupa las piezas como el despiece de la portada. `cubierta` reúne la carcasa, los paneles y el soporte del LiDAR. `traccion` reúne la base, las ruedas, los motores y la rueda loca. `electronica` reúne las placas, la cámara, los separadores y la caja que representa a la Raspberry Pi en el CAD. El LiDAR va en dos partes: `laser_base` y `laser_cabezal`, que es la parte que gira en la portada.
3. Quita lo que no se ve. Del LiDAR, el interior que queda bajo su carcasa. De las placas, las piezas de menos de 3,5 mm, como resistencias, ledes y serigrafía.
4. Pinta cada grupo como el prototipo: PLA negro en la carcasa y la base, goma en las ruedas y metal en los motores. Las placas conservan los colores de sus modelos.
5. Pone el origen en el centro del eje de las ruedas, sobre el piso, con Y hacia arriba y Z hacia el frente curvo.
6. Simplifica cada grupo con su propia tolerancia y comprime con meshopt, con `@gltf-transform/cli`.

## Medidas que se leen del CAD

La cubierta mide 0,23 m de ancho, 0,25 m de largo y 0,136 m de alto sobre el piso, y el LiDAR llega a 0,152 m. El eje de las ruedas queda a 0,055 m del borde recto de atrás y a 0,195 m de la punta curva de adelante. Las ruedas miden 67 mm de diámetro, el radio de 33,5 mm de la tesis. En el CAD sus centros están a 186 mm, la medida de diseño. La pieza impresa en 3D quedó con 188 mm por un error de la impresora, y esa medida real es la que usan la tesis y el sitio. El centro del LiDAR queda 0,115 m delante del eje. Con estas medidas se dibuja el robot de las figuras de la guía, en `js/comun.js`.

## Modelos de terceros

El ensamblaje incluye modelos de componentes comerciales: el RPLidar A1, el Arduino Nano V3, el adaptador de bornes para Nano de Deek-Robot, el controlador L298N y la cámara V2.1. El autor confirmó que sus licencias permiten publicarlos. Si más adelante se agrega un modelo que no se pueda publicar, se pone su nombre en `EXCLUIR`, en `herramientas/modelo_robot.py`, y se vuelve a generar el modelo, que queda sin esa pieza.
