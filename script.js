import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "ضع_هنا_الـ_apiKey_الخاص_بك",
  authDomain: "ahmed-bcad4.firebaseapp.com",
  projectId: "ahmed-bcad4",
  storageBucket: "ahmed-bcad4.firebasestorage.app",
  messagingSenderId: "89153466079",
  appId: "ضع_هنا_الـ_appId_الخاص_بك",
  measurementId: "G-CV2EBHSZT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// عناصر الواجهة
const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');
const loginModal = document.getElementById('loginModal');
const modalUsername = document.getElementById('modalUsername');
const modalPassword = document.getElementById('modalPassword');
const submitLoginBtn = document.getElementById('submitLoginBtn');
const closeLoginBtn = document.getElementById('closeLoginBtn');

const newsForm = document.getElementById('newsForm');
const newsFile = document.getElementById('newsFile');

// استدعاء حقول الروابط المباشرة الجديدة
const newsImgUrl = document.getElementById('newsImgUrl');
const newsVideoUrl = document.getElementById('newsVideoUrl');
const newsFileUrlField = document.getElementById('newsFileUrlField');

const editDocId = document.getElementById('editDocId');
const formTitle = document.getElementById('form-title');
const btnPublish = document.getElementById('btn-publish');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const uploadProgressContainer = document.getElementById('uploadProgressContainer');
const uploadProgressBar = document.getElementById('uploadProgressBar');

const newsContainerAr = document.getElementById('newsContainerAr');
const newsContainerEn = document.getElementById('newsContainerEn');
const btnLangAr = document.getElementById('btn-lang-ar');
const btnLangEn = document.getElementById('btn-lang-en');

let isAdminLoggedIn = false;
let currentSelectedCategory = "all";

btnLangAr.addEventListener('click', () => {
    btnLangAr.classList.add('active');
    btnLangEn.classList.remove('active');
    newsContainerAr.style.display = "flex";
    newsContainerEn.style.display = "none";
});

btnLangEn.addEventListener('click', () => {
    btnLangEn.classList.add('active');
    btnLangAr.classList.remove('active');
    newsContainerEn.style.display = "flex";
    newsContainerAr.style.display = "none";
});

adminBtn.addEventListener('click', () => {
    if (adminPanel.style.display === 'none') {
        loginModal.style.display = 'flex';
        modalUsername.value = "";
        modalPassword.value = "";
        modalUsername.focus();
    } else {
        adminPanel.style.display = 'none';
        adminBtn.innerText = "دخول الأدمن";
        isAdminLoggedIn = false;
        loadNews();
    }
});

closeLoginBtn.addEventListener('click', () => { loginModal.style.display = 'none'; });

submitLoginBtn.addEventListener('click', () => {
    if (modalUsername.value === "admin" && modalPassword.value === "admin123") {
        adminPanel.style.display = 'block';
        adminBtn.innerText = "خروج الأدمن";
        loginModal.style.display = 'none';
        isAdminLoggedIn = true;
        alert("تم تسجيل الدخول بنجاح!");
        loadNews();
    } else {
        alert("اسم المستخدم أو كلمة المرور غير صحيحة!");
    }
});

