import { useEffect, useState } from 'react';
import { fetchArtwork, searchItunes, fetchAlbumTracklist } from './itunes';
import { subscribeToAuthUser } from './auth';
import { subscribeToUserProfile } from './firestoreHooks';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}

// Tracks the signed-in Firebase user, exposed as { id: 닉네임, email, uid, approved, isAdmin } or null.
// `approved` gates write access — new signups start unapproved until an admin flips it in
// their users/{uid} doc; the admin (matched by email) is always treated as approved.
export function useAuthUser() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => subscribeToAuthUser(setAuthUser), []);

  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    return subscribeToUserProfile(authUser.uid, setProfile);
  }, [authUser]);

  if (!authUser) return null;
  const isAdmin = !!ADMIN_EMAIL && authUser.email === ADMIN_EMAIL;
  // `updateProfile()` at signup doesn't re-fire onAuthStateChanged, so the Auth displayName
  // can lag behind — the Firestore profile doc (written in the same signup flow) is authoritative.
  const id = (profile && profile.nickname) || authUser.id;
  return { ...authUser, id, isAdmin, approved: isAdmin || !!(profile && profile.approved) };
}

// Backfills real iTunes cover art for items that don't already carry an artworkUrl.
export function useArtworkMap(items) {
  const [map, setMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    items.forEach((item) => {
      if (item.artworkUrl || map[item.id]) return;
      fetchArtwork(item.title, item.artist, item.type).then((url) => {
        if (!cancelled && url) {
          setMap((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: url }));
        }
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return map;
}

// Fetches an album's tracklist from iTunes once the detail overlay is open on it.
export function useAlbumTracklist(itunesId, type) {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    if (type !== 'album' || !itunesId) {
      setTracks([]);
      return;
    }
    let cancelled = false;
    fetchAlbumTracklist(itunesId).then((t) => {
      if (!cancelled) setTracks(t);
    });
    return () => {
      cancelled = true;
    };
  }, [itunesId, type]);

  return tracks;
}

// Debounced iTunes search used by the 리뷰 작성 flow.
export function useItunesSearch(query, type, active) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!active || !query.trim()) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      searchItunes(query, type)
        .then((r) => {
          if (!cancelled) setResults(r);
        })
        .catch(() => {
          if (!cancelled) setError('검색 중 오류가 발생했어요.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, type, active]);

  return { results, loading, error };
}
