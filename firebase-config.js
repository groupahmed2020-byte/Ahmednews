// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// استبدل هذه البيانات لاحقاً ببيانات مشروعك من Firebase
const firebaseConfig = {
  apiKey: "ضع_الـ_API_KEY_هنا",
  authDomain: "مشروعك.firebaseapp.com",
  projectId: "مشروعك",
  storageBucket: "مشروعك.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// تهيئة المشروع
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
