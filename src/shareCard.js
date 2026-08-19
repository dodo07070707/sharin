const CARD_WIDTH = 1620;
const PAD_X = 60;
const PAD_TOP = 50;
const PAD_BOTTOM = 50;
const RED = '#fa243c';
const FALLBACK_BG = '#0f0f10';
const BORDER = 'rgba(255,255,255,0.15)';
const TEXT_MAIN = '#f5f5f7';
const TEXT_SUB = 'rgba(245,245,247,0.75)';
const FONT = 'Pretendard, system-ui, sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Wraps char-by-char rather than on spaces since Korean text doesn't reliably
// break at spaces the way Latin text does.
function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const ch of text) {
    const test = line + ch;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Like wrapText, but if the text needs more than maxLines it truncates the last
// visible line with an ellipsis instead of silently dropping the remaining text.
function wrapTextEllipsis(ctx, text, maxWidth, maxLines) {
  const lines = wrapText(ctx, text, maxWidth);
  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  const priorLength = kept.slice(0, maxLines - 1).reduce((n, l) => n + l.length, 0);
  const lastLineSource = text.slice(priorLength);

  let line = '';
  for (const ch of lastLineSource) {
    const test = line + ch + '…';
    if (line && ctx.measureText(test).width > maxWidth) break;
    line += ch;
  }
  kept[maxLines - 1] = line + '…';
  return kept;
}

// Resolves to null (rather than rejecting) on any load failure — e.g. the artwork
// CDN not granting CORS — so the card still renders, just without cover art.
function loadImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// The site favicon is a dark stroke (meant for a light browser-tab background), so
// swap it to white before drawing it onto the card's dark background.
let logoPromise = null;
function loadLogo() {
  if (!logoPromise) {
    logoPromise = fetch('/favicon.svg')
      .then((res) => res.text())
      .then((svgText) => {
        const whiteSvg = svgText.replaceAll('#1d1d1f', '#ffffff');
        const url = URL.createObjectURL(new Blob([whiteSvg], { type: 'image/svg+xml' }));
        return loadImage(url);
      })
      .catch(() => null);
  }
  return logoPromise;
}

// Fills the whole canvas with an oversized, blurred crop of the cover art (object-fit:
// cover math, scaled up extra so the blur radius never samples past the drawn image
// and leaves a faded edge), then darkens it for text contrast.
function drawBlurredBackground(ctx, img, w, h) {
  if (!img) {
    ctx.fillStyle = FALLBACK_BG;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const scale = Math.max(w / img.width, h / img.height) * 1.6;
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.save();
  ctx.filter = 'blur(200px)';
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, w, h);
}

function drawCard({ title, artist, img, logo, starsStr, ratingFixed, ratingColor, authorId, text }) {
  // A scratch context (size doesn't matter — only used to measure text) decides how
  // tall the real canvas needs to be, so the card hugs its content instead of
  // centering it inside a taller fixed canvas with empty top/bottom margin.
  const measure = document.createElement('canvas').getContext('2d');

  const coverSize = 420;
  const textX = PAD_X + coverSize + 64;
  const textMaxW = CARD_WIDTH - PAD_X - textX;

  // The logo + wordmark sit at the right end of the title's row, so the title's
  // first line needs to leave room for them instead of running underneath.
  const wordmarkFont = `700 26px ${FONT}`;
  const logoSize = 32;
  const logoTextGap = 12;
  measure.font = wordmarkFont;
  const wordmarkWidth = measure.measureText('SHARIN').width;
  const logoReserve = logoSize + logoTextGap + wordmarkWidth + 24;

  measure.font = `700 50px ${FONT}`;
  const titleLines = wrapTextEllipsis(measure, title, textMaxW - logoReserve, 2);
  measure.font = `700 36px ${FONT}`;
  const quoteLines = wrapTextEllipsis(measure, text, textMaxW - 44, 3);

  const TITLE_LH = 58;
  const QUOTE_LH = 46;
  const textContentHeight =
    titleLines.length * TITLE_LH +
    16 +
    34 + // artist
    20 +
    36 + // stars
    32 + // divider gap
    quoteLines.length * QUOTE_LH +
    20 +
    26; // byline

  const contentY = PAD_TOP;
  const contentHeight = Math.max(coverSize, textContentHeight);
  const cardHeight = contentY + contentHeight + PAD_BOTTOM;

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = cardHeight;
  const ctx = canvas.getContext('2d');

  // Canvas starts fully transparent; clipping everything to a rounded rect (instead
  // of filling the whole rectangle) leaves the corners transparent, so the card reads
  // as a rounded card with the surrounding app/story background showing through.
  roundRect(ctx, 0, 0, CARD_WIDTH, cardHeight, 48);
  ctx.clip();

  drawBlurredBackground(ctx, img, CARD_WIDTH, cardHeight);

  // sharp cover thumbnail, left side, centered within the content block
  const coverX = PAD_X;
  const coverY = contentY + (contentHeight - coverSize) / 2;
  roundRect(ctx, coverX, coverY, coverSize, coverSize, 24);
  if (img) {
    ctx.save();
    ctx.clip();
    ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
    ctx.restore();
  } else {
    ctx.fillStyle = '#2c2c2e';
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, coverX, coverY, coverSize, coverSize, 24);
  ctx.stroke();

  // text column, right side, centered within the content block
  let ty = contentY + (contentHeight - textContentHeight) / 2;

  // logo + wordmark, top-right, level with the title's row
  const titleRowCenterY = ty + TITLE_LH / 2;
  const logoX = CARD_WIDTH - PAD_X - wordmarkWidth - logoTextGap - logoSize;
  if (logo) {
    ctx.drawImage(logo, logoX, titleRowCenterY - logoSize / 2, logoSize, logoSize);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = wordmarkFont;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  ctx.fillText('SHARIN', CARD_WIDTH - PAD_X, titleRowCenterY);
  ctx.textAlign = 'left';

  ctx.fillStyle = TEXT_MAIN;
  ctx.font = `700 50px ${FONT}`;
  ctx.textBaseline = 'top';
  titleLines.forEach((line) => {
    ctx.fillText(line, textX, ty);
    ty += TITLE_LH;
  });
  ty += 16;

  ctx.fillStyle = TEXT_SUB;
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(artist, textX, ty);
  ty += 54;

  ctx.fillStyle = ratingColor || RED;
  ctx.font = `600 32px ${FONT}`;
  ctx.fillText(`${starsStr} ${ratingFixed}`, textX, ty);
  ty += 52;

  ctx.strokeStyle = BORDER;
  ctx.beginPath();
  ctx.moveTo(textX, ty);
  ctx.lineTo(CARD_WIDTH - PAD_X, ty);
  ctx.stroke();
  ty += 32;

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `700 60px Georgia, serif`;
  ctx.fillText('“', textX - 6, ty - 16);

  ctx.fillStyle = TEXT_MAIN;
  ctx.font = `700 36px ${FONT}`;
  quoteLines.forEach((line) => {
    ctx.fillText(line, textX + 44, ty);
    ty += QUOTE_LH;
  });
  ty += 20;

  ctx.fillStyle = TEXT_SUB;
  ctx.font = `600 22px ${FONT}`;
  ctx.fillText(`REVIEW BY ${authorId}`, textX, ty);

  return canvas;
}

export async function createReviewShareCard({ title, artist, coverUrl, starsStr, rating, ratingColor, authorId, text }) {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  const [img, logo] = await Promise.all([loadImage(coverUrl), loadLogo()]);
  const canvas = drawCard({
    title,
    artist,
    img,
    logo,
    starsStr,
    ratingFixed: rating.toFixed(1),
    ratingColor,
    authorId,
    text,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('카드 이미지를 만들지 못했어요.'))), 'image/png');
  });
}
