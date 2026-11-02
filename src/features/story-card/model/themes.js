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
};
