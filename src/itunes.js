const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

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

export async function searchItunes(term, type = 'song', limit = 12) {
  const q = term.trim();
  if (!q) return [];
  const entity = type === 'song' ? 'song' : 'album';
  const params = new URLSearchParams({ term: q, media: 'music', entity, limit: String(limit), country: 'KR' });
  const res = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('iTunes 검색에 실패했습니다.');
  const data = await res.json();
  return (data.results || [])
    .filter((r) => (type === 'song' ? r.kind === 'song' : r.collectionType === 'Album'))
    .map((r) => normalize(r, type));
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
  const promise = fetch(`https://itunes.apple.com/lookup?${params.toString()}`)
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
