const DEEZER_SEARCH_URL = 'https://api.deezer.com/search';
const TIMEOUT_MS = 4000;

// Deezer's API sends no Access-Control-Allow-Origin, so a browser can't fetch() it; it
// does support JSONP. A callback that fires after the timeout lands on a no-op instead of
// throwing, since the script tag can't be cancelled once it's requested.
let seq = 0;
function jsonp(url) {
  return new Promise((resolve, reject) => {
    const name = `__deezerCb${++seq}`;
    const script = document.createElement('script');
    const finish = () => {
      window[name] = () => {};
      script.remove();
      clearTimeout(timer);
    };
    const timer = setTimeout(() => {
      finish();
      reject(new Error('Deezer timeout'));
    }, TIMEOUT_MS);
    window[name] = (data) => {
      finish();
      resolve(data);
    };
    script.onerror = () => {
      finish();
      reject(new Error('Deezer request failed'));
    };
    script.src = `${url}&output=jsonp&callback=${name}`;
    document.head.appendChild(script);
  });
}

// Returns [{ title, artist, rank }] in Deezer's relevance order. `rank` is Deezer's
// popularity score (higher = more played). Albums are found through the track search too,
// as each track's album: Deezer's own album search misses singles its track search finds
// (Munzi's "I•SEOUL•U 2"). A track's rank says nothing about its album, so album hits
// carry 0. Any failure resolves to [] — Deezer only ever refines the iTunes search.
export async function searchDeezer(q, type) {
  if (typeof document === 'undefined') return [];
  try {
    const data = await jsonp(`${DEEZER_SEARCH_URL}?q=${encodeURIComponent(q)}&limit=25`);
    const tracks = data.data || [];
    if (type === 'song') {
      return tracks.map((d) => ({ title: d.title || '', artist: d.artist?.name || '', rank: d.rank || 0 }));
    }
    const albums = new Map();
    for (const d of tracks) {
      const title = d.album?.title || '';
      if (title && !albums.has(title)) albums.set(title, { title, artist: d.artist?.name || '', rank: 0 });
    }
    return [...albums.values()];
  } catch {
    return [];
  }
}
