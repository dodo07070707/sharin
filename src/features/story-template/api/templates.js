import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

// One saved format per account (users/{uid}/storyTemplates/current), replaced on every
// save. Only the design choices are kept — layout, theme, the custom theme's colors and
// the category labels — never the songs picked into the slots.
const templateOf = (uid) => doc(db, 'users', uid, 'storyTemplates', 'current');

export function saveStoryTemplate(uid, { layout, theme, glowColors, slots }) {
  return setDoc(templateOf(uid), {
    layout,
    theme,
    glowColors,
    labels: slots.map((s) => s.label),
    savedAt: Date.now(),
  });
}

// Resolves to null when the account hasn't saved a format yet.
export function loadStoryTemplate(uid) {
  return getDoc(templateOf(uid)).then((snap) => (snap.exists() ? snap.data() : null));
}

// The whole story in progress — songs included — kept beside the format as one draft
// per account (users/{uid}/storyTemplates/draft), replaced on every save.
const draftOf = (uid) => doc(db, 'users', uid, 'storyTemplates', 'draft');

export function saveStoryDraft(uid, { layout, theme, glowColors, title, handle, slots }) {
  return setDoc(draftOf(uid), { layout, theme, glowColors, title, handle, slots, savedAt: Date.now() });
}

// Resolves to null when the account has no draft.
export function loadStoryDraft(uid) {
  return getDoc(draftOf(uid)).then((snap) => (snap.exists() ? snap.data() : null));
}
