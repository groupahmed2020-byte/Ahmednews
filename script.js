// بيانات تجريبية أولية للموقع لدعم الأقسام المختلفة والقسم الإنجليزي
let initialArticles = [
    { id: 1, title: "تحليل اقتصادي: نمو السوق الرقمي وأثره على المشاريع الناشئة", category: "economy", content: "تشهد الأسواق الرقمية طفرة غير مسبوقة مدفوعة بالحلول التقنية المتكاملة...", type: "featured" },
    { id: 2, title: "الذكاء الاصطناعي يغير مفاهيم تطوير تطبيقات الويب في 2026", category: "tech", content: "التقنيات الحديثة تتيح للمطورين بناء واجهات معقدة بسرعة وكفاءة أعلى.", type: "standard" },
    { id: 3, title: "تطوير البنية التحتية والمرافق العامة في البلدية", category: "local", content: "أعلنت الجهات المحلية عن بدء خطة تطوير شاملة للطرق وشبكات الإنارة.", type: "standard" },
    { id: 4, title: "مستجدات الحوار الدبلوماسي الإقليمي لبحث الاستقرار", category: "politics", content: "انطلاق جولة جديدة من المباحثات لبحث سبل تعزيز الاستقرار التجاري والأمني.", type: "standard" },
    { id: 5, title: "Tech Innovation: How Full-Stack Frameworks Shape the Future", category: "english", content: "Modern web standards enable developers to create faster, more modular desktop and mobile ecosystems seamlessly.", type: "english" },
    { id: 6, title: "Global Market Trends and Economic Transitions in 2026", category: "english", content: "Financial experts monitor global shifts as green energy and smart systems take over structural investments.", type: "english" }
];

// التحقق من وجود بيانات سابقة في متصفح المستخدم أو اعتماد البيانات الأولية
if (!localStorage.getItem('ahmad_news_articles')) {
    localStorage.setItem('ahmad_news_articles', JSON.stringify(initialArticles));
}

let articles = JSON.parse(localStorage.getItem('ahmad_news_articles'));
let isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderFrontendNews();
    renderEnglishNews();
    renderAdminTable();
    
    // التحقق من حالة الجلسة عند التحميل لإظهار القسم المناسب
    if (isLoggedIn) {
        switchMainSection('admin');
    }
});

// ================= 1. إدارة الوضع الداكن (Dark Mode) =================
function initTheme() {
    const themeToggle = document.getElementById("themeToggle");
    const currentTheme = localStorage.getItem("theme") || "light";
    
    if (currentTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggle.textContent = "☀️";
    }

    themeToggle.addEventListener("click", () => {
        let theme = document.documentElement.getAttribute("data-theme");
        if (theme === "dark") {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙";
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "☀️";
        }
    });
}

// ================= 2. التنقل بين الواجهات الأساسية =================
function switchMainSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.main-section').forEach(sec => sec.classList.remove('active-section'));
    // إزالة الصفة النشطة من أزرار الهيدر
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // إظهار القسم المطلوب وحماية لوحة التحكم
    if (sectionId === 'admin' && !isLoggedIn) {
        document.getElementById('loginSection').classList.add('active-section');
    } else {
        document.getElementById(`${sectionId}Section`).classList.add('active-section');
    }
}

// ================= 3. عرض الفلاتر والأخبار في الواجهة الأمامية =================
function renderFrontendNews() {
    const featuredContainer = document.getElementById('featuredContainer');
    const articlesContainer = document.getElementById('articlesContainer');
    
    // جلب المقالات العربية فقط للرئيسية
    const arabicArticles = articles.filter(art => art.category !== 'english');
    const featured = arabicArticles.find(art => art.type === 'featured') || arabicArticles[0];
    
    // عرض الخبر المميز
    if (featured) {
        featuredContainer.innerHTML = `
            <div class="featured-card">
                <div class="featured-img-placeholder">موقع أحمد الإخباري - صورة الخبر الرئيسية</div>
                <div class="featured-content">
                    <span class="badge">${getCategoryName(featured.category)}</span>
                    <h2>${featured.title}</h2>
                    <p>${featured.content}</p>
                </div>
            </div>
        `;
    }

    // عرض الأخبار الأخرى بالكامل مبدئياً
    filterArticles('all');
}

