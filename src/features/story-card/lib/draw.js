export const W = 1080;
export const H = 1920;
// Inter has no Hangul, so Korean falls through to Pretendard (the site's own font).
export const SANS = 'Inter, Pretendard, sans-serif';

// CSS `line-height: normal` for this font, as a multiple of the font size — needed to
// reproduce the design's flex-column heights, which are built from line boxes.
export const LH_SANS = 1.21;

// `tracking` is the design's letter-spacing in em. Canvas letterSpacing isn't in every
// browser yet; where it's missing the text just sets slightly looser.
export function setFont(ctx, { weight, size, family = SANS, tracking = 0, color }) {
  ctx.font = `${weight} ${size}px ${family}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking * size}px`;
  ctx.fillStyle = color;
}

export function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let line = text;
  while (line && ctx.measureText(`${line}…`).width > maxWidth) line = line.slice(0, -1);
  return `${line.trimEnd()}…`;
}

// Breaks at the last space that fits (Latin titles shouldn't split mid-word) and falls
// back to a character break for a single word or Korean run too long for the line.
export function wrapLines(ctx, text, maxWidth, maxLines) {
  const lines = [];
  let rest = text.trim();
  while (rest) {
    if (lines.length === maxLines - 1 || ctx.measureText(rest).width <= maxWidth) {
      lines.push(ellipsize(ctx, rest, maxWidth));
      break;
    }
    let cut = 1;
    while (cut < rest.length && ctx.measureText(rest.slice(0, cut + 1)).width <= maxWidth) cut++;
    const space = rest.lastIndexOf(' ', cut);
    if (space > 0) cut = space;
    lines.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  return lines;
}

// Draws one line vertically centred on `cy`, the middle of its CSS line box. The glass
// theme's white glow (CSS text-shadow) is applied here so every piece of text gets it.
export function fillLine(ctx, text, x, cy, theme, align = 'left') {
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;
  if (theme.glow) {
    ctx.shadowColor = 'rgba(255,255,255,0.95)';
    ctx.shadowBlur = 18;
  }
  ctx.fillText(text, x, cy);
  ctx.restore();
}

// The SHARIN mark and wordmark, centred in the 120px bottom margin every layout leaves
// free.
export const BRAND_NAME = 'SHARIN';
export function drawBrand(ctx, logo, theme) {
  const size = 40;
  const gap = 12;
  const cy = H - 60;
  setFont(ctx, { weight: 700, size: 28, color: theme.text });
  const markW = logo ? size + gap : 0;
  const x = (W - markW - ctx.measureText(BRAND_NAME).width) / 2;
  if (logo) ctx.drawImage(logo, x, cy - size / 2, size, size);
  fillLine(ctx, BRAND_NAME, x + markW, cy, theme);
}

const NOTE_ICON = new Path2D('M9 18V5l12-2v13');

function drawNoteIcon(ctx, cx, cy, size) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = '#9A9AA6';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(NOTE_ICON);
  ctx.beginPath();
  ctx.arc(6, 18, 3, 0, Math.PI * 2);
  ctx.moveTo(21, 16);
  ctx.arc(18, 16, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// A square cover; an empty slot (or artwork that failed to load) shows the design's
// placeholder tile with a note icon instead.
export function drawCover(ctx, img, x, y, size, radius, theme, shadow) {
  if (shadow) {
    ctx.save();
    ctx.shadowColor = `rgba(17,17,20,${shadow.alpha})`;
    ctx.shadowOffsetY = shadow.y;
    ctx.shadowBlur = shadow.blur;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fillStyle = theme.placeholder;
    ctx.fill();
    ctx.restore();
  }
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, radius);
  ctx.clip();
  ctx.fillStyle = theme.placeholder;
  ctx.fillRect(x, y, size, size);
  if (img) ctx.drawImage(img, x, y, size, size);
  else drawNoteIcon(ctx, x + size / 2, y + size / 2, Math.round(size * 0.24));
  ctx.restore();
}
