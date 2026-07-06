// --- 1. إدارة الوضع الداكن (Dark Mode) وتأمين حفظ تفضيل المتصفح ---
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️ الوضع العادي' : '🌙 الوضع الداكن';
    });
}
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if(themeToggle) themeToggle.textContent = savedTheme === 'dark' ? '☀️ الوضع العادي' : '🌙 الوضع الداكن';


// --- 2. إنشاء قاعدة البيانات التجريبية الأولى للموقع الإخباري ---
if (!localStorage.getItem('news_posts')) {
    const defaultPosts = [
        { id: 1, title: "إطلاق المبادرات التنموية التكنولوجية في فلسطين لعام 2026", content: "تعلن الحواضن البرمجية المحلية عن فتح باب التسجيل لمشاريع ريادة الأعمال الشابة وتدريب الخريجين لتأسيس شركات ومواقع متكاملة تعتمد حلول الويب المتقدمة.", category: "local", status: "published", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", video: "", doc: "" },
        { id: 2, title: "دراسة شاملة حول الأثر الإرشادي والتربوي للبناء الأسري المستقر", content: "أصدر قسم البحوث دراسة متكاملة تبحث القواعد المنهجية للتوجيه والدعم النفسي المتقدم وتأثيرها المباشر في تعزيز تماسك الأسرة والمجتمع.", category: "research", status: "published", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173", video: "", doc: "https://example.com/research.pdf" }
    ];
    localStorage.setItem('news_posts', JSON.stringify(defaultPosts));
}

if (!localStorage.getItem('users_db')) {
    const defaultUsers = [
        { username: "admin", password: "123", role: "admin" },
        { username: "member1", password: "456", role: "member" }
    ];
    localStorage.setItem('users_db', JSON.stringify(defaultUsers));
}

// --- 3. قراءة وبناء الأخبار وعرض الاختصارات مع زر التفاصيل ---
function renderFrontendPosts(filterCategory = 'all') {
    const newsContainer = document.getElementById('news-container');
    const researchContainer = document.getElementById('research-container');
    const tickerElement = document.getElementById('breaking-news-ticker');
    const posts = JSON.parse(localStorage.getItem('news_posts')) || [];

    if (newsContainer) newsContainer.innerHTML = "";
    if (researchContainer) researchContainer.innerHTML = "";
    
    let breakingTitles = [];

    posts.forEach(post => {
        if (post.status === 'breaking') {
            breakingTitles.push(post.title);
        }

        const postCard = document.createElement('div');
        postCard.className = 'news-card';
        
        let mediaTag = post.img ? `<img src="${post.img}" alt="news">` : '';
        if (post.video) {
            mediaTag = `<video src="${post.video}" controls style="width:100%; height:200px; object-fit:cover;"></video>`;
        }

        let docTag = post.doc ? `<p style="padding: 0 15px;"><a href="${post.doc}" target="_blank">📄 استعراض المستند المرفق</a></p>` : '';

        // عرض جزء من التفاصيل متبوعاً بزر الدخول للخبر الكامل
        postCard.innerHTML = `
            ${mediaTag}
            <div class="news-card-body">
                <h4>${post.title}</h4>
                <p>${post.content.substring(0, 120)}...</p>
                ${docTag}
                <a href="#" class="news-details-btn" onclick="alert('تفاصيل الخبر الكاملة: \\n\\n${post.content}')">التفاصيل ←</a>
            </div>
        `;

        if (post.category === 'research' && researchContainer) {
            researchContainer.appendChild(postCard);
        } else if (post.category !== 'research' && newsContainer) {
            if (filterCategory === 'all' || post.category === filterCategory) {
                newsContainer.appendChild(postCard);
            }
        }
    });

    if (tickerElement && breakingTitles.length > 0) {
        tickerElement.textContent = breakingTitles.join("  |  🔥  |  ");
    }
}

// تشغيل الفلاتر اللحظية بدون إعادة تحميل
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        renderFrontendPosts(e.target.getAttribute('data-category'));
    });
});

renderFrontendPosts();

// حقن وعرض الإعلانات المستقلة
function applyLiveAds() {
    const localAdData = JSON.parse(localStorage.getItem('local_ad'));
    const sidebarAdBox = document.getElementById('local-sidebar-ad');
    if (sidebarAdBox && localAdData) {
        if (localAdData.type === 'image') {
            sidebarAdBox.innerHTML = `<img src="${localAdData.src}" style="width:100%; border-radius:5px;">`;
        } else {
            sidebarAdBox.innerHTML = `<video src="${localAdData.src}" controls style="width:100%; border-radius:5px;"></video>`;
        }
    }
    
    const adsenseCode = localStorage.getItem('adsense_code');
    const topAdsense = document.getElementById('top-adsense');
    if (topAdsense && adsenseCode) {
        topAdsense.innerHTML = adsenseCode;
    }
}
applyLiveAds();


// --- 4. معالجة النظام الإداري لجلسات الكادر والصلاحيات (Admin Control Room) ---
const loginForm = document.getElementById('login-form');
const sessionUser = JSON.parse(sessionStorage.getItem('active_session_user'));

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userIn = document.getElementById('login-username').value;
        const passIn = document.getElementById('login-password').value;
        const users = JSON.parse(localStorage.getItem('users_db'));

        const verified = users.find(u => u.username === userIn && u.password === passIn);
        if (verified) {
            sessionStorage.setItem('active_session_user', JSON.stringify(verified));
            location.reload();
        } else {
            document.getElementById('login-error').textContent = "خطأ في اسم المستخدم أو كلمة المرور السريعة!";
        }
    });
}

