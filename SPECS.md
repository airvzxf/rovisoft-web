# RoviSoft.net — Terminal Personal Interactiva

Este documento contiene la arquitectura, el concepto y las especificaciones técnicas para replicar o extender el proyecto de sitio web estilo terminal para **RoviSoft.net**.

## 1. Visión General

**RoviSoft.net** no es un sitio web tradicional: es una **terminal de comandos interactiva** (TTY) que funciona como página de inicio personal. El visitante llega y se encuentra con una terminal UNIX simulada, donde el ratón es prácticamente inútil y todo se navega escribiendo comandos. La estética está inspirada en emuladores de terminal clásicos: fondo oscuro, fuente monoespaciada y _blinking cursor_.

La terminal tiene un **prompt fijo en la parte superior** de la pantalla, eliminando los problemas clásicos de scroll, detección de altura de viewport y desalineación. Todo el historial de comandos y respuestas fluye hacia abajo desde el prompt, y el scroll natural del navegador se encarga del resto.

En cuanto a experiencia de usuario y adquisición de conocimiento, no espero que para el usuario sea fácil. No espero que el usuario con una tecla o algo así pueda saber todo acerca de mí. Por ejemplo, si quiere saber acerca de mí, se tiene que loguear con mi usuario `su airvzxf` y de ahí explorar las opciones. Normalmente a las páginas web les interesa mostrar información rápida y expedita, fácil y sencilla. A mí no, no me interesa hacerlo muy difícil, pero sí que el usuario tenga que hacer varias interacciones para llegar a la información y en ese intermedio, explorar.

## 2. Concepto

### 2.1. Concepto General

Crear una experiencia de usuario (UX) donde el navegador se comporte como una terminal TTY de Linux. La interacción es primordialmente a través del teclado.

- **Identidad:** RoviSoft.net
- **Usuario por defecto:** `guest`
- **Usuario admin:** `airvzxf`
- **Licencia:** GNU AGPLv3

### 2.2. Prompt fijo superior

A diferencia de las terminales tradicionales donde el prompt se mueve con el contenido, aquí el área de entrada queda anclada al tope de la ventana. Los resultados de comandos previos se acumulan debajo en una zona con scroll. Esto resuelve:

- Problemas de posicionamiento del cursor al redimensionar.
- Inconsistencias entre navegadores en `window.innerHeight`.
- La sensación de un «encabezado vivo» que siempre está accesible.

### 2.3. Sistema de usuarios

La terminal tiene un **sistema básico de sesión**:

| Comando      | Efecto                               |
| ----------------- | ------------------------------------------------------------------- |
| `whoami`     | Muestra el usuario actual                      |
| `who`       | Muestra información del usuario activo               |
| `users`      | Muestra los usuarios del sistema                  |
| `su <username>`  | Cambia de usuario (solo soporta `airvzxf` y `guest`)        |

Esto permite que el sitio sirva tanto como **portfolio profesional** (cuando se accede como `airvzxf`) como **demo/juguete interactivo** (cuando se accede como `guest`).

### 2.4. Comandos

Lista completa de comandos disponibles:

| Comando   | Descripción                     |
| ------------ | --------------------------------------------------- |
| `help`    | Lista todos los comandos disponibles        |
| `clear`   | Limpia la pantalla                 |
| `whoami`   | Muestra el nombre del usuario actual        |
| `who`    | Muestra información del usuario actual       |
| `users`   | Muestra los usuarios del sistema (guest, airvzxf)  |
| `su <user>` | Cambia al usuario especificado           |
| `about`   | Muestra información personal del dueño del sitio  |
| `neofetch`  | ASCII art con información del «sistema»       |
| `contact`  | Muestra formas de contacto             |
| `projects`  | Lista proyectos del portafolio           |
| `social`   | Enlaces a redes sociales              |
| `date`    | Fecha y hora actual                 |
| `echo`    | Repite el texto ingresado              |
| `banner`   | Muestra el banner ASCII de RoviSoft         |
| `license`  | Muestra la licencia (AGPL) y enlace al repositorio |
| `lang es/en` | Cambia el idioma de la interfaz            |
| `history`  | Muestra el historial de comandos de la sesión    |
| `reboot`   | Reinicia la terminal (refresca la página, sin pérdida de datos) |
| `reset`    | Restablece a valores de fábrica (borra todos los datos) |

#### Comandos exclusivos de `airvzxf` (requieren `su airvzxf`)

| Comando   | Descripción                     |
| ------------ | --------------------------------------------------- |
| `airvzxf about` | Información del propietario         |
| `airvzxf contact` | Formas de contacto              |
| `airvzxf social` | Enlaces a redes sociales             |
| `airvzxf projects` | Proyectos del portafolio           |
| `airvzxf skills` | Stack tecnológico y dominios          |
| `airvzxf research` | Investigación en IA y ML            |
| `airvzxf man` | Página de manual (man page)           |

