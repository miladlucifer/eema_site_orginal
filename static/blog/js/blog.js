function convertToPersianNumbers() {
    const persianNumbers = {
        '0': '۰',
        '1': '۱',
        '2': '۲',
        '3': '۳',
        '4': '۴',
        '5': '۵',
        '6': '۶',
        '7': '۷',
        '8': '۸',
        '9': '۹'
    };

    function traverseAndConvert(node) {
        if (node.nodeType === 3) {
            node.nodeValue = node.nodeValue.replace(/[0-9]/g, function (w) {
                return persianNumbers[w] || w;
            });
        } else {
            for (let i = 0; i < node.childNodes.length; i++) {
                traverseAndConvert(node.childNodes[i]);
            }
        }
    }

    traverseAndConvert(document.body);
}

// بارگذاری محتوای وبلاگ با استفاده از جاوااسکریپت

let page = 1;
let loading = false;
let hasNext = true;

document.addEventListener("DOMContentLoaded", function () {
    loadBlogPosts();
    window.addEventListener('scroll', function () {
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 100 && !loading && hasNext) {
            page++;
            loadBlogPosts();
        }
    });

    // تنظیمات اولیه برای فرم ارسال کامنت
    const commentForm = document.getElementById('comment-form');
    const commentBody = document.getElementById('comment-body');

    if (commentForm) {
        commentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const blogId = commentForm.getAttribute('data-blog-id');
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            fetch(`/api/blog/${blogId}/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({
                    body: commentBody.value,
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // اضافه کردن کامنت جدید به لیست کامنت‌ها
                let newComment = `
                    <div class="comment">
                        <p class="comment-author">${data.author_name}</p>
                        <p class="comment-body">${data.body}</p>
                        <p class="comment-date">${new Date(data.datetime_created).toLocaleDateString('fa-IR')}</p>
                    </div>
                    <hr>
                `;
                const commentsContainer = document.getElementById(`comments-container-${blogId}`);
                commentsContainer.innerHTML += newComment;
                commentBody.value = ''; // پاک کردن محتوای فیلد کامنت
            })
            .catch(error => {
                console.error('Error posting comment:', error);
                alert("مشکلی در ارسال کامنت وجود دارد.");
            });
        });
    }
});

function loadBlogPosts() {
    $.ajax({
        url: `/api/blog/?page=${page}`,  // استفاده از شماره صفحه
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (data) {
            console.log("Received data:", data); // بررسی داده‌های دریافتی
            let blogPostsHTML = "";
            data.results.forEach(post => {
                console.log("Processing post:", post); // بررسی داده‌های هر پست

                // اطمینان از دریافت دسته‌بندی‌ها
                let categories = post.category_display && post.category_display.length > 0 ? post.category_display.map(category => category.title).join(', ') : 'بدون دسته‌بندی';
                console.log("Categories for post:", categories); // لاگ کردن دسته‌بندی‌های هر پست

                blogPostsHTML += `
                    <div class="col-md-6">
                        <div class="card blog-card">
                            ${post.image ? `<img src="${post.image}" class="card-img-top" alt="${post.title}">` : ''}
                            <div class="card-body">
                                <h3 class="card-title">${post.title}</h3>
                                <p class="card-text text-muted small">نویسنده: ${post.author_name} - تاریخ: ${new Date(post.datetime_created).toLocaleDateString('fa-IR')}</p>
                                <p class="card-text">${limitWords(post.short_body, 50)}</p>
                                <p class="card-text"><strong>دسته‌بندی‌ها:</strong> ${categories ? categories : 'بدون دسته‌بندی'}</p>
                            </div>
                            <div class="card-footer text-right">
                                <a href="/blog/${post.slug}/" class="btn btn-primary">ادامه مطلب</a>  <!-- استفاده از slug -->
                            </div>
                            <div id="comments-container-${post.id}" class="comments-section mt-5" data-blog-id="${post.id}">
                                <h3>کامنت‌ها</h3>
                                
                            </div>
                        </div>
                    </div>
                `;
            });

            if (page === 1) {
                document.getElementById("blog-posts").innerHTML = blogPostsHTML; // جایگزین کردن محتوای قبلی با محتوای جدید
            } else {
                document.getElementById("blog-posts").innerHTML += blogPostsHTML; // اضافه کردن محتوای جدید به محتوای قبلی
            }

            convertToPersianNumbers(); // تبدیل اعداد به فارسی
            hasNext = !!data.next; // بررسی وجود صفحه بعدی
            loading = false; // تنظیم وضعیت بارگذاری به false

            // بارگذاری کامنت‌ها برای هر پست
            data.results.forEach(post => {
                loadComments(post.id);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error loading blog posts:", status, error);
            loading = false; // تنظیم وضعیت بارگذاری به false در صورت بروز خطا
        }
    });
}

function loadComments(blogId) {
    let nextPageUrl = `/api/blog/${blogId}/comments/`;
    const commentsContainer = document.getElementById(`comments-container-${blogId}`);

    function fetchComments() {
        if (!nextPageUrl) return;

        fetch(nextPageUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                let commentsHTML = '';
                data.results.forEach(comment => {
                    commentsHTML += `
                        <div class="comment">
                            <p class="comment-author">${comment.author_name}</p>
                            <p class="comment-body">${comment.body}</p>
                            <p class="comment-date">${new Date(comment.datetime_created).toLocaleDateString('fa-IR')}</p>
                        </div>
                        <hr>
                    `;
                });
                commentsContainer.innerHTML += commentsHTML;
                nextPageUrl = data.next;
            })
            .catch(error => {
                console.error('Error fetching comments:', error);
            });
    }

    // بارگذاری اولیه کامنت‌ها
    fetchComments();

    // بارگذاری تدریجی کامنت‌ها هنگام اسکرول کردن
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            fetchComments();
        }
    });
}

function limitWords(text, maxWords) {
    let words = text.split(/\s+/);
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
}
