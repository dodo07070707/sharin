const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';

const MAX_ARTIST_QUERIES = 3;
const MAX_ARTIST_LOOKUPS = 3;
// Ranking can only reorder what it was given, so the term search is asked for several
// times what the caller displays. Sik-K's "U" sits outside the top 12 of Apple's own
// relevance order but well inside the top 50, and only surfaces because of this.
const CANDIDATE_MULTIPLIER = 4;

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

// country is intentionally omitted here: Apple's search endpoint (unlike lookup/
// musicArtist search) currently returns 0 results for entity=song/album whenever
// country=KR is set, even for well-known catalog — confirmed by comparing against
// country=US and no-country requests, which both return correct results. Metadata
// (title/artist/artwork) isn't storefront-dependent, so omitting it is safe.
async function searchByTerm(q, type, entity, limit) {
  const params = new URLSearchParams({ term: q, media: 'music', entity, limit: String(limit) });
  const res = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('iTunes 검색에 실패했습니다.');
  const data = await res.json();
  return (data.results || []).filter((r) => (type === 'song' ? r.kind === 'song' : r.collectionType === 'Album'));
}

async function findArtists(term) {
  const params = new URLSearchParams({ term, media: 'music', entity: 'musicArtist', limit: '3', country: 'KR' });
  const res = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || [])
    .filter((a) => a.artistId)
    .map((a, idx) => ({ id: a.artistId, name: a.artistName || '', top: idx === 0 }));
}

// Apple's artist search is thrown off badly by title words sitting in the query: the
// whole query "Sik-K U" returns BTOB/Crush/DAY6 and not Sik-K at all, while the bare
// "Sik-K" finds them as the top hit. The artist sits at one end of a natural
// "artist + title" query, so slices from both ends are tried as artist names alongside
// the full query. The first word comes before the longer slices because a one-word
// artist name is the most common shape and the candidate list is capped.
function artistNameCandidates(q) {
  const words = q.split(/\s+/).filter(Boolean);
  const candidates = [q];
  if (words.length > 1) {
    candidates.push(words[0], words.slice(0, -1).join(' '), words.slice(1).join(' '));
  }
  // A trailing "2", "3", "II" etc. (a common album-title suffix) throws off the artist
  // match too — "SS-POP 3" matches an unrelated artist where the stripped "SS-POP"
  // finds the real one.
  candidates.push(q.replace(/[\s\-_]*\b(\d+|[IVXLCDM]+)$/i, '').trim());
  return [...new Set(candidates.filter(Boolean))].slice(0, MAX_ARTIST_QUERIES);
}

// Each candidate's own top hit is kept, plus any artist whose name literally contains a
// query word. The top hit has to be kept because a title-only query ("밤편지") has no
// artist word to match yet still resolves to the right artist (IU) purely by relevance;
// the name match has to be kept because Apple's relevance alone puts the real Sik-K
// third behind BTOB and Crush for "Sik-K U".
//
// Candidate order decides who survives the cap, rather than name matches winning
// outright: the query's leading words are the likelier artist name, and a trailing title
// word can match artists of its own — "식케이 U" turns up artists actually named "U",
// and ranking those first would push out the Sik-K that the earlier candidates found.
async function selectArtists(q) {
  const candidates = artistNameCandidates(q);
  const lists = await Promise.all(candidates.map((c) => findArtists(c).catch(() => [])));
  const tokens = queryTokens(q);
  const byId = new Map();
  lists.forEach((list, rank) => {
    for (const artist of list) {
      const named = tokens.some((t) => normalizeForMatch(artist.name).includes(t));
      if (!named && !artist.top) continue;
      if (!byId.has(artist.id)) byId.set(artist.id, { ...artist, rank });
    }
  });
  return [...byId.values()].sort((a, b) => a.rank - b.rank).slice(0, MAX_ARTIST_LOOKUPS);
}

