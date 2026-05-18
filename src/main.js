/* =====================================================
   RoviSoft.net — Terminal JavaScript
   GNU AGPL v3 — https://github.com/airvzxf/rovisoft-web
   ===================================================== */

(function () {
  'use strict';

  // ─── DOM ──────────────────────────────────────────────────

  const outputArea   = document.getElementById('output-area');
  const promptArea   = document.getElementById('prompt-area');
  const cmdInput     = document.getElementById('cmd-input');
  const cmdBefore    = document.getElementById('prompt-cmd-before');
  const cmdAfter     = document.getElementById('prompt-cmd-after');
  const cursorEl     = document.getElementById('cursor');
  const promptUser   = document.getElementById('prompt-user');
  const promptHost   = document.getElementById('prompt-host');
  const promptPath   = document.getElementById('prompt-path');
  const promptSymbol = document.getElementById('prompt-symbol');
  const terminal     = document.getElementById('terminal');

  // ─── State ────────────────────────────────────────────────

  const VERSION = '1.3.1';
  const MAX_HISTORY = 1000;

  let sessionStartTime = Date.now();

  const state = {
    user: 'guest',
    host: 'rovisoft.net',
    cwd: '~',
    history: [],
    historyIndex: -1,
    tempInput: '',
    aliases: {}
  };

  // ─── Users ────────────────────────────────────────────────

  const USERS = {
    guest: {
      name: 'guest',
      email: 'desconocido',
      bio: 'Usuario invitado.',
      role: 'Invitado',
      shell: '/bin/bash',
      location: 'Desconocida'
    },
    airvzxf: {
      name: 'Israel Alberto Roldan Vega',
      email: 'israel.alberto.rv@gmail.com',
      bio: 'Senior Software Engineer & Software Architect con más de 19 años de experiencia. Programador de sistemas y arquitecto de bajo nivel. Busco la perfección técnica, la optimización extrema y la comprensión profunda de la máquina — desde el hardware y ensamblador hasta el alto nivel.',
      role: 'Administrador / Propietario',
      shell: '/bin/bash',
      location: 'Guadalajara, Jalisco, México',
      tech: ['Rust', 'Bash', 'Python', 'JavaScript', 'Assembly', 'Podman', 'Linux (Arch)', 'Git'],
      github: 'https://github.com/airvzxf',
      youtube: 'https://www.youtube.com/@israel.roldan',
      x: 'https://x.com/IsraelAlbert_RV',
      linkedin: 'https://www.linkedin.com/in/israel-roldan-airvzxf/',
      website: 'https://rovisoft.net',
      projects: [
        { name: 'c2flowch', desc: 'Sistema de mapeo y visualización de flujo de control para código fuente C, analizando el AST', url: 'https://github.com/airvzxf/c2flowch' },
        { name: 'fibonacci_benchmark', desc: 'Algoritmo de Fibonacci en ensamblador que superó en rendimiento a la versión compilada en C', url: 'https://github.com/airvzxf/assembly/tree/master/linux/benchmark/fibonacci' },
        { name: 'aur_packages', desc: 'Mantenimiento de paquetes duc y duc-git en el Arch User Repository', url: 'https://aur.archlinux.org/packages/duc' }
      ]
    }
  };

  // ─── Virtual Filesystem ───────────────────────────────────

  const FS = {
    '/home/airvzxf/skills.txt': [
      'LANGUAGES:',
      '  Rust        [██████████] Systems programming, rendimiento crítico',
      '  Bash        [██████████] Automatización, scripting de sistemas',
      '  Python      [██████████] Prototipado rápido, ML/DL, tooling',
      '  JavaScript  [████████░░] Web frontend, Node.js',
      '  Assembly    [██████░░░░] x86/x64, optimización de bajo nivel',
      '',
      'ENTORNO & HERRAMIENTAS:',
      '  OS:         Arch Linux (pacman)',
      '  WM:         labwc (Wayland)',
      '  Terminal:   Alacritty + Tmux',
      '  Contenedores: Podman',
      '  VCS:        Git',
      '',
      'DOMINIOS:',
      '  Arquitectura de sistemas     Optimización de bajo nivel',
      '  Machine Learning / Deep Learning    MCP / IA Agéntica',
      '  Ingeniería inversa            Empaquetado AUR',
      '  Orquestación de IA bajo dirección arquitectónica',
    ].join('\n'),

    '/home/airvzxf/projects': {
      type: 'dir',
      entries: {
        c2flowch:            { type: 'dir', desc: 'C source control flow visualization via AST analysis' },
        fibonacci_benchmark: { type: 'dir', desc: 'Assembly Fibonacci outperforming compiled C' },
        aur_packages:        { type: 'dir', desc: 'AUR maintenance (duc, duc-git)' },
        rovisoft_web:        { type: 'dir', desc: 'Interactive personal terminal — RoviSoft.net' }
      }
    },

    '/home/airvzxf/ai_research.log': [
      '[2024-01-15 09:23:11] ML Specialization completada (Udemy)',
      '[2024-03-02 14:55:42] Deep Learning Specialization completada (Udemy)',
      '[2024-06-10 11:30:00] Infraestructura de inferencia local con Ollama desplegada',
      '[2024-06-10 11:30:05] Modelos cargados: Gemma 4, DeepSeek, Qwen',
      '[2024-06-10 11:30:07] Investigación MCP (Model Context Protocol) iniciada',
      '[2024-08-22 16:45:33] Pipeline de orquestación de IA agéntica: fase 1',
      '[2024-11-05 08:12:00] Automatización de análisis de código con LLMs locales',
      '[2025-01-20 13:00:00] OpenCode: entorno de desarrollo impulsado por IA',
      '[2025-03-15 10:00:00] Evaluación DeepSeek V4 para tareas de bajo nivel',
    ].join('\n')
  };

  function resolvePath(rawPath) {
    let p = rawPath.trim();
    if (p.startsWith('~')) p = '/home/' + state.user + p.slice(1);
    if (p === '.' || p === './') p = '/home/' + state.user;
    if (p.startsWith('./')) p = '/home/' + state.user + '/' + p.slice(2);
    if (!p.startsWith('/')) p = '/home/' + state.user + '/' + p;
    return p;
  }

  function fsRead(absPath) {
    const entry = FS[absPath];
    if (entry) return entry;
    return FS[absPath.replace(/\/+$/, '')] || null;
  }

  function fsLs(absPath) {
    const entry = FS[absPath];
    if (!entry || entry.type !== 'dir') return null;
    return entry.entries;
  }

  // ─── Helpers ──────────────────────────────────────────────

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function textOut(lines) {
    const text = Array.isArray(lines) ? lines.join('\n') : lines;
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
    if (state.user === 'root') {
      promptSymbol.textContent = '#';
      promptSymbol.className = 'prompt-symbol symbol-hash';
    } else {
      promptSymbol.textContent = '$';
      promptSymbol.className = 'prompt-symbol';
    }
  }

  // ─── Cursor Position & Visibility ─────────────────────────

  function updateCursorPos() {
    const val = cmdInput.value;
    const pos = cmdInput.selectionStart;
    cmdBefore.textContent = val.slice(0, pos);
    cmdAfter.textContent = val.slice(pos);
  }

  function showCursor() { cursorEl.classList.remove('cursor-hidden'); }
  function hideCursor() { cursorEl.classList.add('cursor-hidden'); }

  // ─── Append Output ────────────────────────────────────────

  function appendOutput(html) {
    if (html === null) return;
    const div = document.createElement('div');
    div.className = 'output-line';
    div.innerHTML = html;
    outputArea.appendChild(div);
    outputArea.scrollTop = outputArea.scrollHeight;
  }

  function appendCommandLine(cmd) {
    const div = document.createElement('div');
    div.className = 'output-line command-line';
    const symbol = state.user === 'root' ? '#' : '$';
    const symbolClass = state.user === 'root' ? 'prompt-symbol prompt-symbol-hash' : 'prompt-symbol';
    div.innerHTML = [
      `<span class="prompt-user">${escapeHtml(state.user)}</span>`,
      `<span class="prompt-at">@</span>`,
      `<span class="prompt-host">${escapeHtml(state.host)}</span>`,
      `<span class="prompt-colon">:</span>`,
      `<span class="prompt-path">${escapeHtml(state.cwd)}</span>`,
      `<span class="${symbolClass}">${escapeHtml(symbol)}</span> `,
      escapeHtml(cmd)
    ].join('');
    outputArea.appendChild(div);
  }

  // ─── Clear Input ──────────────────────────────────────────

  function clearInput() {
    cmdInput.value = '';
    cmdBefore.textContent = '';
    cmdAfter.textContent = '';
  }

  function scrollToBottom() {
    outputArea.scrollTop = outputArea.scrollHeight;
  }

  function permDenied(cmd, user) {
    return [
      `<span class="text-red">${escapeHtml(cmd)}: permiso denegado.</span>`,
      `Inicia sesión como ${escapeHtml(user)} con <span class="cmd">su ${escapeHtml(user)}</span>.`,
      ''
    ].join('\n');
  }

  function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (d) { parts.push(d + 'd'); parts.push(h + 'h'); parts.push(m + 'm'); }
    else if (h) { parts.push(h + 'h'); parts.push(m + 'm'); parts.push(s + 's'); }
    else { parts.push(m + 'm'); parts.push(s + 's'); }
    return parts.join(' ') || '0s';
  }

  function formatStorageSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KiB';
    return (bytes / 1048576).toFixed(2) + ' MiB';
  }

  // ─── Commands ─────────────────────────────────────────────

  const commands = {

    help() {
      const base = [
        '  <span class="cmd">help</span>            Muestra esta ayuda',
        '  <span class="cmd">clear</span>           Limpia la pantalla',
        '  <span class="cmd">whoami</span>          Muestra el usuario actual',
        '  <span class="cmd">users</span>           Lista los usuarios del sistema',
        '  <span class="cmd">su &lt;user&gt;</span>       Cambia de usuario',
        '  <span class="cmd">airvzxf</span>         Información de AirvZxf',
        '  <span class="cmd">neofetch</span>        Información del sistema',
        '  <span class="cmd">date</span>            Fecha y hora actual',
        '  <span class="cmd">echo &lt;texto&gt;</span>    Repite el texto',
        '  <span class="cmd">alias</span>           Gestiona alias de comandos',
        '  <span class="cmd">unalias</span>         Elimina un alias',
        '  <span class="cmd">config</span>          Gestiona el almacenamiento local',
        '  <span class="cmd">reboot</span>          Reinicia la terminal (borra datos)',
        '  <span class="cmd">version</span>         Muestra la versión',
        '  <span class="cmd">license</span>         Muestra la licencia',
        '  <span class="cmd">history</span>         Historial de comandos',
      ];

      if (state.user === 'airvzxf') {
        base.push(
          '',
          '  <span class="text-dim">── Comandos adicionales (airvzxf) ──</span>',
          '',
          '  <span class="cmd">cat &lt;file&gt;</span>      Lee un archivo del sistema',
          '  <span class="cmd">ls [-l] &lt;dir&gt;</span>   Lista contenido de un directorio',
          '  <span class="cmd">man &lt;topic&gt;</span>      Página de manual',
          '  <span class="cmd">tail [-f] &lt;file&gt;</span> Muestra el final de un archivo',
        );
      }

      base.push(
        '',
        '<span class="text-dim">Atajos: ↑/↓ (historial) | Tab (autocompletar) | Ctrl+L (clear) | !N / !! (history) | ; (multicomando)</span>',
        ''
      );
      return base.join('\n');
    },

    clear() {
      outputArea.innerHTML = '';
      return null;
    },

    whoami() {
      return state.user;
    },

    users() {
      return [
        '  <span class="text-green">airvzxf</span>    Administrador / Propietario',
        '  <span class="text-green">guest</span>      Invitado (sesión actual por defecto)',
        ''
      ].join('\n');
    },

    su(args) {
      if (!args.length) {
        return '<span class="text-red">Uso: su &lt;usuario&gt;</span>';
      }
      const target = args[0].toLowerCase();
      if (target === 'airvzxf') {
        state.user = 'airvzxf';
        state.cwd = '~';
        updatePrompt();
        updateCursorPos();
        return [
          '<span class="text-green">Autenticación exitosa.</span>',
          `Bienvenido, <span class="text-cyan text-bold">${USERS.airvzxf.name}</span>.`,
          'Escribe <span class="cmd">airvzxf</span> para ver los subcomandos disponibles.',
        ].join('\n');
      }
      if (target === 'guest') {
        state.user = 'guest';
        state.cwd = '~';
        updatePrompt();
        updateCursorPos();
        return '<span class="text-green">Sesión de invitado restaurada.</span>';
      }
      return `<span class="text-red">su: usuario '${escapeHtml(target)}' no existe.</span>`;
    },

    version() {
      return [
        '<span class="text-dim">Versión:</span>       v' + VERSION,
        '<span class="text-dim">Build:</span>         AGPL v3 — vanilla HTML5/CSS3/ES6+',
        '<span class="text-dim">Repositorio:</span>   ' + link('https://github.com/airvzxf/rovisoft-web'),
        ''
      ].join('\n');
    },

    airvzxf(args) {
      if (state.user !== 'airvzxf') {
        return permDenied('airvzxf', 'airvzxf');
      }
      if (!args.length) {
        return [
          '<span class="text-yellow text-bold">Uso: airvzxf &lt;subcomando&gt;</span>',
          '',
          '  <span class="cmd">airvzxf about</span>     Información del propietario',
          '  <span class="cmd">airvzxf contact</span>   Formas de contacto',
          '  <span class="cmd">airvzxf social</span>    Enlaces a redes sociales',
          '  <span class="cmd">airvzxf projects</span>  Proyectos del portafolio',
          ''
        ].join('\n');
      }
      const sub = args[0].toLowerCase();
      const subcommands = { about: true, contact: true, projects: true, social: true };
      if (!subcommands[sub]) {
        return `<span class="text-red">airvzxf: subcomando desconocido '${escapeHtml(sub)}'</span>\nUsa <span class="cmd">airvzxf</span> para ver los subcomandos disponibles.`;
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
        uptime = formatUptime(uptimeSec) + ' (session)';
      }

      let ram;
      if (status.accepted) {
        const usedBytes = Storage.getStorageInfo().totalBytes;
        ram = formatStorageSize(usedBytes) + ' / 5.0 MiB';
      } else {
        const fakeRam = (Math.random() * 200 + 100).toFixed(0);
        ram = fakeRam + ' MiB / 1024 MiB';
      }

      const configLabel = status.accepted === true ? 'aceptado' : status.accepted === false ? 'rechazado' : 'sin decidir';
      const lines = [
        `<span class="nf-label">OS:</span>        RoviSoft Terminal v${VERSION}`,
        `<span class="nf-label">Host:</span>      ${escapeHtml(state.host)}`,
        `<span class="nf-label">Kernel:</span>    HTML5/CSS3/ES6+`,
        `<span class="nf-label">Shell:</span>     ${escapeHtml(u.shell)}`,
        `<span class="nf-label">User:</span>      ${escapeHtml(state.user)}`,
        `<span class="nf-label">Uptime:</span>    ${uptime}`,
        `<span class="nf-label">Config:</span>    ${configLabel}`,
        `<span class="nf-label">Storage:</span>   ${ram}`,
      ];
      return '<div class="neofetch-block">' + lines.join('\n') + '</div>';
    },

    date() {
      return new Date().toString();
    },

    echo(args) {
      if (!args.length) return '';
      return escapeHtml(args.join(' '));
    },

    license() {
      const year = new Date().getFullYear();
      return [
        '============================================================',
        ' RoviSoft.net — Terminal Personal',
        ` Copyright (C) ${year} Israel Alberto Roldan Vega`,
        '',
        ' This program is free software: you can redistribute it',
        ' and/or modify it under the terms of the GNU Affero General',
        ' Public License as published by the Free Software Foundation,',
        ' either version 3 of the License, or (at your option) any',
        ' later version.',
        '',
        ' This program is distributed in the hope that it will be',
        ' useful, but WITHOUT ANY WARRANTY; without even the implied',
        ' warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR',
        ' PURPOSE.',
        '',
        ` Source code:  ${link('https://github.com/airvzxf/rovisoft-web')}`,
        ` Full license: ${link('https://www.gnu.org/licenses/agpl-3.0.html')}`,
        '============================================================',
        ''
      ].join('\n');
    },

    history() {
      if (!state.history.length) {
        return '<span class="text-dim">No hay comandos en el historial.</span>';
      }
      return state.history.map((cmd, i) => {
        const n = String(i + 1).padStart(4, ' ');
        return `<span class="text-dim">${n}</span>  ${escapeHtml(cmd)}`;
      }).join('\n');
    },

    alias(args) {
      if (!args.length) {
        const keys = Object.keys(state.aliases);
        return [
          '<span class="text-yellow text-bold">alias</span> — Define atajos para comandos',
          '  <span class="cmd">alias</span>                     Muestra los alias definidos',
          '  <span class="cmd">alias nombre</span>              Muestra el valor de un alias',
          '  <span class="cmd">alias nombre=&#39;comando&#39;</span>    Define un nuevo alias',
          '',
          '  <span class="text-dim">Los alias se conservan entre sesiones.</span>',
          '  <span class="text-dim">No se puede crear un alias con el nombre de un comando existente.</span>',
          keys.length ? ' ' : '',
          keys.map(k => `<span class="cmd">alias</span> ${escapeHtml(k)}=${escapeHtml(state.aliases[k])}`)
        ].join('\n');
      }
      const rawArgs = args.join(' ');
      const eqIdx = rawArgs.indexOf('=');
      if (eqIdx === -1) {
        const name = args[0];
        if (state.aliases[name]) {
          return `<span class="cmd">alias</span> ${escapeHtml(name)}=${escapeHtml(state.aliases[name])}`;
        }
        return `<span class="text-red">alias: ${escapeHtml(name)}: no definido.</span>`;
      }
      const name = rawArgs.slice(0, eqIdx).trim();
      let value = rawArgs.slice(eqIdx + 1).trim();
      if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }
      if (!name) return '<span class="text-red">alias: nombre vacío.</span>';
      if (!value) return '<span class="text-red">alias: valor vacío.</span>';
      if (name in commands) return `<span class="text-red">alias: '${escapeHtml(name)}' es un comando existente.</span>`;
      state.aliases[name] = value;
      return '';
    },

    unalias(args) {
      if (!args.length) {
        return [
          '<span class="text-yellow text-bold">unalias</span> — Elimina un alias definido',
          '',
          '  <span class="cmd">unalias nombre</span>   Elimina el alias especificado',
          '',
          '  <span class="text-dim">Usa</span> <span class="cmd">alias</span> <span class="text-dim">para ver los alias definidos.</span>',
          ''
        ].join('\n');
      }
      const name = args[0];
      if (!(name in state.aliases)) return `<span class="text-red">unalias: ${escapeHtml(name)}: no definido.</span>`;
      delete state.aliases[name];
      return '';
    },

    // ─── File system commands (airvzxf only) ──────────────

    cat(args) {
      if (state.user !== 'airvzxf') {
        return '<span class="perm-denied">cat: permiso denegado. Inicia sesión como airvzxf.</span>';
      }
      if (!args.length) {
        return '<span class="text-red">cat: falta el nombre del archivo.</span>';
      }
      const absPath = resolvePath(args[0]);
      const content = fsRead(absPath);
      if (content === null) {
        return `<span class="text-red">cat: ${escapeHtml(args[0])}: No existe el archivo o directorio.</span>`;
      }
      if (typeof content === 'object') {
        return `<span class="text-red">cat: ${escapeHtml(args[0])}: Es un directorio.</span>`;
      }
      return textOut(content);
    },

    ls(args) {
      if (state.user !== 'airvzxf') {
        return '<span class="perm-denied">ls: permiso denegado. Inicia sesión como airvzxf.</span>';
      }
      let longFormat = false;
      let target = '.';
      for (const a of args) {
        if (a === '-l' || a === '-la' || a === '-al') longFormat = true;
        else if (!a.startsWith('-')) target = a;
      }
      const absPath = resolvePath(target);
      const entries = fsLs(absPath);
      if (entries === null) {
        const content = fsRead(absPath);
        if (content !== null && typeof content !== 'object') {
          if (longFormat) {
            return textOut(`-rw-r--r-- airvzxf airvzxf  ${target.split('/').pop()}`);
          }
          return escapeHtml(target.split('/').pop());
        }
        return `<span class="text-red">ls: ${escapeHtml(target)}: No existe el archivo o directorio.</span>`;
      }
      const keys = Object.keys(entries);
      if (longFormat) {
        const lines = [`total ${keys.length}`];
        keys.forEach(k => {
          const e = entries[k];
          const type = e.type === 'dir' ? 'd' : '-';
          lines.push(`${type}rwxr-xr-x airvzxf airvzxf  ${k.padEnd(22)} ${e.desc}`);
        });
        return textOut(lines);
      }
      return textOut(keys.join('  '));
    },

    man(args) {
      if (state.user !== 'airvzxf') {
        return '<span class="perm-denied">man: permiso denegado. Inicia sesión como airvzxf.</span>';
      }
      if (!args.length || args[0] === 'airvzxf') {
        const topic = args[0] || 'airvzxf';
        if (topic !== 'airvzxf') {
          return `<span class="text-red">man: No existe entrada de manual para ${escapeHtml(topic)}.</span>`;
        }
        return textOut([
          'NAME',
          '  airvzxf - Senior Software Engineer, Systems Architect, Toolsmith',
          '',
          'SYNOPSIS',
          '  Systems architecture, low-level optimization, AI orchestration.',
          '',
          'DESCRIPTION',
          '  airvzxf is a systems programmer and software architect with over 19',
          '  years of experience. He operates at the intersection of hardware',
          '  and high-level systems, with an obsessive focus on architectural',
          '  purity and extreme optimization.',
          '',
          '  He despises inefficient code, MVP-driven shortcuts, and technical',
          '  debt. His approach is rooted in deep understanding of the machine',
          '  from assembly up through high-level abstractions.',
          '',
          '  Currently at the job, he orchestrates AI systems as development',
          '  tools under strict architectural direction — not as end-user',
          '  applications, but as instruments of engineering.',
          '',
          '  Diagnosed with mild functional Asperger\'s, which provides hyperfocus,',
          '  deep system analysis, and zero tolerance for dirty code.',
          '',
          'ENVIRONMENT',
          '  OS:         Arch Linux (pacman)',
          '  WM:         labwc (Wayland)',
          '  Terminal:   Alacritty + Tmux',
          '  Containers: Podman',
          '  VCS:        Git',
          '',
          'LANGUAGES',
          '  Rust, Bash, Python, JavaScript, Assembly, C',
          '',
          'SEE ALSO',
          '  whoami(1), cat(1), ls(1), tail(1)',
          '',
          `RoviSoft.net                        ${new Date().getFullYear()}                       airvzxf(1)`,
        ]);
      }
      return '<span class="text-red">man: No existe entrada de manual para ese tema.</span>';
    },

    tail(args) {
      if (state.user !== 'airvzxf') {
        return '<span class="perm-denied">tail: permiso denegado. Inicia sesión como airvzxf.</span>';
      }
      if (!args.length) {
        return '<span class="text-red">tail: falta el nombre del archivo.</span>';
      }
      let fileArg = args[args.length - 1];
      for (const a of args) {
        if (!a.startsWith('-')) { fileArg = a; break; }
      }
      const absPath = resolvePath(fileArg);
      const content = fsRead(absPath);
      if (content === null) {
        return `<span class="text-red">tail: ${escapeHtml(fileArg)}: No existe el archivo.</span>`;
      }
      if (typeof content === 'object') {
        return `<span class="text-red">tail: ${escapeHtml(fileArg)}: Es un directorio.</span>`;
      }
      const lines = content.split('\n');
      const tailLines = lines.slice(-10);
      return textOut(tailLines);
    },

    config(args) {
      if (!args.length) {
        const status = Storage.getStatus();
        const acceptedLabel = status.accepted === true ? '<span class="text-green">aceptado</span>' : status.accepted === false ? '<span class="text-red">rechazado</span>' : '<span class="text-yellow">sin decidir</span>';
        const storeLabel = status.accepted === true ? 'localStorage' : 'sessionStorage (volátil)';
        return [
          '<span class="text-yellow text-bold">Almacenamiento local</span>',
          `  Estado:     ${acceptedLabel}`,
          `  Mecanismo:  ${storeLabel}`,
          '',
          '  <span class="text-dim">Se almacenarían:</span>',
          '  <span class="text-dim">  — Sesión de usuario</span>',
          '  <span class="text-dim">  — Historial de comandos</span>',
          '  <span class="text-dim">  — Preferencias</span>',
          '  <span class="text-dim">  — Versión</span>',
          '',
          '  <span class="cmd">config accept</span>   Aceptar almacenamiento persistente',
          '  <span class="cmd">config reject</span>   Rechazar (datos volátiles, se pierden al cerrar)',
          '  <span class="cmd">config status</span>   Detalle técnico del almacenamiento',
          '  <span class="cmd">config show</span>     Mostrar datos almacenados',
          ''
        ].join('\n');
      }

      const sub = args[0].toLowerCase();

      if (sub === 'accept') {
        Storage.accept();
        Storage.save(state);
        return '<span class="text-green">Almacenamiento persistente aceptado.</span>\nTus datos se guardarán entre sesiones.';
      }

      if (sub === 'reject') {
        Storage.reject();
        return '<span class="text-yellow">Almacenamiento persistente rechazado.</span>\nLos datos se perderán al cerrar la pestaña.\nUsa <span class="cmd">config accept</span> para revertir.';
      }

      if (sub === 'status') {
        const s = Storage.getStatus();
        const acceptedLabel = s.accepted === true ? '<span class="text-green">aceptado</span>' : s.accepted === false ? '<span class="text-red">rechazado</span>' : '<span class="text-yellow">sin decidir</span>';
        const uptimeStr = s.firstVisit ? formatUptime(Math.floor((Date.now() - s.firstVisit) / 1000)) : 'N/A';
        const versionStr = s.versionStored ? 'v' + s.versionStored : 'N/A';
        const info = Storage.getStorageInfo();
        const sizeStr = formatStorageSize(info.totalBytes);
        return [
          `  <span class="nf-label">Modo:</span>        ${acceptedLabel}`,
          `  <span class="nf-label">Almacén:</span>     ${s.storeName}`,
          `  <span class="nf-label">Versión:</span>     ${versionStr} (código: v${VERSION})`,
          `  <span class="nf-label">Uptime:</span>      ${uptimeStr}`,
          `  <span class="nf-label">Datos:</span>       ${sizeStr} en ${info.keysCount} llaves`,
          ''
        ].join('\n');
      }

      if (sub === 'show') {
        const info = Storage.getStorageInfo();
        const store = Storage.isAccepted() ? localStorage : sessionStorage;
        const keys = info.keys;
        const lines = [];

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const rawVal = store.getItem(key);
          if (key === 'rs_state' && rawVal) {
            try {
              const parsed = JSON.parse(rawVal);
              const displayParsed = { ...parsed, history: ['…'] };
              const formatted = JSON.stringify(displayParsed, null, 2);
              const escaped = escapeHtml(formatted);
              const indented = escaped.split('\n').map(function (line, idx) {
                return idx === 0 ? '  <span class="text-cyan">' + key + '</span> = ' + line : '              ' + line;
              }).join('\n');
              lines.push(indented);
            } catch (e) {
              lines.push('  <span class="text-cyan">' + escapeHtml(key) + '</span> = ' + escapeHtml(rawVal));
            }
          } else {
            lines.push('  <span class="text-cyan">' + escapeHtml(key) + '</span> = ' + escapeHtml(rawVal || 'null'));
          }
        }

        lines.push('');
        lines.push('  <span class="text-dim">' + info.keysCount + ' llaves, ' + formatStorageSize(info.totalBytes) + ' en ' + (Storage.isAccepted() ? 'localStorage' : 'sessionStorage') + '</span>');
        lines.push('');
        return lines.join('\n');
      }

      return `<span class="text-red">config: subcomando desconocido '${escapeHtml(sub)}'</span>\nUsa <span class="cmd">config</span> para ver las opciones disponibles.`;
    },

    reboot() {
      cmdInput.disabled = true;
      cmdInput.blur();
      terminal.classList.add('terminal-rebooting');
      appendOutput('<span class="text-yellow">Reiniciando terminal...</span>');
      setTimeout(function () {
        Storage.reset();
        location.reload();
      }, 2500);
      return undefined;
    }
  };

  // ─── AirvZxf subcommands ────────────────────────────────

  const airvzxfSubcommands = {
    about() {
      const u = USERS.airvzxf;
      return [
        `<span class="text-green text-bold">${escapeHtml(u.name)}</span>  <span class="text-dim">— ${escapeHtml(u.role)} de RoviSoft.net</span>`,
        '',
        escapeHtml(u.bio),
        '',
        `<span class="text-dim">Ubicación:</span> ${escapeHtml(u.location)}`,
        `<span class="text-dim">Rol:</span>       Senior Software Engineer & Software Architect`,
        `<span class="text-dim">Tech:</span>      ${escapeHtml(u.tech.join(', '))}`,
        ''
      ].join('\n');
    },

    contact() {
      const u = USERS.airvzxf;
      return [
        `<span class="text-dim">Email:</span>     ${escapeHtml(u.email)}`,
        ''
      ].join('\n');
    },

    projects() {
      const u = USERS.airvzxf;
      const projectLines = [];
      u.projects.forEach((p) => {
        projectLines.push(`<span class="text-cyan text-bold">${escapeHtml(p.name)}</span> — ${escapeHtml(p.desc)}`);
        projectLines.push(`<span class="text-dim">${link(p.url)}</span>`);
        projectLines.push('');
      });
      return projectLines.join('\n');
    },

    social() {
      const u = USERS.airvzxf;
      return [
        `<span class="text-dim">GitHub:</span>    ${link(u.github)}`,
        `<span class="text-dim">YouTube:</span>   ${link(u.youtube)}`,
        `<span class="text-dim">X:</span>         ${link(u.x)}`,
        `<span class="text-dim">LinkedIn:</span>  ${link(u.linkedin)}`,
        ''
      ].join('\n');
    }
  };

  // ─── History Expansion ──────────────────────────────────────

  function expandHistory(input) {
    if (input === '!!') {
      if (state.history.length === 0) return { error: '!!: event not found' };
      return { cmd: state.history[state.history.length - 1] };
    }
    const m = input.match(/^!(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n < 1 || n > state.history.length) return { error: `!${n}: event not found` };
      return { cmd: state.history[n - 1] };
    }
    return null;
  }

  // ─── Execute Command ──────────────────────────────────────

  function runSingle(cmdStr) {
    let trimmed = cmdStr.trim();
    let isExpansion = false;

    if (!trimmed) {
      appendOutput('');
      return;
    }

    const expansion = expandHistory(trimmed);
    if (expansion) {
      appendCommandLine(trimmed);
      if (expansion.error) {
        appendOutput(`<span class="text-red">${escapeHtml(expansion.error)}</span>`);
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
      const expanded = state.aliases[cmdName] + (args.length ? ' ' + args.join(' ') : '');
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
      appendOutput(`<span class="text-red">comando no encontrado: ${escapeHtml(cmdName)}</span>`);
    }
  }

  function execute(cmdStr) {
    const trimmed = cmdStr.trim();

    if (!trimmed) {
      appendOutput('');
      return;
    }

    if (state.history.length === 0 || state.history[state.history.length - 1] !== trimmed) {
      state.history.push(trimmed);
      if (state.history.length > MAX_HISTORY) {
        state.history = state.history.slice(-MAX_HISTORY);
      }
    }
    state.historyIndex = state.history.length;

    const segments = trimmed.split(';').map(s => s.trim()).filter(s => s);
    for (const seg of segments) {
      runSingle(seg);
    }

    Storage.save(state);
  }

  // ─── Event: Click anywhere in terminal focuses input ─────

  terminal.addEventListener('click', function (e) {
    if (window.getSelection().toString()) return;
    cmdInput.focus();
  });

  promptArea.addEventListener('mousedown', function (e) {
    e.preventDefault();
    cmdInput.focus();
  });

  // ─── Event: Blur / Focus — hide/show cursor ──────────────

  cmdInput.addEventListener('blur', hideCursor);
  cmdInput.addEventListener('focus', showCursor);

  // ─── Event: Input & Cursor Position ──────────────────────

  cmdInput.addEventListener('input', updateCursorPos);

  cmdInput.addEventListener('keyup', function (e) {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      updateCursorPos();
    }
  });

  cmdInput.addEventListener('click', updateCursorPos);

  // ─── Event: Keydown ───────────────────────────────────────

  cmdInput.addEventListener('keydown', function (e) {
    const key = e.key;

    if (key === 'Enter') {
      e.preventDefault();
      execute(cmdInput.value);
      clearInput();
      return;
    }

    if (key === 'ArrowUp') {
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

    if (key === 'ArrowDown') {
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

    if (key === 'Tab') {
      e.preventDefault();
      const val = cmdInput.value.trim().split(/\s+/);
      if (val.length === 1 && val[0] !== '') {
        const prefix = val[0].toLowerCase();
        const available = Object.keys(commands).concat(Object.keys(state.aliases));
        const matches = available.filter(c => c.startsWith(prefix));
        if (matches.length === 1) {
          cmdInput.value = matches[0] + ' ';
          updateCursorPos();
          cmdInput.setSelectionRange(cmdInput.value.length, cmdInput.value.length);
        } else if (matches.length > 1) {
          appendCommandLine(prefix);
          appendOutput(matches.join('  '));
        }
      }
      return;
    }

    if (key === 'l' && e.ctrlKey) {
      e.preventDefault();
      commands.clear();
      return;
    }
  });

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
    if (savedState.aliases && typeof savedState.aliases === 'object') {
      state.aliases = savedState.aliases;
    }
  }

  const previousVersion = Storage.loadVersion();
  Storage.saveVersion(VERSION);
  if (previousVersion && previousVersion !== VERSION) {
    appendOutput('<span class="text-green">v' + previousVersion + ' → v' + VERSION + ' instalada.</span>');
  }

  if (!Storage.loadFirstVisit()) {
    Storage.saveFirstVisit(Date.now());
  }

  updatePrompt();
  updateCursorPos();
  scrollToBottom();

  window.addEventListener('resize', function () {
    const atBottom = outputArea.scrollHeight - outputArea.scrollTop - outputArea.clientHeight < 50;
    if (atBottom) scrollToBottom();
  });

})();