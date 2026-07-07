// التبديل بين الوضع الداكن والفاتح باستخدام LocalStorage
const darkModeToggle = document.getElementById('darkModeToggle');
const isDarkMode = localStorage.getItem('darkMode') === 'true';

if (isDarkMode) document.body.classList.add('dark-mode');

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// نظام الفلاتر (Category Filters) والتنقل الديناميكي
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // إزالة الكلاس من الجميع
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const category = e.target.getAttribute('data-filter');
        // هنا سيتم استدعاء الدالة الخاصة بجلب الأخبار من Firebase بناءً على القسم
        console.log("تم اختيار قسم:", category);
    });
});

// جلب حالة الطقس لفلسطين (باستخدام API مجاني - إحداثيات غزة/فلسطين)
async function fetchPalestineWeather() {
    try {
        // خط عرض وطول تقريبي لفلسطين/غزة
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=31.5&longitude=34.46&current_weather=true');
        const data = await res.json();
        document.getElementById('weatherInfo').innerHTML = `
            <p>درجة الحرارة: ${data.current_weather.temperature}°C</p>
            <p>سرعة الرياح: ${data.current_weather.windspeed} كم/س</p>
        `;
    } catch (error) {
        document.getElementById('weatherInfo').innerText = 'تعذر جلب الطقس.';
    }
}
fetchPalestineWeather();

// تحويل الواجهة للغة الإنجليزية
const langToggle = document.getElementById('langToggle');
let currentLang = 'ar';
langToggle.addEventListener('click', () => {
    if(currentLang === 'ar') {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.lang = 'en';
        document.body.style.fontFamily = "'Arial', sans-serif";
        // تغيير النصوص
        langToggle.innerHTML = '<i class="fas fa-language"></i> AR';
        currentLang = 'en';
    } else {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.lang = 'ar';
        document.body.style.fontFamily = "'Tajawal', sans-serif";
        langToggle.innerHTML = '<i class="fas fa-language"></i> EN';
        currentLang = 'ar';
    }
});
