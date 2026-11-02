import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

// One saved format per account (users/{uid}/storyTemplates/current), replaced on every
// save. Only the design choices are kept — layout, theme and the category labels — never
// the songs picked into the slots.
const templateOf = (uid) => doc(db, 'users', uid, 'storyTemplates', 'current');

export function saveStoryTemplate(uid, { layout, theme, slots }) {
  return setDoc(templateOf(uid), { layout, theme, labels: slots.map((s) => s.label), savedAt: Date.now() });
}

// Resolves to null when the account hasn't saved a format yet.
export function loadStoryTemplate(uid) {
  return getDoc(templateOf(uid)).then((snap) => (snap.exists() ? snap.data() : null));
}
