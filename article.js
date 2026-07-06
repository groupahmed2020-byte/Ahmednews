// article.js
import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    // تفعيل المظهر الداكن التلقائي حسب اختيار المستخدم المحفوظ
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // جلب معرف المقال (ID) من الرابط العلوي
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) {
        document.getElementById('article-content').innerText = "لم يتم العثور على معرف المقال الصحيح.";
        return;
    }

    try {
        // الاتصال بمستند الخبر المحدد في فايربيس
        const docRef = doc(db, "news", articleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const news = docSnap.data();
            
            // تعبئة البيانات في الصفحة
            document.title = `${news.title} | أحمد الأخباري`;
            document.getElementById('article-title').innerText = news.title;
            document.getElementById('article-category').innerText = news.category;
            document.getElementById('article-content').innerText = news.content;

            // إظهار الصورة إذا كانت موجودة
            const imgElement = document.getElementById('article-image');
            if (news.imageUrl) {
                imgElement.src = news.imageUrl;
                imgElement.style.display = 'block';
            }
        } else {
            document.getElementById('article-content').innerText = "عذراً، هذا المقال غير موجود أو تم حذفه.";
        }
    } catch (error) {
        console.error("Error loading article:", error);
        document.getElementById('article-content').innerText = "حدث خطأ أثناء تحميل المقال الكامل.";
    }
});
