// Runs of kana/kanji, e.g. "Vaundy - 呼び声 (부르는 소리)" -> ["呼び声"]. ー and ・ are
// Script=Common, so they're listed on their own.
const JAPANESE_RUN = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー・]+/gu;
const HAS_KANA_OR_KANJI = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
// Video-title filler that would otherwise ride along into the iTunes query.
const NOISE = new Set(['歌詞', '歌詞付き', '和訳', '日本語', '公式', '字幕', '翻訳', '中字']);

function japaneseRuns(title) {
  const runs = (title.match(JAPANESE_RUN) || [])
    .map((r) => r.replace(/^・+|・+$/g, ''))
    .filter((r) => HAS_KANA_OR_KANJI.test(r) && !NOISE.has(r));
  return [...new Set(runs)];
}

// Picks the Japanese text that at least two of the titles agree on, in the order it
// first appears from the top. Joined with spaces, because the agreed part can be artist +
// title ("米津玄師 - 感電") and iTunes ranks that well. With no agreement, the first title
// that has any Japanese wins. Returns null when there's no Japanese at all.
export function pickJapaneseTitle(titles) {
  const perTitle = titles.map(japaneseRuns);
  const inOrder = [...new Set(perTitle.flat())];
  const agreed = inOrder.filter((run) => perTitle.filter((runs) => runs.includes(run)).length >= 2);
  if (agreed.length) return agreed.join(' ');
  return perTitle.find((runs) => runs.length)?.join(' ') || null;
}

const squash = (s) => (s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

// iTunes returns every cover of 「呼び声」, but the videos name the artist people mean
// ("Vaundy - 呼び声"). Results whose artist shows up in more of those titles move up;
// the sort is stable, so iTunes's own order breaks ties.
export function preferArtistsInTitles(results, videoTitles) {
  const titles = videoTitles.map(squash);
  const hits = (r) => {
    const artist = squash(r.artist);
    return artist ? titles.filter((t) => t.includes(artist)).length : 0;
  };
  return results
    .map((r) => ({ r, n: hits(r) }))
    .sort((a, b) => b.n - a.n)
    .map((x) => x.r);
}
