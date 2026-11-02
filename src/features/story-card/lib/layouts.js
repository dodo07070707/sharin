import { W, H, LH_SANS, setFont, ellipsize, wrapLines, fillLine, drawCover } from './draw';

const X = 72;
const RIGHT = W - 72;
const BOTTOM = 1920 - 120;

// Stacks text lines centred as one block on `cy`, like the design's flex columns
// (justify-content: center). Each item: { lines, style, lh (px), gap (px before it) }.
function drawStack(ctx, items, x, cy, theme) {
  const height = items.reduce((h, it) => h + (it.gap || 0) + it.lines.length * it.lh, 0);
  let y = cy - height / 2;
  for (const it of items) {
    y += it.gap || 0;
    setFont(ctx, it.style);
    for (const line of it.lines) {
      fillLine(ctx, line, x, y + it.lh / 2, theme);
      y += it.lh;
    }
  }
}

function line(ctx, text, style, maxWidth) {
  setFont(ctx, style);
  return text ? [ellipsize(ctx, text, maxWidth)] : [''];
}

// Measures a right-aligned label, draws it, and returns its width so the text
// column beside it knows how much room is left.
function rightLabel(ctx, text, cy, style, theme) {
  setFont(ctx, style);
  fillLine(ctx, text, RIGHT, cy, theme, 'right');
  return text ? ctx.measureText(text).width : 0;
}

// With fewer slots than the design's the content ends well above the bottom margin; the
// whole block — title down to the last row — then moves down until the space above and
// below it is equal. Both ends are where things are visibly drawn (the title's glyph tops,
// the last cover's bottom edge), not their layout boxes. A full layout (whose design
// margins are already close to even) is never pushed up, so it stays exactly where the
// design puts it. Only the layout moves; the background is already painted.
function centerVertically(ctx, contentTop, contentBottom) {
  ctx.translate(0, Math.max(0, (H - contentBottom - contentTop) / 2));
}

// B2 · 카테고리 오른쪽 정렬: hero row plus equal rows, each category label set flush right.
function drawCategory(ctx, { title, handle, slots }, covers, t) {
  const sub = t.sub ?? '#5B5B66';
  const [hero, ...rows] = slots;

  // The design's seven rows fill the list area exactly. More rows shrink — cover, type
  // and spacing together — while fewer keep the design's size instead of swelling into
  // giant covers.
  const heroTop = 393.5;
  const dividerTop = heroTop + 240 + 44;
  const listTop = dividerTop + 2 + 44 - 8;
  const gap = 24;
  const designRowH = (BOTTOM - listTop - gap * 6) / 7;
  const rowH = Math.min(designRowH, (BOTTOM - listTop - gap * (rows.length - 1)) / rows.length);
  const s = rowH / designRowH;
  // The title's line box starts at 200; its glyphs at about 210.
  centerVertically(ctx, 210, rows.length ? listTop + rows.length * rowH + (rows.length - 1) * gap : heroTop + 240);

  setFont(ctx, { weight: 900, size: 92, tracking: -0.04, color: t.text });
  fillLine(ctx, ellipsize(ctx, title, RIGHT - X), X, 200 + 101.2 / 2, t);

  setFont(ctx, { weight: 700, size: 30, color: sub });
  fillLine(ctx, ellipsize(ctx, handle, RIGHT - X), X, 313.2 + (30 * LH_SANS) / 2, t);

  drawCover(ctx, covers[0], X, heroTop, 240, 28, t, { y: 20, blur: 50, alpha: 0.12 });
  const heroLabelW = rightLabel(ctx, hero.label, heroTop + 120, { weight: 800, size: 26, color: t.accent }, t);
  const heroTextX = X + 240 + 36;
  const heroTextW = RIGHT - heroTextX - (heroLabelW ? heroLabelW + 36 : 0);
  const heroTitle = { weight: 900, size: 54, tracking: -0.03, color: t.text };
  setFont(ctx, heroTitle);
  drawStack(ctx, [
    { lines: wrapLines(ctx, hero.title, heroTextW, 2), style: heroTitle, lh: 54 * 1.15 },
    { lines: line(ctx, hero.sub, { weight: 500, size: 30, color: sub }, heroTextW), style: { weight: 500, size: 30, color: sub }, lh: 30 * LH_SANS, gap: 10 },
  ], heroTextX, heroTop + 120, t);

  if (!rows.length) return;
  ctx.fillStyle = t.divider ?? '#ECECF0';
  ctx.fillRect(X, dividerTop, RIGHT - X, 2);

  rows.forEach((row, i) => {
    const top = listTop + i * (rowH + gap);
    const cy = top + rowH / 2;
    drawCover(ctx, covers[i + 1], X, top, rowH, 16 * s, t);
    const labelW = rightLabel(ctx, row.label, cy, { weight: 700, size: 24 * s, color: sub }, t);
    const textX = X + rowH + 28 * s;
    const textW = RIGHT - textX - (labelW ? labelW + 28 * s : 0);
    const titleStyle = { weight: 800, size: 40 * s, tracking: -0.02, color: t.text };
    const subStyle = { weight: 500, size: 28 * s, color: sub };
    drawStack(ctx, [
      { lines: line(ctx, row.title, titleStyle, textW), style: titleStyle, lh: 40 * s * LH_SANS },
      { lines: line(ctx, row.sub, subStyle, textW), style: subStyle, lh: 28 * s * LH_SANS, gap: 4 * s },
    ], textX, cy, t);
  });
}

