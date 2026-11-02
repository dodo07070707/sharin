import { loadImage } from '../../../shared/lib';
import { W, H, BRAND_NAME, drawBrand } from './draw';
import { STORY_LAYOUTS } from './layouts';
import { STORY_THEMES } from '../model/themes';

// The preview redraws on every keystroke, so each image is fetched once per session.
const imageCache = new Map();
function cachedImage(url) {
  if (!imageCache.has(url)) imageCache.set(url, loadImage(url));
  return imageCache.get(url);
}

// Search results carry 300px artwork; the hero cover is drawn at 300px on a 1080px
// story, so ask Apple's CDN for a sharper copy.
function largeArtwork(url) {
  return url ? url.replace(/\d+x\d+bb/, '600x600bb') : null;
}

const FONT_FACES = [500, 600, 700, 800, 900].flatMap((w) => [`${w} 16px Inter`, `${w} 16px Pretendard`]);

// Canvas text doesn't wait for webfonts, so they're loaded up front — with the actual
// text, since Inter is split into unicode-range chunks that only load on demand.
function loadFonts(text) {
  if (!document.fonts) return null;
  return Promise.all(FONT_FACES.map((f) => document.fonts.load(f, text))).catch(() => null);
}

// Resolves to a fresh 1080×1920 canvas rather than drawing into a caller's canvas, so a
// slow render can never overwrite a newer one that finished first.
export async function renderStory(story) {
  const theme = STORY_THEMES[story.theme];
  const layout = STORY_LAYOUTS[story.layout];
  const text = [BRAND_NAME, story.title, story.handle, ...story.slots.flatMap((s) => [s.label, s.title, s.sub])].join('');
  const [bg, covers, logo] = await Promise.all([
    theme.backgroundImage ? cachedImage(theme.backgroundImage) : null,
    Promise.all(story.slots.map((s) => (s.artworkUrl ? cachedImage(largeArtwork(s.artworkUrl)) : null))),
    cachedImage('/favicon.svg'),
    loadFonts(text),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  theme.paint(ctx, bg, story);
  layout.draw(ctx, story, covers, theme);
  // Layouts may shift themselves down to centre their content; the brand stays pinned
  // to the bottom regardless.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawBrand(ctx, logo, theme);
  return canvas;
}