function filterArticles(category) {
    // تعديل كلاس الزر النشط في الفلتر
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event?.target?.classList?.add('active');

    const articlesContainer = document.getElementById('articlesContainer');
    articlesContainer.innerHTML = '';

    // تصفية المحتوى بناء على القسم المحدد
    let filtered = articles.filter(art => art.category !== 'english');
    if (category !== 'all') {
        filtered = filtered.filter(art => art.category === category);
    }

    filtered.forEach(art => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            <span class="badge">${getCategoryName(art.category)}</span>
            <h4>${art.title}</h4>
            <p>${art.content.substring(0, 100)}...</p>
        `;
        articlesContainer.appendChild(card);
    });
}

// عرض الأخبار الإنجليزية
function renderEnglishNews() {
    const container = document.getElementById('englishArticlesContainer');
    container.innerHTML = '';
    
    const englishArticles = articles.filter(art => art.category === 'english');
    englishArticles.forEach(art => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            <span class="badge" style="background:#4a5568;">International</span>
            <h4>${art.title}</h4>
            <p>${art.content}</p>
        `;
        container.appendChild(card);
    });
}

function getCategoryName(key) {
    const cats = { politics: 'سياسة', economy: 'اقتصاد', tech: 'تكنولوجيا', local: 'محليات' };
    return cats[key] || key;
}

// ================= 4. نظام تسجيل الدخول المبسط والمباشر =================
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    // تسجيل دخول تقليدي مباشر وسريع (بدون تعقيدات التحقق المرئي)
    if (user === "admin" && pass === "admin123") {
        isLoggedIn = true;
        localStorage.setItem('admin_logged_in', 'true');
        errorMsg.textContent = "";
        document.getElementById('loginForm').reset();
        switchMainSection('admin');
    } else {
        errorMsg.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة!";
    }
}

function handleLogout() {
    isLoggedIn = false;
    localStorage.removeItem('admin_logged_in');
    switchMainSection('home');
}

// ================= 5. عمليات لوحة تحكم المسؤول (إضافة وحذف) =================
function createNewArticle(e) {
    e.preventDefault();
    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value;
    const status = document.getElementById('postStatus').value;

    const newArt = {
        id: Date.now(),
        title: title,
        category: category,
        content: content,
        type: status === 'urgent' ? 'featured' : 'standard'
    };

    articles.unshift(newArt);
    localStorage.setItem('ahmad_news_articles', JSON.stringify(articles));
    
    // تحديث الواجهات فوراً
    renderFrontendNews();
    renderAdminTable();
    document.getElementById('addArticleForm').reset();
    alert('تم نشر وتحديث المحتوى بنجاح!');
}

function deleteArticle(id) {
    if(confirm('هل أنت متأكد من حذف هذا الخبر نهائياً؟')) {
        articles = articles.filter(art => art.id !== id);
        localStorage.setItem('ahmad_news_articles', JSON.stringify(articles));
        renderFrontendNews();
        renderAdminTable();
    }
}

function renderAdminTable() {
    const tbody = document.getElementById('adminArticlesTable');
    tbody.innerHTML = '';

    articles.forEach(art => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${art.title.substring(0, 40)}...</strong></td>
            <td>${getCategoryName(art.category)}</td>
            <td><span class="badge">${art.type === 'featured' ? 'مميز/عاجل' : 'عادي'}</span></td>
            <td><button class="btn-danger" onclick="deleteArticle(${art.id})">حذف</button></td>
        `;
        tbody.appendChild(tr);
    });
}
