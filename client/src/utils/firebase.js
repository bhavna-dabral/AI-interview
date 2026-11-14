import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-6fea2.firebaseapp.com",
  projectId: "interviewiq-6fea2",
  storageBucket: "interviewiq-6fea2.firebasestorage.app",
  messagingSenderId: "470406697434",
  appId: "1:470406697434:web:99874a68921aeb5693f0e3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };