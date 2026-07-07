// استدعاء مكتبات فايربيس (تأكد من استدعاء جميع الدوال المطلوبة)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, updateProfile, updatePassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// ⚠️ ضع إعدادات مشروعك هنا
const firebaseConfig = {
  apiKey: "ضع_الكود_هنا",
  authDomain: "ضع_الكود_هنا",
  projectId: "ضع_الكود_هنا",
  storageBucket: "ضع_الكود_هنا",
  messagingSenderId: "ضع_الكود_هنا",
  appId: "ضع_الكود_هنا"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// متغير لتتبع حالة التعديل
let currentEditingNewsId = null;

// دالة لاستخراج كود اليوتيوب للتضمين
function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// --------------------------------------------------
// جلب الأخبار وعرضها في الجدول
// --------------------------------------------------
async function loadNews() {
    const tableBody = document.getElementById('newsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">جاري تحميل الأخبار...</td></tr>';

    try {
        // جلب الأخبار مرتبة من الأحدث للأقدم
        const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        tableBody.innerHTML = ''; // تفريغ الجدول

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا توجد أخبار حالياً</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // تحديد لون حالة الخبر
            let statusBadge = 'badge-draft';
            if(data.status === 'منشور') statusBadge = 'badge-publish';
            if(data.status === 'عاجل') statusBadge = 'badge-urgent';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size: 14px; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data.title}</td>
                <td style="font-size: 14px;">${data.category}</td>
                <td><span class="badge ${statusBadge}">${data.status}</span></td>
                <td>
                    <button onclick="editNews('${docSnap.id}')" style="color: #0056b3; background: none; border: none; cursor: pointer; font-size: 18px; margin-left: 10px;" title="تعديل">✏️</button>
                    <button onclick="deleteNews('${docSnap.id}')" style="color: #dc3545; background: none; border: none; cursor: pointer; font-size: 18px;" title="حذف">🗑️</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("خطأ في جلب الأخبار:", error);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">حدث خطأ في تحميل البيانات</td></tr>';
    }
}

// استدعاء دالة التحميل عند فتح الصفحة
document.addEventListener("DOMContentLoaded", () => {
    loadNews();
});

// --------------------------------------------------
// الإضافة والتحديث (Submit Form)
// --------------------------------------------------
const addNewsForm = document.getElementById('addNewsForm');
const submitNewsBtn = document.getElementById('submitNewsBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

if (addNewsForm) {
    addNewsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitNewsBtn.disabled = true;
        submitNewsBtn.textContent = 'جاري المعالجة...';

        const title = document.getElementById('newsTitle').value;
        const content = document.getElementById('newsContent').value;
        const imageUrl = document.getElementById('newsImage').value;
        const videoUrl = document.getElementById('newsVideo').value;
        const docUrl = document.getElementById('newsDoc').value;
        const category = document.getElementById('newsCategory').value;
        const status = document.getElementById('newsStatus').value;

        // معالجة رابط اليوتيوب
        let ytEmbedCode = "";
        const ytId = getYouTubeId(videoUrl);
        if(ytId) ytEmbedCode = `https://www.youtube.com/embed/${ytId}`;

        const newsData = {
            title: title,
            content: content,
            imageUrl: imageUrl,
            videoUrl: videoUrl,
            youtubeEmbed: ytEmbedCode,
            docUrl: docUrl,
            category: category,
            status: status
        };

        try {
            if (currentEditingNewsId) {
                // حالة التحديث (تعديل خبر موجود)
                const docRef = doc(db, "news", currentEditingNewsId);
                await updateDoc(docRef, newsData);
                alert("✅ تم تحديث الخبر بنجاح!");
                resetFormState();
            } else {
                // حالة الإضافة (خبر جديد)
                newsData.createdAt = serverTimestamp();
                await addDoc(collection(db, "news"), newsData);
                alert("✅ تم نشر الخبر بنجاح!");
                addNewsForm.reset();
            }
            loadNews(); // تحديث الجدول فوراً

        } catch (error) {
            console.error("خطأ في الحفظ:", error);
            alert("❌ حدث خطأ أثناء الحفظ.");
        } finally {
            submitNewsBtn.disabled = false;
            if(!currentEditingNewsId) submitNewsBtn.innerHTML = 'نشر الخبر ☁️';
        }
    });
}

