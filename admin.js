// استدعاء مكتبات فايربيس
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, updateProfile, updatePassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// إعدادات مشروعك الحقيقية
const firebaseConfig = {
  apiKey: "AIzaSyDY4sa7bPPgPj-W0JajUJpOJSVtoe8vpAk",
  authDomain: "ahmad-news-5aa09.firebaseapp.com",
  projectId: "ahmad-news-5aa09",
  storageBucket: "ahmad-news-5aa09.firebasestorage.app",
  messagingSenderId: "291118806446",
  appId: "1:291118806446:web:54923afed0a67054d4443f",
  measurementId: "G-6WQLLFY5RF"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ... (باقي الكود القديم الخاص بك يبقى كما هو بدون تغيير)