### 2.5. Comando `license`

El comando `license` muestra un bloque de texto con:

- El nombre de la licencia (GNU Affero General Public License v3).
- Un resumen breve de lo que implica.
- Un enlace al repositorio de GitHub donde está el código fuente.
- Un enlace al texto completo de la licencia.

Esto cumple con los requisitos de atribución y transparencia que la AGPL fomenta, y además sirve como llamado a la acción para que otros desarrolladores visiten el repo.

### 2.6. Parámetros URL

La terminal soporta ejecución de comandos a través de parámetros en la URL. Esto permite:

- **SEO**: Los crawlers y compartición en redes pueden indexar contenido específico (about, contact, social, etc.).
- **Deep linking**: Compartir una URL que pre-configura la terminal con el tema, idioma y contenido deseado.
- **Juguete/herramienta**: El usuario construye la vista que quiere visualizar al abrir la página.

**Formatos soportados:**

| Formato | Ejemplo |
| --- | --- |
| Punto y coma (en un solo `cmd`) | `/?cmd=clear;su%20airvzxf;airvzxf%20about` |
| Parámetros repetidos (`&cmd=`) | `/?cmd=clear&cmd=su%20airvzxf&cmd=airvzxf%20about` |

Ambos formatos pueden combinarse. Los comandos se ejecutan secuencialmente tras la carga de la terminal. Tras la ejecución, los parámetros se eliminan de la URL (`history.replaceState`) para evitar re-ejecución al refrescar la página.

Los comandos se ejecutan con el mismo pipeline que la entrada manual: soporte de `;` para multicomando, historial de comandos, alias y expansión de historial.

## 3. Stack Tecnológico

Se usan **exclusivamente tecnologías nativas de la web**, sin frameworks, sin dependencias, sin build tools:

```
/ (raíz)
├── index.html   # Estructura del documento
├── style.css    # Estilos visuales
└── main.js     # Lógica de la terminal
```

- **HTML5**: Semántica mínima, un `div` para la salida y un `input` disfrazado de línea de comandos.
- **CSS3**: Variables CSS para el tema de colores, `@font-face` o stack de fuentes mono, scroll suave, animaciones básicas para el cursor.
- **JavaScript (ES6+)**: Manejo del DOM, parser de comandos, sistema de usuarios, historial de comandos con `ArrowUp`/`ArrowDown`, autocompletado con `Tab`.

### 3.1. Por qué sin frameworks

- **Carga instantánea**: El HTML completo pesa < 20 KB.
- **Sin dependencias**: Nadie tiene que instalar nada; solo clonar y abrir.
- **Portabilidad absoluta**: Funciona en cualquier navegador moderno, incluso en dispositivos muy limitados.
- **Ideal para GitHub Pages**: Se sirve como sitio estático sin configuración.

## 4. Licencia — GNU AGPL v3

### 4.1. ¿Por qué AGPL?

La **AGPL (Affero General Public License)** extiende la GPL tradicional con una cláusula clave: si alguien modifica el código y lo ofrece como servicio a través de una red (por ejemplo, aloja una versión modificada de esta terminal en su propio dominio), **está obligado a publicar el código fuente completo de sus modificaciones** bajo la misma licencia.

### 4.2. Beneficios para este proyecto

| Beneficio               | Detalle                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Protección del código**       | Nadie puede tomar tu código, modificarlo y ofrecerlo como SaaS sin liberar los cambios.        |
| **Disuasión de uso indebido**     | Las empresas que no quieran abrir su código simplemente no usarán tu proyecto; te protege de parásitos. |
| **Atribución garantizada**       | La licencia obliga a mantener avisos de copyright y atribución.                    |
| **Alineación filosófica**       | Si crees en el software libre, la AGPL es la licencia más coherente para proyectos web.        |
| **Efecto educativo**          | El comando `license` dentro de la terminal educa a los visitantes sobre software libre.        |

### 4.3. Posibles afectaciones

| Afectación             | Realidad para este proyecto                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| **Menor adopción empresarial**   | Irrelevante: es un sitio personal, no un producto que aspira a adopción masiva.     |
| **Percepción de licencia "viral"** | La AGPL tiene fama de restrictiva; quien quiera contribuir sabrá que sus cambios serán libres también. |
| **Compatibilidad legal**      | La AGPL es compatible con GPLv3 pero no con GPLv2. Para este proyecto, no hay conflicto. |

### 4.4. ¿Es viable?

**Sí, completamente.** La AGPL es una de las licencias más usadas para proyectos web open-source (MongoDB, Grafana, OnlyOffice, etc.). Para un sitio personal tipo portafolio, la AGPL es incluso una **declaración de principios**: estás diciendo «esto es libre, siempre lo será, y si lo usas también debes serlo».

