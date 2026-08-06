# 📜 Registro de Cambios (Changelog) — Planificador de Ataques

Todos los cambios notables y mejoras de rendimiento introducidos en el script están organizados a continuación en orden cronológico inverso.

---

## [v4.6] — 06/08/2026
### ✨ Añadido
* **Notas:** Ahora puedes añadir una nota o una observación cuando planees un ataque.
* **Notas en BBCode:** Las notas se añadirán al BBCode exportado.

---

## [v4.5] — 05/08/2026
### ✨ Añadido
* **Enlace al Registro de Cambios:** Incorporado un hipervínculo directo en el pie de página (`tw-footer`) para consultar el historial de versiones.
* **Constante Configurable:** Variable global `CHANGELOG_URL` en la cabecera del script para facilitar la actualización de la URL del repositorio.

---

## [v4.0] — Julio 2026
### ✨ Añadido
* **Resolución de Nombres de Pueblos:** Integración con `/map/village.txt` y `TWMap.villages` para obtener de forma asíncrona los nombres e IDs de los pueblos según sus coordenadas `(X|Y)`.
* **Exportador de BBCode:** Panel dedicado para generar de forma automática una lista formateada con etiquetas `[coord]`, `[unit]` y fechas, lista para compartir en foros de tribu o bloc de notas.
* **Copia Rápida de Horarios:** Botón 📋 junto a las horas de lanzamiento y llegada para copiar instantáneamente el formato `HH:MM:SS` al portapapeles.

### ⚡ Mejorado & Optimizado
* **Refactorización del Temporizador:** Separación del renderizado visual (`renderAttacks`) de la actualización por segundo (`updateTimersOnly`), eliminando parpadeos visuales y reduciendo el consumo de CPU a prácticamente cero.
* **Alertas Dinámicas de Tiempo:** El contador cambia automáticamente de estado (`OK`, `⚠️ Próximo`, `⚠️ ATRASADO`) aplicando estilos visuales dinámicos según los milisegundos restantes.

---

## [v3.5] — Junio 2026
### ✨ Añadido
* **Detección de Pueblo Actual:** Badge dinámico que verifica si el jugador se encuentra en el pueblo origen seleccionado (`✅ Estás en el pueblo` / `⚠️ No estás en el pueblo`).
* **Autocompletado Rápido:** Botón `📍 Usar pueblo actual` para rellenar las coordenadas del pueblo activo en un solo clic.
* **Sistema Anti-Duplicados:** Limpieza automática de intervalos globales (`window.twPlannerInterval`) y nodos DOM previos al ejecutar el script múltiples veces.

---

## [v3.0] — Junio 2026
### ✨ Añadido
* **Persistencia con `localStorage`:** Guardado automático de la posición del panel en pantalla, ataques planificados activos y ajustes de velocidad del mundo.
* **Configuración de Velocidades:** Lectura automática de `/interface.php?func=get_config` con la opción de editar manualmente las velocidades del mundo y de las unidades haciendo clic sobre sus valores.

---

## [v2.0] — Junio 2026
### ✨ Añadido
* **Cálculo Automático por Unidad Más Lenta:** Identificación automática de la tropa con menor velocidad dentro del contingente seleccionado para calcular la duración exacta del desplazamiento.
* **Acceso Directo a la Plaza de Reuniones:** Generación de enlaces con parámetros GET pre-rellenados (`&x=...&y=...&unit=count`) para enviar ataques rápidamente desde la interfaz.

---

## [v1.0] — Junio 2026
### ✨ Lanzamiento Inicial
* **Interfaz Flotante Draggable:** Creación del panel GUI flotante minimizable y arrastrable adaptado al estilo estético del juego.
* **Formulario Base:** Entrada de coordenadas de origen, destino, fecha y hora exacta con soporte para milisegundos.
