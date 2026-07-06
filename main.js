const newsData = [
    { id: 1, title: "تحليل سياسي موسع حول التطورات الإقليمية الأخيرة", category: "politics", summary: "يقدم الخبراء نظرة عميقة حول السيناريوهات المتوقعة لملف المنطقة لعام 2026..." },
    { id: 2, title: "قفزة جديدة في أسعار الذهب والأسواق العالمية تتأثر فوراً", category: "economy", summary: "شهدت الأسواق هذا الصباح ارتفاعاً ملحوظاً مدفوعاً ببيانات التضخم وسعر صرف العملات الأجنبية..." },
    { id: 3, title: "موقع أحمد الإخباري يطلق واجهته البرمجية الحديثة بالكامل لتجربة أسرع", category: "tech", summary: "باعتماد تقنيات الـ Grid والـ Modular JavaScript تم تحسين سرعة التصفح بمقدار الضعف لتوفير استهلاك البيانات..." },
    { id: 4, title: "بلدية المدينة تطلق حملة كبرى لتشجير الأحياء السكنية والمناطق المحلية", category: "local", summary: "بهدف تحسين جودة الحياة والبيئة المحلية، انطلقت المبادرة بمشاركة مجتمعية واسعة من المتطوعين..." },
    { id: 5, title: "دراسة بحثية جديدة تكشف أسرار كفاءة الأنظمة السحابية المعززة", category: "research", summary: "نشر قسم التطوير والبحث ورقة علمية مخصصة لتحسين وسائط النقل والبيانات العشوائية وحلول التخزين الذكية..." }
];

const urgentNews = "🔴 عاجل: إطلاق البث التجريبي والميزات الحصرية الكاملة لـ (موقع أحمد الإخباري - Ahmad News) بنجاح تـام.";

document.addEventListener("DOMContentLoaded", () => {
    
    // تشغيل شريط العاجل
    const tickerElement = document.getElementById("urgent-ticker");
    if (tickerElement) {
        tickerElement.innerText = urgentNews;
    }

    // عرض الأخبار لأول مرة
    renderNews("all");

    // تفعيل فلاتر الأقسام
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            const selectedCategory = e.target.getAttribute("data-category");
            renderNews(selectedCategory);
        });
    });

    // تبديل الوضع الداكن
    const themeToggleBtn = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        if(themeToggleBtn) themeToggleBtn.innerText = "☀️ الوضع الفاتح";
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            let theme = document.documentElement.getAttribute("data-theme");
            if (theme === "dark") {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("theme", "light");
                themeToggleBtn.innerText = "🌙 الوضع الداكن";
            } else {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("theme", "dark");
                themeToggleBtn.innerText = "☀️ الوضع الفاتح";
            }
        });
    }
});

function renderNews(category) {
    const container = document.getElementById("news-container");
    if (!container) return;
    
    container.innerHTML = "";

    const filteredNews = category === "all" ? newsData : newsData.filter(item => item.category === category);

    if (filteredNews.length === 0) {
        container.innerHTML = "<p style='padding: 20px;'>لا توجد أخبار متوفرة في هذا القسم حالياً.</p>";
        return;
    }

    filteredNews.forEach(news => {
        const card = document.createElement("div");
        card.className = "news-card";
        card.innerHTML = `
            <div class="news-card-content">
                <span class="category-badge">${news.category.toUpperCase()}</span>
                <h3 style="margin: 10px 0; font-size: 1.2rem;">${news.title}</h3>
                <p style="font-size: 0.95rem; opacity: 0.85; line-height: 1.5;">${news.summary}</p>
            </div>
        `;
        container.appendChild(card);
    });
}
