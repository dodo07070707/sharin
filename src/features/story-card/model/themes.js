import { W, H } from '../lib/draw';

// Each glow is one of the design's radial-gradient layers: [cx, cy, rx, ry, rgb, alpha],
// positioned in the design's blob box that sits 120px above the top edge.
const SUNSET_GLOWS = [
  [560, 120, 560, 480, '255,138,50', 0.95],
  [1020, 260, 520, 520, '255,224,74', 0.95],
  [1200, 640, 480, 600, '98,222,166', 0.9],
];

const VIOLET_GLOWS = [
  [1140, 140, 520, 460, '86,12,222', 0.95],
  [760, 160, 560, 480, '150,80,246', 0.9],
  [1120, 640, 520, 560, '196,160,250', 0.9],
  [520, 300, 420, 380, '200,180,252', 0.75],
  [860, 560, 380, 420, '160,226,250', 0.6],
];

// The custom theme keeps sunset's three glows — positions, sizes, strengths — and takes
// their colors from the story; the defaults are sunset's own.
export const DEFAULT_GLOW_COLORS = ['#ff8a32', '#ffe04a', '#62dea6'];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${n >> 16},${(n >> 8) & 255},${n & 255}`;
}

function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).split(',').map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Builds all three glow colors from one, spaced the way sunset's are: orange (25°), a
// neighbour 25° on (yellow) and an accent ~128° away (mint). The picked color itself is
// kept exactly, so the picker doesn't jump away from what was chosen; the two derived
// ones are held where a glow reads as color on white — not muddy, not washed out. A
// near-grey pick has no real hue to rotate (it would read as 0°, red), so it stays grey.
const GLOW_HUE_OFFSETS = [30, 125];
export function glowColorsFrom(baseHex) {
  const [h, s, l] = hexToHsl(baseHex);
  const sat = s < 10 ? s : Math.min(100, Math.max(55, s));
  const light = Math.min(70, Math.max(50, l));
  return [baseHex, ...GLOW_HUE_OFFSETS.map((offset) => hslToHex((h + offset) % 360, sat, light))];
}

function customGlows(colors) {
  return SUNSET_GLOWS.map(([cx, cy, rx, ry, , alpha], i) => [cx, cy, rx, ry, hexToRgb(colors[i]), alpha]);
}

// The design also blurs these layers (CSS filter: blur), but they're already soft-edged
// radial gradients, so the blur is skipped — Safari's canvas has no `filter` support.
function paintGlows(ctx, glows) {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  // CSS paints the first background layer on top, so draw them back to front.
  for (const [cx, cy, rx, ry, rgb, alpha] of [...glows].reverse()) {
    ctx.save();
    ctx.translate(cx, cy - 120);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(${rgb},${alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  }
}

function paintGlass(ctx, bg) {
  ctx.fillStyle = '#DCE8F2';
  ctx.fillRect(0, 0, W, H);
  if (bg) {
    const scale = Math.max(W / bg.width, H / bg.height);
    const dw = bg.width * scale;
    const dh = bg.height * scale;
    ctx.drawImage(bg, (W - dw) / 2, (H - dh) / 2, dw, dh);
  }
  const wash = ctx.createLinearGradient(0, 0, W, 0);
  wash.addColorStop(0, 'rgba(255,255,255,0.42)');
  wash.addColorStop(0.55, 'rgba(255,255,255,0.22)');
  wash.addColorStop(1, 'rgba(255,255,255,0.08)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
}

// `sub` and `divider` are only set where a theme overrides the layout's own colors.
// `paint(ctx, bg, story)`; only the custom theme reads the story (its glowColors), which
// `customGlows` flags so the page knows to show the color pickers.
export const STORY_THEMES = {
  sunset: {
    label: '선셋',
    text: '#111114',
    accent: '#fa243c',
    placeholder: '#F1F1F4',
    paint: (ctx) => paintGlows(ctx, SUNSET_GLOWS),
  },
  glass: {
    label: '글래스',
    text: '#111114',
    sub: '#33333F',
    accent: '#fa243c',
    placeholder: 'rgba(255,255,255,0.55)',
    divider: 'rgba(17,17,20,0.10)',
    glow: true,
    backgroundImage: '/story/glass.jpg',
    paint: paintGlass,
  },
  violet: {
    label: '바이올렛',
    text: '#111114',
    accent: '#fa243c',
    placeholder: '#F1F1F4',
    paint: (ctx) => paintGlows(ctx, VIOLET_GLOWS),
  },
  custom: {
    label: '커스텀',
    text: '#111114',
    accent: '#fa243c',
    placeholder: '#F1F1F4',
    customGlows: true,
    paint: (ctx, _bg, story) => paintGlows(ctx, customGlows(story.glowColors ?? DEFAULT_GLOW_COLORS)),
  },
};
