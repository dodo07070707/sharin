import { useEffect, useState } from 'react';
import { collection, doc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

// Live-syncs the `items` collection (songs/albums, with reviews embedded as an array field)
// so every connected browser sees the same catalog and reviews.
export function useItemsCollection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'items'), (snap) => {
      setItems(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
    });
    return unsub;
  }, []);

  const addItem = (item) => setDoc(doc(db, 'items', item.id), item);
  const addReview = (itemId, review) => updateDoc(doc(db, 'items', itemId), { reviews: arrayUnion(review) });
  const replaceReviews = (itemId, reviews) => updateDoc(doc(db, 'items', itemId), { reviews });

  return { items, addItem, addReview, replaceReviews };
}

// Live-syncs the `posts` (게시판) collection across all browsers.
export function usePostsCollection() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'posts'), (snap) => {
      setPosts(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
    });
    return unsub;
  }, []);

  const addPost = (post) => addDoc(collection(db, 'posts'), post);
  const updatePost = (id, patch) => updateDoc(doc(db, 'posts', id), patch);
  const removePost = (id) => deleteDoc(doc(db, 'posts', id));

  return { posts, addPost, updatePost, removePost };
}

// Subscribes to one user's approval-status doc (users/{uid}).
export function subscribeToUserProfile(uid, callback) {
  return onSnapshot(doc(db, 'users', uid), (snap) => callback(snap.exists() ? snap.data() : null));
}

// Admin-only: live list of every signed-up user, so pending accounts can be approved.
// Only subscribes while `enabled` (i.e. the current user is the admin) — Firestore rules
// reject a full collection listing from anyone else.
export function usePendingUsers(enabled) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!enabled) {
      setUsers([]);
      return;
    }
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ ...d.data(), uid: d.id })));
    });
    return unsub;
  }, [enabled]);

  const approveUser = (uid) => updateDoc(doc(db, 'users', uid), { approved: true });

  return { users, approveUser };
}
