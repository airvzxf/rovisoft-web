/* =====================================================
   RoviSoft.net — Terminal JavaScript
   GNU AGPL v3 — https://github.com/airvzxf/rovisoft-web
   ===================================================== */

(function () {
  "use strict";

  // ─── DOM ──────────────────────────────────────────────────

  const outputArea = document.getElementById("output-area");
  const promptArea = document.getElementById("prompt-area");
  const cmdInput = document.getElementById("cmd-input");
  const cmdBefore = document.getElementById("prompt-cmd-before");
  const cmdAfter = document.getElementById("prompt-cmd-after");
  const cursorEl = document.getElementById("cursor");
  const promptUser = document.getElementById("prompt-user");
  const promptHost = document.getElementById("prompt-host");
  const promptPath = document.getElementById("prompt-path");
  const promptSymbol = document.getElementById("prompt-symbol");
  const promptAt = document.getElementById("prompt-at");
  const promptColon = document.getElementById("prompt-colon");
  const terminal = document.getElementById("terminal");

  // ─── State ────────────────────────────────────────────────

  const VERSION = "1.12.0";
  const MAX_HISTORY = 1000;

  let sessionStartTime = Date.now();

  const THEMEABLE_VARS = [
    "--bg",
    "--bg-prompt",
    "--text",
    "--text-dim",
    "--green",
    "--green-bright",
    "--red",
    "--cyan",
    "--cyan-bright",
    "--yellow",
    "--magenta",
    "--border",
    "--scrollbar",
    "--font-size",
    "--line-height",
  ];

  const BUILTIN_THEMES = {
    dark: {
      name: "Dark",
      vars: {
        "--font-size": "15px",
        "--line-height": "1.6",
        "--bg": "#0d1117",
        "--bg-prompt": "#0d1117",
        "--text": "#c9d1d9",
        "--text-dim": "#8b949e",
        "--green": "#3fb950",
        "--green-bright": "#56d364",
        "--red": "#f85149",
        "--cyan": "#58a6ff",
        "--cyan-bright": "#79c0ff",
        "--yellow": "#d2991d",
        "--magenta": "#bc8cff",
        "--border": "#21262d",
        "--scrollbar": "#30363d",
      },
    },
    light: {
      name: "Light",
      vars: {
        "--font-size": "15px",
        "--line-height": "1.6",
        "--bg": "#f6f8fa",
        "--bg-prompt": "#ffffff",
        "--text": "#1f2328",
        "--text-dim": "#656d76",
        "--green": "#1a7f37",
        "--green-bright": "#238636",
        "--red": "#cf222e",
        "--cyan": "#0969da",
        "--cyan-bright": "#0550ae",
        "--yellow": "#9a6700",
        "--magenta": "#8250df",
        "--border": "#d0d7de",
        "--scrollbar": "#afb8c1",
      },
    },
  };

  let currentTheme = "dark";
  let customThemes = {};

  const state = {
    user: "guest",
    host: "rovisoft.net",
    cwd: "~",
    history: [],
    historyIndex: -1,
    tempInput: "",
    aliases: {},
    lang: "es",
    suTarget: null,
    cowsayMode: false,
    hackerMode: false,
  };

  var matrixActive = false;

  // ─── Internationalization ──────────────────────────────────

  var I18N = {
    es: {
      "welcome.main":
        "Bienvenido a <strong>RoviSoft.net</strong> \u2014 Terminal interactiva (TTY).",
      "welcome.desc":
        "Este no es un sitio web tradicional: es una terminal de comandos interactiva que funciona como p\u00e1gina de inicio personal.",
      "welcome.help":
        'Escribe <span class="cmd">help</span> para ver los comandos disponibles.',
      "welcome.config":
        'Escribe <span class="cmd">config</span> para gestionar el almacenamiento de preferencias.',
      "welcome.mouse": "El mouse no sirve de mucho... mejor escribe.",
      "welcome.ariaLabel": "L\u00ednea de comandos",

      "help.help": "Muestra esta ayuda",
      "help.clear": "Limpia la pantalla",
      "help.whoami": "Muestra el usuario actual",
      "help.users": "Lista los usuarios del sistema",
      "help.su": "Cambia de usuario",
      "help.airvzxf": "Informaci\u00f3n de AirvZxf",
      "help.neofetch": "Informaci\u00f3n del sistema",
      "help.date": "Fecha y hora actual",
      "help.echo": "Repite el texto",
      "help.alias": "Gestiona alias de comandos",
      "help.unalias": "Elimina un alias",
      "help.theme": "Gestiona temas de color y tipograf\u00eda",
      "help.lang": "Cambia el idioma de la interfaz",
      "help.config": "Gestiona el almacenamiento local",
      "help.reboot": "Reinicia la terminal",
      "help.reset": "Restablece a valores de fábrica (borra datos)",
      "help.version": "Muestra la versi\u00f3n",
      "help.license": "Muestra la licencia",
      "help.history": "Historial de comandos",
      "help.man": "Muestra p\u00e1ginas de manual",
      "help.shortcuts":
        "Atajos: \u2191/\u2193 (historial) | Tab (autocompletar) | Ctrl+L (clear) | !N / !! (history) | ; (multicommando)",
      "help.urlParams":
        'Par\u00e1metros URL: <span class="cmd">?cmd=clear;su%20airvzxf</span> (\u00f3 &cmd= repetidos)',

      "users.rootDesc": "Superusuario",
      "users.airvzxfDesc": "Administrador / Propietario",
      "users.guestDesc": "Invitado (sesi\u00f3n actual por defecto)",

      "su.usage": "Uso: su &lt;user&gt;",
      "su.authSuccess": "Autenticaci\u00f3n exitosa.",
      "su.authFailed": "su: Autenticaci\u00f3n fallida.",
      "su.password": "Contrase\u00f1a:",
      "su.welcomeUser": "Bienvenido, {0}",
      "su.guestRestored": "Sesi\u00f3n de invitado restaurada.",
      "su.unknownUser": "su: usuario '{0}' no existe.",

      "version.label": "Versi\u00f3n:",
      "version.build": "Build:",
      "version.upgraded": "instalada",

      "airvzxf.usage": "Uso: airvzxf &lt;subcomando&gt;",
      "airvzxf.paramSubcommand": "subcomando",
      "airvzxf.about": "Informaci\u00f3n del propietario",
      "airvzxf.contact": "Formas de contacto",
      "airvzxf.social": "Enlaces a redes sociales",
      "airvzxf.projects": "Proyectos del portafolio",
      "airvzxf.skills": "Stack tecnol\u00f3gico y dominios",
      "airvzxf.research": "Investigaci\u00f3n en IA y ML",
      "airvzxf.unknownSubcommand": "airvzxf: subcomando desconocido '{0}'",
      "airvzxf.useHelp":
        'Usa <span class="cmd">airvzxf</span> para ver los subcomandos disponibles.',

      "about.of": "de RoviSoft.net",
      "about.location": "Ubicaci\u00f3n:",
      "about.role": "Rol:",
      "about.tech": "Tech:",

      "contact.email": "Email:",

      "social.github": "GitHub:",
      "social.youtube": "YouTube:",
      "social.x": "X:",
      "social.linkedin": "LinkedIn:",

      "neofetch.os": "OS:",
      "neofetch.host": "Host:",
      "neofetch.kernel": "Kernel:",
      "neofetch.shell": "Shell:",
      "neofetch.user": "User:",
      "neofetch.theme": "Theme:",
      "neofetch.uptime": "Uptime:",
      "neofetch.config": "Config:",
      "neofetch.storage": "Storage:",
      "neofetch.session": "(sesi\u00f3n)",
      "neofetch.accepted": "aceptado",
      "neofetch.rejected": "rechazado",
      "neofetch.undecided": "sin decidir",

      "license.title": "RoviSoft.net \u2014 Terminal Personal",
      "license.source": "C\u00f3digo fuente:",
      "license.fullLicense": "Licencia completa:",

      "history.empty": "No hay comandos en el historial.",

      "lang.title": "Idioma de la interfaz",
      "lang.current": "Idioma actual:",
      "lang.available": "Idiomas disponibles:",
      "lang.changed": "Idioma cambiado a '{0}'.",
      "lang.unknownLang": "lang: idioma desconocido '{0}'.",
      "lang.hint":
        'Usa <span class="cmd">lang list</span> para ver los idiomas disponibles.',

      "theme.title": "Temas de color y tipograf\u00eda",
      "theme.current": "Tema actual:",
      "theme.currentMarker": "actual",
      "theme.builtin": "Temas integrados:",
      "theme.custom": "Temas personalizados:",
      "theme.description": "Cambia al tema especificado",
      "theme.listDesc": "Lista los temas disponibles",
      "theme.createDesc": "Crea un tema personalizado",
      "theme.editDesc": "Edita un tema personalizado",
      "theme.deleteDesc": "Elimina un tema personalizado",
      "theme.exportDesc": "Exporta las variables del tema",
      "theme.createNameRequired": "theme create: se requiere un nombre.",
      "theme.createNameInvalid":
        "theme create: nombre inv\u00e1lido. Solo letras min\u00fasculas, n\u00fameros, guiones y guiones bajos. Debe iniciar con letra, m\u00e1x 20 caracteres.",
      "theme.createBuiltIn":
        "theme create: '{0}' es un tema integrado y no puede sobreescribirse.",
      "theme.createBaseInvalid":
        "theme create: base inv\u00e1lida '{0}'. Valores: dark, light.",
      "theme.createVarUnknown":
        "theme create: variable desconocida '{0}'. Variables disponibles: {1}",
      "theme.createVarRequired":
        "theme create: se requiere al menos una variable de color o tipograf\u00eda.",
      "theme.createUseExport":
        'Usa <span class="cmd">theme export</span> para ver las variables disponibles.',
      "theme.created": "Tema '{0}' creado (base: {1}, {2} variable{3}).",
      "theme.useTheme":
        'Usa <span class="cmd">theme {0}</span> para activarlo.',
      "theme.editNameRequired": "theme edit: se requiere un nombre.",
      "theme.editBuiltIn":
        "theme edit: no se puede editar el tema integrado '{0}'.",
      "theme.editNotExists": "theme edit: el tema '{0}' no existe.",
      "theme.editUseCreate":
        'Usa <span class="cmd">theme create {0}</span> para crearlo primero.',
      "theme.editNoChanges":
        "theme edit: se requiere al menos una variable o --base para editar.",
      "theme.editBaseInvalid":
        "theme edit: base inv\u00e1lida '{0}'. Valores: dark, light.",
      "theme.edited": "Tema '{0}' editado ({1}).",
      "theme.deleteNameRequired":
        "theme delete: se requiere un nombre de tema personalizado.",
      "theme.deleteBuiltIn":
        "theme delete: no se puede eliminar el tema integrado '{0}'.",
      "theme.deleteNotExists": "theme delete: el tema '{0}' no existe.",
      "theme.deleted": "Tema '{0}' eliminado.",
      "theme.exportTitle": "Tema: {0}",
      "theme.exportNotExists": "theme export: el tema '{0}' no existe.",
      "theme.changedTo": "Tema cambiado a '{0}'.",
      "theme.notExists": "theme: '{0}' no existe.",
      "theme.useList":
        'Usa <span class="cmd">theme list</span> para ver los temas disponibles.',
      "theme.variable": "variable",
      "theme.variables": "variables",

      "alias.title": "alias \u2014 Define atajos para comandos",
      "alias.showAliases": "Muestra los alias definidos",
      "alias.showValue": "Muestra el valor de un alias",
      "alias.define": "Define un nuevo alias",
      "alias.preserved": "Los alias se conservan entre sesiones.",
      "alias.noOverride":
        "No se puede crear un alias con el nombre de un comando existente.",
      "alias.notDefined": "alias: {0}: no definido.",
      "alias.nameEmpty": "alias: nombre vac\u00edo.",
      "alias.valueEmpty": "alias: valor vac\u00edo.",
      "alias.existingCommand": "alias: '{0}' es un comando existente.",

      "unalias.title": "unalias \u2014 Elimina un alias definido",
      "unalias.desc": "Elimina el alias especificado",
      "unalias.useAlias":
        'Usa <span class="cmd">alias</span> para ver los alias definidos.',
      "unalias.notDefined": "unalias: {0}: no definido.",

      permDenied: "{0}: permiso denegado.",
      loginAs:
        'Inicia sesi\u00f3n como {0} con <span class="cmd">su {0}</span>.',

      cmdNotFound: "comando no encontrado: {0}",

      "config.title": "Almacenamiento local",
      "config.state": "Estado:",
      "config.mechanism": "Mecanismo:",
      "config.wouldStore": "Se almacenar\u00eda:",
      "config.session": "Sesi\u00f3n de usuario",
      "config.historyStore": "Historial de comandos",
      "config.preferences": "Preferencias",
      "config.versionStore": "Versi\u00f3n",
      "config.accept": "Aceptar almacenamiento persistente",
      "config.reject": "Rechazar (datos vol\u00e1tiles, se pierden al cerrar)",
      "config.status": "Detalle t\u00e9cnico del almacenamiento",
      "config.show": "Mostrar datos almacenados",
      "config.acceptedShort": "aceptado",
      "config.rejectedShort": "rechazado",
      "config.undecidedShort": "sin decidir",
      "config.volatile": "sessionStorage (vol\u00e1til)",
      "config.acceptedMsg": "Almacenamiento persistente aceptado.",
      "config.acceptedMsg2": "Tus datos se guardar\u00e1n entre sesiones.",
      "config.rejectedMsg": "Almacenamiento persistente rechazado.",
      "config.rejectedMsg2":
        "Los datos se perder\u00e1n al cerrar la pesta\u00f1a.",
      "config.rejectedMsg3":
        'Usa <span class="cmd">config accept</span> para revertir.',
      "config.unknownSubcommand": "config: subcomando desconocido '{0}'",
      "config.useConfig":
        'Usa <span class="cmd">config</span> para ver las opciones disponibles.',
      "config.labelMode": "Modo:",
      "config.labelStore": "Almac\u00e9n:",
      "config.labelVersion": "Versi\u00f3n:",
      "config.labelUptime": "Uptime:",
      "config.labelData": "Datos:",
      "config.keys": "llaves",
      "config.inWord": "en",

      "reset.msg": "Restableciendo a valores de f\u00e1brica...",
      "reboot.msg": "Reiniciando terminal...",

      "about.bio":
        "Senior Software Engineer & Software Architect con m\u00e1s de 19 a\u00f1os de experiencia. Programador de sistemas y arquitecto de bajo nivel. Busco la perfecci\u00f3n t\u00e9cnica, la optimizaci\u00f3n extrema y la comprensi\u00f3n profunda de la m\u00e1quina \u2014 desde el hardware y ensamblador hasta el alto nivel.",
      "about.roleAdmin": "Administrador / Propietario",
      "about.roleTitle": "Senior Software Engineer & Software Architect",

      "projects.c2flowch.desc":
        "Sistema de mapeo y visualizaci\u00f3n de flujo de control para c\u00f3digo fuente C, analizando el AST",
      "projects.telora.desc":
        "Asistente de Speech-to-Text para Linux: demonio en Rust con Whisper (CUDA) y cliente GTK4",
      "projects.bose_connect_linux.desc":
        "Aplicaci\u00f3n Bose\u00ae Connect para Linux: ingenier\u00eda inversa de protocolos Bluetooth (46\u2605)",
      "projects.ftp_deployment_action.desc":
        "GitHub Action para despliegue v\u00eda FTP: copia archivos del repositorio al servidor (36\u2605, 9 forks)",
      "projects.fibonacci_benchmark.desc":
        "Algoritmo de Fibonacci en ensamblador que super\u00f3 en rendimiento a la versi\u00f3n compilada en C",
      "projects.aur_packages.desc":
        "Mantenimiento de paquetes duc y duc-git en el Arch User Repository",

      "env.containers": "Contenedores:",

      "skills.header.languages": "LENGUAJES:",
      "skills.lang.rust": "Systems programming, rendimiento cr\u00edtico",
      "skills.lang.bash": "Automatizaci\u00f3n, scripting de sistemas",
      "skills.lang.python": "Prototipado r\u00e1pido, ML/DL, tooling",
      "skills.lang.javascript": "Web frontend, Node.js",
      "skills.lang.assembly": "x86/x64, optimizaci\u00f3n de bajo nivel",
      "skills.lang.c": "Reverse engineering, sistemas embebidos",
      "skills.header.env": "ENTORNO & HERRAMIENTAS:",
      "skills.header.domains": "DOMINIOS:",
      "skills.domain.1": "  Arquitectura de sistemas",
      "skills.domain.2": "  Optimizaci\u00f3n de bajo nivel",
      "skills.domain.3": "  Machine Learning / Deep Learning",
      "skills.domain.4": "  MCP / IA Ag\u00e9ntica",
      "skills.domain.5": "  Ingenier\u00eda inversa",
      "skills.domain.6": "  Empaquetado AUR",
      "skills.domain.7":
        "  Orquestaci\u00f3n de IA bajo direcci\u00f3n arquitect\u00f3nica",
      "skills.domain.8": "  Speech-to-Text (Whisper/CUDA)",
      "skills.domain.9": "  CI/CD (GitHub Actions)",

      "research.log1":
        "[2024-01-15 09:23:11] ML Specialization completada (Udemy)",
      "research.log2":
        "[2024-03-02 14:55:42] Deep Learning Specialization completada (Udemy)",
      "research.log3":
        "[2024-06-10 11:30:00] Infraestructura de inferencia local con Ollama desplegada",
      "research.log4":
        "[2024-06-10 11:30:05] Modelos cargados: Gemma 4, DeepSeek, Qwen",
      "research.log5":
        "[2024-06-10 11:30:07] Investigaci\u00f3n MCP (Model Context Protocol) iniciada",
      "research.log6":
        "[2024-08-22 16:45:33] Pipeline de orquestaci\u00f3n de IA ag\u00e9ntica: fase 1",
      "research.log7":
        "[2024-11-05 08:12:00] Automatizaci\u00f3n de an\u00e1lisis de c\u00f3digo con LLMs locales",
      "research.log8":
        "[2025-01-20 13:00:00] OpenCode: entorno de desarrollo impulsado por IA",
      "research.log9":
        "[2025-03-15 10:00:00] Evaluaci\u00f3n DeepSeek V4 para tareas de bajo nivel",
      "research.log10":
        "[2025-05-01 10:00:00] ai-llm-rust-expert: fine-tuning con SFT + DPO para Rust idiom\u00e1tico",
      "research.log11":
        "[2025-09-01 09:00:00] formic-ai-framework: orquestaci\u00f3n multi-agente declarativa con YAML",
      "research.log12":
        "[2025-11-10 14:30:00] Experimentos de Deep Learning: backpropagation, CNNs y RNNs desde cero",
      "research.log13":
        "[2026-02-09 18:10:00] Telora: demonio Rust + Whisper (CUDA) para Speech-to-Text en Linux",
      "research.log14":
        "[2026-05-05 03:42:00] Candle: framework minimalista de ML en Rust",

      "man.header.name": "NOMBRE",
      "man.nameText":
        "airvzxf - Senior Software Engineer, Arquitecto de Sistemas, Toolsmith",
      "man.header.synopsis": "SINOPSIS",
      "man.synopsisText":
        "Arquitectura de sistemas, optimizaci\u00f3n de bajo nivel, orquestaci\u00f3n de IA.",
      "man.header.description": "DESCRIPCI\u00d3N",
      "man.desc.p1":
        "  airvzxf es un programador de sistemas y arquitecto de software con m\u00e1s\n  de 19 a\u00f1os de experiencia. Opera en la intersecci\u00f3n del hardware\n  y los sistemas de alto nivel, con un enfoque obsesivo en la pureza\n  arquitect\u00f3nica y la optimizaci\u00f3n extrema.",
      "man.desc.p2":
        "  Desprecia el c\u00f3digo ineficiente, los atajos MVP y la deuda t\u00e9cnica.\n  Su enfoque se basa en la comprensi\u00f3n profunda de la m\u00e1quina,\n  desde ensamblador hasta las abstracciones de alto nivel.",
      "man.desc.p3":
        "  Actualmente orquesta sistemas de IA como herramientas de desarrollo\n  bajo direcci\u00f3n arquitect\u00f3nica estricta \u2014 no como aplicaciones\n  de usuario final, sino como instrumentos de ingenier\u00eda.",
      "man.desc.p4":
        "  Diagnosticado con Asperger leve funcional, lo que le otorga\n  hiperfoco, an\u00e1lisis profundo de sistemas y cero tolerancia\n  al c\u00f3digo sucio.",
      "man.header.environment": "ENTORNO",
      "man.header.languages": "LENGUAJES",
      "man.langList": "Rust, Bash, Python, JavaScript, Assembly, C",
      "man.header.seeAlso": "VEASE TAMBIEN",
      "man.header.options": "OPCIONES",
      "man.header.subcommands": "SUBCOMANDOS",
      "man.header.historyExpansion": "EXPANSION DE HISTORIAL",
      "man.available": "Paginas de manual disponibles:",
      "man.notFound": "No hay entrada de manual para '{0}'.",
      "man.hint":
        'Usa <span class="cmd">man</span> para ver las paginas disponibles.',

      "man.help.name": "help - Muestra los comandos disponibles",
      "man.help.synopsis": "help",
      "man.help.description":
        "Muestra una lista de todos los comandos disponibles en la terminal, junto con una breve descripcion de cada uno. Tambien muestra atajos de teclado y parametros de URL.",
      "man.help.seeAlso": "man(1)",

      "man.clear.name": "clear - Limpia la pantalla",
      "man.clear.synopsis": "clear",
      "man.clear.description":
        "Limpia toda la salida visible de la terminal, proporcionando un espacio de trabajo limpio. El historial de comandos se preserva. Tambien se puede activar con Ctrl+L.",
      "man.clear.seeAlso": "reboot(1), reset(1)",

      "man.whoami.name": "whoami - Muestra el usuario actual",
      "man.whoami.synopsis": "whoami",
      "man.whoami.description":
        "Muestra el nombre del usuario de la sesion actual. Los usuarios disponibles son: guest (invitado), airvzxf (administrador) y root (superusuario).",
      "man.whoami.seeAlso": "users(1), su(1), man(1)",

      "man.users.name": "users - Lista los usuarios del sistema",
      "man.users.synopsis": "users",
      "man.users.description":
        "Muestra una lista de todos los usuarios disponibles en el sistema junto con sus roles y descripciones.",
      "man.users.seeAlso": "whoami(1), su(1)",

      "man.su.name": "su - Cambia de usuario",
      "man.su.synopsis": "su <usuario>",
      "man.su.description":
        "Cambia la sesion al usuario especificado. Los usuarios disponibles son: guest (sin contrasena), airvzxf (sin contrasena) y root (requiere contrasena). Use su sin argumentos para ver el uso.",
      "man.su.seeAlso": "whoami(1), users(1)",

      "man.airvzxf.name": "airvzxf - Informacion del propietario",
      "man.airvzxf.synopsis": "airvzxf <subcomando>",
      "man.airvzxf.description":
        "Muestra informacion sobre el propietario y administrador de RoviSoft.net. Requiere iniciar sesion como airvzxf o root. Los subcomandos disponibles son: about, contact, social, projects, skills y research.",
      "man.airvzxf.seeAlso": "whoami(1), neofetch(1)",

      "man.neofetch.name": "neofetch - Informacion del sistema",
      "man.neofetch.synopsis": "neofetch",
      "man.neofetch.description":
        "Muestra informacion del sistema en formato neofetch, incluyendo: sistema operativo, host, kernel, shell, usuario, tema, tiempo de actividad, estado de configuracion y almacenamiento.",
      "man.neofetch.seeAlso": "version(1), config(1)",

      "man.date.name": "date - Fecha y hora actual",
      "man.date.synopsis": "date",
      "man.date.description":
        "Muestra la fecha y hora actuales segun el reloj del navegador.",
      "man.date.seeAlso": "neofetch(1)",

      "man.echo.name": "echo - Repite texto",
      "man.echo.synopsis": "echo <texto>",
      "man.echo.description":
        "Muestra el texto proporcionado en la terminal. Si no se proporciona texto, muestra una linea vacia.",
      "man.echo.seeAlso": "alias(1)",

      "man.alias.name": "alias - Define atajos para comandos",
      "man.alias.synopsis": "alias | alias <nombre> | alias <nombre>='comando'",
      "man.alias.description":
        "Gestiona alias de comandos. Sin argumentos, muestra los alias definidos y el uso. Los alias no pueden sobreescribir comandos existentes. Se conservan entre sesiones si el almacenamiento persistente esta habilitado.",
      "man.alias.opt.show": "Muestra los alias definidos",
      "man.alias.opt.showValue": "Muestra el valor de un alias especifico",
      "man.alias.opt.define": "Define un nuevo alias con el valor especificado",
      "man.alias.seeAlso": "unalias(1), config(1)",

      "man.unalias.name": "unalias - Elimina un alias",
      "man.unalias.synopsis": "unalias <nombre>",
      "man.unalias.description":
        "Elimina el alias especificado de la lista de alias definidos.",
      "man.unalias.seeAlso": "alias(1)",

      "man.theme.name": "theme - Gestiona temas de color y tipograf\u00eda",
      "man.theme.synopsis":
        "theme | theme <nombre> | theme list | theme create | theme edit | theme delete | theme export",
      "man.theme.description":
        "Gestiona los temas de color y tipografia de la terminal. Los temas integrados son 'dark' y 'light'. Se pueden crear temas personalizados con variables de color y tipografia especificas. Los temas personalizados se conservan entre sesiones si el almacenamiento persistente esta habilitado.",
      "man.theme.sub.list": "Lista los temas disponibles",
      "man.theme.sub.set": "Cambia al tema especificado",
      "man.theme.sub.create": "Crea un tema personalizado",
      "man.theme.sub.edit": "Edita un tema personalizado",
      "man.theme.sub.delete": "Elimina un tema personalizado",
      "man.theme.sub.export": "Exporta las variables del tema",
      "man.theme.seeAlso": "config(1), neofetch(1)",

      "man.lang.name": "lang - Cambia el idioma de la interfaz",
      "man.lang.synopsis": "lang | lang <codigo> | lang list",
      "man.lang.description":
        "Cambia o muestra el idioma de la interfaz de la terminal. Los idiomas disponibles se listan con 'lang list'. El cambio se guarda entre sesiones si el almacenamiento persistente esta habilitado.",
      "man.lang.seeAlso": "config(1)",

      "man.config.name": "config - Gestiona el almacenamiento local",
      "man.config.synopsis":
        "config | config accept | config reject | config status | config show",
      "man.config.description":
        "Gestiona las preferencias de almacenamiento local. Controla si los datos persisten entre sesiones (localStorage) o son volatiles (sessionStorage). Acepta tres estados: aceptado, rechazado o sin decidir.",
      "man.config.sub.accept": "Acepta el almacenamiento persistente",
      "man.config.sub.reject":
        "Rechaza (datos volatiles, se pierden al cerrar)",
      "man.config.sub.status": "Muestra detalles tecnicos del almacenamiento",
      "man.config.sub.show": "Muestra los datos almacenados",
      "man.config.seeAlso": "theme(1), reboot(1)",

      "man.reboot.name": "reboot - Reinicia la terminal",
      "man.reboot.synopsis": "reboot",
      "man.reboot.description":
        "Reinicia la terminal, recargando la pagina y reinicializando la sesion. Los datos se preservan si el almacenamiento persistente esta habilitado.",
      "man.reboot.seeAlso": "reset(1), clear(1)",

      "man.reset.name": "reset - Restablece a valores de fabrica",
      "man.reset.synopsis": "reset",
      "man.reset.description":
        "Restablece la terminal a sus valores de fabrica, eliminando todos los datos almacenados incluyendo historial, alias, temas personalizados y preferencias. Esta accion es irreversible.",
      "man.reset.seeAlso": "reboot(1), config(1)",

      "man.version.name": "version - Muestra la version",
      "man.version.synopsis": "version",
      "man.version.description":
        "Muestra la version actual de la terminal, informacion del build y enlaces al codigo fuente.",
      "man.version.seeAlso": "neofetch(1), license(1)",

      "man.license.name": "license - Muestra la licencia",
      "man.license.synopsis": "license",
      "man.license.description":
        "Muestra la informacion de licencia GNU Affero General Public License v3 (AGPL v3), junto con enlaces al codigo fuente y al texto completo de la licencia.",
      "man.license.seeAlso": "version(1)",

      "man.history.name": "history - Historial de comandos",
      "man.history.synopsis": "history",
      "man.history.description":
        "Muestra la lista de comandos ejecutados previamente con sus numeros de indice.",
      "man.history.expansionText":
        "Se puede re-ejecutar un comando usando su numero: !N ejecuta el comando numero N, y !! ejecuta el ultimo comando.",
      "man.history.seeAlso": "alias(1)",

      "man.man.name": "man - Muestra paginas de manual",
      "man.man.synopsis": "man <comando>",
      "man.man.description":
        "Muestra la pagina de manual para el comando especificado. Las paginas de manual contienen informacion detallada sobre cada comando, incluyendo sinopsis, descripciones, opciones y comandos relacionados. Sin argumentos, lista todos los comandos con paginas de manual disponibles.",
      "man.man.seeAlso": "help(1)",

      eventNotFound: "{0}: event not found",
      historyExpansion: "\u2192 {0}",

      "easter.sudo":
        "Permiso denegado. S\u00e9 lo que est\u00e1s pensando... pero no.",
      "easter.exit": "No hay escape; La Matrix te tiene.",
      "easter.42": "La respuesta a la vida, el universo y todo.",
      "easter.cowsay.on":
        "Modo cowsay activado. Las vacas est\u00e1n observando.",
      "easter.cowsay.off": "Modo cowsay desactivado. Las vacas se han ido.",
      "easter.cowsay.quips": [
        "Muu.",
        "Ya despert\u00e9. \u00bfQu\u00e9 haces?",
        "El c\u00f3digo compila. Disfrútalo mientras dure.",
        "sudo no funciona aquí tampoco.",
        "Estaba debuggeando y me encontr\u00e9 con esta vaca.",
        "He visto tu historial. Impresionante.",
        "\u00bfProbaste con 42?",
        "La Matrix te tiene.",
        "Este no es el Easter egg que buscas.",
        "En mi servidor me alimentan bien.",
        "0xC0FFEE \u2014 mi direcci\u00f3n de memoria favorita.",
        "El bug estaba entre la silla y el teclado.",
        "Un developer, una vaca, una terminal. \u00bfQu\u00e9 puede salir mal?",
        "He visto cosas que no creer\u00edas... como CSS que se centra solo.",
        "La respuesta es siempre 42.",
      ],
      "easter.rmrf.header": "Eliminando archivos...",
      "easter.rmrf.punchline":
        "Es broma, tus datos est\u00e1n a salvo... \u00bfo no?",
      "easter.rmrf.files.linux": [
        "removing /etc/passwd...",
        "removing /etc/shadow...",
        "removing /home/user/.bashrc...",
        "removing /home/user/.ssh/authorized_keys...",
        "removing /usr/bin/vim...",
        "removing /usr/bin/git...",
        "removing /usr/bin/python3...",
        "removing /boot/vmlinuz...",
        "removing /var/log/syslog...",
        "removing /etc/hostname...",
        "removing /root/.config/...",
        "removing /tmp/.X11-unix/...",
        "removing /usr/share/doc/...",
        "removing /lib/systemd/systemd...",
        "removing /bin/sh...",
      ],
      "easter.rmrf.files.windows": [
        "removing C:\\Windows\\System32\\drivers\\etc\\hosts...",
        "removing C:\\Windows\\System32\\config\\SAM...",
        "removing C:\\Users\\User\\Documents...",
        "removing C:\\Users\\User\\Desktop...",
        "removing C:\\Program Files\\App...",
        "removing C:\\Windows\\explorer.exe...",
        "removing C:\\Windows\\System32\\cmd.exe...",
        "removing C:\\Users\\User\\AppData\\Local...",
        "removing C:\\Windows\\System32\\ntdll.dll...",
        "removing C:\\Users\\User\\.ssh\\id_rsa...",
        "removing C:\\ProgramData...",
        "removing C:\\Windows\\Temp...",
        "removing C:\\Users\\User\\Downloads...",
        "removing C:\\Windows\\RegEdit.exe...",
        "removing C:\\pagefile.sys...",
      ],
      "easter.rmrf.files.macos": [
        "removing /Users/user/.zshrc...",
        "removing /Users/user/.ssh/id_rsa...",
        "removing /System/Library/CoreServices...",
        "removing /Applications/Safari.app...",
        "removing /Applications/Xcode.app...",
        "removing /usr/bin/git...",
        "removing /usr/local/bin/brew...",
        "removing /Library/Preferences/com.apple...",
        "removing /private/var/db/...",
        "removing /Users/user/Documents...",
        "removing /Users/user/Downloads...",
        "removing /System/Library/Extensions...",
        "removing /usr/sbin/periodic...",
        "removing /var/log/system.log...",
        "removing /Users/user/Library/...",
      ],
      "easter.rmrf.files.android": [
        "removing /data/app/com.android.settings/base.apk...",
        "removing /data/data/com.android.chrome/...",
        "removing /sdcard/DCIM/Camera/...",
        "removing /sdcard/Download/...",
        "removing /system/bin/sh...",
        "removing /system/app/Settings/Settings.apk...",
        "removing /data/local/tmp/...",
        "removing /sdcard/WhatsApp/...",
        "removing /data/app/com.google.android.gms/...",
        "removing /system/etc/hosts...",
        "removing /sdcard/Pictures/...",
        "removing /data/data/com.android.providers.media/...",
        "removing /system/lib64/libandroid_runtime.so...",
        "removing /data/misc/wifi/wpa_supplicant.conf...",
        "removing /system/framework/framework.jar...",
      ],
      "easter.rmrf.files.ios": [
        "removing /var/mobile/Applications/com.apple.mobilesafari/...",
        "removing /var/mobile/Library/Preferences/...",
        "removing /private/var/containers/Data/Application/...",
        "removing /System/Library/CoreServices/SpringBoard.app/...",
        "removing /var/mobile/Containers/Data/Application/...",
        "removing /System/Library/PrivateFrameworks/...",
        "removing /private/var/mobile/Library/Caches/...",
        "removing /var/mobile/Documents/...",
        "removing /System/Library/Frameworks/UIKit.framework/...",
        "removing /private/var/mobile/Library/SMS/...",
        "removing /System/Library/CoreServices/...",
        "removing /var/mobile/Library/AddressBook/...",
        "removing /private/var/db/...",
        "removing /System/Library/Extensions/...",
        "removing /var/mobile/Library/Preferences/com.apple...",
      ],
      "easter.konami.on": "MODO HACKER ACTIVADO",
      "easter.konami.off": "MODO HACKER DESACTIVADO",
      "easter.konami.hint": "Algunos secretos requieren m\u00e1s que escribir.",

      "easter.matrix.active":
        "Ya hay una animaci\u00f3n Matrix en ejecuci\u00f3n.",
      "easter.matrix.exitMsg": "Despertando de la Matrix...",
    },
  };

  var i18nLoadPending = {};

  function loadI18N(lang, callback) {
    if (I18N[lang]) {
      if (callback) callback(true);
      return;
    }
    if (i18nLoadPending[lang]) {
      if (callback) i18nLoadPending[lang].push(callback);
      return;
    }
    i18nLoadPending[lang] = callback ? [callback] : [];
    var script = document.createElement("script");
    script.src = "i18n/" + lang + ".js?v=" + encodeURIComponent(VERSION);
    script.onerror = function () {
      var cbs = i18nLoadPending[lang];
      delete i18nLoadPending[lang];
      if (cbs) {
        for (var i = 0; i < cbs.length; i++) {
          cbs[i](false);
        }
      }
    };
    document.head.appendChild(script);
  }

  window._registerI18N = function (lang, data) {
    I18N[lang] = data;
    var cbs = i18nLoadPending[lang];
    delete i18nLoadPending[lang];
    if (cbs) {
      for (var i = 0; i < cbs.length; i++) {
        cbs[i](true);
      }
    }
  };

  function t(key) {
    return (I18N[state.lang] && I18N[state.lang][key]) || I18N.es[key] || key;
  }

  function tf(key) {
    var template = t(key);
    var args = Array.prototype.slice.call(arguments, 1);
    return template.replace(/\{(\d+)\}/g, function (m, i) {
      return args[parseInt(i, 10)] !== undefined ? args[parseInt(i, 10)] : m;
    });
  }

  var AVAILABLE_LANGS = {
    es: "Espa\u00f1ol",
    en: "English",
  };

  // ─── Users ────────────────────────────────────────────────

  const USERS = {
    guest: {
      name: "guest",
      email: "desconocido",
      bio: "Usuario invitado.",
      role: "Invitado",
      shell: "/bin/bash",
      location: "Desconocida",
    },
    root: {
      name: "root",
      shell: "/bin/bash",
      location: "RoviSoft.net",
    },
    airvzxf: {
      name: "Israel Alberto Roldan Vega",
      email: "israel.alberto.rv@gmail.com",
      shell: "/bin/bash",
      location: "Guadalajara, Jalisco, M\u00e9xico",
      tech: [
        "Rust",
        "Bash",
        "Python",
        "JavaScript",
        "Assembly",
        "C",
        "Podman",
        "Linux (Arch)",
        "Git",
      ],
      github: "https://github.com/airvzxf",
      youtube: "https://www.youtube.com/@israel.roldan",
      x: "https://x.com/IsraelAlbert_RV",
      linkedin: "https://www.linkedin.com/in/israel-roldan-airvzxf/",
      website: "https://rovisoft.net",
      projects: [
        {
          name: "c2flowch",
          url: "https://github.com/airvzxf/c2flowch",
        },
        {
          name: "telora",
          url: "https://github.com/airvzxf/telora",
        },
        {
          name: "bose_connect_linux",
          url: "https://github.com/airvzxf/bose-connect-app-linux",
        },
        {
          name: "ftp_deployment_action",
          url: "https://github.com/airvzxf/ftp-deployment-action",
        },
        {
          name: "fibonacci_benchmark",
          url: "https://github.com/airvzxf/assembly/tree/master/linux/benchmark/fibonacci",
        },
        {
          name: "aur_packages",
          url: "https://aur.archlinux.org/packages/duc",
        },
      ],
    },
  };

  // ─── Helpers ──────────────────────────────────────────────

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function textOut(lines) {
    const text = Array.isArray(lines) ? lines.join("\n") : lines;
    return escapeHtml(text);
  }

  function link(url) {
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="text-cyan">${escapeHtml(url)}</a>`;
  }

  // ─── Update Prompt ────────────────────────────────────────

  function updatePrompt() {
    if (state.suTarget) {
      promptUser.textContent = t("su.password");
      promptAt.textContent = "";
      promptHost.textContent = "";
      promptColon.textContent = "";
      promptPath.textContent = "";
      promptSymbol.textContent = "";
    } else {
      promptUser.textContent = state.user;
      promptAt.textContent = "@";
      promptHost.textContent = state.host;
      promptColon.textContent = ":";
      promptPath.textContent = state.cwd;
      if (state.user === "root") {
        promptSymbol.textContent = "#";
        promptSymbol.className = "prompt-symbol symbol-hash";
      } else {
        promptSymbol.textContent = "$";
        promptSymbol.className = "prompt-symbol";
      }
    }
  }

  // ─── Cursor Position & Visibility ─────────────────────────

  function updateCursorPos() {
    const val = cmdInput.value;
    const pos = cmdInput.selectionStart;
    if (state.suTarget) {
      cmdBefore.textContent = "";
      cmdAfter.textContent = "";
    } else {
      cmdBefore.textContent = val.slice(0, pos);
      cmdAfter.textContent = val.slice(pos);
    }
  }

  function showCursor() {
    cursorEl.classList.remove("cursor-hidden");
  }
  function hideCursor() {
    cursorEl.classList.add("cursor-hidden");
  }

  // ─── Append Output ────────────────────────────────────────

  function appendOutput(html) {
    if (html === null) return;
    const div = document.createElement("div");
    div.className = "output-line";
    div.innerHTML = html;
    outputArea.appendChild(div);
    outputArea.scrollTop = outputArea.scrollHeight;
  }

  function appendCommandLine(cmd) {
    const div = document.createElement("div");
    div.className = "output-line command-line";
    const symbol = state.user === "root" ? "#" : "$";
    const symbolClass =
      state.user === "root" ? "prompt-symbol symbol-hash" : "prompt-symbol";
    div.innerHTML = [
      `<span class="prompt-user">${escapeHtml(state.user)}</span>`,
      `<span class="prompt-at">@</span>`,
      `<span class="prompt-host">${escapeHtml(state.host)}</span>`,
      `<span class="prompt-colon">:</span>`,
      `<span class="prompt-path">${escapeHtml(state.cwd)}</span>`,
      `<span class="${symbolClass}">${escapeHtml(symbol)}</span> `,
      escapeHtml(cmd),
    ].join("");
    outputArea.appendChild(div);
  }

  // ─── Clear Input ──────────────────────────────────────────

  function clearInput() {
    cmdInput.value = "";
    cmdBefore.textContent = "";
    cmdAfter.textContent = "";
  }

  function scrollToBottom() {
    outputArea.scrollTop = outputArea.scrollHeight;
  }

  function permDenied(cmd, user) {
    return [
      `<span class="text-red">${escapeHtml(tf("permDenied", cmd))}</span>`,
      tf("loginAs", user),
      "",
    ].join("\n");
  }

  function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (d) {
      parts.push(d + "d");
      parts.push(h + "h");
      parts.push(m + "m");
    } else if (h) {
      parts.push(h + "h");
      parts.push(m + "m");
      parts.push(s + "s");
    } else {
      parts.push(m + "m");
      parts.push(s + "s");
    }
    return parts.join(" ") || "0s";
  }

  function formatStorageSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KiB";
    return (bytes / 1048576).toFixed(2) + " MiB";
  }

  function stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"');
  }

  function visualLen(html) {
    return stripHtml(html).length;
  }

  function formatHtmlList(items, options) {
    if (!options) options = {};
    var indent = options.indent || "  ";
    var minGap = options.minGap != null ? options.minGap : 2;
    var maxLen = 0;
    for (var i = 0; i < items.length; i++) {
      var len = visualLen(items[i][0]);
      if (len > maxLen) maxLen = len;
    }
    var descCol = maxLen + minGap;
    var lines = [];
    for (var i = 0; i < items.length; i++) {
      var cmdHtml = items[i][0];
      var desc = items[i][1];
      if (items[i].length >= 3 && items[i][2] === "wrap") {
        lines.push(indent + cmdHtml);
        lines.push(indent + " ".repeat(descCol) + desc);
      } else {
        var currentLen = visualLen(cmdHtml);
        var padding = descCol - currentLen;
        lines.push(indent + cmdHtml + " ".repeat(padding) + desc);
      }
    }
    return lines;
  }

  function formatTextList(items, options) {
    if (!options) options = {};
    var indent = options.indent || "  ";
    var minGap = options.minGap != null ? options.minGap : 2;
    var maxLen = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i][0].length > maxLen) maxLen = items[i][0].length;
    }
    var descCol = maxLen + minGap;
    var lines = [];
    for (var i = 0; i < items.length; i++) {
      var key = items[i][0];
      var val = items[i][1];
      var padding = descCol - key.length;
      lines.push(indent + key + " ".repeat(padding) + val);
    }
    return lines;
  }

  function applyTheme(themeName) {
    if (BUILTIN_THEMES[themeName]) {
      for (var i = 0; i < THEMEABLE_VARS.length; i++) {
        document.documentElement.style.removeProperty(THEMEABLE_VARS[i]);
      }
      document.documentElement.setAttribute("data-theme", themeName);
      var base = themeName === "light" ? "light" : "dark";
      var meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.content = base;
      currentTheme = themeName;
      Storage.saveTheme(themeName);
      return true;
    }
    if (customThemes[themeName]) {
      var custom = customThemes[themeName];
      var baseName = custom.base || "dark";
      document.documentElement.setAttribute("data-theme", baseName);
      var baseVars = BUILTIN_THEMES[baseName].vars;
      for (var i = 0; i < THEMEABLE_VARS.length; i++) {
        document.documentElement.style.removeProperty(THEMEABLE_VARS[i]);
      }
      var varKeys = Object.keys(custom.vars);
      for (var i = 0; i < varKeys.length; i++) {
        document.documentElement.style.setProperty(
          varKeys[i],
          custom.vars[varKeys[i]],
        );
      }
      var meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.content = baseName === "light" ? "light" : "dark";
      currentTheme = themeName;
      Storage.saveTheme(themeName);
      return true;
    }
    return false;
  }

  // ─── Easter Eggs ────────────────────────────────────────────

  function detectOS() {
    var ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return "ios";
    if (/Android/.test(ua)) return "android";
    if (/Win/.test(ua)) return "windows";
    if (/Mac/.test(ua)) return "macos";
    return "linux";
  }

  function isRmrfPattern(args) {
    if (args.length < 2) return false;
    var flags = args[0];
    var target = args[args.length - 1];
    if (flags.charAt(0) !== "-") return false;
    var flagsLower = flags.toLowerCase();
    var hasR = flagsLower.indexOf("r") !== -1;
    var hasF = flagsLower.indexOf("f") !== -1;
    if (!hasR || !hasF) return false;
    if (target === "/" || target === "/*" || target === "." || target === "./*")
      return true;
    return false;
  }

  function executeRmrf() {
    cmdInput.disabled = true;
    cmdInput.blur();

    var os = detectOS();
    var files = t("easter.rmrf.files." + os);
    if (!Array.isArray(files)) {
      files = t("easter.rmrf.files.linux");
    }

    appendOutput(
      '<span class="text-red">' + t("easter.rmrf.header") + "</span>",
    );

    var i = 0;
    function nextLine() {
      if (i < files.length) {
        appendOutput('<span class="text">' + escapeHtml(files[i]) + "</span>");
        i++;
        setTimeout(nextLine, Math.floor(Math.random() * 2000));
      } else {
        appendOutput("");
        appendOutput(
          '<span class="text-dim">' + t("easter.rmrf.punchline") + "</span>",
        );
        if (state.cowsayMode) {
          appendCowQuip();
        }
        cmdInput.disabled = false;
        cmdInput.focus();
      }
    }
    setTimeout(nextLine, 500);
  }

  function appendCowQuip() {
    var quips = t("easter.cowsay.quips");
    if (!Array.isArray(quips) || quips.length === 0) return;
    var quip = quips[Math.floor(Math.random() * quips.length)];
    appendOutput(
      '<span class="text-green">  ^__^\n  (oo) "' +
        escapeHtml(quip) +
        '"\n  (__)</span>',
    );
  }

  function maybeAppendCowQuip(cmdName) {
    if (!state.cowsayMode) return;
    if (cmdName === "cowsay") return;
    if (cmdName === "clear") return;
    if (cmdName === "reboot") return;
    if (cmdName === "reset") return;
    appendCowQuip();
  }

  function toggleHackerMode() {
    state.hackerMode = !state.hackerMode;
    if (state.hackerMode) {
      terminal.classList.add("hacker-mode");
      appendCommandLine("\u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA");
      appendOutput(
        '<span class="text-green">' + t("easter.konami.on") + "</span>",
      );
    } else {
      terminal.classList.remove("hacker-mode");
      appendCommandLine("\u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA");
      appendOutput(
        '<span class="text-yellow">' + t("easter.konami.off") + "</span>",
      );
    }
  }

  var easterEggs = {
    42: function () {
      return '<span class="text-cyan">' + t("easter.42") + "</span>";
    },

    exit: function () {
      return '<span class="text-green">' + t("easter.exit") + "</span>";
    },

    cowsay: function () {
      state.cowsayMode = !state.cowsayMode;
      if (state.cowsayMode) {
        return '<span class="text-green">' + t("easter.cowsay.on") + "</span>";
      }
      return '<span class="text-yellow">' + t("easter.cowsay.off") + "</span>";
    },

    konami: function () {
      return (
        '<span class="text-magenta">' + t("easter.konami.hint") + "</span>"
      );
    },

    "konami-code": function () {
      return (
        '<span class="text-magenta">' + t("easter.konami.hint") + "</span>"
      );
    },

    matrix: function () {
      if (matrixActive)
        return (
          '<span class="text-red">' + t("easter.matrix.active") + "</span>"
        );
      matrixActive = true;

      var CHARS =
        "\u30a2\u30a4\u30a6\u30a8\u30aa\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd\u30bf\u30c1\u30c4\u30c6\u30c8\u30ca\u30cb\u30cc\u30cd\u30ce\u30cf\u30d2\u30d5\u30d8\u30db\u30de\u30df\u30e0\u30e1\u30e2\u30e4\u30e6\u30e8\u30e9\u30ea\u30eb\u30ec\u30ed\u30ef\u30f30123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var FONT_SIZE = 16;
      var canExit = false;
      var exited = false;
      var animFrame;

      setTimeout(function () {
        canExit = true;
      }, 300);

      var canvas = document.createElement("canvas");
      canvas.style.cssText =
        "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;cursor:none;touch-action:none;background:#0d1117;";
      document.body.appendChild(canvas);

      var ctx = canvas.getContext("2d");

      function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var newCols = Math.min(Math.floor(canvas.width / FONT_SIZE), 120);
        var newDrops = [];
        for (var i = 0; i < newCols; i++) {
          newDrops[i] = i < columns ? drops[i] : (Math.random() * -25) | 0;
        }
        columns = newCols;
        drops = newDrops;
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      var columns = Math.min(Math.floor(canvas.width / FONT_SIZE), 120);
      var drops = [];
      for (var i = 0; i < columns; i++) {
        drops[i] = (Math.random() * -25) | 0;
      }

      function draw() {
        if (exited) return;
        ctx.fillStyle = "rgba(13, 17, 23, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = FONT_SIZE + "px monospace";

        for (var i = 0; i < columns; i++) {
          if (drops[i] < 0) {
            drops[i]++;
            continue;
          }
          var x = i * FONT_SIZE;
          var y = drops[i] * FONT_SIZE;

          ctx.fillStyle = "#56d364";
          ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], x, y);

          if (drops[i] > 0) {
            ctx.fillStyle = "#3fb950";
            ctx.fillText(
              CHARS[(Math.random() * CHARS.length) | 0],
              x,
              y - FONT_SIZE,
            );
          }

          drops[i]++;
          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
        }
        animFrame = requestAnimationFrame(draw);
      }

      function cleanup() {
        if (exited) return;
        exited = true;
        matrixActive = false;
        cancelAnimationFrame(animFrame);
        canvas.remove();
        window.removeEventListener("resize", onResize);
        document.removeEventListener("keydown", onExit);
        document.removeEventListener("click", onExit);
        cmdInput.disabled = false;
        cmdInput.focus();
        appendOutput(
          '<span class="text-green">' + t("easter.matrix.exitMsg") + "</span>",
        );
      }

      function onExit() {
        if (!canExit || exited) return;
        cleanup();
      }

      window.addEventListener("resize", onResize);
      cmdInput.disabled = true;
      cmdInput.blur();

      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animFrame = requestAnimationFrame(draw);

      document.addEventListener("keydown", onExit);
      document.addEventListener("click", onExit);

      return null;
    },
  };

  // ─── Man Page Helper ──────────────────────────────────────

  function buildManPage(cmdName, sections) {
    var lines = [];
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      lines.push(
        '<span class="man-section">' + escapeHtml(section.header) + "</span>",
      );
      if (Array.isArray(section.body)) {
        for (var j = 0; j < section.body.length; j++) {
          lines.push(section.body[j]);
        }
      } else {
        lines.push(section.body);
      }
      lines.push("");
    }
    lines.push(
      "RoviSoft.net                        " +
        new Date().getFullYear() +
        "                       " +
        cmdName +
        "(1)",
    );
    lines.push("");
    return lines.join("\n");
  }

  // ─── Commands ─────────────────────────────────────────────

  const commands = {
    help() {
      const base = formatHtmlList([
        ['<span class="cmd">help</span>', t("help.help")],
        ['<span class="cmd">clear</span>', t("help.clear")],
        ['<span class="cmd">whoami</span>', t("help.whoami")],
        ['<span class="cmd">users</span>', t("help.users")],
        ['<span class="cmd">su &lt;user&gt;</span>', t("help.su")],
        ['<span class="cmd">airvzxf</span>', t("help.airvzxf")],
        ['<span class="cmd">neofetch</span>', t("help.neofetch")],
        ['<span class="cmd">date</span>', t("help.date")],
        ['<span class="cmd">echo &lt;text&gt;</span>', t("help.echo")],
        ['<span class="cmd">alias</span>', t("help.alias")],
        ['<span class="cmd">unalias</span>', t("help.unalias")],
        ['<span class="cmd">theme</span>', t("help.theme")],
        ['<span class="cmd">lang</span>', t("help.lang")],
        ['<span class="cmd">config</span>', t("help.config")],
        ['<span class="cmd">reboot</span>', t("help.reboot")],
        ['<span class="cmd">reset</span>', t("help.reset")],
        ['<span class="cmd">version</span>', t("help.version")],
        ['<span class="cmd">license</span>', t("help.license")],
        ['<span class="cmd">history</span>', t("help.history")],
        ['<span class="cmd">man &lt;cmd&gt;</span>', t("help.man")],
      ]);

      base.push(
        "",
        '<span class="text-dim">' + t("help.shortcuts") + "</span>",
        '<span class="text-dim">' + t("help.urlParams") + "</span>",
        "",
      );
      return base.join("\n");
    },

    clear() {
      outputArea.innerHTML = "";
      return null;
    },

    lang(args) {
      if (!args.length) {
        var currentLangName = AVAILABLE_LANGS[state.lang] || state.lang;
        return [
          '<span class="text-yellow">' + t("lang.title") + "</span>",
          '  <span class="cmd">lang &lt;lang&gt;</span>',
          "",
          t("lang.current") +
            ' <span class="text-cyan">' +
            escapeHtml(state.lang) +
            "</span> (" +
            escapeHtml(currentLangName) +
            ")",
          '<span class="text-dim">' + t("lang.hint") + "</span>",
          "",
        ].join("\n");
      }

      var sub = args[0].toLowerCase();

      if (sub === "list") {
        var lines = [
          '<span class="text-yellow">' + t("lang.available") + "</span>",
        ];
        var langKeys = Object.keys(AVAILABLE_LANGS);
        var langItems = [];
        for (var i = 0; i < langKeys.length; i++) {
          var k = langKeys[i];
          var marker =
            k === state.lang ? ' <span class="text-dim">\u2190</span>' : "";
          langItems.push([
            '<span class="text-green">' + escapeHtml(k) + "</span>",
            escapeHtml(AVAILABLE_LANGS[k]) + marker,
          ]);
        }
        lines.push(...formatHtmlList(langItems));
        lines.push("");
        return lines.join("\n");
      }

      if (!AVAILABLE_LANGS[sub]) {
        return (
          '<span class="text-red">' +
          escapeHtml(tf("lang.unknownLang", sub)) +
          "</span>\n" +
          t("lang.hint")
        );
      }

      if (I18N[sub]) {
        state.lang = sub;
        document.documentElement.setAttribute("lang", sub);
        Storage.save(state);
        Storage.saveLang(sub);
        cmdInput.setAttribute("aria-label", t("welcome.ariaLabel"));

        var newLangName = AVAILABLE_LANGS[sub] || sub;
        return (
          '<span class="text-green">' +
          escapeHtml(tf("lang.changed", sub + " (" + newLangName + ")")) +
          "</span>"
        );
      }

      if (i18nLoadPending[sub]) {
        return (
          '<span class="text-dim">\u23f3 ' +
          escapeHtml(AVAILABLE_LANGS[sub] || sub) +
          " is already loading...</span>"
        );
      }

      appendOutput(
        '<span class="text-dim">\u23f3 Loading ' +
          escapeHtml(AVAILABLE_LANGS[sub] || sub) +
          "...</span>",
      );
      loadI18N(sub, function (success) {
        if (success) {
          state.lang = sub;
          document.documentElement.setAttribute("lang", sub);
          Storage.save(state);
          Storage.saveLang(sub);
          cmdInput.setAttribute("aria-label", t("welcome.ariaLabel"));
          appendOutput(
            '<span class="text-green">' +
              escapeHtml(
                tf("lang.changed", sub + " (" + AVAILABLE_LANGS[sub] + ")"),
              ) +
              "</span>",
          );
        } else {
          appendOutput(
            '<span class="text-red">Error: Could not load language "' +
              escapeHtml(sub) +
              '".</span>',
          );
        }
        scrollToBottom();
        cmdInput.focus();
      });
      return undefined;
    },

    whoami() {
      return state.user;
    },

    users() {
      return formatHtmlList([
        ['<span class="text-green">root</span>', t("users.rootDesc")],
        ['<span class="text-green">airvzxf</span>', t("users.airvzxfDesc")],
        ['<span class="text-green">guest</span>', t("users.guestDesc")],
      ])
        .concat([""])
        .join("\n");
    },

    su(args) {
      if (!args.length) {
        return '<span class="text-red">' + t("su.usage") + "</span>";
      }
      const target = args[0].toLowerCase();
      if (target === "root") {
        state.suTarget = "root";
        updatePrompt();
        updateCursorPos();
        cmdInput.focus();
        return null;
      }
      if (target === "airvzxf") {
        state.user = "airvzxf";
        state.cwd = "~";
        updatePrompt();
        updateCursorPos();
        return [
          '<span class="text-green">' + t("su.authSuccess") + "</span>",
          tf(
            "su.welcomeUser",
            '<span class="text-cyan text-bold">' +
              escapeHtml(USERS.airvzxf.name) +
              "</span>",
          ),
          t("airvzxf.useHelp"),
        ].join("\n");
      }
      if (target === "guest") {
        state.user = "guest";
        state.cwd = "~";
        updatePrompt();
        updateCursorPos();
        return '<span class="text-green">' + t("su.guestRestored") + "</span>";
      }
      return `<span class="text-red">${escapeHtml(tf("su.unknownUser", target))}</span>`;
    },

    version() {
      const lines = formatHtmlList([
        [
          '<span class="text-dim">' + t("version.label") + "</span>",
          "v" + VERSION,
        ],
        [
          '<span class="text-dim">' + t("version.build") + "</span>",
          "AGPL v3 \u2014 vanilla HTML5/CSS3/ES6+",
        ],
        [
          '<span class="text-dim">' + t("license.source") + "</span>",
          link("https://github.com/airvzxf/rovisoft-web"),
        ],
      ]);
      lines.push("");
      return lines.join("\n");
    },

    airvzxf(args) {
      if (state.user !== "airvzxf" && state.user !== "root") {
        return permDenied("airvzxf", "airvzxf");
      }
      if (!args.length) {
        const lines = [
          '<span class="text-yellow">' + t("airvzxf.usage") + "</span>",
          "",
        ];
        lines.push(
          ...formatHtmlList([
            ['<span class="cmd">airvzxf about</span>', t("airvzxf.about")],
            ['<span class="cmd">airvzxf contact</span>', t("airvzxf.contact")],
            ['<span class="cmd">airvzxf social</span>', t("airvzxf.social")],
            [
              '<span class="cmd">airvzxf projects</span>',
              t("airvzxf.projects"),
            ],
            ['<span class="cmd">airvzxf skills</span>', t("airvzxf.skills")],
            [
              '<span class="cmd">airvzxf research</span>',
              t("airvzxf.research"),
            ],
          ]),
        );
        lines.push("");
        return lines.join("\n");
      }
      if (args[0].toLowerCase() === "man") {
        return manPages.airvzxf();
      }
      const sub = args[0].toLowerCase();
      const subcommands = {
        about: true,
        contact: true,
        projects: true,
        social: true,
        skills: true,
        research: true,
      };
      if (!subcommands[sub]) {
        return `<span class="text-red">${escapeHtml(tf("airvzxf.unknownSubcommand", sub))}</span>\n${t("airvzxf.useHelp")}`;
      }
      return airvzxfSubcommands[sub]();
    },

    neofetch() {
      const u = USERS[state.user];
      const status = Storage.getStatus();

      let uptime;
      if (status.accepted && status.firstVisit) {
        const uptimeSec = Math.floor((Date.now() - status.firstVisit) / 1000);
        uptime = formatUptime(uptimeSec);
      } else {
        const uptimeSec = Math.floor((Date.now() - sessionStartTime) / 1000);
        uptime = formatUptime(uptimeSec) + " " + t("neofetch.session");
      }

      let ram;
      if (status.accepted) {
        const usedBytes = Storage.getStorageInfo().totalBytes;
        ram = formatStorageSize(usedBytes) + " / 5.0 MiB";
      } else {
        const fakeRam = (Math.random() * 200 + 100).toFixed(0);
        ram = fakeRam + " MiB / 1024 MiB";
      }

      const configLabel =
        status.accepted === true
          ? t("neofetch.accepted")
          : status.accepted === false
            ? t("neofetch.rejected")
            : t("neofetch.undecided");
      const lines = formatHtmlList([
        [
          '<span class="nf-label">' + t("neofetch.os") + "</span>",
          "RoviSoft Terminal v" + VERSION,
        ],
        [
          '<span class="nf-label">' + t("neofetch.host") + "</span>",
          escapeHtml(state.host),
        ],
        [
          '<span class="nf-label">' + t("neofetch.kernel") + "</span>",
          "HTML5/CSS3/ES6+",
        ],
        [
          '<span class="nf-label">' + t("neofetch.shell") + "</span>",
          escapeHtml(u.shell),
        ],
        [
          '<span class="nf-label">' + t("neofetch.user") + "</span>",
          escapeHtml(state.user),
        ],
        [
          '<span class="nf-label">' + t("neofetch.theme") + "</span>",
          escapeHtml(currentTheme),
        ],
        ['<span class="nf-label">' + t("neofetch.uptime") + "</span>", uptime],
        [
          '<span class="nf-label">' + t("neofetch.config") + "</span>",
          configLabel,
        ],
        ['<span class="nf-label">' + t("neofetch.storage") + "</span>", ram],
      ]);
      return '<div class="neofetch-block">' + lines.join("\n") + "</div>";
    },

    date() {
      return new Date().toString();
    },

    echo(args) {
      if (!args.length) return "";
      return escapeHtml(args.join(" "));
    },

    license() {
      const year = new Date().getFullYear();
      return [
        "============================================================",
        " " + t("license.title"),
        ` Copyright (C) ${year} Israel Alberto Roldan Vega`,
        "",
        " This program is free software: you can redistribute it",
        " and/or modify it under the terms of the GNU Affero General",
        " Public License as published by the Free Software Foundation,",
        " either version 3 of the License, or (at your option) any",
        " later version.",
        "",
        " This program is distributed in the hope that it will be",
        " useful, but WITHOUT ANY WARRANTY; without even the implied",
        " warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR",
        " PURPOSE.",
        "",
        ` ${t("license.source")}  ${link("https://github.com/airvzxf/rovisoft-web")}`,
        ` ${t("license.fullLicense")} ${link("https://www.gnu.org/licenses/agpl-3.0.html")}`,
        "============================================================",
        "",
      ].join("\n");
    },

    history() {
      if (!state.history.length) {
        return '<span class="text-dim">' + t("history.empty") + "</span>";
      }
      return state.history
        .map((cmd, i) => {
          const n = String(i + 1).padStart(4, " ");
          return `<span class="text-dim">${n}</span>  ${escapeHtml(cmd)}`;
        })
        .join("\n");
    },

    theme(args) {
      if (!args.length) {
        const themeItems = [
          ['<span class="cmd">theme list</span>', t("theme.listDesc")],
          [
            '<span class="cmd">theme &lt;name&gt;</span>',
            t("theme.description"),
          ],
          [
            '<span class="cmd">theme create &lt;name&gt; [--base=dark|light] [--var=value]</span>',
            t("theme.createDesc"),
            "wrap",
          ],
          [
            '<span class="cmd">theme edit &lt;name&gt; [--base=dark|light] [--var=value]</span>',
            t("theme.editDesc"),
            "wrap",
          ],
          [
            '<span class="cmd">theme delete &lt;name&gt;</span>',
            t("theme.deleteDesc"),
          ],
          [
            '<span class="cmd">theme export [&lt;name&gt;]</span>',
            t("theme.exportDesc"),
          ],
        ];
        return [
          '<span class="text-yellow">' + t("theme.title") + "</span>",
          `  ${t("theme.current")} <span class="text-cyan">${escapeHtml(currentTheme)}</span>`,
          "",
          ...formatHtmlList(themeItems),
          "",
        ].join("\n");
      }

      var sub = args[0].toLowerCase();

      if (sub === "list") {
        var lines = [
          '<span class="text-yellow">' + t("theme.builtin") + "</span>",
        ];
        var builtinKeys = Object.keys(BUILTIN_THEMES);
        var builtinItems = [];
        for (var i = 0; i < builtinKeys.length; i++) {
          var k = builtinKeys[i];
          var marker =
            k === currentTheme
              ? ' <span class="text-dim">(' +
                t("theme.currentMarker") +
                ")</span>"
              : "";
          builtinItems.push([
            '<span class="text-green">' + escapeHtml(k) + "</span>",
            escapeHtml(BUILTIN_THEMES[k].name) + marker,
          ]);
        }
        lines.push(...formatHtmlList(builtinItems));
        var customKeys = Object.keys(customThemes);
        if (customKeys.length) {
          lines.push("");
          lines.push(
            '<span class="text-yellow">' + t("theme.custom") + "</span>",
          );
          var customItems = [];
          for (var i = 0; i < customKeys.length; i++) {
            var k = customKeys[i];
            var marker =
              k === currentTheme
                ? ' <span class="text-dim">(' +
                  t("theme.currentMarker") +
                  ")</span>"
                : "";
            customItems.push([
              '<span class="text-green">' + escapeHtml(k) + "</span>",
              "base: " + escapeHtml(customThemes[k].base || "dark") + marker,
            ]);
          }
          lines.push(...formatHtmlList(customItems));
        }
        lines.push("");
        return lines.join("\n");
      }

      if (sub === "create") {
        if (args.length < 2) {
          return (
            '<span class="text-red">' +
            t("theme.createNameRequired") +
            "</span>\n" +
            t("theme.createUseExport")
          );
        }
        var name = args[1].toLowerCase();
        if (!/^[a-z][a-z0-9_-]{0,19}$/.test(name)) {
          return (
            '<span class="text-red">' + t("theme.createNameInvalid") + "</span>"
          );
        }
        if (BUILTIN_THEMES[name]) {
          return `<span class="text-red">${escapeHtml(tf("theme.createBuiltIn", name))}</span>`;
        }
        var base = "dark";
        var vars = {};
        for (var i = 2; i < args.length; i++) {
          var arg = args[i];
          if (arg.indexOf("=") === -1) continue;
          var eqIdx = arg.indexOf("=");
          var key = arg.slice(0, eqIdx);
          var value = arg.slice(eqIdx + 1);
          if (key === "--base") {
            if (value === "dark" || value === "light") {
              base = value;
            } else {
              return `<span class="text-red">${escapeHtml(tf("theme.createBaseInvalid", value))}</span>`;
            }
          } else {
            var varName = key.startsWith("--") ? key : "--" + key;
            if (THEMEABLE_VARS.indexOf(varName) === -1) {
              return `<span class="text-red">${escapeHtml(tf("theme.createVarUnknown", varName, THEMEABLE_VARS.join(", ")))}</span>`;
            }
            vars[varName] = value;
          }
        }
        if (Object.keys(vars).length === 0) {
          return (
            '<span class="text-red">' +
            t("theme.createVarRequired") +
            "</span>\n" +
            t("theme.createUseExport")
          );
        }
        customThemes[name] = { base: base, vars: vars };
        Storage.saveCustomThemes(customThemes);
        var varCount = Object.keys(vars).length;
        var varWord = varCount > 1 ? t("theme.variables") : t("theme.variable");
        return [
          `<span class="text-green">${escapeHtml(tf("theme.created", name, base, String(varCount), varWord))}</span>`,
          tf("theme.useTheme", name),
        ].join("\n");
      }

      if (sub === "edit") {
        if (args.length < 2) {
          return (
            '<span class="text-red">' +
            t("theme.editNameRequired") +
            '</span>\n<span class="cmd">theme edit &lt;name&gt; [--base=dark|light] [--var=value]...</span>'
          );
        }
        var name = args[1].toLowerCase();
        if (BUILTIN_THEMES[name]) {
          return `<span class="text-red">${escapeHtml(tf("theme.editBuiltIn", name))}</span>`;
        }
        if (!customThemes[name]) {
          return `<span class="text-red">${escapeHtml(tf("theme.editNotExists", name))}</span>\n${tf("theme.editUseCreate", name)}`;
        }
        var changes = {};
        var newBase = null;
        for (var i = 2; i < args.length; i++) {
          var arg = args[i];
          if (arg.indexOf("=") === -1) continue;
          var eqIdx = arg.indexOf("=");
          var key = arg.slice(0, eqIdx);
          var value = arg.slice(eqIdx + 1);
          if (key === "--base") {
            if (value === "dark" || value === "light") {
              newBase = value;
            } else {
              return `<span class="text-red">${escapeHtml(tf("theme.editBaseInvalid", value))}</span>`;
            }
          } else {
            var varName = key.startsWith("--") ? key : "--" + key;
            if (THEMEABLE_VARS.indexOf(varName) === -1) {
              return `<span class="text-red">${escapeHtml(tf("theme.createVarUnknown", varName, THEMEABLE_VARS.join(", ")))}</span>`;
            }
            changes[varName] = value;
          }
        }
        if (Object.keys(changes).length === 0 && newBase === null) {
          return (
            '<span class="text-red">' + t("theme.editNoChanges") + "</span>"
          );
        }
        if (newBase !== null) {
          customThemes[name].base = newBase;
        }
        for (var k in changes) {
          customThemes[name].vars[k] = changes[k];
        }
        Storage.saveCustomThemes(customThemes);
        if (currentTheme === name) {
          applyTheme(name);
        }
        var editInfo = [];
        if (newBase) editInfo.push("base: " + escapeHtml(newBase));
        var changedCount = Object.keys(changes).length;
        if (changedCount > 0)
          editInfo.push(
            changedCount +
              " " +
              (changedCount > 1 ? t("theme.variables") : t("theme.variable")),
          );
        return `<span class="text-green">${escapeHtml(tf("theme.edited", name, editInfo.join(", ")))}</span>`;
      }

      if (sub === "delete") {
        if (args.length < 2) {
          return (
            '<span class="text-red">' +
            t("theme.deleteNameRequired") +
            "</span>"
          );
        }
        var name = args[1].toLowerCase();
        if (BUILTIN_THEMES[name]) {
          return `<span class="text-red">${escapeHtml(tf("theme.deleteBuiltIn", name))}</span>`;
        }
        if (!customThemes[name]) {
          return `<span class="text-red">${escapeHtml(tf("theme.deleteNotExists", name))}</span>`;
        }
        if (currentTheme === name) {
          applyTheme("dark");
        }
        delete customThemes[name];
        Storage.saveCustomThemes(customThemes);
        return `<span class="text-green">${escapeHtml(tf("theme.deleted", name))}</span>`;
      }

      if (sub === "export") {
        var themeName = args[1] ? args[1].toLowerCase() : currentTheme;
        var varsToExport;
        if (BUILTIN_THEMES[themeName]) {
          varsToExport = BUILTIN_THEMES[themeName].vars;
        } else if (customThemes[themeName]) {
          var base = customThemes[themeName].base || "dark";
          varsToExport = Object.assign(
            {},
            BUILTIN_THEMES[base].vars,
            customThemes[themeName].vars,
          );
        } else {
          return `<span class="text-red">${escapeHtml(tf("theme.exportNotExists", themeName))}</span>`;
        }
        var lines = [
          '<span class="text-yellow">' +
            escapeHtml(tf("theme.exportTitle", themeName)) +
            "</span>",
        ];
        var keys = Object.keys(varsToExport);
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          lines.push(
            `  <span class="text-cyan">${escapeHtml(k)}</span>=${escapeHtml(varsToExport[k])}`,
          );
        }
        lines.push("");
        return lines.join("\n");
      }

      var themeName = sub;
      if (!applyTheme(themeName)) {
        return `<span class="text-red">${escapeHtml(tf("theme.notExists", themeName))}</span>\n${t("theme.useList")}`;
      }
      return `<span class="text-green">${escapeHtml(tf("theme.changedTo", themeName))}</span>`;
    },

    alias(args) {
      if (!args.length) {
        const keys = Object.keys(state.aliases);
        const lines = [
          '<span class="text-yellow">' + t("alias.title") + "</span>",
        ];
        lines.push(
          ...formatHtmlList([
            ['<span class="cmd">alias</span>', t("alias.showAliases")],
            [
              '<span class="cmd">alias &lt;name&gt;</span>',
              t("alias.showValue"),
            ],
            [
              "<span class=\"cmd\">alias &lt;name&gt;='command'</span>",
              t("alias.define"),
            ],
          ]),
        );
        lines.push(
          "",
          '  <span class="text-dim">' + t("alias.preserved") + "</span>",
          '  <span class="text-dim">' + t("alias.noOverride") + "</span>",
          keys.length
            ? "\n" +
                keys
                  .map(
                    (k) =>
                      `<span class="cmd">alias</span> ${escapeHtml(k)}=${escapeHtml(state.aliases[k])}`,
                  )
                  .join("\n")
            : [],
        );
        return lines.join("\n");
      }
      const rawArgs = args.join(" ");
      const eqIdx = rawArgs.indexOf("=");
      if (eqIdx === -1) {
        const name = args[0];
        if (state.aliases[name]) {
          return `<span class="cmd">alias</span> ${escapeHtml(name)}=${escapeHtml(state.aliases[name])}`;
        }
        return `<span class="text-red">${escapeHtml(tf("alias.notDefined", name))}</span>`;
      }
      const name = rawArgs.slice(0, eqIdx).trim();
      let value = rawArgs.slice(eqIdx + 1).trim();
      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1);
      }
      if (!name)
        return '<span class="text-red">' + t("alias.nameEmpty") + "</span>";
      if (!value)
        return '<span class="text-red">' + t("alias.valueEmpty") + "</span>";
      if (name in commands)
        return `<span class="text-red">${escapeHtml(tf("alias.existingCommand", name))}</span>`;
      state.aliases[name] = value;
      return "";
    },

    unalias(args) {
      if (!args.length) {
        const lines = [
          '<span class="text-yellow">' + t("unalias.title") + "</span>",
          "",
        ];
        lines.push(
          ...formatHtmlList([
            [
              '<span class="cmd">unalias &lt;name&gt;</span>',
              t("unalias.desc"),
            ],
          ]),
        );
        lines.push(
          "",
          '  <span class="text-dim">' + t("unalias.useAlias") + "</span>",
          "",
        );
        return lines.join("\n");
      }
      const name = args[0];
      if (!(name in state.aliases))
        return `<span class="text-red">${escapeHtml(tf("unalias.notDefined", name))}</span>`;
      delete state.aliases[name];
      return "";
    },

    config(args) {
      if (!args.length) {
        const status = Storage.getStatus();
        const acceptedLabel =
          status.accepted === true
            ? '<span class="text-green">' +
              t("config.acceptedShort") +
              "</span>"
            : status.accepted === false
              ? '<span class="text-red">' +
                t("config.rejectedShort") +
                "</span>"
              : '<span class="text-yellow">' +
                t("config.undecidedShort") +
                "</span>";
        const storeLabel =
          status.accepted === true ? "localStorage" : t("config.volatile");
        const lines = [
          '<span class="text-yellow">' + t("config.title") + "</span>",
        ];
        lines.push(
          ...formatHtmlList([
            [t("config.state"), acceptedLabel],
            [t("config.mechanism"), storeLabel],
          ]),
        );
        lines.push(
          "",
          '  <span class="text-dim">' + t("config.wouldStore") + "</span>",
          '  <span class="text-dim">  \u2014 ' +
            t("config.session") +
            "</span>",
          '  <span class="text-dim">  \u2014 ' +
            t("config.historyStore") +
            "</span>",
          '  <span class="text-dim">  \u2014 ' +
            t("config.preferences") +
            "</span>",
          '  <span class="text-dim">  \u2014 ' +
            t("config.versionStore") +
            "</span>",
          "",
        );
        lines.push(
          ...formatHtmlList([
            ['<span class="cmd">config accept</span>', t("config.accept")],
            ['<span class="cmd">config reject</span>', t("config.reject")],
            ['<span class="cmd">config status</span>', t("config.status")],
            ['<span class="cmd">config show</span>', t("config.show")],
          ]),
        );
        lines.push("");
        return lines.join("\n");
      }

      const sub = args[0].toLowerCase();

      if (sub === "accept") {
        Storage.accept();
        Storage.save(state);
        return (
          '<span class="text-green">' +
          t("config.acceptedMsg") +
          "</span>\n" +
          t("config.acceptedMsg2")
        );
      }

      if (sub === "reject") {
        Storage.reject();
        return (
          '<span class="text-yellow">' +
          t("config.rejectedMsg") +
          "</span>\n" +
          t("config.rejectedMsg2") +
          "\n" +
          t("config.rejectedMsg3")
        );
      }

      if (sub === "status") {
        const s = Storage.getStatus();
        const acceptedLabel =
          s.accepted === true
            ? '<span class="text-green">' +
              t("config.acceptedShort") +
              "</span>"
            : s.accepted === false
              ? '<span class="text-red">' +
                t("config.rejectedShort") +
                "</span>"
              : '<span class="text-yellow">' +
                t("config.undecidedShort") +
                "</span>";
        const uptimeStr = s.firstVisit
          ? formatUptime(Math.floor((Date.now() - s.firstVisit) / 1000))
          : "N/A";
        const versionStr = s.versionStored ? "v" + s.versionStored : "N/A";
        const info = Storage.getStorageInfo();
        const sizeStr = formatStorageSize(info.totalBytes);
        return formatHtmlList([
          [
            '<span class="nf-label">' + t("config.labelMode") + "</span>",
            acceptedLabel,
          ],
          [
            '<span class="nf-label">' + t("config.labelStore") + "</span>",
            s.storeName,
          ],
          [
            '<span class="nf-label">' + t("config.labelVersion") + "</span>",
            versionStr,
          ],
          [
            '<span class="nf-label">' + t("config.labelUptime") + "</span>",
            uptimeStr,
          ],
          [
            '<span class="nf-label">' + t("config.labelData") + "</span>",
            sizeStr +
              " " +
              t("config.inWord") +
              " " +
              info.keysCount +
              " " +
              t("config.keys"),
          ],
        ])
          .concat([""])
          .join("\n");
      }

      if (sub === "show") {
        const info = Storage.getStorageInfo();
        const store = Storage.isAccepted() ? localStorage : sessionStorage;
        const keys = info.keys;
        const lines = [];

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const rawVal = store.getItem(key);
          if (key === "rs_state" && rawVal) {
            try {
              const parsed = JSON.parse(rawVal);
              const displayParsed = { ...parsed, history: ["\u2026"] };
              const formatted = JSON.stringify(displayParsed, null, 2);
              const escaped = escapeHtml(formatted);
              const indented = escaped
                .split("\n")
                .map(function (line, idx) {
                  return idx === 0
                    ? '  <span class="text-cyan">' + key + "</span> = " + line
                    : "              " + line;
                })
                .join("\n");
              lines.push(indented);
            } catch (e) {
              lines.push(
                '  <span class="text-cyan">' +
                  escapeHtml(key) +
                  "</span> = " +
                  escapeHtml(rawVal),
              );
            }
          } else {
            lines.push(
              '  <span class="text-cyan">' +
                escapeHtml(key) +
                "</span> = " +
                escapeHtml(rawVal || "null"),
            );
          }
        }

        lines.push("");
        lines.push(
          '  <span class="text-dim">' +
            info.keysCount +
            " " +
            t("config.keys") +
            ", " +
            formatStorageSize(info.totalBytes) +
            " " +
            t("config.inWord") +
            " " +
            (Storage.isAccepted() ? "localStorage" : "sessionStorage") +
            "</span>",
        );
        lines.push("");
        return lines.join("\n");
      }

      return `<span class="text-red">${escapeHtml(tf("config.unknownSubcommand", sub))}</span>\n${t("config.useConfig")}`;
    },

    man(args) {
      if (!args.length) {
        var cmdNames = Object.keys(manPages).sort();
        var items = [];
        for (var i = 0; i < cmdNames.length; i++) {
          var name = cmdNames[i];
          var desc = t("man." + name + ".name")
            .split(" - ")
            .slice(1)
            .join(" - ");
          items.push([
            '<span class="cmd">' + escapeHtml(name) + "</span>",
            escapeHtml(desc),
          ]);
        }
        var lines = [
          '<span class="text-yellow">' + t("man.available") + "</span>",
          "",
        ];
        lines.push(...formatHtmlList(items));
        lines.push("");
        return lines.join("\n");
      }

      var cmd = args[0].toLowerCase();
      if (!manPages[cmd]) {
        return (
          '<span class="text-red">' +
          escapeHtml(tf("man.notFound", cmd)) +
          "</span>\n" +
          t("man.hint")
        );
      }

      return manPages[cmd]();
    },

    reboot() {
      state.cowsayMode = false;
      state.hackerMode = false;
      terminal.classList.remove("hacker-mode");
      cmdInput.disabled = true;
      cmdInput.blur();
      terminal.classList.add("terminal-rebooting");
      appendOutput('<span class="text-yellow">' + t("reboot.msg") + "</span>");
      setTimeout(function () {
        Storage.saveFirstVisit(Date.now());
        location.reload();
      }, 1800);
      return undefined;
    },

    reset() {
      state.cowsayMode = false;
      state.hackerMode = false;
      terminal.classList.remove("hacker-mode");
      cmdInput.disabled = true;
      cmdInput.blur();
      terminal.classList.add("terminal-rebooting");
      appendOutput('<span class="text-yellow">' + t("reset.msg") + "</span>");
      setTimeout(function () {
        Storage.reset();
        location.reload();
      }, 2500);
      return undefined;
    },
  };

  // ─── AirvZxf subcommands ────────────────────────────────

  const airvzxfSubcommands = {
    about() {
      const u = USERS.airvzxf;
      const infoLines = formatHtmlList(
        [
          [
            '<span class="text-dim">' + t("about.location") + "</span>",
            escapeHtml(u.location),
          ],
          [
            '<span class="text-dim">' + t("about.role") + "</span>",
            escapeHtml(t("about.roleTitle")),
          ],
          [
            '<span class="text-dim">' + t("about.tech") + "</span>",
            escapeHtml(u.tech.join(", ")),
          ],
        ],
        { indent: "" },
      );
      return [
        `<span class="text-green text-bold">${escapeHtml(u.name)}</span>  <span class="text-dim">\u2014 ${escapeHtml(t("about.roleAdmin"))} ${t("about.of")}</span>`,
        "",
        escapeHtml(t("about.bio")),
        "",
        ...infoLines,
        "",
      ].join("\n");
    },

    contact() {
      const u = USERS.airvzxf;
      const lines = formatHtmlList(
        [
          [
            '<span class="text-dim">' + t("contact.email") + "</span>",
            escapeHtml(u.email),
          ],
        ],
        { indent: "" },
      );
      lines.push("");
      return lines.join("\n");
    },

    projects() {
      const u = USERS.airvzxf;
      const projectLines = [];
      u.projects.forEach((p) => {
        const descKey = "projects." + p.name + ".desc";
        projectLines.push(
          `<span class="text-cyan text-bold">${escapeHtml(p.name)}</span> \u2014 ${escapeHtml(t(descKey))}`,
        );
        projectLines.push(`<span class="text-dim">${link(p.url)}</span>`);
        projectLines.push("");
      });
      return projectLines.join("\n");
    },

    social() {
      const u = USERS.airvzxf;
      const lines = formatHtmlList(
        [
          [
            '<span class="text-dim">' + t("social.github") + "</span>",
            link(u.github),
          ],
          [
            '<span class="text-dim">' + t("social.youtube") + "</span>",
            link(u.youtube),
          ],
          ['<span class="text-dim">' + t("social.x") + "</span>", link(u.x)],
          [
            '<span class="text-dim">' + t("social.linkedin") + "</span>",
            link(u.linkedin),
          ],
        ],
        { indent: "" },
      );
      lines.push("");
      return lines.join("\n");
    },

    skills() {
      return [
        t("skills.header.languages"),
        "  Rust        [##########] " + t("skills.lang.rust"),
        "  Bash        [##########] " + t("skills.lang.bash"),
        "  Python      [##########] " + t("skills.lang.python"),
        "  JavaScript  [########..] " + t("skills.lang.javascript"),
        "  Assembly    [######....] " + t("skills.lang.assembly"),
        "  C           [####......] " + t("skills.lang.c"),
        "",
        t("skills.header.env"),
        ...formatTextList([
          ["OS:", "Arch Linux (pacman)"],
          ["WM:", "labwc (Wayland)"],
          ["Terminal:", "Alacritty + Tmux"],
          [t("env.containers"), "Podman"],
          ["VCS:", "Git"],
        ]),
        "",
        t("skills.header.domains"),
        t("skills.domain.1"),
        t("skills.domain.2"),
        t("skills.domain.3"),
        t("skills.domain.4"),
        t("skills.domain.5"),
        t("skills.domain.6"),
        t("skills.domain.7"),
        t("skills.domain.8"),
        t("skills.domain.9"),
        "",
      ].join("\n");
    },

    research() {
      return [
        t("research.log1"),
        t("research.log2"),
        t("research.log3"),
        t("research.log4"),
        t("research.log5"),
        t("research.log6"),
        t("research.log7"),
        t("research.log8"),
        t("research.log9"),
        t("research.log10"),
        t("research.log11"),
        t("research.log12"),
        t("research.log13"),
        t("research.log14"),
        "",
      ].join("\n");
    },

    man() {
      return [
        t("man.header.name"),
        "  " + t("man.nameText"),
        "",
        t("man.header.synopsis"),
        "  " + t("man.synopsisText"),
        "",
        t("man.header.description"),
        ...t("man.desc.p1").split("\n"),
        "",
        ...t("man.desc.p2").split("\n"),
        "",
        ...t("man.desc.p3").split("\n"),
        "",
        ...t("man.desc.p4").split("\n"),
        "",
        t("man.header.environment"),
        ...formatTextList([
          ["OS:", "Arch Linux (pacman)"],
          ["WM:", "labwc (Wayland)"],
          ["Terminal:", "Alacritty + Tmux"],
          [t("env.containers"), "Podman"],
          ["VCS:", "Git"],
        ]),
        "",
        t("man.header.languages"),
        "  " + t("man.langList"),
        "",
        t("man.header.seeAlso"),
        "  whoami(1)",
        "",
        "RoviSoft.net                        " +
          new Date().getFullYear() +
          "                       airvzxf(1)",
        "",
      ].join("\n");
    },
  };

  // ─── Man Pages ────────────────────────────────────────────

  var manPages = {
    help: function () {
      return buildManPage("help", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.help.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.help.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.help.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.help.seeAlso")),
        },
      ]);
    },

    clear: function () {
      return buildManPage("clear", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.clear.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.clear.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.clear.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.clear.seeAlso")),
        },
      ]);
    },

    whoami: function () {
      return buildManPage("whoami", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.whoami.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.whoami.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.whoami.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.whoami.seeAlso")),
        },
      ]);
    },

    users: function () {
      return buildManPage("users", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.users.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.users.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.users.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.users.seeAlso")),
        },
      ]);
    },

    su: function () {
      return buildManPage("su", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.su.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.su.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.su.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.su.seeAlso")),
        },
      ]);
    },

    airvzxf: function () {
      return airvzxfSubcommands.man();
    },

    neofetch: function () {
      return buildManPage("neofetch", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.neofetch.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.neofetch.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.neofetch.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.neofetch.seeAlso")),
        },
      ]);
    },

    date: function () {
      return buildManPage("date", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.date.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.date.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.date.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.date.seeAlso")),
        },
      ]);
    },

    echo: function () {
      return buildManPage("echo", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.echo.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.echo.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.echo.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.echo.seeAlso")),
        },
      ]);
    },

    alias: function () {
      return buildManPage("alias", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.alias.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.alias.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.alias.description")),
        },
        {
          header: t("man.header.options"),
          body: [
            ...formatHtmlList([
              ['<span class="cmd">alias</span>', t("man.alias.opt.show")],
              [
                '<span class="cmd">alias &lt;name&gt;</span>',
                t("man.alias.opt.showValue"),
              ],
              [
                "<span class=\"cmd\">alias &lt;name&gt;='command'</span>",
                t("man.alias.opt.define"),
                "wrap",
              ],
            ]),
          ],
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.alias.seeAlso")),
        },
      ]);
    },

    unalias: function () {
      return buildManPage("unalias", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.unalias.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.unalias.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.unalias.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.unalias.seeAlso")),
        },
      ]);
    },

    theme: function () {
      return buildManPage("theme", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.theme.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.theme.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.theme.description")),
        },
        {
          header: t("man.header.subcommands"),
          body: [
            ...formatHtmlList([
              ['<span class="cmd">theme list</span>', t("man.theme.sub.list")],
              [
                '<span class="cmd">theme &lt;name&gt;</span>',
                t("man.theme.sub.set"),
              ],
              [
                '<span class="cmd">theme create</span>',
                t("man.theme.sub.create"),
              ],
              ['<span class="cmd">theme edit</span>', t("man.theme.sub.edit")],
              [
                '<span class="cmd">theme delete</span>',
                t("man.theme.sub.delete"),
              ],
              [
                '<span class="cmd">theme export</span>',
                t("man.theme.sub.export"),
              ],
            ]),
          ],
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.theme.seeAlso")),
        },
      ]);
    },

    lang: function () {
      return buildManPage("lang", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.lang.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.lang.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.lang.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.lang.seeAlso")),
        },
      ]);
    },

    config: function () {
      return buildManPage("config", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.config.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.config.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.config.description")),
        },
        {
          header: t("man.header.subcommands"),
          body: [
            ...formatHtmlList([
              [
                '<span class="cmd">config accept</span>',
                t("man.config.sub.accept"),
              ],
              [
                '<span class="cmd">config reject</span>',
                t("man.config.sub.reject"),
              ],
              [
                '<span class="cmd">config status</span>',
                t("man.config.sub.status"),
              ],
              [
                '<span class="cmd">config show</span>',
                t("man.config.sub.show"),
              ],
            ]),
          ],
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.config.seeAlso")),
        },
      ]);
    },

    reboot: function () {
      return buildManPage("reboot", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.reboot.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.reboot.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.reboot.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.reboot.seeAlso")),
        },
      ]);
    },

    reset: function () {
      return buildManPage("reset", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.reset.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.reset.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.reset.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.reset.seeAlso")),
        },
      ]);
    },

    version: function () {
      return buildManPage("version", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.version.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.version.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.version.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.version.seeAlso")),
        },
      ]);
    },

    license: function () {
      return buildManPage("license", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.license.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.license.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.license.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.license.seeAlso")),
        },
      ]);
    },

    history: function () {
      return buildManPage("history", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.history.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.history.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.history.description")),
        },
        {
          header: t("man.header.historyExpansion"),
          body: "  " + escapeHtml(t("man.history.expansionText")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.history.seeAlso")),
        },
      ]);
    },

    man: function () {
      return buildManPage("man", [
        {
          header: t("man.header.name"),
          body:
            '  <span class="man-name">' +
            escapeHtml(t("man.man.name")) +
            "</span>",
        },
        {
          header: t("man.header.synopsis"),
          body: "  " + escapeHtml(t("man.man.synopsis")),
        },
        {
          header: t("man.header.description"),
          body: "  " + escapeHtml(t("man.man.description")),
        },
        {
          header: t("man.header.seeAlso"),
          body: "  " + escapeHtml(t("man.man.seeAlso")),
        },
      ]);
    },
  };

  // ─── History Expansion ──────────────────────────────────────

  function expandHistory(input) {
    if (input === "!!") {
      if (state.history.length === 0) return { error: "!!: event not found" };
      return { cmd: state.history[state.history.length - 1] };
    }
    const m = input.match(/^!(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n < 1 || n > state.history.length)
        return { error: `!${n}: event not found` };
      return { cmd: state.history[n - 1] };
    }
    return null;
  }

  // ─── Execute Command ──────────────────────────────────────

  function runSingle(cmdStr) {
    let trimmed = cmdStr.trim();
    let isExpansion = false;

    if (!trimmed) {
      appendOutput("");
      return;
    }

    const expansion = expandHistory(trimmed);
    if (expansion) {
      appendCommandLine(trimmed);
      if (expansion.error) {
        appendOutput(
          `<span class="text-red">${escapeHtml(expansion.error)}</span>`,
        );
        return;
      }
      appendOutput(escapeHtml(expansion.cmd));
      trimmed = expansion.cmd;
      isExpansion = true;
    }

    if (!isExpansion) {
      appendCommandLine(trimmed);
    }

    const parts = trimmed.split(/\s+/);
    let cmdName = parts[0].toLowerCase();
    let args = parts.slice(1);

    if (cmdName === "sudo") {
      appendOutput('<span class="text-red">' + t("easter.sudo") + "</span>");
      maybeAppendCowQuip(cmdName);
      return;
    }

    if (cmdName === "rm" && isRmrfPattern(args)) {
      executeRmrf();
      return;
    }

    var easterFn = easterEggs[cmdName];
    if (easterFn) {
      var easterResult = easterFn(args, trimmed);
      if (easterResult !== undefined && easterResult !== null) {
        appendOutput(easterResult);
      }
      maybeAppendCowQuip(cmdName);
      return;
    }

    if (state.aliases[cmdName]) {
      const expanded =
        state.aliases[cmdName] + (args.length ? " " + args.join(" ") : "");
      appendOutput(`<span class="text-dim">→ ${escapeHtml(expanded)}</span>`);
      const expandedParts = expanded.split(/\s+/);
      cmdName = expandedParts[0].toLowerCase();
      args = expandedParts.slice(1);
    }

    const cmdFn = commands[cmdName];
    if (cmdFn) {
      const result = cmdFn(args, trimmed);
      if (result !== undefined && result !== null) {
        appendOutput(result);
      }
      maybeAppendCowQuip(cmdName);
    } else {
      appendOutput(
        `<span class="text-red">${escapeHtml(tf("cmdNotFound", cmdName))}</span>`,
      );
      maybeAppendCowQuip(cmdName);
    }
  }

  function execute(cmdStr) {
    const trimmed = cmdStr.trim();

    if (!trimmed) {
      appendOutput("");
      return;
    }

    if (
      state.history.length === 0 ||
      state.history[state.history.length - 1] !== trimmed
    ) {
      state.history.push(trimmed);
      if (state.history.length > MAX_HISTORY) {
        state.history = state.history.slice(-MAX_HISTORY);
      }
    }
    state.historyIndex = state.history.length;

    const segments = trimmed
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s);
    for (const seg of segments) {
      runSingle(seg);
      if (state.suTarget) break;
    }

    Storage.save(state);
  }

  // ─── URL Command Execution ────────────────────────────────

  function executeUrlCommands() {
    var params = new URLSearchParams(window.location.search);
    var cmds = params.getAll("cmd");
    if (!cmds.length) return;
    for (var i = 0; i < cmds.length; i++) {
      execute(cmds[i]);
      if (state.suTarget) {
        appendOutput(
          '<span class="text-red">' + t("su.authFailed") + "</span>",
        );
        state.suTarget = null;
        updatePrompt();
        updateCursorPos();
      }
    }
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch (e) {}
    scrollToBottom();
    cmdInput.focus();
  }

  // ─── Event: Click anywhere in terminal focuses input ─────

  terminal.addEventListener("click", function (e) {
    if (window.getSelection().toString()) return;
    cmdInput.focus();
  });

  promptArea.addEventListener("mousedown", function (e) {
    e.preventDefault();
    cmdInput.focus();
  });

  // ─── Event: Blur / Focus — hide/show cursor ──────────────

  cmdInput.addEventListener("blur", hideCursor);
  cmdInput.addEventListener("focus", showCursor);

  // ─── Event: Input & Cursor Position ──────────────────────

  cmdInput.addEventListener("input", updateCursorPos);

  cmdInput.addEventListener("keyup", function (e) {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      updateCursorPos();
    }
  });

  cmdInput.addEventListener("click", updateCursorPos);

  // ─── Event: Keydown ───────────────────────────────────────

  var konamiBuffer = [];
  var KONAMI_SEQUENCE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];

  cmdInput.addEventListener("keydown", function (e) {
    const key = e.key;

    konamiBuffer.push(key);
    if (konamiBuffer.length > KONAMI_SEQUENCE.length) {
      konamiBuffer.shift();
    }
    if (konamiBuffer.length === KONAMI_SEQUENCE.length) {
      var konamiMatch = true;
      for (var ki = 0; ki < KONAMI_SEQUENCE.length; ki++) {
        if (konamiBuffer[ki] !== KONAMI_SEQUENCE[ki]) {
          konamiMatch = false;
          break;
        }
      }
      if (konamiMatch && !state.suTarget) {
        e.preventDefault();
        konamiBuffer = [];
        cmdInput.value = "";
        cmdBefore.textContent = "";
        cmdAfter.textContent = "";
        toggleHackerMode();
        return;
      }
    }

    if (key === "Enter") {
      e.preventDefault();
      if (state.suTarget) {
        var failMsg =
          '<span class="text-red">' + t("su.authFailed") + "</span>";
        state.suTarget = null;
        clearInput();
        updatePrompt();
        updateCursorPos();
        appendOutput(failMsg);
        Storage.save(state);
        return;
      }
      execute(cmdInput.value);
      clearInput();
      return;
    }

    if (key === "ArrowUp") {
      e.preventDefault();
      if (state.suTarget) return;
      if (state.history.length === 0) return;
      if (state.historyIndex === state.history.length) {
        state.tempInput = cmdInput.value;
      }
      if (state.historyIndex > 0) {
        state.historyIndex--;
        cmdInput.value = state.history[state.historyIndex];
      }
      updateCursorPos();
      cmdInput.setSelectionRange(cmdInput.value.length, cmdInput.value.length);
      updateCursorPos();
      return;
    }

    if (key === "ArrowDown") {
      e.preventDefault();
      if (state.suTarget) return;
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        cmdInput.value = state.history[state.historyIndex];
      } else {
        state.historyIndex = state.history.length;
        cmdInput.value = state.tempInput;
      }
      updateCursorPos();
      cmdInput.setSelectionRange(cmdInput.value.length, cmdInput.value.length);
      updateCursorPos();
      return;
    }

    if (key === "Tab") {
      e.preventDefault();
      if (state.suTarget) return;
      const val = cmdInput.value.trim().split(/\s+/);
      if (val.length === 1 && val[0] !== "") {
        const prefix = val[0].toLowerCase();
        const available = Object.keys(commands).concat(
          Object.keys(state.aliases),
        );
        const matches = available.filter((c) => c.startsWith(prefix));
        if (matches.length === 1) {
          cmdInput.value = matches[0] + " ";
          updateCursorPos();
          cmdInput.setSelectionRange(
            cmdInput.value.length,
            cmdInput.value.length,
          );
        } else if (matches.length > 1) {
          appendCommandLine(prefix);
          appendOutput(matches.join("  "));
        }
      } else if (val.length === 2 && val[0].toLowerCase() === "man") {
        var manPrefix = val[1].toLowerCase();
        var manCmds = Object.keys(manPages);
        var manMatches = manCmds.filter(function (c) {
          return c.startsWith(manPrefix);
        });
        if (manMatches.length === 1) {
          cmdInput.value = "man " + manMatches[0] + " ";
          updateCursorPos();
          cmdInput.setSelectionRange(
            cmdInput.value.length,
            cmdInput.value.length,
          );
        } else if (manMatches.length > 1) {
          appendCommandLine(cmdInput.value.trim());
          appendOutput(manMatches.join("  "));
        }
      }
      return;
    }

    if (key === "l" && e.ctrlKey) {
      e.preventDefault();
      commands.clear();
      return;
    }
  });

  // ─── Welcome Message ─────────────────────────────────────────

  var ASCII_BANNER =
    '8888888b.                   d8b  .d8888b.            .d888 888    \n888   Y88b                  Y8P d88P  Y88b          d88P"  888    \n888    888                      Y88b.               888    888    \n888   d88P .d88b.  888  888 888  "Y888b.    .d88b.  888888 888888 \n8888888P" d88""88b 888  888 888     "Y88b. d88""88b 888    888    \n888 T88b  888  888 Y88  88P 888       "888 888  888 888    888    \n888  T88b Y88..88P  Y8bd8P  888 Y88b  d88P Y88..88P 888    Y88b.  \n888   T88b "Y88P"    Y88P   888  "Y8888P"   "Y88P"  888     "Y888';

  function renderWelcome() {
    var welcomeEl = document.getElementById("welcome-message");
    if (!welcomeEl) return;
    var currentLang = welcomeEl.getAttribute("data-lang");
    if (currentLang === state.lang) {
      cmdInput.setAttribute("aria-label", t("welcome.ariaLabel"));
      return;
    }
    welcomeEl.setAttribute("data-lang", state.lang);
    welcomeEl.innerHTML =
      '<pre class="ascii-banner">' +
      escapeHtml(ASCII_BANNER) +
      "</pre>" +
      "<p>" +
      t("welcome.main") +
      "\n" +
      t("welcome.desc") +
      "\n\n" +
      t("welcome.help") +
      "\n" +
      t("welcome.config") +
      "\n" +
      t("welcome.mouse") +
      "</p>";
    cmdInput.setAttribute("aria-label", t("welcome.ariaLabel"));
  }

  // ─── Init ─────────────────────────────────────────────────

  const savedState = Storage.load();
  if (savedState) {
    if (savedState.user && USERS[savedState.user]) {
      state.user = savedState.user;
    }
    if (savedState.cwd) {
      state.cwd = savedState.cwd;
    }
    if (savedState.history && Array.isArray(savedState.history)) {
      state.history = savedState.history;
      if (state.history.length > MAX_HISTORY) {
        state.history = state.history.slice(-MAX_HISTORY);
      }
      state.historyIndex = state.history.length;
    }
    if (savedState.aliases && typeof savedState.aliases === "object") {
      state.aliases = savedState.aliases;
    }
    if (savedState.lang && AVAILABLE_LANGS[savedState.lang]) {
      state.lang = savedState.lang;
    }
  }

  var savedLang = Storage.loadLang();
  if (savedLang && AVAILABLE_LANGS[savedLang]) {
    state.lang = savedLang;
  }

  function finishInit() {
    document.documentElement.setAttribute("lang", state.lang);

    var previousVersion = Storage.loadVersion();
    Storage.saveVersion(VERSION);
    if (previousVersion && previousVersion !== VERSION) {
      var versMsg =
        "v" +
        previousVersion +
        " \u2192 v" +
        VERSION +
        " " +
        t("version.upgraded") +
        ".";
      appendOutput('<span class="text-green">' + versMsg + "</span>");
    }

    customThemes = Storage.loadCustomThemes();
    var savedTheme = Storage.loadTheme();
    if (savedTheme) {
      applyTheme(savedTheme);
    }

    if (!Storage.loadFirstVisit()) {
      Storage.saveFirstVisit(Date.now());
    }

    renderWelcome();
    updatePrompt();
    updateCursorPos();
    scrollToBottom();

    cmdInput.disabled = false;
    cmdInput.focus();

    executeUrlCommands();

    window.addEventListener("resize", function () {
      const atBottom =
        outputArea.scrollHeight -
          outputArea.scrollTop -
          outputArea.clientHeight <
        50;
      if (atBottom) scrollToBottom();
    });
  }

  if (state.lang !== "es" && !I18N[state.lang]) {
    loadI18N(state.lang, function (success) {
      if (!success) {
        state.lang = "es";
      }
      finishInit();
    });
  } else {
    finishInit();
  }
})();
