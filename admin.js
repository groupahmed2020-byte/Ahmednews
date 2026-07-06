// admin.js
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // تسجيل الدخول والتنقل
    const loginForm = document.getElementById('login-form');
    const loginPortal = document.getElementById('login-portal');
    const dashboardLayout = document.getElementById('admin-dashboard');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            let userRole = (username.toLowerCase() === 'admin' || username.toLowerCase() === 'ahmad') ? 'admin' : 'editor';
            
            loginPortal.style.display = 'none';
            dashboardLayout.style.display = 'flex';
            document.body.classList.remove('admin-body');
            document.getElementById('current-user').innerText = `${username} (${userRole === 'admin' ? 'مدير' : 'محرر'})`;

            if (userRole === 'editor') {
                document.getElementById('users-nav-item').style.display = 'none';
            }
            loadAdminNews();
        });
    }

    const sidebarLinks = document.querySelectorAll('.admin-sidebar ul li a');
    const sections = document.querySelectorAll('.dashboard-section');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if(link.getAttribute('href') === 'index.html') return; 
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(sec => sec.style.display = 'none');
            
            const linkText = link.innerText.trim();
            document.getElementById('page-title').innerText = linkText;

            if(linkText.includes('إدارة الأخبار')) document.getElementById('section-news').style.display = 'block';
            else if (linkText.includes('إعدادات الحساب')) document.getElementById('section-settings').style.display = 'block';
            else if (linkText.includes('إدارة الأعضاء')) document.getElementById('section-users').style.display = 'block';
        });
    });

    // إضافة خبر
    const addNewsForm = document.getElementById('add-news-form');
    if(addNewsForm) {
        addNewsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('news-title').value;
            const content = document.getElementById('news-content').value;
            const imageUrl = document.getElementById('news-image').value;
            const category = document.getElementById('news-category').value;
            const status = document.getElementById('news-status').value;

            try {
                await addDoc(collection(db, "news"), {
                    title: title,
                    content: content,
                    imageUrl: imageUrl,
                    category: category,
                    status: status,
                    timestamp: serverTimestamp()
                });
                alert('تم نشر الخبر بنجاح!');
                addNewsForm.reset();
                loadAdminNews(); 
            } catch (error) {
                console.error("Error adding document: ", error);
                alert('تأكد من وضع بياناتك الصحيحة في ملف firebase-config.js');
            }
        });
    }

    // جلب وحذف الأخبار
    async function loadAdminNews() {
        const newsTableBody = document.querySelector('#news-table tbody');
        if(!newsTableBody) return;

        try {
            const q = query(collection(db, "news"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            newsTableBody.innerHTML = '';

            querySnapshot.forEach((docSnap) => {
                const news = docSnap.data();
                const id = docSnap.id;
                
                let statusBadgeClass = 'published';
                if(news.status === 'مسودة') statusBadgeClass = 'draft';
                if(news.status === 'عاجل') statusBadgeClass = 'urgent';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${news.title}</td>
                    <td>${news.category}</td>
                    <td><span class="status-badge ${statusBadgeClass}">${news.status}</span></td>
                    <td>
                        <button class="btn-icon delete" data-id="${id}" title="حذف"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                newsTableBody.appendChild(tr);
            });

            const deleteBtns = document.querySelectorAll('.delete');
            deleteBtns.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const docId = btn.getAttribute('data-id');
                    if(confirm('هل أنت متأكد من حذف هذا الخبر نهائياً؟')) {
                        await deleteDoc(doc(db, "news", docId));
                        loadAdminNews();
                    }
                });
            });

        } catch (error) {
            console.error("Error fetching news: ", error);
        }
    }
});
