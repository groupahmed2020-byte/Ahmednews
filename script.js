document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. إدارة الوضع الداكن (Dark Mode) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    // تفعيل المظهر المحفوظ مسبقاً
    if (currentTheme === 'dark') {
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

    // --- 2. القائمة الخاصة بالجوال (Mobile Menu) ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if(mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- 3. نظام فلترة الأخبار بدون إعادة تحميل الصفحة ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // إزالة الكلاس النشط من الجميع وإضافته للزر المضغوط
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetCategory = btn.getAttribute('data-filter');

            // فرز البطاقات
            newsCards.forEach(card => {
                if (targetCategory === 'all' || card.getAttribute('data-category') === targetCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // --- 4. محاكاة تسجيل دخول الإدارة وصلاحيات الأعضاء ---
    const loginForm = document.getElementById('login-form');
    const loginPortal = document.getElementById('login-portal');
    const dashboardLayout = document.getElementById('admin-dashboard');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            
            // محاكاة صلاحيات الإدارة (للتطبيق الفعلي سيتم التحقق عبر Backend)
            let userRole = 'editor'; // افتراضي
            if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'ahmad') {
                userRole = 'admin';
            }

            // إخفاء تسجيل الدخول وإظهار لوحة التحكم
            loginPortal.style.display = 'none';
            dashboardLayout.style.display = 'flex';
            document.body.classList.remove('admin-body'); // لإلغاء التوسيط الخاص بتسجيل الدخول
            
            document.getElementById('current-user').innerText = `${username} (${userRole === 'admin' ? 'مدير' : 'محرر'})`;

            // تطبيق قاعدة الصلاحيات: المحرر لا يمكنه إضافة أعضاء جدد
            if (userRole === 'editor') {
                document.getElementById('users-nav-item').style.display = 'none';
                document.getElementById('users-management').style.display = 'none';
            }
        });
    }

    // --- 5. أزرار التعديل والحذف (محاكاة) ---
    const deleteBtns = document.querySelectorAll('.btn-icon.delete');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if(confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
                this.closest('tr').remove();
            }
        });
    });
});
