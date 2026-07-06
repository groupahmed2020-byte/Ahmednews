// إدارة الوضع الداكن
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// التحقق من التفضيل المحفوظ
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    darkModeToggle.innerText = '☀️ وضع مضيء';
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        darkModeToggle.innerText = '☀️ وضع مضيء';
    } else {
        localStorage.setItem('theme', 'light');
        darkModeToggle.innerText = '🌙 وضع داكن';
    }
});

// فلترة الأخبار ديناميكياً بدون إعادة تحميل
function filterNews(category) {
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}
