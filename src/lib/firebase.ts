import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Client-side Firebase configuration
const firebaseConfig = {
  projectId: "campus-compass-p5kpr",
  appId: "1:1551289454:web:dbc595db13f9eeff0eaa7f",
  storageBucket: "campus-compass-p5kpr.firebasestorage.app",
  apiKey: "AIzaSyCseMMw7uweuEfcM9tAmOKAW1YYHSnlLvM",
  authDomain: "campus-compass-p5kpr.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1551289454"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export { app, db, auth };
