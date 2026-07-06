// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// هذه بيانات مشروعك الحقيقية التي ظهرت في الشاشة
const firebaseConfig = {
  apiKey: "AIzaSyDY4sa7bPPgPj-W0Jaj",
  authDomain: "ahmad-news-5aa09.firebaseapp.com",
  projectId: "ahmad-news-5aa09",
  storageBucket: "ahmad-news-5aa09.appspot.com",
  messagingSenderId: "291118806446",
  appId: "1:291118806446:web:d723c8"
};

// تهيئة تشغيل فايربيس وقاعدة البيانات
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