// B6 · 매거진 (구분선 없음): big hero, a two-up grid, then ruled rows.
function drawMagazine(ctx, { title, handle, slots }, covers, t) {
  const sub = t.sub ?? '#4A4A55';
  const divider = t.divider ?? 'rgba(17,17,20,0.12)';
  const [hero, ...rest] = slots;
  const grid = rest.slice(0, 2);
  const rows = rest.slice(2);

  // Five rows fill the list area in the design; more shrink to fit and fewer keep the
  // design's size (see drawCategory).
  const heroTop = 294 + 32 * LH_SANS + 60;
  const gridTop = heroTop + 300 + 60;
  const dividerTop = gridTop + 136 + 52;
  const listTop = dividerTop + 1.5;
  const designRowH = (BOTTOM - listTop) / 5;
  const rowH = Math.min(designRowH, (BOTTOM - listTop) / rows.length);
  const s = rowH / designRowH;
  // The title's line box starts at 188; its glyphs at about 194. A list row centres its
  // cover in the row's height, so the last cover ends short of the row's bottom.
  centerVertically(
    ctx,
    194,
    rows.length
      ? listTop + rows.length * rowH - (rowH - 100 * s) / 2
      : grid.length
        ? gridTop + 136
        : heroTop + 300
  );

  setFont(ctx, { weight: 900, size: 92, tracking: -0.055, color: t.text });
  fillLine(ctx, ellipsize(ctx, title, RIGHT - X), X, 188 + 46, t);
  setFont(ctx, { weight: 700, size: 32, color: sub });
  fillLine(ctx, ellipsize(ctx, handle, RIGHT - X), X, 294 + (32 * LH_SANS) / 2, t);

  drawCover(ctx, covers[0], X, heroTop, 300, 10, t, { y: 24, blur: 60, alpha: 0.18 });
  const heroTextX = X + 300 + 44;
  const heroTextW = RIGHT - heroTextX;
  const heroLabel = { weight: 700, size: 26, color: t.accent };
  const heroTitle = { weight: 900, size: 76, tracking: -0.045, color: t.text };
  const heroSub = { weight: 500, size: 32, color: sub };
  setFont(ctx, heroTitle);
  const heroTitleLines = wrapLines(ctx, hero.title, heroTextW, 2);
  drawStack(ctx, [
    { lines: line(ctx, hero.label, heroLabel, heroTextW), style: heroLabel, lh: 26 * LH_SANS },
    { lines: heroTitleLines, style: heroTitle, lh: 76 * 1.05, gap: 14 },
    { lines: line(ctx, hero.sub, heroSub, heroTextW), style: heroSub, lh: 32 * LH_SANS, gap: 14 },
  ], heroTextX, heroTop + 150, t);

  const cellW = (RIGHT - X - 32) / 2;
  grid.forEach((cell, i) => {
    const cx = X + i * (cellW + 32);
    drawCover(ctx, covers[i + 1], cx, gridTop, 136, 8, t, { y: 14, blur: 34, alpha: 0.14 });
    const textX = cx + 136 + 22;
    const textW = cellW - 136 - 22;
    const labelStyle = { weight: 700, size: 21, color: t.text };
    const titleStyle = { weight: 900, size: 38, tracking: -0.035, color: t.text };
    const subStyle = { weight: 500, size: 24, color: sub };
    drawStack(ctx, [
      { lines: line(ctx, cell.label, labelStyle, textW), style: labelStyle, lh: 21 * LH_SANS },
      { lines: line(ctx, cell.title, titleStyle, textW), style: titleStyle, lh: 38 * LH_SANS, gap: 6 },
      { lines: line(ctx, cell.sub, subStyle, textW), style: subStyle, lh: 24 * LH_SANS, gap: 6 },
    ], textX, gridTop + 68, t);
  });

  if (!rows.length) return;
  ctx.fillStyle = divider;
  ctx.fillRect(X, dividerTop, RIGHT - X, 1.5);

  rows.forEach((row, i) => {
    const top = listTop + i * rowH;
    const last = i === rows.length - 1;
    const contentH = last ? rowH : rowH - 1.5;
    const cy = top + contentH / 2;
    const cover = 100 * s;
    drawCover(ctx, covers[i + 3], X, cy - cover / 2, cover, 6 * s, t);
    const labelW = rightLabel(ctx, row.label, cy, { weight: 600, size: 24 * s, color: sub }, t);
    const textX = X + cover + 28 * s;
    const textW = RIGHT - textX - (labelW ? labelW + 28 * s : 0);
    const titleStyle = { weight: 800, size: 38 * s, tracking: -0.025, color: t.text };
    const subStyle = { weight: 500, size: 26 * s, color: sub };
    drawStack(ctx, [
      { lines: line(ctx, row.title, titleStyle, textW), style: titleStyle, lh: 38 * s * LH_SANS },
      { lines: line(ctx, row.sub, subStyle, textW), style: subStyle, lh: 26 * s * LH_SANS, gap: 4 * s },
    ], textX, cy, t);
    if (!last) {
      ctx.fillStyle = divider;
      ctx.fillRect(X, top + contentH, RIGHT - X, 1.5);
    }
  });
}

// Both layouts read the same slots (the first is always the hero), so switching layout
// keeps every pick.
export const STORY_LAYOUTS = {
  category: { label: '카테고리형', draw: drawCategory },
  magazine: { label: '매거진형', draw: drawMagazine },
};
