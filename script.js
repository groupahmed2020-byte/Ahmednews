// script.js
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    
    // الوضع الداكن
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

    // قائمة الجوال
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if(mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // جلب الأخبار من فايربيس
    const newsContainer = document.getElementById('news-container');
    const urgentTicker = document.getElementById('urgent-ticker');
    
    try {
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
                if(news.status === 'عاجل') {
                    urgentNewsHTML += `<span>${news.title}</span><span> | </span>`;
                }
                const imgUrl = news.imageUrl || 'https://via.placeholder.com/400x250';
                newsContainer.innerHTML += `
                    <article class="news-card" data-category="${news.category}">
                        <img src="${imgUrl}" alt="صورة الخبر">
                        <div class="news-content">
                            <span class="category-badge">${news.category}</span>
                            <h3>${news.title}</h3>
                            <p>${news.content.substring(0, 80)}...</p>
                        </div>
                    </article>
                `;
            });
        }
        
        urgentTicker.innerHTML = urgentNewsHTML !== '' ? urgentNewsHTML : '<span>لا توجد أخبار عاجلة حالياً</span>';

    } catch (error) {
        console.error("Error loading news: ", error);
        newsContainer.innerHTML = '<p>تأكد من إعدادات الفايربيس ليتم عرض الأخبار هنا.</p>';
    }

    // الفلاتر
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
