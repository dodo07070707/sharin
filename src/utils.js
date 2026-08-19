const RATING_RED = [239, 68, 68];
const RATING_GREEN = [34, 197, 94];
const RATING_PURPLE = [139, 92, 246];

export function avg(item) {
  if (!item.reviews.length) return 0;
  return item.reviews.reduce((s, r) => s + r.rating, 0) / item.reviews.length;
}

export function starsStr(rating) {
  const r = Math.round(rating);
  let out = '';
  for (let i = 1; i <= 5; i++) out += i <= r ? '★' : '☆';
  return out;
}

export function typeBadge(type) {
  return type === 'song'
    ? { typeBg: 'transparent', typeColor: '#ffffff', typeBorder: '1px solid #ffffff', typeText: '곡' }
    : { typeBg: '#ffffff', typeColor: '#000000', typeBorder: 'none', typeText: '앨범' };
}

export function ratingBadge(val) {
  const t = Math.max(1, Math.min(5, val));
  const stops = t <= 3 ? [RATING_RED, RATING_GREEN, (t - 1) / 2] : [RATING_GREEN, RATING_PURPLE, (t - 3) / 2];
  const [from, to, f] = stops;
  const c = from.map((v, i) => Math.round(v + (to[i] - v) * f));
  const hex = '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  return { ratingBg: '#000000', ratingColor: hex, ratingBorder: `1px solid ${hex}` };
}

export function artworkFor(items, artworkMap, id) {
  const it = items.find((x) => x.id === id);
  if (!it) return null;
  return it.artworkUrl || artworkMap[id] || null;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// `date` alone (day precision) is all older reviews have. `createdAt` adds real
// minute-of-day precision going forward, but backfilled legacy reviews only got a
// synthetic createdAt for sort-order tie-breaking — showing that as a real time would be
// misleading, so those (and anything else without a precise timestamp) default to
// 00시 00분 instead. Detected structurally (within a minute of that date's UTC midnight)
// rather than relying only on the `createdAtApprox` flag, since some were backfilled
// before that flag existed and can never pick it up now (they already have a `createdAt`,
// so the backfill skips them).
export function reviewTimestampStr(review) {
  const [, month, day] = review.date.split('-');
  let hh = '00';
  let mm = '00';
  if (review.createdAt) {
    const daySynthetic = Math.abs(review.createdAt - Date.parse(review.date)) < 60000;
    if (!review.createdAtApprox && !daySynthetic) {
      const d = new Date(review.createdAt);
      hh = String(d.getHours()).padStart(2, '0');
      mm = String(d.getMinutes()).padStart(2, '0');
    }
  }
  return `${parseInt(month, 10)}월 ${parseInt(day, 10)}일 ${hh}시 ${mm}분`;
}

// Lets a post's text block mark specific words as "big" by wrapping them in [[...]] —
// a lightweight substitute for a full rich-text editor. Returns the text split into
// { text, big } segments to render.
export function parseBigText(text) {
  const segments = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) segments.push({ text: text.slice(lastIndex, match.index), big: false });
    segments.push({ text: match[1], big: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex), big: false });
  return segments;
}

// Post content is an ordered list of blocks ({type:'text'} or {type:'item'}) so a
// post can interleave several song/album embeds with paragraphs. Older posts were
// written before this existed and have a plain string `content` — normalize both.
export function normalizePostContent(content) {
  if (Array.isArray(content)) return content;
  if (typeof content === 'string' && content) return [{ type: 'text', text: content }];
  return [];
}

export function boardCoverFor(content) {
  const block = normalizePostContent(content).find((b) => b.type === 'item');
  if (!block) return { coverLabel: 'BOARD', imageUrl: null };
  return { coverLabel: block.itemType === 'song' ? 'SONG COVER' : 'ALBUM COVER', imageUrl: block.artworkUrl || null };
}

export function rankBadgeColor(rank) {
  if (rank === 1) return '#ffd60a';
  if (rank === 2) return '#c0c0c0';
  if (rank === 3) return '#cd7f32';
  return null;
}

export function itemHref(id) {
  return `/item/${encodeURIComponent(id)}`;
}

export function boardHref(id) {
  return `/board/${encodeURIComponent(id)}`;
}

// Lets list rows render as real <a> links (so right-click "copy link", cmd/ctrl-click
// to open in a new tab, etc. all work) while a plain left-click still does SPA nav.
export function navClick(fn) {
  return (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    fn();
  };
}
