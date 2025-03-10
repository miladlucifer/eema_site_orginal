let page = 0; // شروع از صفحه‌ی 0
let loading = false;
let hasNext = true;

// ایجاد Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !loading && hasNext) {
            page++;
            loadMorePosts();
        }
    });
}, {
    threshold: 0.1 // وقتی ۱۰٪ المان وارد viewport شد، عمل کن
});

// المان Sentinel (نشانگر) برای تشخیص رسیدن به انتهای صفحه
const sentinel = document.createElement('div');
document.body.appendChild(sentinel);
observer.observe(sentinel);

// تابع برای بارگذاری پست‌های بیشتر
function loadMorePosts() {
    if (loading || !hasNext) return; // اگر در حال بارگذاری هست یا صفحه‌ی بعدی وجود نداره، کاری نکن
    loading = true;

    // نمایش اسپینر در حال بارگذاری
    document.getElementById('loading').style.display = 'block';

    fetch(`/api/blog/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            if (data.results && Array.isArray(data.results)) { // بررسی وجود data.results
                data.results.forEach(post => {
                    document.getElementById('blog-posts').innerHTML += `
                        <div class="col-md-6">
                            <div class="card blog-card">
                                ${post.image ? `<img src="${post.image}" class="card-img-top" alt="${post.title}">` : ''}
                                <div class="card-body">
                                    <h3 class="card-title">${post.title}</h3>
                                    <p class="card-text text-muted small">نویسنده: ${post.author_name} - تاریخ: ${new Date(post.datetime_created).toLocaleDateString('fa-IR')}</p>
                                    <p class="card-text">${limitWords(post.short_body, 50)}</p>
                                    <p class="card-text"><strong>دسته‌بندی‌ها:</strong> ${post.category_display ? post.category_display.map(category => category.title).join(', ') : 'بدون دسته‌بندی'}</p>
                                </div>
                                <div class="card-footer text-right">
                                    <a href="/blog/${post.slug}/" class="btn btn-primary">ادامه مطلب</a>
                                </div>
                            </div>
                        </div>
                    `;
                });

                // مخفی کردن اسپینر بعد از بارگذاری
                document.getElementById('loading').style.display = 'none';

                loading = false;
                hasNext = !!data.next; // بررسی وجود صفحه‌ی بعدی
            } else {
                console.error('Invalid data structure:', data);
            }
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            document.getElementById('loading').style.display = 'none';
            loading = false;
        });
}


// تابع برای محدود کردن تعداد کلمات
function limitWords(text, maxWords) {
    let words = text.split(/\s+/);
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
}