// node --test src/features/jp-song-search/lib/pickJapaneseTitle.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickJapaneseTitle, preferArtistsInTitles } from './pickJapaneseTitle.js';

test('agreed title wins', () => {
  assert.equal(
    pickJapaneseTitle([
      'Vaundy - 呼び声 (부르는 소리, 요비고에) 가사 번역 - 페퍼민트',
      '[한글자막] Vaundy「呼び声」 MV',
      '요비고에 커버',
    ]),
    '呼び声'
  );
});

test('artist and title both agreed, filler dropped', () => {
  assert.equal(
    pickJapaneseTitle(['米津玄師 - 感電 【歌詞付き】', '米津玄師「感電」 가사', '감전 米津玄師 感電 歌詞付き']),
    '米津玄師 感電'
  );
});

test('no agreement falls back to first title with Japanese', () => {
  assert.equal(pickJapaneseTitle(['요비고에', 'YOASOBI - 夜に駆ける', 'ハルジオン']), '夜に駆ける');
});

test('no Japanese at all', () => {
  assert.equal(pickJapaneseTitle(['아이유 밤편지', 'IU Through the Night']), null);
});

test('long vowel mark stays inside the run', () => {
  assert.equal(pickJapaneseTitle(['ヒーロー 가사', 'ヒーロー MV']), 'ヒーロー');
});

test('artist named in the video titles moves up', () => {
  const results = [{ artist: 'batta' }, { artist: 'Vaundy' }, { artist: '테이' }];
  const titles = ['Vaundy - 呼び声 가사', '[한글자막] Vaundy「呼び声」', '요비고에 커버'];
  assert.deepEqual(
    preferArtistsInTitles(results, titles).map((r) => r.artist),
    ['Vaundy', 'batta', '테이']
  );
});
