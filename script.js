// script.js
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. إدارة الوضع الداكن (Dark Mode) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
    }

    // --- 2. قائمة الجوال (Mobile Menu) ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if(mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // --- 3. جلب الأخبار من فايربيس وعرضها ديناميكياً ---
    const newsContainer = document.getElementById('news-container');
    const urgentTicker = document.getElementById('urgent-ticker');
    
    try {
        // الاستعلام عن الأخبار وترتيبها من الأحدث للأقدم
        const q = query(collection(db, "news"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        newsContainer.innerHTML = '';
        urgentTicker.innerHTML = '';
        let urgentNewsHTML = '';

        if(querySnapshot.empty) {
            newsContainer.innerHTML = '<p>لا توجد أخبار حالياً.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const news = doc.data();
                const id = doc.id; // هنا جلبنا المعرّف الفريد الخاص بالخبر من فايربيس

                // إذا كان الخبر عاجل، نضعه في شريط الأخبار العلوي
                if(news.status === 'عاجل') {
                    urgentNewsHTML += `<span>${news.title}</span><span> | </span>`;
                }

                // تعيين صورة افتراضية في حال لم يرفع الأدمن صورة للخبر
                const imgUrl = news.imageUrl || 'https://via.placeholder.com/400x250';
                
                // بناء بطاقة الخبر وإضافة زر "إظهار التفاصيل" مع تمرير الـ ID في الرابط
                newsContainer.innerHTML += `
                    <article class="news-card" data-category="${news.category}">
                        <img src="${imgUrl}" alt="صورة الخبر">
                        <div class="news-content">
                            <span class="category-badge">${news.category}</span>
                            <h3>${news.title}</h3>
                            <p>${news.content.substring(0, 100)}...</p>
                            
                            <a href="article.html?id=${id}" class="read-more-link" style="display: inline-block; margin-top: 15px; color: var(--primary-color); font-weight: bold;">
                                إظهار التفاصيل <i class="fas fa-arrow-left" style="font-size: 0.85rem; margin-right: 5px;"></i>
                            </a>
                        </div>
                    </article>
                `;
            });
        }
        
        // تشغيل شريط الأخبار العاجلة أو إظهار رسالة افتراضية
        urgentTicker.innerHTML = urgentNewsHTML !== '' ? urgentNewsHTML : '<span>لا توجد أخبار عاجلة حالياً</span>';

    } catch (error) {
        console.error("Error loading news: ", error);
        newsContainer.innerHTML = '<p>حدث خطأ أثناء تحميل الأخبار من قاعدة البيانات.</p>';
    }

    // --- 4. فلاتر الأقسام (Category Filters) ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetCategory = btn.getAttribute('data-filter');
            const newsCards = document.querySelectorAll('.news-card'); 
            
            newsCards.forEach(card => {
                if (targetCategory === 'all' || card.getAttribute('data-category') === targetCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