// دالة لمعالجة روابط يوتيوب وتحويلها لصيغة embed قابلة للتشغيل داخل iframe
function getYoutubeEmbedUrl(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

// دالة جلب وعرض الأخبار
async function loadNews() {
    try {
        const q = query(collection(db, "news"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        newsContainerAr.innerHTML = "";
        newsContainerEn.innerHTML = "";
        
        let hasArNews = false;
        let hasEnNews = false;

        querySnapshot.forEach((docSnap) => {
            const news = docSnap.data();
            const id = docSnap.id;

            if (currentSelectedCategory !== "all" && news.category !== currentSelectedCategory) {
                return;
            }

            const newsCard = document.createElement('article');
            newsCard.className = 'news-card';
            
            let categoryText = "";
            if (news.language === 'en') {
                const categoryMapEn = { politics: "Politics", economy: "Economy", tech: "Technology", studies: "Studies & Research" };
                categoryText = categoryMapEn[news.category] || "General";
            } else {
                const categoryMapAr = { politics: "سياسية", economy: "اقتصادية", tech: "تكنولوجيا", studies: "دراسات وأبحاث" };
                categoryText = categoryMapAr[news.category] || "عام";
            }
            
            // بناء الميديا (فيديو - صورة - مستند) بشكل منفصل ومنظم
            let mediaHtml = "";

            // 1. معالجة وعرض الفيديو
            if (news.videoUrl) {
                const ytEmbed = getYoutubeEmbedUrl(news.videoUrl);
                if (ytEmbed) {
                    mediaHtml += `<div style="margin-bottom:15px;"><iframe width="100%" height="315" src="${ytEmbed}" frameborder="0" allowfullscreen style="border-radius:6px;"></iframe></div>`;
                } else {
                    mediaHtml += `<video src="${news.videoUrl}" controls style="width:100%; max-height:350px; border-radius:6px; margin-bottom:15px;"></video>`;
                }
            }

            // 2. معالجة وعرض الصورة (سواء رابط نصي أو مرفوعة من الجهاز)
            let finalImgUrl = news.imgUrl || "";
            if (!finalImgUrl && news.fileUrl) {
                const isUploadedImage = news.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) || (news.fileType && news.fileType.startsWith('image/'));
                if (isUploadedImage) {
                    finalImgUrl = news.fileUrl;
                }
            }
            
            if (finalImgUrl) {
                mediaHtml += `<img src="${finalImgUrl}" alt="صورة الخبر" style="width:100%; max-height:350px; object-fit:cover; border-radius:6px; margin-bottom:15px;">`;
            } else if (!news.videoUrl) {
                // صورة افتراضية فقط إذا لم يتوفر أي صورة أو فيديو للخبر
                mediaHtml += `<img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600" alt="صورة افتراضية" style="width:100%; max-height:350px; object-fit:cover; border-radius:6px; margin-bottom:15px;">`;
            }

            // 3. معالجة وعرض المستند والملف المرفق
            let finalDocUrl = news.fileUrlField || "";
            if (!finalDocUrl && news.fileUrl) {
                const isUploadedImage = news.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) || (news.fileType && news.fileType.startsWith('image/'));
                if (!isUploadedImage) {
                    finalDocUrl = news.fileUrl;
                }
            }

            if (finalDocUrl) {
                mediaHtml += `<br><a href="${finalDocUrl}" target="_blank" class="download-link-btn">📎 تحميل أو عرض الملف المرفق</a>`;
            }

            let adminActionsHtml = "";
            if (isAdminLoggedIn) {
                adminActionsHtml = `
                    <div class="post-actions">
                        <button class="btn-edit" data-id="${id}">تعديل</button>
                        <button class="btn-delete" data-id="${id}">حذف</button>
                    </div>
                `;
            }

            newsCard.innerHTML = `
                <span class="badge">${categoryText}</span>
                <h3>${news.title}</h3>
                <p class="date">${news.language === 'en' ? 'Published Cloud' : 'نُشر سحابياً'}</p>
                ${mediaHtml}
                <p class="content" style="margin-top:10px;">${news.content}</p>
                ${adminActionsHtml}
            `;

            // حفظ الداتا في الـ dataset لإرجاعها للحقول عند التعديل
            newsCard.dataset.imgUrl = news.imgUrl || "";
            newsCard.dataset.videoUrl = news.videoUrl || "";
            newsCard.dataset.fileUrlField = news.fileUrlField || "";

            if (news.language === 'en') {
                newsContainerEn.appendChild(newsCard);
                hasEnNews = true;
            } else {
                newsContainerAr.appendChild(newsCard);
                hasArNews = true;
            }
        });

        if (!hasArNews) newsContainerAr.innerHTML = "<p style='text-align:center; color:#888; width:100%;'>لا توجد أخبار عربية حالياً.</p>";
        if (!hasEnNews) newsContainerEn.innerHTML = "<p style='text-align:center; color:#888; width:100%;'>No English news available.</p>";

        addActionsEventListeners();

    } catch (error) {
        console.error("Error loading news: ", error);
    }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentSelectedCategory = e.target.getAttribute('data-category');
        loadNews();
    });
});

function addActionsEventListeners() {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("هل أنت متأكد من حذف هذا البوست نهائياً؟")) {
                await deleteDoc(doc(db, "news", id));
                alert("تم حذف البوست بنجاح!");
                loadNews();
            }
        });
    });

    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const card = e.target.closest('.news-card');
            const title = card.querySelector('h3').innerText;
            const content = card.querySelector('.content').innerText;
            
            editDocId.value = id;
            document.getElementById('newsTitle').value = title;
            document.getElementById('newsContent').value = content;
            
            // تعبئة حقول الروابط عند التعديل
            newsImgUrl.value = card.dataset.imgUrl || "";
            newsVideoUrl.value = card.dataset.videoUrl || "";
            newsFileUrlField.value = card.dataset.fileUrlField || "";
            
            formTitle.innerText = "تعديل الخبر الحالي";
            btnPublish.innerText = "حفظ التعديلات";
            btnCancelEdit.style.display = "block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

btnCancelEdit.addEventListener('click', () => { resetForm(); });

function resetForm() {
    newsForm.reset();
    editDocId.value = "";
    formTitle.innerText = "إضافة خبر جديد";
    btnPublish.innerText = "نشر الخبر";
    btnCancelEdit.style.display = "none";
}

newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = editDocId.value;
    const lang = document.getElementById('newsLanguage').value;
    const category = document.getElementById('newsCategory').value;
    const title = document.getElementById('newsTitle').value;
    const content = document.getElementById('newsContent').value;
    const selectedFile = newsFile.files[0];
    
    // بناء كائن البيانات ليشمل الحقول النصية للروابط المباشرة
    let data = { 
        language: lang, 
        category: category, 
        title: title, 
        content: content,
        imgUrl: newsImgUrl.value.trim(),
        videoUrl: newsVideoUrl.value.trim(),
        fileUrlField: newsFileUrlField.value.trim()
    };

    try {
        if (selectedFile) {
            uploadProgressContainer.style.display = 'block';
            const storageRef = ref(storage, 'uploads/' + Date.now() + '_' + selectedFile.name);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);

            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        uploadProgressBar.style.width = progress + '%';
                    }, 
                    (error) => reject(error), 
                    async () => {
                        data.fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        data.fileType = selectedFile.type;
                        resolve();
                    }
                );
            });
        }

        if (id) {
            await updateDoc(doc(db, "news", id), data);
            alert("تم تحديث الخبر بنجاح!");
        } else {
            data.timestamp = new Date();
            await addDoc(collection(db, "news"), data);
            alert("تم نشر الخبر بنجاح!");
        }
        
        resetForm();
        uploadProgressContainer.style.display = 'none';
        uploadProgressBar.style.width = '0%';
        loadNews();
        
    } catch (error) {
        console.error(error);
        uploadProgressContainer.style.display = 'none';
    }
});

loadNews();
