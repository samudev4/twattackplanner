# 🛡️ Tribal Wars Attack Planner

![Version](https://img.shields.io/badge/version-4.5-blue.svg)
![Languages](https://img.shields.io/badge/languages-ES-green.svg)
![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)

Un **userscript avanzado e intuitivo** diseñado para optimizar, coordinar y gestionar la planificación de ataques en **Guerras Tribales (Tribal Wars)** directamente desde el navegador.

---

## 🌟 Características Principales

* **🎯 Cálculo de Tiempos con Precisión:** Calcula automáticamente la fecha y hora exacta de salida considerando las coordenadas, la unidad más lenta elegida y las velocidades del mundo.
* **🌐 Soporte Multi-idioma (i18n):** Interfaz dinámicamente conmutable entre **Español 🇪🇸** e **Inglés 🇬🇧** con guardado de preferencias.
* **🗺️ Carga de Datos en Tiempo Real:** Conexión directa con la base de datos de pueblos del mundo (`/map/village.txt`) para resolver los nombres de pueblos de origen y destino automáticamente.
* **⚔️ Integración con la Plaza de Armas:** Genera enlaces directos a la Plaza de Armas cargando previamente el objetivo y las tropas seleccionadas.
* **📋 Exportación a BBCode:** Exporta tu lista completa de ataques organizados por hora de salida con un solo clic, listo para compartir en el foro de la tribu o por mensaje.
* **⏱️ Temporizadores Dinámicos:** Muestra la cuenta atrás en tiempo real para cada ataque planificado con avisos visuales de color según la urgencia.
* **💾 Persistencia de Datos:** Guarda tus planes, posiciones del panel desplegable y configuraciones en `localStorage` para no perder la información al recargar la página.

---

## 🚀 Instalación

Añadir el script a la barra de acceso rápido de tu cuenta de Guerras Tribales es muy sencillo:

1. Entra en el juego y ve a **Ajustes** > **Barra de acceso rápido**.
2. Haz clic en **Añadir nueva entrada**.
3. Configura los campos del formulario:
   * **Nombre del enlace:** `Planificador de Ataques` (o el nombre que prefieras).
   * **URL de la imagen:** *(Opcional)* Enlace a un icono si deseas personalizarlo.
   * **URL del objetivo:** Pega el contenido del archivo [`planificador_v45.js`](./planificador_v45.js) precedido de `javascript:`.
4. Guarda los cambios. El botón estará listo para usarse en tu barra superior en cualquier pantalla del juego.

---

## 🛠️ Modo de Uso

1. **Configurar Coordenadas:** Introduce las coordenadas de origen y destino o utiliza el botón **`📍 Usar pueblo actual`**.
2. **Definir Hora de Llegada:** Indica la fecha, hora, minutos, segundos y milisegundos en los que debe impactar el ataque.
3. **Seleccionar Tropas:** Especifica las cantidades de tropas a enviar para que el script determine la velocidad del ejército.
4. **Planificar:** Haz clic en **`➕ Añadir al Planificador`**.
5. **Ejecutar o Compartir:** Usa el botón **`⚔️ Ir a la Plaza`** cuando el temporizador llegue a cero o exporta la lista mediante **`📋 Exportar BBCode`**.

---

## ⚙️ Configuración del Mundo

El script detecta automáticamente la **Velocidad del Mundo** y la **Velocidad de Unidades**. Si juegas en un servidor especial o privado donde no se lean automáticamente, puedes hacer clic directamente sobre las cifras en la barra superior de la herramienta para editarlas manualmente.

---

## 📝 Registro de Cambios

Consulta el historial de actualizaciones y mejoras en el archivo [CHANGELOG.md](./changelog.MD).

---

## 👨‍💻 Autor

Desarrollado por **samudev4** (REDWALDA).

* **GitHub:** [@samudev4](https://github.com/samudev4)
