# 📜 Registro de Cambios — Planificador de Ataques

Todos los cambios notables en este proyecto serán documentados en este archivo.

---

## [v4.5] — 2026-08-05
### ✨ Añadido
* Enlace directo al **Registro de cambios** en el pie de página de la interfaz.
* Parámetro configurable `CHANGELOG_URL` al inicio del script.

---

## [v4.0] — 2026-07-20
### ✨ Añadido
* Integración con `/map/village.txt` para autocompletar nombres e IDs de pueblos origen y destino.
* Botón de copia rápida al portapapeles para horas de lanzamiento (`HH:MM:SS`).
* Generador de exportación a BBCode listo para foros de tribu.

### ⚡ Mejorado
* Optimización del temporizador usando actualización DOM selectiva para evitar consumo innecesario de CPU.
* Ajustes visuales en las tarjetas de ataques planificados y distinción de estado mediante alertas dinámicas.

---

## [v3.0] — 2026-06-12
### ✨ Añadido
* Persistencia local con `localStorage` para posición del panel y ataques guardados.
* Detección automática de la unidad más lenta para el cálculo preciso de tiempos.

### 🔧 Cambios
* Edición manual de velocidades del mundo y de unidades al hacer clic en los valores.
* Limpieza de intervalos previos al reejecutar el script para evitar instancias duplicadas en memoria.