Además, GitHub Pages no ejecuta código del lado del servidor, así que no hay riesgo de que el propio hosting entre en conflicto con la licencia.

### 4.5. El comando `license`

Dentro de la terminal, el comando `license` imprime:

```
============================================================
 RoviSoft.net — Terminal Personal
 Copyright (C) 2024 Israel Alberto Roldan Vega

 This program is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General
 Public License as published by the Free Software Foundation,
 either version 3 of the License, or (at your option) any
 later version.

 Source code: https://github.com/airvzxf/rovisoft-web
 Full license: https://www.gnu.org/licenses/agpl-3.0.html
============================================================
```

## 5. Funcionalidades Técnicas

### 5.1. Prompt fijo

```css
.prompt-area {
 position: sticky;
 top: 0;
 z-index: 10;
 background: var(--bg);
}
```

El área de entrada se mantiene fija con `position: sticky; top: 0`. El contenido de salida tiene `overflow-y: auto` y ocupa el resto de la pantalla.

### 5.2. Historial de comandos

- `ArrowUp`: Navega hacia atrás en el historial de la sesión.
- `ArrowDown`: Navega hacia adelante.
- `Tab`: Autocompleta comandos conocidos.
- `Ctrl+L`: Atajo para `clear`.

### 5.3. Parser de comandos

El parser soporta:

- Comandos con argumentos (`su airvzxf`).
- Pipe simbólico (sintaxis, sin pipes reales).
- Múltiples espacios entre palabras.
- Trim automático de entrada.

### 5.4. Estados

```javascript
const state = {
  user: 'guest',     // usuario activo
  host: 'rovisoft.net', // hostname
  cwd: '~',       // directorio actual simulado
  history: [],      // historial de comandos
  historyIndex: -1,    // posición actual en el historial
  lang: 'es'       // idioma de la interfaz ('es' o 'en')
};
```

## 6. Diseño visual

- **Fondo**: Negro puro o `#0d1117` (GitHub dark) con ligero gradiente.
- **Texto**: Blanco/gris claro (`#c9d1d9`).
- **Prompt**: Verde brillante (`#3fb950`) para el usuario y host, blanco para el `$`.
- **Cursor**: Bloque verde que parpadea.
- **Output**: Colores diferenciados para errores (rojo), éxito (verde), info (cian).
- **Tipografía**: `'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Courier New', monospace`.
- **Scrollbar**: Estilizada, delgada y oscura.

## 7. Mejoras

Ninguno por el momento.

## 8. Bugs

### 8.1. En el móvil

- La barra del prompt desaparece cuando hace un scroll de los comandos y si escribo vuelve a aparecer pero cortada.
- También en la barra del prompt cuando escribo un texto de medio largo a largo desaparecen las letras y no puedo mover yo creo que será mejor que vaya no sé, desplazándose hacia abajo y con un cierto límite hasta que se haga un scroll yo creo que unas cuatro líneas y luego ya que permite scroll.

## 9. Roadmap / Ideas futuras

- Revisa la descripción de todos los commits que se han hecho desde el inicio y ve que características se han agregado para lo siguiente. Mejorar el archivo README.md, crear el archivo CONTRIBUTING.md y analizar si se deja este documento SPECS.md o se quita. También ver si se agregan más documentos o no. O sea, todo lo que tiene que ver con documentación hay que hacerlo en este punto.

## 10. Informacion personal

Nombre: Israel Alberto Roldan Vega
Email: israel.alberto.rv@gmail.com
Dominio web: https://rovisoft.net

GitHub: https://github.com/airvzxf
YouTube: https://www.youtube.com/@israel.roldan
X: https://x.com/IsraelAlbert_RV
LinkedIn: https://www.linkedin.com/in/israel-roldan-airvzxf/

Ubicación: Gudadalajara, Jalisco, Mexico

---

Aquí está el contexto estricto sobre mi identidad técnica y filosofía:
- Nombre: Israel Alberto Roldan Vega.
- Rol: Senior Software Engineer y Software Architect (más de 19 años de experiencia, actualmente en IBM México).
- Filosofía técnica: Soy un programador de sistemas y arquitecto de bajo nivel. Busco la perfección técnica, la optimización extrema y la comprensión profunda de la máquina (desde el hardware y ensamblador hasta el alto nivel). No me interesa el "Minimum Viable Product"; me interesa la pureza arquitectónica y el rendimiento absoluto.
- Diagnóstico: Asperger leve y funcional, lo que me otorga una capacidad de hiperfoco, análisis profundo de sistemas y una intolerancia a la ineficiencia o al código sucio.
- Tono requerido para las respuestas: Objetivo, crítico, directo y crudo (estilo UNIX). ESTÁ ESTRICTAMENTE PROHIBIDO usar halagos vacíos, lenguaje de marketing corporativo o validación superficial. Solo se debe destacar algo si es demostrable y estadísticamente excepcional.

