# Credits

Third-party and reused material in the site, with its source, author and license. The icons are credited in `LICENSE-iconos.txt`, the fonts in `docs/medicion-fuentes.md` and the product photos in `LICENSE-contenido.md`.

## Images from the thesis repositories

Both repositories are by Sebastián Valderas Neculqueo, the author of the thesis.

| File in `public/img/` | Used in | Source | License |
| --- | --- | --- | --- |
| `fotos/odometria-prueba-marcas*.webp`, `fotos/odometria-prueba-marcas.jpg` | `movimiento.html` | `docs/images/field-tests/odometry-test-robot-on-marks-1.jpg` of ros2-indoor-exploration-robot, cropped and resized from 4080 px to 1200 px | MIT |
| `fotos/chasis-render*.webp`, `fotos/chasis-render.jpg` | `replicar.html` | `docs/images/mechanical/robot-v2-render-top-left-front.png` of ros2-indoor-exploration-robot | MIT |
| `fotos/navegacion-real-sala.webp`, `fotos/navegacion-real-sala.png` | `navegacion.html` | `docs/images/real-robot/navigation-room-path-2026-01-24.png` of ros2-indoor-exploration-robot | MIT |
| `tesis/circuito-1800.webp` | `replicar.html` | `figures/05-implementation/circuit-diagram.png` of doc_tesis, resized from 11441 px to 1800 px | CC BY 4.0 |

The photos show the robot, a carpet and tape. None shows an address, a network name, a serial number or a MAC address. The voltage display in the field photo shows only electrical readings.

## Icons

Phosphor Icons 2.1.1, MIT, Copyright (c) 2023 Phosphor Icons. See `LICENSE-iconos.txt` and `docs/decisions/0008-iconos-con-significado.md`.

## Qwen3-TTS (synthetic voice)

- What: the pre-generated audio in `public/audio/` that reads the oral-defense questions and the topic summaries. The voice is synthetic and is labeled so on the site.
- Model: Qwen3-TTS-12Hz-1.7B-Base (voice cloning) and Qwen3-TTS-12Hz-1.7B-VoiceDesign (design of the reference voice).
- Author: Qwen team, Alibaba Cloud. Source: https://github.com/QwenLM/Qwen3-TTS and https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base.
- License: Apache 2.0.
- How it is used: `scripts/voz_natural.py` runs the model offline on the owner's PC. The site serves only the resulting files. See `docs/decisions/0010-voz-natural-pregenerada.md`.
