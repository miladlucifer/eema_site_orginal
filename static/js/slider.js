document.addEventListener('DOMContentLoaded', function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    // نمایش اسلاید فعلی
    function showSlide(index) {

        // مخفی کردن همه اسلایدها
        slides.forEach((slide) => {
            slide.classList.remove('active');
        });
        // نمایش اسلاید فعلی
        if (slides[index]) {
            slides[index].classList.add('active');
        }

        // به‌روزرسانی نقاط نشان‌دهنده
        dots.forEach((dot) => {
            dot.classList.remove('active');
        });
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }

    // رفتن به اسلاید بعدی
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // رفتن به اسلاید قبلی
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    // رفتن به اسلاید خاص
    function goToSlide(index) {
        currentSlide = index;
        showSlide(currentSlide);
    }

    // تغییر خودکار اسلایدها هر ۵ ثانیه
    setInterval(nextSlide, 5000);

    // نمایش اولین اسلاید هنگام بارگذاری صفحه
    showSlide(currentSlide);
});

   function goToSlide(index) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');

        // مخفی کردن همه اسلایدها
        slides.forEach((slide) => {
            slide.classList.remove('active');
        });

        // نمایش اسلاید فعلی
        if (slides[index]) {
            slides[index].classList.add('active');
        }

        // غیرفعال کردن همه نقاط
        dots.forEach((dot) => {
            dot.classList.remove('active');
        });

        // فعال کردن نقطه فعلی
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }