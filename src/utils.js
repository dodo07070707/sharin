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

export function coverLabelFor(items, relId) {
  const it = items.find((x) => x.id === relId);
  return it ? (it.type === 'song' ? 'SONG COVER' : 'ALBUM COVER') : 'BOARD';
}

export function artworkFor(items, artworkMap, id) {
  const it = items.find((x) => x.id === id);
  if (!it) return null;
  return it.artworkUrl || artworkMap[id] || null;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
