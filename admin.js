import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, updatePassword, updateEmail, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } 
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// ضع إعدادات Firebase الخاصة بمشروعك هنا
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// إدارة تسجيل الدخول (بدون كابتشا)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'flex';
    } catch (error) {
        document.getElementById('loginError').innerText = 'بيانات الدخول غير صحيحة.';
    }
});

// إضافة مقال مع خيار رفع الملفات (صورة/مستند/فيديو من الهاتف أو رابط)
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const category = document.getElementById('postCategory').value;
    const status = document.querySelector('input[name="postStatus"]:checked').value;
    
    let mediaUrl = document.getElementById('externalUrlInput').value; // إذا أضاف رابط خارجي
    const file = document.getElementById('localFileInput').files[0]; // إذا رفع ملف من الجهاز/الهاتف

    try {
        // إذا قام برفع ملف، نقوم بتخزينه أولاً في Firebase Storage
        if(file) {
            const storageRef = ref(storage, 'uploads/' + file.name);
            await uploadBytes(storageRef, file);
            mediaUrl = await getDownloadURL(storageRef);
        }

        // إضافة البيانات إلى قاعدة البيانات Firestore
        await addDoc(collection(db, "posts"), {
            title: title,
            content: content,
            category: category,
            status: status,
            mediaUrl: mediaUrl, // رابط الملف المرفوع أو الخارجي
            authorId: auth.currentUser.uid,
            timestamp: new Date()
        });
        
        alert("تم إضافة الخبر بنجاح!");
        document.getElementById('postForm').reset();
    } catch (error) {
        alert("حدث خطأ أثناء الإضافة: " + error.message);
    }
});

// تغيير اسم المستخدم (البريد) وكلمة المرور
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newEmail = document.getElementById('newEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const user = auth.currentUser;

    try {
        if(newEmail) await updateEmail(user, newEmail);
        if(newPassword) await updatePassword(user, newPassword);
        alert("تم تحديث البيانات بنجاح!");
    } catch (error) {
        alert("حدث خطأ: قد يتطلب الأمر إعادة تسجيل الدخول. " + error.message);
    }
});

// تسجيل الخروج
document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.reload();
    });
});
