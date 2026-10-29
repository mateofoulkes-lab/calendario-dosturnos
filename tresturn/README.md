# TresTurn

Calendario web instalable (PWA) de tres turnos, alojado junto a DosTurn en la carpeta \`tresturn/\`. No altera la aplicación original.

## Reglas
- Equipo A: mañana, B: tarde y C: noche en la semana del **lunes 26 de octubre de 2026** (semana de referencia).
- Rotación **semanal**, cada lunes: de manera predeterminada mañana → tarde → noche → mañana. Es configurable la dirección inversa.
- **Mañana:** lunes a sábado, 06:00–14:00.
- **Tarde:** lunes a viernes, 14:00–22:00.
- **Noche:** comienza lunes a viernes a las 22:00 y termina al día siguiente a las 06:00 (última salida: sábado 06:00).
- Los domingos son francos para todos.
- El calendario atribuye cada noche a su fecha de inicio. En el detalle de cada día se muestra además la salida nocturna de la jornada anterior; en los sábados también aparece en la cuadrícula.

## Uso
Abrir \`https://mateofoulkes-lab.github.io/calendario-dosturnos/tresturn/\` si GitHub Pages publica el repositorio desde la raíz de \`main\`. En Android, utilizar «Instalar» o «Agregar a pantalla principal» desde el navegador. En iOS, usar Safari → Compartir → Añadir a pantalla de inicio.

El calendario no requiere servidores, APIs, ni dependencias externas. La rotación y el equipo resaltado se almacenan en \`localStorage\` de cada teléfono. Los archivos se guardan en caché para poder abrir la app sin conexión tras una primera visita conectada.

**Aclaración:** la fecha de inicio y el sentido de giro son configurables para ajustarse al cronograma real. No hay feriados ni excepciones de planta cargadas de manera automática.