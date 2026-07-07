// استدعاء مكتبات فايربيس الخاصة بتسجيل الدخول
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// إعدادات مشروعك الحقيقية في فايربيس
const firebaseConfig = {
  apiKey: "AIzaSyDY4sa7bPPgPj-W0JajUJpOJSVtoe8vpAk",
  authDomain: "ahmad-news-5aa09.firebaseapp.com",
  projectId: "ahmad-news-5aa09",
  storageBucket: "ahmad-news-5aa09.firebasestorage.app",
  messagingSenderId: "291118806446",
  appId: "1:291118806446:web:54923afed0a67054d4443f",
  measurementId: "G-6WQLLFY5RF"
};

// تهيئة الاتصال بفايربيس
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ربط عناصر صفحة تسجيل الدخول
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');

// وظيفة زر تسجيل الدخول
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // منع تحديث الصفحة
        
        // تغيير شكل الزر ليدل على التحميل
        loginBtn.disabled = true;
        loginBtn.textContent = 'جاري التحقق...';

        // جلب الإيميل والباسورد الذي كتبته
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // محاولة تسجيل الدخول
            await signInWithEmailAndPassword(auth, email, password);
            
            // إذا نجح الدخول، يتم تحويلك فوراً لصفحة لوحة التحكم
            window.location.href = 'admin.html'; 
            
        } catch (error) {
            console.error("خطأ الدخول:", error);
            alert("❌ بيانات الدخول غير صحيحة، أو تأكد من تفعيل Authentication في فايربيس.");
            
            // إعادة الزر لشكله الطبيعي في حال الفشل
            loginBtn.disabled = false;
            loginBtn.textContent = 'تسجيل الدخول';
        }
    });
}
