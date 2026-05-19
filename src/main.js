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
  const terminal = document.getElementById("terminal");

  // ─── State ────────────────────────────────────────────────

  const VERSION = "1.6.0";
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
  ];

  const BUILTIN_THEMES = {
    dark: {
      name: "Dark",
      vars: {
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
  };

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
      "help.theme": "Gestiona temas de color",
      "help.lang": "Cambia el idioma de la interfaz",
      "help.config": "Gestiona el almacenamiento local",
      "help.reboot": "Reinicia la terminal",
      "help.reset": "Restablece a valores de fábrica (borra datos)",
      "help.version": "Muestra la versi\u00f3n",
      "help.license": "Muestra la licencia",
      "help.history": "Historial de comandos",
      "help.shortcuts":
        "Atajos: \u2191/\u2193 (historial) | Tab (autocompletar) | Ctrl+L (clear) | !N / !! (history) | ; (multicommando)",
      "help.urlParams":
        'Par\u00e1metros URL: <span class="cmd">?cmd=clear;su%20airvzxf</span> (\u00f3 &cmd= repetidos)',

      "users.airvzxfDesc": "Administrador / Propietario",
      "users.guestDesc": "Invitado (sesi\u00f3n actual por defecto)",

      "su.usage": "Uso: su &lt;user&gt;",
      "su.authSuccess": "Autenticaci\u00f3n exitosa.",
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
      "airvzxf.man": "P\u00e1gina de manual (man page)",
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

      "theme.title": "Temas de color",
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
        "theme create: se requiere al menos una variable de color.",
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
      "config.codeWord": "c\u00f3digo",
      "config.inWord": "en",

      "reset.msg": "Restableciendo a valores de f\u00e1brica...",
      "reboot.msg": "Reiniciando terminal...",

      eventNotFound: "{0}: event not found",
      historyExpansion: "\u2192 {0}",
    },

    en: {
      "welcome.main":
        "Welcome to <strong>RoviSoft.net</strong> \u2014 Interactive terminal (TTY).",
      "welcome.desc":
        "This is not a traditional website: it's an interactive command terminal that works as a personal homepage.",
      "welcome.help":
        'Type <span class="cmd">help</span> to see available commands.',
      "welcome.config":
        'Type <span class="cmd">config</span> to manage storage preferences.',
      "welcome.mouse": "The mouse is not very useful here... just type.",
      "welcome.ariaLabel": "Command line",

      "help.help": "Show this help",
      "help.clear": "Clear screen",
      "help.whoami": "Show current user",
      "help.users": "List system users",
      "help.su": "Switch user",
      "help.airvzxf": "AirvZxf information",
      "help.neofetch": "System information",
      "help.date": "Current date and time",
      "help.echo": "Echo text",
      "help.alias": "Manage command aliases",
      "help.unalias": "Remove an alias",
      "help.theme": "Manage color themes",
      "help.lang": "Change interface language",
      "help.config": "Manage local storage",
      "help.reboot": "Reboots the terminal",
      "help.reset": "Factory reset (clears all data)",
      "help.version": "Show version",
      "help.license": "Show license",
      "help.history": "Command history",
      "help.shortcuts":
        "Shortcuts: \u2191/\u2193 (history) | Tab (autocomplete) | Ctrl+L (clear) | !N / !! (history) | ; (multicommand)",
      "help.urlParams":
        'URL parameters: <span class="cmd">?cmd=clear;su%20airvzxf</span> (or repeated &cmd=)',

      "users.airvzxfDesc": "Administrator / Owner",
      "users.guestDesc": "Guest (default session)",

      "su.usage": "Usage: su &lt;user&gt;",
      "su.authSuccess": "Authentication successful.",
      "su.welcomeUser": "Welcome, {0}",
      "su.guestRestored": "Guest session restored.",
      "su.unknownUser": "su: user '{0}' does not exist.",

      "version.label": "Version:",
      "version.build": "Build:",
      "version.upgraded": "installed",

      "airvzxf.usage": "Usage: airvzxf &lt;subcommand&gt;",
      "airvzxf.paramSubcommand": "subcommand",
      "airvzxf.about": "Owner information",
      "airvzxf.contact": "Contact information",
      "airvzxf.social": "Social media links",
      "airvzxf.projects": "Portfolio projects",
      "airvzxf.skills": "Tech stack and domains",
      "airvzxf.research": "AI and ML research",
      "airvzxf.man": "Manual page (man page)",
      "airvzxf.unknownSubcommand": "airvzxf: unknown subcommand '{0}'",
      "airvzxf.useHelp":
        'Use <span class="cmd">airvzxf</span> to see available subcommands.',

      "about.of": "of RoviSoft.net",
      "about.location": "Location:",
      "about.role": "Role:",
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
      "neofetch.session": "(session)",
      "neofetch.accepted": "accepted",
      "neofetch.rejected": "rejected",
      "neofetch.undecided": "undecided",

      "license.title": "RoviSoft.net \u2014 Personal Terminal",
      "license.source": "Source code:",
      "license.fullLicense": "Full license:",

      "history.empty": "No commands in history.",

      "lang.title": "Interface language",
      "lang.current": "Current language:",
      "lang.available": "Available languages:",
      "lang.changed": "Language changed to '{0}'.",
      "lang.unknownLang": "lang: unknown language '{0}'.",
      "lang.hint":
        'Use <span class="cmd">lang list</span> to see available languages.',

      "theme.title": "Color themes",
      "theme.current": "Current theme:",
      "theme.currentMarker": "current",
      "theme.builtin": "Built-in themes:",
      "theme.custom": "Custom themes:",
      "theme.description": "Switch to specified theme",
      "theme.listDesc": "List available themes",
      "theme.createDesc": "Create a custom theme",
      "theme.editDesc": "Edit a custom theme",
      "theme.deleteDesc": "Delete a custom theme",
      "theme.exportDesc": "Export theme variables",
      "theme.createNameRequired": "theme create: a name is required.",
      "theme.createNameInvalid":
        "theme create: invalid name. Only lowercase letters, numbers, hyphens and underscores. Must start with a letter, max 20 characters.",
      "theme.createBuiltIn":
        "theme create: '{0}' is a built-in theme and cannot be overwritten.",
      "theme.createBaseInvalid":
        "theme create: invalid base '{0}'. Values: dark, light.",
      "theme.createVarUnknown":
        "theme create: unknown variable '{0}'. Available variables: {1}",
      "theme.createVarRequired":
        "theme create: at least one color variable is required.",
      "theme.createUseExport":
        'Use <span class="cmd">theme export</span> to see available variables.',
      "theme.created": "Theme '{0}' created (base: {1}, {2} variable{3}).",
      "theme.useTheme":
        'Use <span class="cmd">theme {0}</span> to activate it.',
      "theme.editNameRequired": "theme edit: a name is required.",
      "theme.editBuiltIn": "theme edit: cannot edit built-in theme '{0}'.",
      "theme.editNotExists": "theme edit: theme '{0}' does not exist.",
      "theme.editUseCreate":
        'Use <span class="cmd">theme create {0}</span> to create it first.',
      "theme.editNoChanges":
        "theme edit: at least one variable or --base is required to edit.",
      "theme.editBaseInvalid":
        "theme edit: invalid base '{0}'. Values: dark, light.",
      "theme.edited": "Theme '{0}' edited ({1}).",
      "theme.deleteNameRequired":
        "theme delete: a custom theme name is required.",
      "theme.deleteBuiltIn":
        "theme delete: cannot delete built-in theme '{0}'.",
      "theme.deleteNotExists": "theme delete: theme '{0}' does not exist.",
      "theme.deleted": "Theme '{0}' deleted.",
      "theme.exportTitle": "Theme: {0}",
      "theme.exportNotExists": "theme export: theme '{0}' does not exist.",
      "theme.changedTo": "Theme changed to '{0}'.",
      "theme.notExists": "theme: '{0}' does not exist.",
      "theme.useList":
        'Use <span class="cmd">theme list</span> to see available themes.',
      "theme.variable": "variable",
      "theme.variables": "variables",

      "alias.title": "alias \u2014 Define command shortcuts",
      "alias.showAliases": "Show defined aliases",
      "alias.showValue": "Show value of an alias",
      "alias.define": "Define a new alias",
      "alias.preserved": "Aliases are preserved between sessions.",
      "alias.noOverride":
        "Cannot create an alias with an existing command name.",
      "alias.notDefined": "alias: {0}: not defined.",
      "alias.nameEmpty": "alias: empty name.",
      "alias.valueEmpty": "alias: empty value.",
      "alias.existingCommand": "alias: '{0}' is an existing command.",

      "unalias.title": "unalias \u2014 Remove a defined alias",
      "unalias.desc": "Remove the specified alias",
      "unalias.useAlias":
        'Use <span class="cmd">alias</span> to see defined aliases.',
      "unalias.notDefined": "unalias: {0}: not defined.",

      permDenied: "{0}: permission denied.",
      loginAs: 'Log in as {0} with <span class="cmd">su {0}</span>.',

      cmdNotFound: "command not found: {0}",

      "config.title": "Local storage",
      "config.state": "State:",
      "config.mechanism": "Mechanism:",
      "config.wouldStore": "Would store:",
      "config.session": "User session",
      "config.historyStore": "Command history",
      "config.preferences": "Preferences",
      "config.versionStore": "Version",
      "config.accept": "Accept persistent storage",
      "config.reject": "Reject (volatile data, lost on close)",
      "config.status": "Technical storage details",
      "config.show": "Show stored data",
      "config.acceptedShort": "accepted",
      "config.rejectedShort": "rejected",
      "config.undecidedShort": "undecided",
      "config.volatile": "sessionStorage (volatile)",
      "config.acceptedMsg": "Persistent storage accepted.",
      "config.acceptedMsg2": "Your data will be saved between sessions.",
      "config.rejectedMsg": "Persistent storage rejected.",
      "config.rejectedMsg2": "Data will be lost when the tab is closed.",
      "config.rejectedMsg3":
        'Use <span class="cmd">config accept</span> to revert.',
      "config.unknownSubcommand": "config: unknown subcommand '{0}'",
      "config.useConfig":
        'Use <span class="cmd">config</span> to see available options.',
      "config.labelMode": "Mode:",
      "config.labelStore": "Store:",
      "config.labelVersion": "Version:",
      "config.labelUptime": "Uptime:",
      "config.labelData": "Data:",
      "config.keys": "keys",
      "config.codeWord": "code",
      "config.inWord": "in",

      "reset.msg": "Restoring factory defaults...",
      "reboot.msg": "Rebooting terminal...",

      eventNotFound: "{0}: event not found",
      historyExpansion: "\u2192 {0}",
    },
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
    airvzxf: {
      name: "Israel Alberto Roldan Vega",
      email: "israel.alberto.rv@gmail.com",
      bio: "Senior Software Engineer & Software Architect con más de 19 años de experiencia. Programador de sistemas y arquitecto de bajo nivel. Busco la perfección técnica, la optimización extrema y la comprensión profunda de la máquina — desde el hardware y ensamblador hasta el alto nivel.",
      role: "Administrador / Propietario",
      shell: "/bin/bash",
      location: "Guadalajara, Jalisco, México",
      tech: [
        "Rust",
        "Bash",
        "Python",
        "JavaScript",
        "Assembly",
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
          desc: "Sistema de mapeo y visualización de flujo de control para código fuente C, analizando el AST",
          url: "https://github.com/airvzxf/c2flowch",
        },
        {
          name: "fibonacci_benchmark",
          desc: "Algoritmo de Fibonacci en ensamblador que superó en rendimiento a la versión compilada en C",
          url: "https://github.com/airvzxf/assembly/tree/master/linux/benchmark/fibonacci",
        },
        {
          name: "aur_packages",
          desc: "Mantenimiento de paquetes duc y duc-git en el Arch User Repository",
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
    promptUser.textContent = state.user;
    promptHost.textContent = state.host;
    promptPath.textContent = state.cwd;
    if (state.user === "root") {
      promptSymbol.textContent = "#";
      promptSymbol.className = "prompt-symbol symbol-hash";
    } else {
      promptSymbol.textContent = "$";
      promptSymbol.className = "prompt-symbol";
    }
  }

  // ─── Cursor Position & Visibility ─────────────────────────

  function updateCursorPos() {
    const val = cmdInput.value;
    const pos = cmdInput.selectionStart;
    cmdBefore.textContent = val.slice(0, pos);
    cmdAfter.textContent = val.slice(pos);
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
      state.user === "root"
        ? "prompt-symbol prompt-symbol-hash"
        : "prompt-symbol";
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
          '<span class="text-yellow text-bold">' + t("lang.title") + "</span>",
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
          '<span class="text-yellow text-bold">' +
            t("lang.available") +
            "</span>",
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
    },

    whoami() {
      return state.user;
    },

    users() {
      return formatHtmlList([
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
      if (state.user !== "airvzxf") {
        return permDenied("airvzxf", "airvzxf");
      }
      if (!args.length) {
        const lines = [
          '<span class="text-yellow text-bold">' +
            t("airvzxf.usage") +
            "</span>",
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
            ['<span class="cmd">airvzxf man</span>', t("airvzxf.man")],
          ]),
        );
        lines.push("");
        return lines.join("\n");
      }
      const sub = args[0].toLowerCase();
      const subcommands = {
        about: true,
        contact: true,
        projects: true,
        social: true,
        skills: true,
        research: true,
        man: true,
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
          '<span class="text-yellow text-bold">' + t("theme.title") + "</span>",
          `  ${t("theme.current")} <span class="text-cyan">${escapeHtml(currentTheme)}</span>`,
          "",
          ...formatHtmlList(themeItems),
          "",
        ].join("\n");
      }

      var sub = args[0].toLowerCase();

      if (sub === "list") {
        var lines = [
          '<span class="text-yellow text-bold">' +
            t("theme.builtin") +
            "</span>",
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
            '<span class="text-yellow text-bold">' +
              t("theme.custom") +
              "</span>",
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
          '<span class="text-yellow text-bold">' +
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
          '<span class="text-yellow text-bold">' + t("alias.title") + "</span>",
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
          '<span class="text-yellow text-bold">' +
            t("unalias.title") +
            "</span>",
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
          '<span class="text-yellow text-bold">' +
            t("config.title") +
            "</span>",
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
            versionStr + " (" + t("config.codeWord") + ": v" + VERSION + ")",
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

    reboot() {
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
            "Senior Software Engineer & Software Architect",
          ],
          [
            '<span class="text-dim">' + t("about.tech") + "</span>",
            escapeHtml(u.tech.join(", ")),
          ],
        ],
        { indent: "" },
      );
      return [
        `<span class="text-green text-bold">${escapeHtml(u.name)}</span>  <span class="text-dim">\u2014 ${escapeHtml(u.role)} ${t("about.of")}</span>`,
        "",
        escapeHtml(u.bio),
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
        projectLines.push(
          `<span class="text-cyan text-bold">${escapeHtml(p.name)}</span> \u2014 ${escapeHtml(p.desc)}`,
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
      return state.lang === "en"
        ? [
            "LANGUAGES:",
            "  Rust        [##########] Systems programming, critical performance",
            "  Bash        [##########] Automation, systems scripting",
            "  Python      [##########] Rapid prototyping, ML/DL, tooling",
            "  JavaScript  [########..] Web frontend, Node.js",
            "  Assembly    [######....] x86/x64, low-level optimization",
            "",
            "ENVIRONMENT & TOOLS:",
            ...formatTextList([
              ["OS:", "Arch Linux (pacman)"],
              ["WM:", "labwc (Wayland)"],
              ["Terminal:", "Alacritty + Tmux"],
              ["Containers:", "Podman"],
              ["VCS:", "Git"],
            ]),
            "",
            "DOMAINS:",
            "  Systems architecture          Low-level optimization",
            "  Machine Learning / Deep Learning    MCP / Agentic AI",
            "  Reverse engineering            AUR packaging",
            "  AI orchestration under architectural direction",
            "",
          ].join("\n")
        : [
            "LENGUAJES:",
            "  Rust        [##########] Systems programming, rendimiento cr\u00edtico",
            "  Bash        [##########] Automatizaci\u00f3n, scripting de sistemas",
            "  Python      [##########] Prototipado r\u00e1pido, ML/DL, tooling",
            "  JavaScript  [########..] Web frontend, Node.js",
            "  Assembly    [######....] x86/x64, optimizaci\u00f3n de bajo nivel",
            "",
            "ENTORNO & HERRAMIENTAS:",
            ...formatTextList([
              ["OS:", "Arch Linux (pacman)"],
              ["WM:", "labwc (Wayland)"],
              ["Terminal:", "Alacritty + Tmux"],
              ["Contenedores:", "Podman"],
              ["VCS:", "Git"],
            ]),
            "",
            "DOMINIOS:",
            "  Arquitectura de sistemas     Optimizaci\u00f3n de bajo nivel",
            "  Machine Learning / Deep Learning    MCP / IA Ag\u00e9ntica",
            "  Ingenier\u00eda inversa            Empaquetado AUR",
            "  Orquestaci\u00f3n de IA bajo direcci\u00f3n arquitect\u00f3nica",
            "",
          ].join("\n");
    },

    research() {
      return state.lang === "en"
        ? [
            "[2024-01-15 09:23:11] ML Specialization completed (Udemy)",
            "[2024-03-02 14:55:42] Deep Learning Specialization completed (Udemy)",
            "[2024-06-10 11:30:00] Local inference infrastructure deployed with Ollama",
            "[2024-06-10 11:30:05] Models loaded: Gemma 4, DeepSeek, Qwen",
            "[2024-06-10 11:30:07] MCP (Model Context Protocol) research started",
            "[2024-08-22 16:45:33] Agentic AI orchestration pipeline: phase 1",
            "[2024-11-05 08:12:00] Code analysis automation with local LLMs",
            "[2025-01-20 13:00:00] OpenCode: AI-driven development environment",
            "[2025-03-15 10:00:00] DeepSeek V4 evaluation for low-level tasks",
            "",
          ].join("\n")
        : [
            "[2024-01-15 09:23:11] ML Specialization completada (Udemy)",
            "[2024-03-02 14:55:42] Deep Learning Specialization completada (Udemy)",
            "[2024-06-10 11:30:00] Infraestructura de inferencia local con Ollama desplegada",
            "[2024-06-10 11:30:05] Modelos cargados: Gemma 4, DeepSeek, Qwen",
            "[2024-06-10 11:30:07] Investigaci\u00f3n MCP (Model Context Protocol) iniciada",
            "[2024-08-22 16:45:33] Pipeline de orquestaci\u00f3n de IA ag\u00e9ntica: fase 1",
            "[2024-11-05 08:12:00] Automatizaci\u00f3n de an\u00e1lisis de c\u00f3digo con LLMs locales",
            "[2025-01-20 13:00:00] OpenCode: entorno de desarrollo impulsado por IA",
            "[2025-03-15 10:00:00] Evaluaci\u00f3n DeepSeek V4 para tareas de bajo nivel",
            "",
          ].join("\n");
    },

    man() {
      return state.lang === "en"
        ? [
            "NAME",
            "  airvzxf - Senior Software Engineer, Systems Architect, Toolsmith",
            "",
            "SYNOPSIS",
            "  Systems architecture, low-level optimization, AI orchestration.",
            "",
            "DESCRIPTION",
            "  airvzxf is a systems programmer and software architect with over 19",
            "  years of experience. He operates at the intersection of hardware",
            "  and high-level systems, with an obsessive focus on architectural",
            "  purity and extreme optimization.",
            "",
            "  He despises inefficient code, MVP-driven shortcuts, and technical",
            "  debt. His approach is rooted in deep understanding of the machine",
            "  from assembly up through high-level abstractions.",
            "",
            "  Currently at the job, he orchestrates AI systems as development",
            "  tools under strict architectural direction \u2014 not as end-user",
            "  applications, but as instruments of engineering.",
            "",
            "  Diagnosed with mild functional Asperger's, which provides hyperfocus,",
            "  deep system analysis, and zero tolerance for dirty code.",
            "",
            "ENVIRONMENT",
            ...formatTextList([
              ["OS:", "Arch Linux (pacman)"],
              ["WM:", "labwc (Wayland)"],
              ["Terminal:", "Alacritty + Tmux"],
              ["Containers:", "Podman"],
              ["VCS:", "Git"],
            ]),
            "",
            "LANGUAGES",
            "  Rust, Bash, Python, JavaScript, Assembly, C",
            "",
            "SEE ALSO",
            "  whoami(1)",
            "",
            `RoviSoft.net                        ${new Date().getFullYear()}                       airvzxf(1)`,
          ].join("\n")
        : [
            "NOMBRE",
            "  airvzxf - Senior Software Engineer, Arquitecto de Sistemas, Toolsmith",
            "",
            "SINOPSIS",
            "  Arquitectura de sistemas, optimizaci\u00f3n de bajo nivel, orquestaci\u00f3n de IA.",
            "",
            "DESCRIPCI\u00d3N",
            "  airvzxf es un programador de sistemas y arquitecto de software con m\u00e1s",
            "  de 19 a\u00f1os de experiencia. Opera en la intersecci\u00f3n del hardware",
            "  y los sistemas de alto nivel, con un enfoque obsesivo en la pureza",
            "  arquitect\u00f3nica y la optimizaci\u00f3n extrema.",
            "",
            "  Desprecia el c\u00f3digo ineficiente, los atajos MVP y la deuda t\u00e9cnica.",
            "  Su enfoque se basa en la comprensi\u00f3n profunda de la m\u00e1quina,",
            "  desde ensamblador hasta las abstracciones de alto nivel.",
            "",
            "  Actualmente orquesta sistemas de IA como herramientas de desarrollo",
            "  bajo direcci\u00f3n arquitect\u00f3nica estricta \u2014 no como aplicaciones",
            "  de usuario final, sino como instrumentos de ingenier\u00eda.",
            "",
            "  Diagnosticado con Asperger leve funcional, lo que le otorga",
            "  hiperfoco, an\u00e1lisis profundo de sistemas y cero tolerancia",
            "  al c\u00f3digo sucio.",
            "",
            "ENTORNO",
            ...formatTextList([
              ["OS:", "Arch Linux (pacman)"],
              ["WM:", "labwc (Wayland)"],
              ["Terminal:", "Alacritty + Tmux"],
              ["Contenedores:", "Podman"],
              ["VCS:", "Git"],
            ]),
            "",
            "LENGUAJES",
            "  Rust, Bash, Python, JavaScript, Assembly, C",
            "",
            "VEASE TAMBIEN",
            "  whoami(1)",
            "",
            `RoviSoft.net                        ${new Date().getFullYear()}                       airvzxf(1)`,
          ].join("\n");
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
    } else {
      appendOutput(
        `<span class="text-red">${escapeHtml(tf("cmdNotFound", cmdName))}</span>`,
      );
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

  cmdInput.addEventListener("keydown", function (e) {
    const key = e.key;

    if (key === "Enter") {
      e.preventDefault();
      execute(cmdInput.value);
      clearInput();
      return;
    }

    if (key === "ArrowUp") {
      e.preventDefault();
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
    if (savedState.lang && I18N[savedState.lang]) {
      state.lang = savedState.lang;
    }
  }

  var savedLang = Storage.loadLang();
  if (savedLang && I18N[savedLang]) {
    state.lang = savedLang;
  }
  document.documentElement.setAttribute("lang", state.lang);

  const previousVersion = Storage.loadVersion();
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

  executeUrlCommands();

  window.addEventListener("resize", function () {
    const atBottom =
      outputArea.scrollHeight - outputArea.scrollTop - outputArea.clientHeight <
      50;
    if (atBottom) scrollToBottom();
  });
})();
