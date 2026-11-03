const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// The API returns titles HTML-escaped ("Tom &amp; Jerry", "&#39;").
function decodeEntities(s) {
  return new DOMParser().parseFromString(s, 'text/html').documentElement.textContent || '';
}

// Returns the titles of the top `max` videos in YouTube's relevance order, as seen from
// Korea. One call costs 100 of the 10,000 daily free quota units, shared by every user.
export async function searchYoutubeTitles(q, max = 3) {
  if (!API_KEY) throw new Error('YouTube API 키가 설정되지 않았어요.');
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: String(max),
    q,
    regionCode: 'KR',
    relevanceLanguage: 'ko',
    key: API_KEY,
  });
  const res = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const quota = data.error?.errors?.some((e) => e.reason === 'quotaExceeded');
    throw new Error(quota ? '오늘 일본 노래 검색 한도를 다 썼어요. 내일 다시 시도해 주세요.' : 'YouTube 검색에 실패했어요.');
  }
  return (data.items || []).map((i) => decodeEntities(i.snippet?.title || ''));
}
