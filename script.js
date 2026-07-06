import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// عناصر الواجهة الأساسية
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

// عناصر شريط الأخبار العاجلة الجديد وإدارته
const tickerWrapper = document.getElementById('tickerWrapper');
const tickerTitle = document.getElementById('tickerTitle');
const tickerText = document.getElementById('tickerText');

const tickerForm = document.getElementById('tickerForm');
const editTickerId = document.getElementById('editTickerId');
const tickerLanguage = document.getElementById('tickerLanguage');
const tickerInputText = document.getElementById('tickerInputText');
const btnPublishTicker = document.getElementById('btn-publish-ticker');
const btnCancelTickerEdit = document.getElementById('btn-cancel-ticker-edit');
const tickerAdminList = document.getElementById('tickerAdminList');

// العناصر الجديدة لإدارة الأعضاء
const mainAdminOnlySection = document.getElementById('mainAdminOnlySection');
const addUserForm = document.getElementById('addUserForm');
const newMemberName = document.getElementById('newMemberName');
const newMemberUsername = document.getElementById('newMemberUsername');
const newMemberPassword = document.getElementById('newMemberPassword');

let isAdminLoggedIn = false;
let currentSelectedCategory = "all";
let currentLanguage = "ar";

btnLangAr.addEventListener('click', () => {
    btnLangAr.classList.add('active');
    btnLangEn.classList.remove('active');
    newsContainerAr.style.display = "flex";
    newsContainerEn.style.display = "none";
    currentLanguage = "ar";
    tickerWrapper.setAttribute('dir', 'rtl');
    tickerTitle.innerText = "عاجل";
    loadTickerNews();
});

btnLangEn.addEventListener('click', () => {
    btnLangEn.classList.add('active');
    btnLangAr.classList.remove('active');
    newsContainerEn.style.display = "flex";
    newsContainerAr.style.display = "none";
    currentLanguage = "en";
    tickerWrapper.setAttribute('dir', 'ltr');
    tickerTitle.innerText = "Breaking";
    loadTickerNews();
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
        loadTickerNews();
    }
});

closeLoginBtn.addEventListener('click', () => { loginModal.style.display = 'none'; });

// منطق التحقق المزدوج: أدمن رئيسي أو مستخدم سحابي
submitLoginBtn.addEventListener('click', async () => {
    const userVal = modalUsername.value.trim();
    const passVal = modalPassword.value.trim();

    if (!userVal || !passVal) {
        alert("الرجاء تعبئة كافة الحقول المطلوبة!");
        return;
    }

    // 1. فحص حساب الادمن الرئيسي المباشر
    if (userVal === "admin" && passVal === "admin123") {
        completeLoginSequence(true, "الأدمن الرئيسي");
        return;
    }

    // 2. فحص الحسابات من مجموعة المستخدمين المضافة في Firestore
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", userVal.toLowerCase()), where("password", "==", passVal));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const loggedInUser = querySnapshot.docs[0].data();
            completeLoginSequence(false, loggedInUser.name);
        } else {
            alert("خطأ: اسم المستخدم أو كلمة المرور المدخلة غير صحيحة!");
        }
    } catch (error) {
        console.error("Login verification failed: ", error);
        alert("حدث خطأ تقني أثناء محاولة الاستعلام، يرجى المحاولة لاحقاً.");
    }
});

function completeLoginSequence(isMainAdmin, nameToDisplay) {
    adminPanel.style.display = 'block';
    adminBtn.innerText = `خروج (${nameToDisplay})`;
    loginModal.style.display = 'none';
    isAdminLoggedIn = true;

    // إخفاء أو إظهار أدوات الإدارة الحساسة حسب الرتبة
    if (isMainAdmin) {
        mainAdminOnlySection.style.display = "block";
    } else {
        mainAdminOnlySection.style.display = "none";
    }

    alert(`مرحباً بك يا ${nameToDisplay}، تم الدخول بنجاح للموقع.`);
    loadNews();
    loadTickerNews();
}

