
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database";
import { getAnalytics, type Analytics } from "firebase/analytics"; // Import getAnalytics

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: "https://quantum-nexus-33878-default-rtdb.asia-southeast1.firebasedatabase.app/",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Added Measurement ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let rtdb: Database;
let analytics: Analytics | null = null; // Initialize analytics as null

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
rtdb = getDatabase(app);

// Conditionally initialize Analytics only on the client side
if (typeof window !== "undefined") {
  if (firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  } else {
    console.warn("Firebase Measurement ID (NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) is not set in environment variables. Firebase Analytics will not be initialized.");
  }
}

export { app, auth, db, rtdb, analytics };
