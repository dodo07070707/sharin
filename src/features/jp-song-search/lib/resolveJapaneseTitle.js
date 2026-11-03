import { searchYoutubeTitles } from '../../../shared/api';
import { pickJapaneseTitle } from './pickJapaneseTitle';
import { countYoutubeSearch } from '../api/youtubeQuota';

// "JP요비고에" / "jp 요비고에" -> "요비고에". Only JP followed by Hangul (jamo included, so
// the mode kicks in while still typing), so artists like "JPEGMAFIA" search as usual.
const JP_PREFIX = /^jp\s*(?=[ㄱ-ㅎㅏ-ㅣ가-힣])/i;

export function parseJpQuery(query) {
  const q = query.trim();
  return JP_PREFIX.test(q) ? q.replace(JP_PREFIX, '').trim() : null;
}

// The free YouTube quota is about 100 searches a day for everyone, so a term is only
// ever asked once per page load. The in-flight promise is cached too, which also absorbs
// the double Enter some Korean IMEs fire. Failures are dropped so they can be retried.
const cache = new Map();

// Resolves to { title, videoTitles, remaining }; title is null when no Japanese was
// found, remaining is null when the usage count couldn't be read.
export function resolveJapaneseTitle(term) {
  if (!cache.has(term)) {
    cache.set(
      term,
      Promise.all([searchYoutubeTitles(term, 3), countYoutubeSearch()])
        .then(([videoTitles, remaining]) => ({ title: pickJapaneseTitle(videoTitles), videoTitles, remaining }))
        .catch((e) => {
          cache.delete(term);
          throw e;
        })
    );
  }
  return cache.get(term);
}
