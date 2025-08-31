import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_P,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_P,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_P,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_P,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_P,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_P,
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { app, firestore };
