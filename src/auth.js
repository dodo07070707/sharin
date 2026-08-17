import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// New accounts start unapproved — they can browse, but Firestore rules block them from
// writing reviews/posts/items until an admin flips `approved` to true.
export function signUp(email, password, nickname) {
  return createUserWithEmailAndPassword(auth, email, password).then((cred) =>
    Promise.all([
      updateProfile(cred.user, { displayName: nickname }),
      setDoc(doc(db, "users", cred.user.uid), {
        nickname,
        email,
        approved: false,
        createdAt: serverTimestamp(),
      }),
    ])
  );
}

export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logOut() {
  return signOut(auth);
}

export function subscribeToAuthUser(callback) {
  return onAuthStateChanged(auth, (u) => {
    callback(
      u ? { id: u.displayName || u.email, email: u.email, uid: u.uid } : null
    );
  });
}

const ERROR_MESSAGES = {
  "auth/email-already-in-use": "이미 가입된 이메일이에요.",
  "auth/invalid-email": "이메일 형식이 올바르지 않아요.",
  "auth/weak-password": "비밀번호는 6자 이상이어야 해요.",
  "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않아요.",
  "auth/wrong-password": "이메일 또는 비밀번호가 올바르지 않아요.",
  "auth/user-not-found": "이메일 또는 비밀번호가 올바르지 않아요.",
  "auth/too-many-requests": "시도가 너무 많아요. 잠시 후 다시 시도해주세요.",
};

export function authErrorMessage(err) {
  return ERROR_MESSAGES[err.code] || "문제가 발생했어요. 다시 시도해주세요.";
}
