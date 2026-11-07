# IRON SECTOR — Planta 09

FPS 3D original para navegador de escritorio. Un nivel industrial de seis salas conectadas por pasillos, 12 hostiles, tres reactores y un ascensor de extracción. No utiliza recursos de Doom o Quake.

## Jugar

Abre `dist/index.html` en Brave, Chrome, Edge o Firefox. Todo está incluido: no necesita conexión, instalación ni compilación. Pulsa **ENTRAR A LA PLANTA** para capturar el ratón y habilitar audio. Necesita WebGL y teclado/ratón. Las vistas integradas pueden impedir Pointer Lock: en ese caso utiliza una pestaña normal del navegador.

Si tu navegador restringe archivos locales, ejecuta `python -m http.server 8765 --bind 127.0.0.1 --directory dist` desde esta carpeta y abre http://127.0.0.1:8765. También puedes ejecutar `node server.cjs` si tienes Node.js. Cierra el servidor con Ctrl+C.

| Control | Acción |
|---|---|
| W A S D | Moverse |
| Ratón | Mirar y apuntar |
| Clic izquierdo / mantener | Disparar |
| R | Recargar (12 balas, 1,15 segundos) |
| Shift izquierdo | Correr |
| E | Desactivar reactor / usar ascensor |
| M | Mostrar mapa: naranja = reactor, verde = activado, azul = salida |
| Esc | Liberar ratón y pausar |

Acércate a cada reactor y pulsa E. Cuando los tres estén apagados, vuelve al ascensor del suroeste y pulsa E. Los botiquines recuperan hasta 30 de vida; las cajas y enemigos caídos suministran 24 balas. Los enemigos necesitan tres impactos y disparan proyectiles esquivables. La partida puede reiniciarse al morir o ganar. No hay guardado de partida ni controles táctiles.

## Render PSX efectivo

El aspecto se implementa en `dist/game.js`, sobre geometría 3D real:

- Resolución interna fija 320×240; perfil alternativo 480×360. El escalado CSS usa `image-rendering: pixelated`; antialias y devicePixelRatio elevado desactivados.
- Snapping de vértices en coordenadas de pantalla: división por W, redondeo a píxeles y multiplicación por W. El temblor aparece al mover la cámara; no es una vibración aleatoria de la cámara ni de las colisiones.
- Interpolación afín: se envían UV×W y W al fragment shader y se dividen allí para cancelar la corrección de perspectiva.
- Texturas procedurales originales de 64×64, muestreo NEAREST y sin mipmaps.
- Dither ordenado 4×4 con valores PSX y cuantización de salida a 5 bits por canal (RGB555).
- Paleta oliva/óxido, iluminación gruesa por vértice, geometría de pocos polígonos, tuberías hexagonales y niebla entre 9 y 42 unidades.
- La física usa coordenadas continuas; el snapping ocurre sólo al dibujar. Proyectiles con subpasos, desplazamiento con radio y deslizamiento contra muros/cajas, percepción con oclusión y rutas BFS para los enemigos.

Es una recreación visual, no un emulador exacto de PS1: se conserva el depth buffer para evitar errores de visibilidad que afectarían al combate; la niebla y el dither se aplican en shaders modernos. El HUD HTML se mantiene legible a resolución de pantalla.

Fuentes consultadas:
- [PSX-SPX: GPU, perspectiva y dither RGB de 15 bits](https://psx-spx.consoledev.net/graphicsprocessingunitgpu/)
- [three-psx: implementación de referencia y técnicas](https://github.com/codedgar/three-psx/)

## Archivos y verificación

- `dist/index.html`, `style.css`: interfaz, menú, HUD y controles.
- `dist/game.js`: shaders, escena, combate, audio y estado de partida.
- `dist/simulation.js`: mapa, colisiones, visibilidad y búsqueda de rutas.
- `dist/vendor/three.min.js`: Three.js r128, incluido con licencia MIT.
- `test.cjs`: pruebas reproducibles; ejecuta `node test.cjs` desde esta carpeta.
- `server.cjs`: servidor local opcional, sin dependencias.

Verificado: 11 pruebas de lógica pasan (rutas a todos los objetivos, muros, cajas, oclusión, proyectiles, bajas, recarga, recogida, ataques enemigos, victoria, muerte/reinicio/pausa). Estas pruebas ejecutan la lógica real con un renderizador simulado; no certifican la GPU. La escena y el menú se revisaron en navegador integrado, sin errores de consola/shaders. Pointer Lock fue rechazado por esa vista; no se pudo completar la comprobación de controles en navegador externo porque la herramienta de control se detuvo. No se afirma haber completado una partida manual de principio a fin.

Código y gráficos procedurales del proyecto: MIT. Three.js conserva su licencia en `dist/vendor/THREE-LICENSE.txt`.