// --------------------------------------------------
// دالة تجهيز الخبر للتعديل (تعبئة الحقول)
// --------------------------------------------------
window.editNews = async function(newsId) {
    try {
        const docRef = doc(db, "news", newsId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            document.getElementById('newsTitle').value = data.title || '';
            document.getElementById('newsContent').value = data.content || '';
            document.getElementById('newsImage').value = data.imageUrl || '';
            document.getElementById('newsVideo').value = data.videoUrl || '';
            document.getElementById('newsDoc').value = data.docUrl || '';
            document.getElementById('newsCategory').value = data.category || 'سياسة';
            document.getElementById('newsStatus').value = data.status || 'منشور';

            currentEditingNewsId = newsId;

            // تغيير شكل زر النشر ليصبح تحديث وإظهار زر الإلغاء
            submitNewsBtn.innerHTML = 'تحديث الخبر 🔄';
            submitNewsBtn.style.backgroundColor = '#ffc107'; 
            submitNewsBtn.style.color = '#000';
            cancelEditBtn.style.display = 'block';

            // التمرير لأعلى النموذج
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error("خطأ في جلب بيانات الخبر:", error);
        alert("حدث خطأ أثناء محاولة تعديل الخبر.");
    }
};

// إلغاء التعديل والعودة لوضع الإضافة
if(cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetFormState);
}

function resetFormState() {
    currentEditingNewsId = null;
    addNewsForm.reset();
    submitNewsBtn.innerHTML = 'نشر الخبر ☁️';
    submitNewsBtn.style.backgroundColor = '#28a745';
    submitNewsBtn.style.color = '#fff';
    cancelEditBtn.style.display = 'none';
}

// --------------------------------------------------
// دالة حذف الخبر
// --------------------------------------------------
window.deleteNews = async function(newsId) {
    if (confirm("⚠️ هل أنت متأكد من حذف هذا الخبر نهائياً؟")) {
        try {
            await deleteDoc(doc(db, "news", newsId));
            alert("🗑️ تم الحذف بنجاح!");
            
            // إذا كان يحذف خبراً يقوم بتعديله حالياً، نفرغ الفورم
            if(currentEditingNewsId === newsId) {
                resetFormState();
            }
            
            loadNews(); // تحديث الجدول
        } catch (error) {
            console.error("خطأ في الحذف:", error);
            alert("❌ حدث خطأ أثناء محاولة الحذف.");
        }
    }
};

// --------------------------------------------------
// إعدادات الحساب والمصادقة (كما هي سابقاً)
// --------------------------------------------------
const updateProfileForm = document.getElementById('updateProfileForm');
const welcomeMessage = document.getElementById('welcomeMessage');

onAuthStateChanged(auth, (user) => {
    if (user) {
        welcomeMessage.textContent = `أهلاً بك، ${user.displayName || 'مدير'}`;
    } else {
        welcomeMessage.textContent = 'أنت غير مسجل الدخول!';
    }
});

if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const user = auth.currentUser;

        if (user) {
            try {
                let updated = false;
                if (newUsername !== "") {
                    await updateProfile(user, { displayName: newUsername });
                    welcomeMessage.textContent = `أهلاً بك، ${newUsername}`;
                    updated = true;
                }
                if (newPassword !== "") {
                    if(newPassword.length < 6) { alert("❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل."); return; }
                    await updatePassword(user, newPassword);
                    updated = true;
                }
                if (updated) {
                    alert("✅ تم تحديث بيانات الحساب بنجاح!");
                    updateProfileForm.reset();
                } else {
                    alert("⚠️ لم تقم بإدخال أي بيانات لتحديثها.");
                }
            } catch (error) {
                if (error.code === 'auth/requires-recent-login') {
                    alert("⚠️ لدواعي أمنية، يرجى تسجيل الخروج ثم الدخول مجدداً لتتمكن من تغيير كلمة المرور.");
                } else {
                    alert("❌ حدث خطأ: " + error.message);
                }
            }
        }
    });
}