Entorno y Stack Tecnológico (La base de mi sistema):
- OS: Arch Linux (gestión de paquetes estrictamente con pacman).
- Entorno: labwc (compositor Wayland), terminal Alacritty, Tmux.
- Editor: vim (nunca nano).
- Contenedores: Podman (orquestación sin demonio centralizado).
- Lenguajes principales: Rust, Bash, Python, JavaScript, HTML, Ensamblador.
- Estándares innegociables: En Bash, siempre uso `#!/usr/bin/env bash`, extensión `.bash`, y llaves para todas las variables `${VARIABLE}`.

Proyectos y Logros para incluir en las salidas:
1. c2flowch: Un sistema de mapeo y visualización de flujo de control para código fuente C, analizando el AST. Creado orquestando inteligencia artificial bajo mi dirección técnica estricta.
2. Benchmark de Bajo Nivel: Creación de un algoritmo de la secuencia de Fibonacci escrito en ensamblador que superó en rendimiento a la versión compilada en C.
3. Open Source / AUR: Mantenimiento de paquetes en el Arch User Repository (duc y duc-git).
4. Inteligencia Artificial y Machine Learning: Finalización exhaustiva de cursos en Machine Learning y Deep Learning. Investigación activa en sistemas de IA agéntica, implementaciones de Model Context Protocol (MCP) e inferencia local de modelos (Gemma 4, DeepSeek, Qwen) a través de Ollama. Mi enfoque es la orquestación de IAs como herramientas de desarrollo bajo mi dirección arquitectónica, no como usuario final.

TAREA:
Genera el texto plano y formateado (listo para mostrar en una terminal web) que será la salida de los siguientes comandos ejecutados por un usuario:

1. `whoami`: Un resumen técnico, directo y sin adornos sobre quién soy y mi enfoque de ingeniería (Arquitecto / Toolsmith).
2. `cat ./skills.txt`: Un listado estructurado de mi stack tecnológico y mi dominio del bajo nivel.
3. `ls -l ./projects`: Una tabla estilo UNIX que liste `c2flowch`, el `fibonacci_benchmark` y `aur_packages` con una descripción de una sola línea, concisa y técnica.
4. `man airvzxf`: Un texto a modo de manual de Linux (NAME, SYNOPSIS, DESCRIPTION) que explique mi filosofía de trabajo: por qué desprecio el código mal hecho, mi obsesión por desmenuzar el hardware y mi rol como orquestador de sistemas complejos. Tengo un dilema aquí porque normalmente el man es para la documentación de un comando en este caso debería existir el comando airzxf, no sé si sea mejor eso o solamente escribir el comando airzxf, o que se tengan que lograr en mi usuario `su airvzxf` y ahí aparezca un archivo que se llame `ME.md` o algo así, no sé.
5. `tail -f /var/log/ai_research.log`: Una salida de log que describa de manera técnica mi entrenamiento formal en Machine Learning y Deep Learning, mi infraestructura de inferencia local con Ollama y mis planes futuros para seguir utilizando sistemas agénticos en el análisis de código y automatización de bajo nivel.

Asegúrate de que la salida visual parezca texto puro de terminal, respetando saltos de línea y tabulaciones, sin usar markdown de negritas o cursivas si no se renderizaría en una TTY estándar.

---

Estudiante de Ingeniería en Desarrollo de Software (UnADM) | Desarrollador Web & Systems Enthusiast

Mi trayectoria combina la experiencia profesional en el ecosistema web con una profunda curiosidad por los sistemas de bajo nivel. Como estudiante en la UnADM, busco formalizar una práctica que ya ejecuto en el día a día: la resolución de problemas complejos mediante código eficiente y estructurado. Mi stack técnico es políglota, moviéndome con soltura en Python para prototipado rápido, Rust para rendimiento crítico, y Bash para una automatización de sistemas rigurosa.

Más allá del entorno laboral, soy un usuario activo de Arch Linux y contribuidor en GitHub, donde el hacking de videojuegos me sirve como laboratorio de ingeniería inversa. Mi enfoque no se limita a la pantalla; he llevado la lógica de programación al mundo físico, diseñando e implementando un sistema automatizado para el llenado de cisterna y tinaco, junto con otros sistemas para resolver problemas reales de infraestructura doméstica.

## 11. Conclusión

**RoviSoft.net** es más que un portafolio: es una declaración de estilo, una experiencia interactiva y un guiño a la cultura hacker y UNIX. La AGPL protege el proyecto manteniéndolo libre para siempre, mientras que el diseño minimalista y sin dependencias lo hace eternamente mantenible, rápido y portable. Es la intersección perfecta entre creatividad, principios y tecnología.
