/**
 * =============================================================================
 * FLASHCART PARTNER PORTAL — Firebase Configuration
 * =============================================================================
 * 
 * Same Firebase project as the main app. This is a duplicate of firebase.js
 * with additional OneSignal configuration constants.
 * 
 * The partner portal connects to the same Firestore and RTDB as the
 * customer portal, ensuring real-time data synchronization.
 * 
 * Developer: Rizwan Rahim Chowdhury
 * =============================================================================
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  sendEmailVerification, sendPasswordResetEmail, 
  signOut, onAuthStateChanged, updateProfile 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, getDoc, getDocs, 
  setDoc, updateDoc, deleteDoc, addDoc, query, where, 
  orderBy, limit, startAfter, onSnapshot, serverTimestamp, 
  increment, arrayUnion, arrayRemove, writeBatch, Timestamp 
} from 'firebase/firestore';
import { 
  getDatabase, ref, set, get, update, remove, push, 
  onValue, onChildAdded, onChildChanged, onChildRemoved, 
  off, serverTimestamp as rtdbServerTimestamp, onDisconnect 
} from 'firebase/database';

/* Firebase Configuration — Same project as main app */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDe1BG7CQbG1zRocxCP9naJfi-JsTit3iw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "flashcart-bd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "flashcart-bd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "flashcart-bd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "240971637959",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:240971637959:web:ef506397d505dac1accae2",
  databaseURL: import.meta.env.VITE_FIREBASE_RTDB_URL || "https://flashcart-bd-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
const db = getFirestore(app);
const rtdb = getDatabase(app);

/* --- Core Instances --- */
export { app, auth, db, rtdb, googleProvider };

/* --- Auth Functions --- */
export {
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail, signOut, onAuthStateChanged, updateProfile
};

/* --- Firestore Functions --- */
export {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
  query, where, orderBy, limit, startAfter, onSnapshot, serverTimestamp,
  increment, arrayUnion, arrayRemove, writeBatch, Timestamp
};

/* --- RTDB Functions --- */
export {
  ref, set, get, update, remove, push, onValue, onChildAdded,
  onChildChanged, onChildRemoved, off, rtdbServerTimestamp, onDisconnect
};

/* --- ImgBB Configuration --- */
export const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "fdbfbcfd3bc5189e50a50c574515298d";
export const IMGBB_UPLOAD_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

/* --- OneSignal Configuration (Partner Portal ONLY) --- */
export const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "289acc0a-9fde-435e-aad7-aca9c0aca98d";
export const ONESIGNAL_REST_API_KEY = import.meta.env.VITE_ONESIGNAL_REST_API_KEY || "os_v2_app_fcnmycu73zbv5kwxvsu4blfjrxjhpbu4dp6ezx562jjsbpk3dpjrvuvypwzlfxhw2yta4qiupjmijw735zwj5nv6c3mx36ximt7un2q";

/* --- Admin Password --- */
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "RahimRahim";

/* --- Application URLs --- */
export const APP_URLS = {
  main: import.meta.env.VITE_APP_URL || "https://flashcart.bsdc.info.bd",
  partner: import.meta.env.VITE_PARTNER_URL || "https://partner.flashcart.bsdc.info.bd",
  docs: import.meta.env.VITE_DOCS_URL || "https://docs.flashcart.bsdc.info.bd"
};

/* --- Developer Credits --- */
export const CREDITS = {
  developer: import.meta.env.VITE_DEVELOPER_NAME || "Rizwan Rahim Chowdhury",
  poweredBy: import.meta.env.VITE_POWERED_BY || "Bangladesh Software Development Community",
  poweredByUrl: import.meta.env.VITE_POWERED_BY_URL || "https://www.bsdc.info.bd"
};

/* --- Collection References --- */
export const collections = {
  users: collection(db, 'users'),
  partners: collection(db, 'partners'),
  orders: collection(db, 'orders'),
  reviews: collection(db, 'reviews'),
  notifications: collection(db, 'notifications'),
  certificates: collection(db, 'certificates'),
  analytics: collection(db, 'analytics'),
  docs: collection(db, 'docs'),
  siteSettings: collection(db, 'siteSettings'),
  reports: collection(db, 'reports')
};

/* --- RTDB References --- */
export const rtdbRefs = {
  orders: (orderId) => ref(rtdb, `orders/${orderId}`),
  allOrders: () => ref(rtdb, 'orders'),
  presence: (userId) => ref(rtdb, `presence/${userId}`),
  notifications: (partnerId) => ref(rtdb, `notifications/${partnerId}`),
  analytics: (storeId, date) => ref(rtdb, `analytics/${storeId}/${date}`)
};
