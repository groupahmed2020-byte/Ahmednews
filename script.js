import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// عناصر شريط الأخبار العاجلة الجديد
const tickerWrapper = document.getElementById('tickerWrapper');
const tickerTitle = document.getElementById('tickerTitle');
const tickerText = document.getElementById('tickerText');

let isAdminLoggedIn = false;
let currentSelectedCategory = "all";
let currentLanguage = "ar"; // لمتابعة اللغة المفتوحة حالياً

btnLangAr.addEventListener('click', () => {
    btnLangAr.classList.add('active');
    btnLangEn.classList.remove('active');
    newsContainerAr.style.display = "flex";
    newsContainerEn.style.display = "none";
    currentLanguage = "ar";
    tickerWrapper.setAttribute('dir', 'rtl');
    tickerTitle.innerText = "عاجل";
    loadTickerNews(); // تحديث شريط العاجل للغة العربية
});

btnLangEn.addEventListener('click', () => {
    btnLangEn.classList.add('active');
    btnLangAr.classList.remove('active');
    newsContainerEn.style.display = "flex";
    newsContainerAr.style.display = "none";
    currentLanguage = "en";
    tickerWrapper.setAttribute('dir', 'ltr');
    tickerTitle.innerText = "Breaking";
    loadTickerNews(); // تحديث شريط العاجل للغة الإنجليزية
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

function getYoutubeEmbedUrl(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

// دالة جلب وتحديث شريط الأخبار العاجلة تلقائياً بناءً على آخر 5 أخبار
async function loadTickerNews() {
    try {
        const q = query(collection(db, "news"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        let tickerTitles = [];
        
        querySnapshot.forEach((docSnap) => {
            const news = docSnap.data();
            if (news.language === currentLanguage && tickerTitles.length < 5) {
                tickerTitles.push(news.title);
            }
        });

        if (tickerTitles.length > 0) {
            // دمج العناوين بفاصل مميز وتحديث النص داخل الشريط
            const separator = currentLanguage === 'en' ? "   •   " : "   ◀   ";
            tickerText.innerText = tickerTitles.join(separator);
        } else {
            tickerText.innerText = currentLanguage === 'en' ? "No breaking news at the moment." : "لا توجد أخبار عاجلة حالياً.";
        }
    } catch (error) {
        console.error("Error loading ticker: ", error);
    }
}

// دالة جلب وعرض الأخبار في الكروت
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
            
            let mediaHtml = "";

            if (news.videoUrl) {
                const ytEmbed = getYoutubeEmbedUrl(news.videoUrl);
                if (ytEmbed) {
                    mediaHtml += `<div style="margin-bottom:15px;"><iframe width="100%" height="315" src="${ytEmbed}" frameborder="0" allowfullscreen style="border-radius:6px;"></iframe></div>`;
                } else {
                    mediaHtml += `<video src="${news.videoUrl}" controls style="width:100%; max-height:350px; border-radius:6px; margin-bottom:15px;"></video>`;
                }
            }

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
                mediaHtml += `<img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600" alt="صورة افتراضية" style="width:100%; max-height:350px; object-fit:cover; border-radius:6px; margin-bottom:15px;">`;
            }

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
                loadTickerNews(); // تحديث الشريط عند الحذف
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
        loadTickerNews(); // تحديث شريط العاجل فوراً بعد النشر أو التعديل
        
    } catch (error) {
        console.error(error);
        uploadProgressContainer.style.display = 'none';
    }
});

// التشغيل الأولي عند فتح الصفحة
loadNews();
loadTickerNews();
