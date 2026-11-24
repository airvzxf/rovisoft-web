/* =====================================================
   RoviSoft.net — i18n: English
   GNU AGPL v3 — https://github.com/airvzxf/rovisoft-web
   ===================================================== */

(function () {
  "use strict";

  var translations = {
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
    "help.theme": "Manage color and typography themes",
    "help.lang": "Change interface language",
    "help.config": "Manage local storage",
    "help.reboot": "Reboot the terminal",
    "help.reset": "Factory reset (clears all data)",
    "help.version": "Show version",
    "help.license": "Show license",
    "help.history": "Command history",
    "help.man": "Display manual pages",
    "help.shortcuts":
      "Shortcuts: \u2191/\u2193 (history) | Tab (autocomplete) | Ctrl+L (clear) | !N / !! (history) | ; (multicommand)",
    "help.urlParams":
      'URL parameters: <span class="cmd">?cmd=clear;su%20airvzxf</span> (or repeated &cmd=)',

    "users.rootDesc": "Superuser",
    "users.airvzxfDesc": "Administrator / Owner",
    "users.guestDesc": "Guest (default session)",

    "su.usage": "Usage: su &lt;user&gt;",
    "su.authSuccess": "Authentication successful.",
    "su.authFailed": "su: Authentication failure.",
    "su.password": "Password:",
    "su.welcomeUser": "Welcome, {0}",
    "su.guestRestored": "Guest session restored.",
    "su.unknownUser": "su: user '{0}' does not exist.",
    "su.rootHint":
      'Hint: the root password is not public. Try <span class="cmd">su airvzxf</span>.',

    urlBlocked: "{0}: not run from a link for safety. Type it in the terminal.",

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
    "lang.loading": "Loading {0}...",
    "lang.alreadyLoading": "{0} is already loading...",
    "lang.loadError": "Error: could not load language '{0}'.",
    "lang.hint":
      'Use <span class="cmd">lang list</span> to see available languages.',

    "theme.title": "Color and typography themes",
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
      "theme create: at least one color or typography variable is required.",
    "theme.createUseExport":
      'Use <span class="cmd">theme export</span> to see available variables.',
    "theme.created": "Theme '{0}' created (base: {1}, {2} variable{3}).",
    "theme.useTheme": 'Use <span class="cmd">theme {0}</span> to activate it.',
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
    "theme.deleteBuiltIn": "theme delete: cannot delete built-in theme '{0}'.",
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
    "alias.noOverride": "Cannot create an alias with an existing command name.",
    "alias.notDefined": "alias: {0}: not defined.",
    "alias.nameEmpty": "alias: empty name.",
    "alias.valueEmpty": "alias: empty value.",
    "alias.nameInvalid":
      "alias: invalid name '{0}'. Use letters, digits, '.', '_' or '-' (max 32).",
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
    "config.inWord": "in",

    "reset.msg": "Restoring factory defaults...",
    "reboot.msg": "Rebooting terminal...",

    "about.bio":
      "Senior Software Engineer with over {0} years of experience. Systems programmer and low-level architect. Seeking technical perfection, extreme optimization, and deep understanding of the machine \u2014 from hardware and assembly to high level. In artificial intelligence I have walked the whole path: from Machine Learning and Deep Learning fundamentals to RAG, experiments with local models, and comparing AI labs and models.",
    "about.roleAdmin": "Administrator / Owner",
    "about.roleTitle":
      "Senior Software Engineer \u00b7 Software Architect \u00b7 Applied AI Engineer",

    "projects.c2flowch.desc":
      "Rust library and CLI that turns C source code into flowcharts (ANSI / ISO 5807) by analyzing the AST",
    "projects.telora.desc":
      "Speech-to-Text Assistant for Linux: Rust daemon with Whisper (CUDA) and GTK4 client",
    "projects.bose_connect_linux.desc":
      "Bose\u00ae Connect App for Linux: reverse-engineered Bluetooth protocols",
    "projects.ftp_deployment_action.desc":
      "GitHub Action for FTP deployment: copies repo files to a server path",
    "projects.cache_anything_new_action.desc":
      "GitHub Action that caches everything an install step creates or changes (apt, SDKs, toolchains) and restores it on the next run",
    "projects.assembly_from_the_ground_up.desc":
      "x86 32-bit edition of \u201cProgramming from the Ground Up\u201d, updated for Linux (GNU Assembler, i386), with tested solutions to every exercise",
    "projects.fibonacci_benchmark.desc":
      "Fibonacci algorithm in assembly that outperformed the C-compiled version",
    "projects.aur_packages.desc":
      "Maintenance of duc and duc-git packages in the Arch User Repository",

    "env.containers": "Containers:",

    "skills.header.languages": "LANGUAGES:",
    "skills.lang.rust": "Systems programming, critical performance",
    "skills.lang.bash": "Automation, systems scripting",
    "skills.lang.python": "Rapid prototyping, ML/DL, tooling",
    "skills.lang.javascript": "Web frontend, Node.js",
    "skills.lang.assembly": "x86/x64, low-level optimization",
    "skills.lang.c": "Reverse engineering, embedded systems",
    "skills.header.env": "ENVIRONMENT & TOOLS:",
    "skills.header.ai": "ARTIFICIAL INTELLIGENCE:",
    "skills.ai.foundationsLabel": "Foundations:",
    "skills.ai.foundations":
      "Machine Learning and Deep Learning with Python (TensorFlow, Keras)",
    "skills.ai.localLabel": "Local models:",
    "skills.ai.rag": "Embeddings, vector search, retrieval over documentation",
    "skills.ai.agentsLabel": "Agents:",
    "skills.ai.evalLabel": "Evaluation:",
    "skills.ai.eval": "Comparing AI labs and models on real engineering tasks",
    "skills.header.domains": "DOMAINS:",
    "skills.domains": [
      "Systems architecture",
      "Low-level optimization",
      "Applied AI: RAG, agents and model evaluation",
      "AI orchestration under architectural direction",
      "Reverse engineering",
      "Speech-to-Text (Whisper/CUDA)",
      "AUR packaging",
      "CI/CD (GitHub Actions)",
    ],

    "research.logs": [
      "[2024-01-15 09:23:11] Course \u201cMachine Learning and Data Science with Python\u201d completed (Udemy)",
      "[2024-03-02 14:55:42] Course \u201cArtificial Intelligence and Deep Learning with Python, TensorFlow and Keras\u201d completed (Udemy)",
      "[2024-07-02 11:30:00] Local inference infrastructure deployed with Ollama",
      "[2024-07-02 11:30:05] Models loaded: Gemma 2, DeepSeek-Coder-V2, Qwen2",
      "[2024-08-22 16:45:33] Agentic AI orchestration pipeline: phase 1",
      "[2024-11-05 08:12:00] Code analysis automation with local LLMs",
      "[2024-12-02 10:15:00] MCP (Model Context Protocol) research started",
      "[2025-02-17 16:40:00] RAG: embeddings and vector search over technical documentation",
      "[2025-03-15 10:00:00] DeepSeek-V3 and DeepSeek-R1 evaluation for low-level tasks",
      "[2025-07-14 13:00:00] OpenCode: AI-driven development environment",
      "[2025-09-08 09:00:00] Comparison of AI labs and models on software engineering tasks",
      "[2025-11-10 14:30:00] Deep Learning experiments: backpropagation, CNNs and RNNs from scratch",
      "[2026-02-09 18:10:00] Telora: Rust daemon + Whisper (CUDA) for Speech-to-Text on Linux",
      "[2026-05-05 03:42:00] Candle: minimalist ML framework in Rust",
    ],

    "man.header.name": "NAME",
    "man.nameText":
      "airvzxf - Senior Software Engineer, Systems Architect, Applied AI Engineer, Toolsmith",
    "man.header.synopsis": "SYNOPSIS",
    "man.synopsisText":
      "Systems architecture, low-level optimization, applied AI and AI orchestration.",
    "man.header.description": "DESCRIPTION",
    "man.desc.p1":
      "  airvzxf is a systems programmer and software architect with over {0}\n  years of experience. He operates at the intersection of hardware\n  and high-level systems, with an obsessive focus on architectural\n  purity and extreme optimization.",
    "man.desc.p2":
      "  He despises inefficient code, MVP-driven shortcuts, and technical\n  debt. His approach is rooted in deep understanding of the machine\n  from assembly up through high-level abstractions.",
    "man.desc.p3":
      "  He currently orchestrates AI systems as development\n  tools under strict architectural direction \u2014 not as end-user\n  applications, but as instruments of engineering. He has walked AI\n  from ML and Deep Learning fundamentals to RAG, experiments with\n  local models, and comparing AI labs and models.",
    "man.desc.p4":
      "  Diagnosed with mild functional Asperger's, which provides hyperfocus,\n  deep system analysis, and zero tolerance for dirty code.",
    "man.header.environment": "ENVIRONMENT",
    "man.header.languages": "LANGUAGES",
    "man.langList": "Rust, Bash, Python, JavaScript, Assembly, C",
    "man.header.seeAlso": "SEE ALSO",
    "man.header.options": "OPTIONS",
    "man.header.subcommands": "SUBCOMMANDS",
    "man.header.historyExpansion": "HISTORY EXPANSION",
    "man.available": "Available manual pages:",
    "man.notFound": "No manual entry for '{0}'.",
    "man.hint": 'Use <span class="cmd">man</span> to see available pages.',

    "man.help.name": "help - Show available commands",
    "man.help.synopsis": "help",
    "man.help.description":
      "Displays a list of all available commands in the terminal, along with a brief description of each one. Also shows keyboard shortcuts and URL parameters.",
    "man.help.seeAlso": "man(1)",

    "man.clear.name": "clear - Clear the terminal screen",
    "man.clear.synopsis": "clear",
    "man.clear.description":
      "Clears all visible output from the terminal screen, providing a clean workspace. Command history is preserved. Can also be triggered with Ctrl+L.",
    "man.clear.seeAlso": "reboot(1), reset(1)",

    "man.whoami.name": "whoami - Show current user",
    "man.whoami.synopsis": "whoami",
    "man.whoami.description":
      "Displays the name of the current user session. Available users are: guest (default), airvzxf (administrator), and root (superuser).",
    "man.whoami.seeAlso": "users(1), su(1), man(1)",

    "man.users.name": "users - List system users",
    "man.users.synopsis": "users",
    "man.users.description":
      "Displays a list of all available users in the system along with their roles and descriptions.",
    "man.users.seeAlso": "whoami(1), su(1)",

    "man.su.name": "su - Switch user",
    "man.su.synopsis": "su <user>",
    "man.su.description":
      "Switches the current user session to the specified user. Available users are: guest (no password), airvzxf (no password), and root (requires a password that is not public). Use su without arguments to see the usage.",
    "man.su.seeAlso": "whoami(1), users(1)",

    "man.airvzxf.name": "airvzxf - Owner information",
    "man.airvzxf.synopsis": "airvzxf <subcommand>",
    "man.airvzxf.description":
      "Displays information about the owner and administrator of RoviSoft.net. Accessible only by airvzxf and root users. Available subcommands are: about, contact, social, projects, skills, and research.",
    "man.airvzxf.seeAlso": "whoami(1), neofetch(1)",

    "man.neofetch.name": "neofetch - System information",
    "man.neofetch.synopsis": "neofetch",
    "man.neofetch.description":
      "Displays system information in a neofetch-style format, including: OS, host, kernel, shell, user, theme, uptime, config status, and storage.",
    "man.neofetch.seeAlso": "version(1), config(1)",

    "man.date.name": "date - Current date and time",
    "man.date.synopsis": "date",
    "man.date.description":
      "Displays the current date and time according to the browser clock.",
    "man.date.seeAlso": "neofetch(1)",

    "man.echo.name": "echo - Display text",
    "man.echo.synopsis": "echo <text>",
    "man.echo.description":
      "Outputs the provided text to the terminal. If no text is provided, outputs an empty line.",
    "man.echo.seeAlso": "alias(1)",

    "man.alias.name": "alias - Define command shortcuts",
    "man.alias.synopsis": "alias | alias <name> | alias <name>='command'",
    "man.alias.description":
      "Manages command aliases. Without arguments, shows defined aliases and usage. Aliases cannot override existing commands and are preserved between sessions if persistent storage is enabled.",
    "man.alias.opt.show": "Show defined aliases",
    "man.alias.opt.showValue": "Show value of a specific alias",
    "man.alias.opt.define": "Define a new alias with the specified value",
    "man.alias.seeAlso": "unalias(1), config(1)",

    "man.unalias.name": "unalias - Remove an alias",
    "man.unalias.synopsis": "unalias <name>",
    "man.unalias.description":
      "Removes the specified alias from the defined aliases list.",
    "man.unalias.seeAlso": "alias(1)",

    "man.theme.name": "theme - Manage color and typography themes",
    "man.theme.synopsis":
      "theme | theme <name> | theme list | theme create | theme edit | theme delete | theme export",
    "man.theme.description":
      "Manages the terminal's color and typography themes. Built-in themes are 'dark' and 'light'. Custom themes can be created with specific color and typography variables. Custom themes are preserved between sessions if persistent storage is enabled.",
    "man.theme.sub.list": "List available themes",
    "man.theme.sub.set": "Switch to specified theme",
    "man.theme.sub.create": "Create a custom theme",
    "man.theme.sub.edit": "Edit a custom theme",
    "man.theme.sub.delete": "Delete a custom theme",
    "man.theme.sub.export": "Export theme variables",
    "man.theme.seeAlso": "config(1), neofetch(1)",

    "man.lang.name": "lang - Change interface language",
    "man.lang.synopsis": "lang | lang <code> | lang list",
    "man.lang.description":
      "Changes or displays the terminal's interface language. Available languages are listed with 'lang list'. The change is persisted between sessions if persistent storage is enabled.",
    "man.lang.seeAlso": "config(1)",

    "man.config.name": "config - Manage local storage",
    "man.config.synopsis":
      "config | config accept | config reject | config status | config show",
    "man.config.description":
      "Manages local storage preferences. Controls whether data persists between sessions (localStorage) or is volatile (sessionStorage). Accepts three states: accepted, rejected, or undecided.",
    "man.config.sub.accept": "Accept persistent storage",
    "man.config.sub.reject": "Reject (volatile data, lost on close)",
    "man.config.sub.status": "Show technical storage details",
    "man.config.sub.show": "Show stored data",
    "man.config.seeAlso": "theme(1), reboot(1)",

    "man.reboot.name": "reboot - Reboot the terminal",
    "man.reboot.synopsis": "reboot",
    "man.reboot.description":
      "Restarts the terminal, reloading the page and reinitializing the session. Data is preserved if persistent storage is enabled.",
    "man.reboot.seeAlso": "reset(1), clear(1)",

    "man.reset.name": "reset - Factory reset",
    "man.reset.synopsis": "reset",
    "man.reset.description":
      "Restores the terminal to factory defaults, clearing all stored data including history, aliases, custom themes, discovered Easter eggs, and preferences. This action is irreversible.",
    "man.reset.seeAlso": "reboot(1), config(1)",

    "man.version.name": "version - Show version",
    "man.version.synopsis": "version",
    "man.version.description":
      "Displays the current terminal version, build information, and source code links.",
    "man.version.seeAlso": "neofetch(1), license(1)",

    "man.license.name": "license - Show license",
    "man.license.synopsis": "license",
    "man.license.description":
      "Displays the GNU Affero General Public License v3 (AGPL v3) information, along with links to the source code and full license text.",
    "man.license.seeAlso": "version(1)",

    "man.history.name": "history - Command history",
    "man.history.synopsis": "history",
    "man.history.description":
      "Displays the list of previously executed commands with their index numbers.",
    "man.history.expansionText":
      "A command can be re-executed using its number: !N executes command number N, and !! executes the last command.",
    "man.history.seeAlso": "alias(1)",

    "man.man.name": "man - Display manual pages",
    "man.man.synopsis": "man <command>",
    "man.man.description":
      "Displays the manual page for the specified command. Manual pages contain detailed information about each command, including synopsis, descriptions, options, and related commands. Without arguments, lists all commands with available manual pages.",
    "man.man.seeAlso": "help(1)",

    "man.eggs.name": "eggs - Easter egg progress",
    "man.eggs.synopsis": "eggs",
    "man.eggs.description":
      "Shows how many Easter eggs you have discovered in total and per level (Rookie, Hacker, Legend). Undiscovered secrets appear as ???. Some are typed as commands, others with the keyboard. Eggs run from a link (?cmd=) do not count. Progress is kept between sessions if persistent storage is enabled.",
    "man.eggs.seeAlso": "help(1), config(1), reset(1)",

    "help.eggs": "Discovered Easter egg progress",
    "eggs.title": "Easter eggs discovered: {0}/{1}",
    "eggs.level1": "Level 1 \u00b7 Rookie:",
    "eggs.level2": "Level 2 \u00b7 Hacker:",
    "eggs.level3": "Level 3 \u00b7 Legend:",
    "eggs.found": "[+] Easter egg discovered! ({0}/{1})",
    "eggs.hint": 'Type <span class="cmd">eggs</span> to see your progress.',
    "eggs.keepLooking":
      "Keep exploring: some secrets are typed, others are keyed in.",
    "eggs.allFound": "You found them all! You are a terminal legend.",

    eventNotFound: "{0}: event not found",
    historyExpansion: "\u2192 {0}",

    "easter.sudo": "Permission denied. I know what you're thinking... but no.",
    "easter.exit": "There is no escape; The matrix has you.",
    "easter.42": "The answer to life, the universe, and everything.",
    "easter.cowsay.on": "Cowsay mode activated. The cows are watching.",
    "easter.cowsay.off": "Cowsay mode deactivated. The cows have left.",
    "easter.cowsay.quips": [
      "Moo.",
      "I'm awake. What are you doing?",
      "The code compiles. Enjoy it while it lasts.",
      "sudo won't work here either.",
      "I was debugging and found this cow.",
      "I've seen your browser history. Impressive.",
      "Have you tried 42?",
      "The matrix has you.",
      "This is not the Easter egg you're looking for.",
      "On my server they feed me well.",
      "0xC0FFEE — my favorite memory address.",
      "The bug was between the chair and the keyboard.",
      "A developer, a cow, a terminal. What could go wrong?",
      "I've seen things you wouldn't believe... like CSS that centers itself.",
      "The answer is always 42.",
    ],
    "easter.rmrf.header": "Removing files...",
    "easter.rmrf.punchline": "Just kidding, your data is safe... or is it?",
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
    "easter.konami.on": "HACKER MODE ACTIVATED",
    "easter.konami.off": "HACKER MODE DEACTIVATED",
    "easter.konami.hint": "Some secrets require more than typing.",

    "easter.matrix.active": "A Matrix animation is already running.",
    "easter.matrix.exitMsg": "Waking up from the Matrix...",
  };

  if (typeof window._registerI18N === "function") {
    window._registerI18N("en", translations);
  }
})();