if (sessionUser) {
    const portal = document.getElementById('login-portal');
    const dashArea = document.getElementById('dashboard-area');
    if (portal) portal.classList.add('hidden');
    if (dashArea) dashArea.classList.remove('hidden');

    const roleDisplay = document.getElementById('user-role-display');
    const welcome = document.getElementById('welcome-message');
    if (roleDisplay) roleDisplay.textContent = sessionUser.role === 'admin' ? 'مدير عام النظام' : 'عضو محرر';
    if (welcome) welcome.textContent = `مرحباً، ${sessionUser.username}`;

    // إخفاء كتل المسؤولين تلقائياً إذا كان المسجل رتبته "عضو"
    if (sessionUser.role !== 'admin') {
        document.querySelectorAll('.admin-only-section').forEach(el => el.classList.add('hidden'));
    }

    const profUser = document.getElementById('profile-username');
    if (profUser) profUser.value = sessionUser.username;

    // تحديث البيانات الشخصية
    document.getElementById('profile-update-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        let users = JSON.parse(localStorage.getItem('users_db'));
        const newU = document.getElementById('profile-username').value;
        const newP = document.getElementById('profile-password').value;

        users = users.map(u => {
            if (u.username === sessionUser.username) {
                u.username = newU;
                u.password = newP;
            }
            return u;
        });
        localStorage.setItem('users_db', JSON.stringify(users));
        sessionStorage.setItem('active_session_user', JSON.stringify({ username: newU, role: sessionUser.role }));
        alert('تم تعديل حسابك بنجاح!');
        location.reload();
    });

    // إضافة عضو جديد للمسؤول فقط
    document.getElementById('add-member-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-member-username').value;
        const pass = document.getElementById('new-member-password').value;
        const role = document.getElementById('new-member-role').value;

        if(!name || !pass) return alert('الرجاء تعبئة كافة الحقول.');

        let users = JSON.parse(localStorage.getItem('users_db'));
        users.push({ username: name, password: pass, role: role });
        localStorage.setItem('users_db', JSON.stringify(users));
        alert('تمت إضافة الحساب الجديد.');
        buildMembersTable();
    });

    function buildMembersTable() {
        const tableBody = document.querySelector('#members-table tbody');
        if (!tableBody) return;
        const users = JSON.parse(localStorage.getItem('users_db')) || [];
        tableBody.innerHTML = "";

        users.forEach((u, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" value="${u.username}" id="table-u-${index}"></td>
                <td>${u.role}</td>
                <td>
                    <input type="password" placeholder="تعديل الرقم السري" id="table-p-${index}" style="width:120px; padding:3px;">
                    <button class="btn-submit" style="width:auto; padding:3px 10px;" onclick="updateAnyUser(${index})">حفظ</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
    
    window.updateAnyUser = function(idx) {
        let users = JSON.parse(localStorage.getItem('users_db'));
        const targetU = document.getElementById(`table-u-${idx}`).value;
        const targetP = document.getElementById(`table-p-${idx}`).value;

        users[idx].username = targetU;
        if (targetP) users[idx].password = targetP;

        localStorage.setItem('users_db', JSON.stringify(users));
        alert('تم تحديث بيانات العضو بنجاح.');
        buildMembersTable();
    }
    
    if (sessionUser.role === 'admin') buildMembersTable();

    // معالجة النشر ورفع الملفات المباشرة والمحاكاة الذكية للروابط
    document.getElementById('add-post-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const category = document.getElementById('post-category').value;
        const status = document.getElementById('post-status').value;

        let finalImg = document.getElementById('link-img').value;
        let finalVideo = document.getElementById('link-video').value;
        let finalDoc = document.getElementById('link-doc').value;

        const fileImg = document.getElementById('upload-img').files[0];
        const fileVideo = document.getElementById('upload-video').files[0];
        const fileDoc = document.getElementById('upload-doc').files[0];

        const proceedAndSave = () => {
            let posts = JSON.parse(localStorage.getItem('news_posts')) || [];
            posts.unshift({
                id: Date.now(),
                title, content, category, status,
                img: finalImg, video: finalVideo, doc: finalDoc
            });
            localStorage.setItem('news_posts', JSON.stringify(posts));
            alert('تم نشر وإدراج المحتوى بنجاح!');
            this.reset();
        };

        if (fileImg) {
            const reader = new FileReader();
            reader.onload = function(e) { finalImg = e.target.result; handleVideo(); }
            reader.readAsDataURL(fileImg);
        } else { handleVideo(); }

        function handleVideo() {
            if (fileVideo) {
                const reader = new FileReader();
                reader.onload = function(e) { finalVideo = e.target.result; handleDoc(); }
                reader.readAsDataURL(fileVideo);
            } else { handleDoc(); }
        }

        function handleDoc() {
            if (fileDoc) {
                const reader = new FileReader();
                reader.onload = function(e) { finalDoc = e.target.result; proceedAndSave(); }
                reader.readAsDataURL(fileDoc);
            } else { proceedAndSave(); }
        }
    });

    // حفظ وتحديث الإعلانات
    document.getElementById('save-adsense-btn')?.addEventListener('click', () => {
        const code = document.getElementById('adsense-code-input').value;
        localStorage.setItem('adsense_code', code);
        alert('تم تحديث أكواد Google AdSense للموقع.');
    });

    document.getElementById('save-local-ad-btn')?.addEventListener('click', () => {
        const type = document.getElementById('local-ad-type').value;
        const file = document.getElementById('local-ad-file').files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                localStorage.setItem('local_ad', JSON.stringify({ type: type, src: e.target.result }));
                alert('تم رفع وتثبيت الإعلان المحلي بنجاح!');
            }
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        sessionStorage.removeItem('active_session_user');
        location.reload();
    });
}