function normalizeForMatch(s) {
  return (s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

// Splits a query into normalized word tokens, e.g. "나우아임영 ah ah" -> ["나우아임영", "ah"].
function queryTokens(q) {
  return [...new Set(q.split(/\s+/).map(normalizeForMatch).filter(Boolean))];
}

function titleOf(r, type) {
  return (type === 'song' ? r.trackName : r.collectionName) || '';
}

// Normalizing the fields as one joined string (with no separator) can accidentally
// create a substring at a word boundary that was never in any field (e.g. artist
// "Deretta" + title "HELLA FLAME" merges into "...deretta hellaflame..." -> "tahella" ->
// contains "ah"). Normalizing each field separately and joining with a single space
// keeps those boundaries intact so short tokens can't match across them.
function matchesTokens(tokens, ...fields) {
  if (!tokens.length) return false;
  const haystack = fields.map(normalizeForMatch).join(' ');
  return tokens.every((t) => haystack.includes(t));
}

// A track's credited artist is whatever the storefront calls it, which is not
// necessarily the name that was typed: searching "Sik-K U" resolves the artist fine,
// but the KR storefront credits the track to "식케이 & 릴 모쉬핏", so a "sikk" token
// matches nothing on the track itself and the right song gets filtered away. The name
// that the artist search matched is therefore carried onto its own catalog entries and
// counts towards the match, which is what makes the two scripts interchangeable here.
function artistFieldsOf(r) {
  return [r.resolvedArtistName || '', r.artistName || ''];
}

// Apple's term search doubles as the popularity signal the API otherwise doesn't expose:
// a query that really is an artist's name comes back saturated with that artist (36 of 48
// results for "NewJeans"), while a query that's a song title spreads thinly over many
// artists (3 of 48 at most for "nobody"). Reading that skew costs no extra request — the
// sample is the search already being run.
const DOMINANT_SHARE = 0.25;
const DOMINANT_MIN_COUNT = 5;

// Maps each dominating artist to their own name rather than just collecting ids, because
// the bonus has to be checked against that name alone. A track's artistName is the whole
// credit line, and a one-letter query word hides far too easily inside it — the "u" of
// "Sik-K U" turns up in a collaborator's "BIG Naughty", which would otherwise read as a
// pure artist query and lift the whole feature over the song actually titled "U". The
// shortest credit an artist appears under is the closest thing to their bare name.
function dominantArtists(termResults) {
  const counts = new Map();
  const names = new Map();
  for (const r of termResults) {
    if (!r.artistId) continue;
    counts.set(r.artistId, (counts.get(r.artistId) || 0) + 1);
    const name = normalizeForMatch(r.artistName);
    const known = names.get(r.artistId);
    if (!known || name.length < known.length) names.set(r.artistId, name);
  }
  const dominant = new Map();
  for (const [id, n] of counts) {
    if (n >= DOMINANT_MIN_COUNT && n / termResults.length >= DOMINANT_SHARE) {
      dominant.set(id, names.get(id) || '');
    }
  }
  return dominant;
}

// A title hit outranks an artist-name hit: searching "nobody" is a search for the song
// called "Nobody", not for the back catalogue of an artist who happens to go by that name.
// Tracks by a matching artist still rank above partial title matches, so a bare artist
// name ("Sik-K") returns their releases rather than loose title fragments.
//
// The one exception is an artist dominating the sample above: "NewJeans" is unambiguously
// about the group, so their songs belong ahead of the obscure tracks literally titled
// "NEWJEANS". That only applies where the query is entirely the artist's name — once a
// title word is in play ("Sik-K U") the title ranking governs, so the exact "U" can't be
// pushed under the rest of his catalogue.
function scoreResult(tokens, r, type, dominant) {
  const title = normalizeForMatch(titleOf(r, type));
  const artist = artistFieldsOf(r).map(normalizeForMatch).join(' ');
  // Words the artist already accounts for don't have to appear in the title as well,
  // which is what lets "Sik-K U" match a track simply titled "U".
  const titleTokens = tokens.filter((t) => !artist.includes(t));
  const joined = titleTokens.join('');
  let score;
  if (title === tokens.join('')) score = 120; // the whole query is the title
  else if (!titleTokens.length) score = 70; // the whole query is the artist — all of their releases qualify
  else if (title === joined) score = 100;
  else if (title.startsWith(joined)) score = 85;
  else if (title.includes(joined)) score = 60;
  else if (titleTokens.every((t) => title.includes(t))) score = 40;
  else score = 0;
  if (!score) return 0;
  if (tokens.some((t) => artist.includes(t))) score += 10;
  // Only where the query is the artist's bare name — every query word has to sit in that
  // name, not merely somewhere in the credit line.
  const dominantName = dominant.get(r.artistId);
  if (dominantName && tokens.every((t) => dominantName.includes(t))) score += 45;
  // Came out of a catalog lookup for an artist Apple itself tied to the query, which is
  // what separates IU's own "밤편지" from the pile of identically-titled covers. It adds
  // nothing when the query matched the artist and not the title, though — for a query
  // like "BLACKPINK", where Apple's artist search only turns up same-named unknowns, the
  // bonus would just promote those over the real group's own term-search hits.
  if (titleTokens.length && r.resolvedArtistName) score += 5;
  return score;
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
    const artists = await selectArtists(q);
    if (!artists.length) return [];

    const lookups = await Promise.all(
      artists.map((artist) => {
        const lookupParams = new URLSearchParams({ id: String(artist.id), entity, limit: '200', country: 'KR' });
        return fetch(`${ITUNES_LOOKUP_URL}?${lookupParams.toString()}`)
          .then((r) => (r.ok ? r.json() : { results: [] }))
          .catch(() => ({ results: [] }))
          .then((d) => (d.results || []).map((r) => ({ ...r, resolvedArtistName: artist.name })));
      })
    );

    const tokens = queryTokens(q);
    return lookups
      .flat()
      .filter((r) => (type === 'song' ? r.kind === 'song' : r.collectionType === 'Album'))
      .filter((r) => matchesTokens(tokens, ...artistFieldsOf(r), titleOf(r, type)));
  } catch {
    return [];
  }
}

export async function searchItunes(term, type = 'song', limit = 12) {
  const q = term.trim();
  if (!q) return [];
  const entity = type === 'song' ? 'song' : 'album';

  const [termResults, fallbackResults] = await Promise.all([
    searchByTerm(q, type, entity, Math.min(limit * CANDIDATE_MULTIPLIER, 200)),
    searchByArtistFallback(q, type, entity),
  ]);

  // Apple's own term-search relevance is occasionally fuzzy/unrelated (e.g. a query like
  // "ah ah" surfacing a track whose title and artist contain neither word at all), and
  // the artist fallback returns a whole catalog in no useful order, so neither ordering
  // is trusted on its own — everything is scored against the query instead. A result
  // matching nothing scores 0 and sinks rather than being dropped, in case Apple matched
  // on something the simple substring check misses. The sort is stable, so Apple's
  // relevance still breaks ties among equally-scored results.
  // Dominance is measured on the term results alone: the fallback is one artist's entire
  // catalogue, which would swamp any share calculation it took part in.
  const tokens = queryTokens(q);
  const dominant = dominantArtists(termResults);
  const ranked = [...termResults, ...fallbackResults]
    .map((r, idx) => ({ r, idx, score: scoreResult(tokens, r, type, dominant) }))
    .sort((a, b) => b.score - a.score || a.idx - b.idx);

  // The same recording reaches us once per release it appears on (a single and the album
  // that later collected it), which reads as a duplicate row in the picker — for a review
  // it's the same song either way, so only the best-ranked copy of a title/artist pair is
  // kept.
  const idOf = (r) => (type === 'song' ? r.trackId : r.collectionId);
  const seenIds = new Set();
  const seenTitles = new Set();
  const combined = [];
  for (const { r } of ranked) {
    const id = idOf(r);
    const titleKey = `${normalizeForMatch(r.artistName || '')}:${normalizeForMatch(titleOf(r, type))}`;
    if (seenIds.has(id) || seenTitles.has(titleKey)) continue;
    seenIds.add(id);
    seenTitles.add(titleKey);
    combined.push(r);
    if (combined.length === limit) break;
  }

  return combined.map((r) => normalize(r, type));
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
