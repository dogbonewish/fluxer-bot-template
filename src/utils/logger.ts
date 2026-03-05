// this is the console output! it has nice visuals etc etc :)

// these are ansi color codes for the console output, you can find more at https://gist.github.com/JBlond/2fea43a3049b38287e5e9cefc87b2124
export const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bRed: '\x1b[91m',
  bGreen: '\x1b[92m',
  bYellow: '\x1b[93m',
  bBlue: '\x1b[94m',
  bMagenta: '\x1b[95m',
  bCyan: '\x1b[96m',
  bWhite: '\x1b[97m',
};

// draws the boxes
export const chars = {
  tl: '┌',
  tr: '┐',
  bl: '└',
  br: '┘',
  h: '─',
  v: '│',
  dtl: '╔',
  dtr: '╗',
  dbl: '╚',
  dbr: '╝',
  dh: '═',
  dv: '║',
};

export const sym = {
  check: `${c.bGreen}✓${c.reset}`,
  cross: `${c.bRed}✗${c.reset}`,
  warn: `${c.bYellow}!${c.reset}`,
  info: `${c.bCyan}i${c.reset}`,
  arrow: `${c.bBlue}→${c.reset}`,
};

// helpers
function timestamp(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${c.gray}${hh}:${mm}:${ss}${c.reset}`;
}

function pad(str: string, len: number): string {
  const stripped = str.replace(/\x1b\[[0-9;]*m/g, '');
  return str + ' '.repeat(Math.max(0, len - stripped.length));
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function hLine(width: number, char = chars.h): string {
  return char.repeat(width);
}

// the different log leveles with their labels and colors
const LEVELS: Record<string, { label: string; color: string }> = {
  debug: { label: 'DBG', color: c.gray },
  info: { label: 'INF', color: c.bCyan },
  ok: { label: ' OK', color: c.bGreen },
  warn: { label: 'WRN', color: c.bYellow },
  error: { label: 'ERR', color: c.bRed },
  fatal: { label: 'FTL', color: `${c.bold}${c.bRed}` },
};

function log(level: string, tag: string, ...msgs: unknown[]): void {
  const lv = LEVELS[level] || LEVELS.info;
  const tagStr = tag ? `${c.blue}[${tag}]${c.reset} ` : '';
  const prefix = `${timestamp()} ${lv.color}${lv.label}${c.reset} ${tagStr}`;
  console.log(prefix + msgs.join(' '));
}

// public api

interface TableRow {
  label: string;
  value: string;
}

const logger = {
  debug: (tag: string, ...msgs: unknown[]) => log('debug', tag, ...msgs),
  info: (tag: string, ...msgs: unknown[]) => log('info', tag, ...msgs),
  ok: (tag: string, ...msgs: unknown[]) => log('ok', tag, ...msgs),
  warn: (tag: string, ...msgs: unknown[]) => log('warn', tag, ...msgs),
  error: (tag: string, ...msgs: unknown[]) => log('error', tag, ...msgs),
  fatal: (tag: string, ...msgs: unknown[]) => log('fatal', tag, ...msgs),

  banner(lines: string[]) {
    const maxLen = Math.max(...lines.map((l) => stripAnsi(l).length));
    const w = maxLen + 4;
    console.log('');
    console.log(`  ${c.bCyan}${chars.dtl}${hLine(w, chars.dh)}${chars.dtr}${c.reset}`);
    for (const line of lines) {
      console.log(
        `  ${c.bCyan}${chars.dv}${c.reset}  ${pad(line, maxLen)}  ${c.bCyan}${chars.dv}${c.reset}`
      );
    }
    console.log(`  ${c.bCyan}${chars.dbl}${hLine(w, chars.dh)}${chars.dbr}${c.reset}`);
    console.log('');
  },

  box(title: string, rows: (string | TableRow)[]) {
    const allLines = rows.map((r) => {
      if (typeof r === 'string') return r;
      return `${pad(r.label, 20)} ${c.bWhite}${r.value}${c.reset}`;
    });
    const maxLen = Math.max(
      stripAnsi(title).length + 2,
      ...allLines.map((l) => stripAnsi(l).length)
    );
    const w = maxLen + 4;

    console.log(
      `  ${c.cyan}${chars.tl}${hLine(2, chars.h)} ${c.bold}${c.bCyan}${title} ${c.reset}${c.cyan}${hLine(Math.max(0, w - stripAnsi(title).length - 4), chars.h)}${chars.tr}${c.reset}`
    );
    for (const line of allLines) {
      console.log(
        `  ${c.cyan}${chars.v}${c.reset}  ${pad(line, maxLen)}  ${c.cyan}${chars.v}${c.reset}`
      );
    }
    console.log(`  ${c.cyan}${chars.bl}${hLine(w, chars.h)}${chars.br}${c.reset}`);
  },

  step(label: string, ms: number | null, ok = true) {
    const icon = ok ? sym.check : sym.cross;
    const timeStr = ms != null ? `${c.gray}${String(ms).padStart(6)}ms${c.reset}` : '';
    console.log(`  ${icon}  ${pad(label, 30)} ${timeStr}`);
  },

  divider(label?: string) {
    if (label) {
      console.log(
        `\n  ${c.gray}${hLine(2, chars.h)}${c.reset} ${c.bold}${label}${c.reset} ${c.gray}${hLine(Math.max(0, 38 - label.length), chars.h)}${c.reset}`
      );
    } else {
      console.log(`  ${c.gray}${hLine(40, chars.h)}${c.reset}`);
    }
  },

  c,
  sym,
  chars,
};

export default logger;
