const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';

function upscaleArtwork(url) {
  return url ? url.replace('100x100bb', '300x300bb') : null;
}

function normalize(result, type) {
  return {
    itunesId: type === 'song' ? result.trackId : result.collectionId,
    type,
    title: type === 'song' ? result.trackName : result.collectionName,
    artist: result.artistName,
    releaseDate: (result.releaseDate || '').slice(0, 10),
    artworkUrl: upscaleArtwork(result.artworkUrl100 || result.artworkUrl60),
    previewUrl: result.previewUrl || null,
    genre: result.primaryGenreName || null,
  };
}

async function searchByTerm(q, type, entity, limit) {
  const params = new URLSearchParams({ term: q, media: 'music', entity, limit: String(limit), country: 'KR' });
  const res = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('iTunes 검색에 실패했습니다.');
  const data = await res.json();
  return (data.results || []).filter((r) => (type === 'song' ? r.kind === 'song' : r.collectionType === 'Album'));
}

async function findArtistIds(q) {
  const params = new URLSearchParams({ term: q, media: 'music', entity: 'musicArtist', limit: '1', country: 'KR' });
  const res = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((a) => a.artistId);
}

function normalizeForMatch(s) {
  return (s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

// Splits a query into normalized word tokens, e.g. "나우아임영 ah ah" -> ["나우아임영", "ah"].
function queryTokens(q) {
  return [...new Set(q.split(/\s+/).map(normalizeForMatch).filter(Boolean))];
}

// iTunes's own relevance ranking sometimes just doesn't surface a real, existing
// release for its term search at all (seen with small/indie catalog entries, even at
// a large limit) — and it fills the result list up to `limit` with loosely-related
// padding regardless, so a short result count isn't a reliable signal either. Looking
// the artist up directly and listing their catalog is far more reliable, so this is
// always run alongside the plain term search and merged in.
//
// A trailing "2", "3", "II" etc. (a common album-title suffix) can also throw off the
// artist-name match itself (e.g. "SS-POP 3" matches an unrelated artist, but the
// stripped "SS-POP" correctly finds the real one), so both the raw and stripped query
// are tried. Neither artist match is necessarily the right one though (an artist "match"
// on a title fragment can be pure noise), so the artist's whole catalog isn't trusted —
// only catalog entries that actually match are kept. That match is checked per query word
// (rather than the whole query as one substring) against the artist name *and* title
// together, since a natural query like "나우아임영 ah ah" (artist + track title) has no
// reason to appear contiguously in the title alone — the artist name is right there in
// the query on purpose, to disambiguate a short/generic title.
async function searchByArtistFallback(q, type, entity) {
  try {
    const stripped = q.replace(/[\s\-_]*\b(\d+|[IVXLCDM]+)$/i, '').trim();
    const idLists = await Promise.all(
      stripped && stripped !== q ? [findArtistIds(q), findArtistIds(stripped)] : [findArtistIds(q)]
    );
    const artistIds = [...new Set(idLists.flat())];
    if (!artistIds.length) return [];

    const lookups = await Promise.all(
      artistIds.map((id) => {
        const lookupParams = new URLSearchParams({ id: String(id), entity, limit: '200', country: 'KR' });
        return fetch(`${ITUNES_LOOKUP_URL}?${lookupParams.toString()}`)
          .then((r) => (r.ok ? r.json() : { results: [] }))
          .catch(() => ({ results: [] }));
      })
    );

    const tokens = queryTokens(q);
    return lookups
      .flatMap((d) => d.results || [])
      .filter((r) => (type === 'song' ? r.kind === 'song' : r.collectionType === 'Album'))
      .filter((r) => {
        const title = type === 'song' ? r.trackName : r.collectionName;
        const haystack = normalizeForMatch(`${r.artistName || ''} ${title || ''}`);
        return tokens.length > 0 && tokens.every((t) => haystack.includes(t));
      });
  } catch {
    return [];
  }
}

export async function searchItunes(term, type = 'song', limit = 12) {
  const q = term.trim();
  if (!q) return [];
  const entity = type === 'song' ? 'song' : 'album';

  const [termResults, fallbackResults] = await Promise.all([
    searchByTerm(q, type, entity, limit),
    searchByArtistFallback(q, type, entity),
  ]);

  const idOf = (r) => (type === 'song' ? r.trackId : r.collectionId);
  const seenIds = new Set();
  const combined = [];
  for (const r of [...fallbackResults, ...termResults]) {
    const id = idOf(r);
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    combined.push(r);
  }

  return combined.slice(0, limit).map((r) => normalize(r, type));
}

const artworkCache = new Map();

export function fetchArtwork(title, artist, type) {
  const key = `${type}:${title}:${artist}`;
  if (artworkCache.has(key)) return artworkCache.get(key);
  const promise = searchItunes(`${artist} ${title}`, type, 1)
    .then((results) => results[0]?.artworkUrl || null)
    .catch(() => null);
  artworkCache.set(key, promise);
  return promise;
}

const tracklistCache = new Map();

export function fetchAlbumTracklist(collectionId) {
  if (!collectionId) return Promise.resolve([]);
  if (tracklistCache.has(collectionId)) return tracklistCache.get(collectionId);
  const params = new URLSearchParams({ id: String(collectionId), entity: 'song' });
  const promise = fetch(`${ITUNES_LOOKUP_URL}?${params.toString()}`)
    .then((res) => (res.ok ? res.json() : { results: [] }))
    .then((data) =>
      (data.results || [])
        .filter((r) => r.wrapperType === 'track' && r.kind === 'song')
        .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0))
        .map((r) => ({ trackNumber: r.trackNumber, title: r.trackName }))
    )
    .catch(() => []);
  tracklistCache.set(collectionId, promise);
  return promise;
}
