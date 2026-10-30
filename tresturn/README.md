# TresTurn

Versión de **DosTurn** con exactamente la misma estructura visual y controles, pero para tres equipos.

- Elegí **Turno A, B o C** desde el desplegable superior: se recuerda en este dispositivo.
- El calendario muestra solo el horario del equipo seleccionado.
- **Mañana** (celeste): lunes a sábado, 06:00–14:00.
- **Tarde** (naranja): lunes a viernes, 14:00–22:00.
- **Noche** (azul oscuro): lunes a viernes, 22:00–06:00. La noche se pinta en el día **de ingreso a las 22:00**, sin marcar la salida en el día siguiente.
- Semanas desde el **lunes 26/10/2026**: A mañana, B tarde, C noche. Rotación semanal estándar mañana→tarde→noche.
- Las opciones originales de feriados se mantienen. Desde el engranaje se puede invertir el sentido de rotación si correspondiera.
- Instalable como PWA, con archivos propios y modo sin conexión.

GitHub Pages (si publica desde main / raíz): https://mateofoulkes-lab.github.io/calendario-dosturnos/tresturn/

No modifica el calendario original de DosTurn.

## Feriados 2026 y 2027 (revisión 30/10/2026)

- 2026: calendario oficial, días no laborables turísticos **23/03, 10/07, 07/12**, y feriado extraordinario nacional **09/11** por visita papal (DNU 1103/2026). Feriados regionales **10/11** (Córdoba/CABA) y **11/11** (Provincia de Buenos Aires).
- 2027: fechas fijas, Carnaval, Semana Santa y traslados de Ley 27.399 (**21/06, 16/08, 11/10**). El 20/11 cae sábado y su traslado depende de la autoridad según Decreto 614/2025: se muestra en **fecha original con ?**.
- 2027 aún **sin días turísticos oficiales** publicados en la fecha de revisión: no se inventan.
- Días no laborables religiosos: 2026 judíos e islámicos según fuentes oficiales, con fechas islámicas aproximadas; 2027 festividades judías verificadas en calendarios de diáspora. Las festividades islámicas de 2027 no se cargan hasta confirmar sus fechas lunares. Los no laborables religiosos tienen alcance legal específico. El Jueves Santo es no laborable, no feriado nacional.
- En los días con varias conmemoraciones se muestran **todas** en el detalle al pulsar el día.
- Los turnos se mantienen según calendario: un feriado no significa automáticamente día franco en la planta.

Fuentes:
- https://www.argentina.gob.ar/feriados
- https://www.argentina.gob.ar/normativa/nacional/ley-27399-281835/texto
- https://www.argentina.gob.ar/normativa/nacional/decreto-614-2025-416911
- https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-164-2025-421799
- https://www.argentina.gob.ar/normativa/nacional/norma-430580/texto
- https://www.hebcal.com/holidays/pesach-2027
- https://www.chabad.org/holidays/default_cdo/year/2027/jewish/holidays-2027.htm


## Selector de año y feriados visibles (30/10/2026)

El calendario ahora permite seleccionar directamente el año (por ejemplo, **2027**) además del mes. Abajo se muestra un listado visible por fecha de todos los feriados nacionales y días no laborables con los filtros activados, incluyendo conmemoraciones coincidentes y avisos sobre traslados pendientes. El cambio de año no modifica la rotación de turnos.
