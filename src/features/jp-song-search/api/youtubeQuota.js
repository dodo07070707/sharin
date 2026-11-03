import { doc, getDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

// 10,000 free units a day / 100 units per search.list call.
const DAILY_SEARCHES = 100;

// YouTube's quota resets at midnight Pacific Time, not Korean time.
function quotaDay() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
}

// YouTube has no API for the remaining quota, so every call this app makes is counted
// in one shared doc per day. Returns the estimated searches left, or null if Firestore
// refused (e.g. missing rule) — the search itself never depends on it.
export async function countYoutubeSearch() {
  const ref = doc(db, 'usage', `youtube-${quotaDay()}`);
  try {
    await setDoc(ref, { searches: increment(1) }, { merge: true });
    const snap = await getDoc(ref);
    return Math.max(0, DAILY_SEARCHES - (snap.data()?.searches || 0));
  } catch {
    return null;
  }
}