// معالجة إضافة عضو جديد وحفظه سحابياً
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = newMemberName.value.trim();
    const username = newMemberUsername.value.trim().toLowerCase();
    const password = newMemberPassword.value.trim();

    if (username === "admin") {
        alert("لا يمكن حجز اسم المستخدم 'admin' لأنه مخصص للأدمن الرئيسي!");
        return;
    }

    try {
        // فحص مسبق لعدم تكرار اليوزر نيم
        const qCheck = query(collection(db, "users"), where("username", "==", username));
        const checkSnap = await getDocs(qCheck);

        if (!checkSnap.empty) {
            alert("اسم المستخدم هذا مأخوذ مسبقاً! يرجى اختيار اسم آخر.");
            return;
        }

        // الحفظ في كولكشن users
        await addDoc(collection(db, "users"), {
            name: name,
            username: username,
            password: password,
            timestamp: new Date()
        });

        alert(`تمت إضافة العضو بنجاح وتفعيل حسابه: ${name}`);
        addUserForm.reset();

    } catch (error) {
        console.error("Error adding member: ", error);
        alert("فشل في إضافة العضو الجديد.");
    }
});

function getYoutubeEmbedUrl(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

async function loadTickerNews() {
    try {
        const q = query(collection(db, "breaking_news"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        let tickerTitles = [];
        if (isAdminLoggedIn) tickerAdminList.innerHTML = "";
        
        querySnapshot.forEach((docSnap) => {
            const tickerData = docSnap.data();
            const id = docSnap.id;

            if (tickerData.language === currentLanguage) {
                tickerTitles.push(tickerData.text);
            }

            if (isAdminLoggedIn) {
                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid #ddd";
                tr.innerHTML = `
                    <td style="padding: 8px;">${tickerData.language === 'en' ? 'English' : 'العربية'}</td>
                    <td style="padding: 8px; word-break: break-all;">${tickerData.text}</td>
                    <td style="padding: 8px; text-align: center; white-space: nowrap;">
                        <button class="btn-ticker-edit" data-id="${id}" data-text="${tickerData.text}" data-lang="${tickerData.language}" style="background-color:#ff9800; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; margin-left:5px;">تعديل</button>
                        <button class="btn-ticker-delete" data-id="${id}" style="background-color:#f44336; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف</button>
                    </td>
                `;
                tickerAdminList.appendChild(tr);
            }
        });

        if (tickerTitles.length > 0) {
            const separator = currentLanguage === 'en' ? "   •   " : "   ◀   ";
            tickerText.innerText = tickerTitles.join(separator);
        } else {
            tickerText.innerText = currentLanguage === 'en' ? "No breaking news at the moment." : "لا توجد أخبار عاجلة حالياً.";
        }

        if (isAdminLoggedIn) {
            addTickerActionsListeners();
        }
    } catch (error) {
        console.error("Error loading ticker: ", error);
    }
}

function addTickerActionsListeners() {
    document.querySelectorAll('.btn-ticker-delete').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true)); 
    });
    document.querySelectorAll('.btn-ticker-edit').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });

    document.querySelectorAll('.btn-ticker-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("هل أنت متأكد من حذف هذا الخبر العاجل نهائياً؟")) {
                await deleteDoc(doc(db, "breaking_news", id));
                alert("تم حذف الخبر العاجل بنجاح!");
                loadTickerNews();
            }
        });
    });

    document.querySelectorAll('.btn-ticker-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const text = e.target.getAttribute('data-text');
            const lang = e.target.getAttribute('data-lang');

            editTickerId.value = id;
            tickerInputText.value = text;
            tickerLanguage.value = lang;

            document.getElementById('ticker-form-title').innerText = "تعديل الخبر العاجل الحالي";
            btnPublishTicker.innerText = "حفظ تعديل الخبر العاجل";
            btnCancelTickerEdit.style.display = "block";
        });
    });
}

btnCancelTickerEdit.addEventListener('click', () => { resetTickerForm(); });

function resetTickerForm() {
    tickerForm.reset();
    editTickerId.value = "";
    document.getElementById('ticker-form-title').innerText = "إدارة شريط الأخبار العاجلة";
    btnPublishTicker.innerText = "حفظ ونشر في شريط العاجل";
    btnCancelTickerEdit.style.display = "none";
}

tickerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editTickerId.value;
    const lang = tickerLanguage.value;
    const text = tickerInputText.value.trim();

    let tickerData = { language: lang, text: text };

    try {
        if (id) {
            await updateDoc(doc(db, "breaking_news", id), tickerData);
            alert("تم تحديث الخبر العاجل بنجاح!");
        } else {
            tickerData.timestamp = new Date();
            await addDoc(collection(db, "breaking_news"), tickerData);
            alert("تم نشر الخبر العاجل بنجاح!");
        }
        resetTickerForm();
        loadTickerNews();
    } catch (error) {
        console.error("Error saving ticker: ", error);
    }
});

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
        button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });

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
    const selectedFile = 