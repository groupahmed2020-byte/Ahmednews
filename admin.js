// محاكاة دور المستخدم (في بيئة العمل الحقيقية سيتم جلبها من الـ Backend)
// قم بتغيير القيمة إلى 'member' لاختبار واجهة الأعضاء العاديين
const currentUserRole = 'admin'; 

document.addEventListener('DOMContentLoaded', () => {
    const adminSection = document.getElementById('adminOnlySection');
    
    // إذا كان المستخدم أدمن، يتم إظهار قسم إضافة الأعضاء وتعديل حساباتهم وإدارة الإعلانات
    // الأعضاء العاديين لن يروا هذا القسم، وسيقتصر دورهم على إضافة/تعديل الأخبار
    if (currentUserRole === 'admin') {
        adminSection.style.display = 'block';
    } else {
        adminSection.style.display = 'none';
    }
});
