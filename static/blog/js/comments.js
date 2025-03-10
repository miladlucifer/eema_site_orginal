document.addEventListener("DOMContentLoaded", function () {
    console.log('JavaScript loaded and DOM content loaded.');

    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) {
        console.log('No comments container found on this page.');
        return;
    }

    const blogSlug = commentsContainer.getAttribute('data-blog-slug');
    const commentForm = document.getElementById('comment-form');
    const commentBody = document.getElementById('comment-body');
    const alertContainer = document.getElementById('alert-container');
    let nextPageUrl = `/api/blog/${blogSlug}/comments/`;
    let isLoading = false;

    console.log('blogSlug:', blogSlug);
    console.log('commentsContainer:', commentsContainer);
    console.log('commentForm:', commentForm);
    console.log('commentBody:', commentBody);

    // بررسی وضعیت احراز هویت کاربر
    function checkAuthStatus() {
        fetch('/api/check-auth/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const isAuthenticated = data.isAuthenticated;
                // ذخیره وضعیت لاگین در localStorage
                localStorage.setItem('isAuthenticated', isAuthenticated);
                loadComments(isAuthenticated);
            })
            .catch(error => {
                console.error('Error checking auth status:', error);
                // اگر خطایی رخ داد، کاربر را لاگین‌نشده در نظر بگیرید
                localStorage.setItem('isAuthenticated', false);
                loadComments(false);
            });
    }

    // تابع renderComment برای نمایش کامنت‌ها
    function renderComment(comment, isAuthenticated) {
        const isAdmin = comment.is_staff; // استفاده از فیلد is_staff
        const adminClass = isAdmin ? 'admin-comment' : '';
        const hasReplies = comment.replies && comment.replies.length > 0;
        const repliesHTML = hasReplies ? comment.replies.map(reply => {
            if (reply.status === 'منتشر شده') {  // فقط ریپلای‌های تایید شده را نمایش دهید
                return renderComment(reply, isAuthenticated);
            }
            return '';
        }).join('') : '';

        return `
            <div class="comment ${adminClass}" data-comment-id="${comment.id}">
<div class="comment-header">
    <img src="${comment.author_avatar || '/media/blog/image_avatar/user.png'}" alt="${comment.author_name}" class="comment-avatar">
    <div class="comment-info">
        <h6 class="comment-author">${comment.author_name}</h6>
        <h6 class="comment-date">${new Date(comment.datetime_created).toLocaleDateString('fa-IR')}</h6>
    </div>
</div>
                <div class="comment-body">${comment.body}</div>
                <div class="comment-actions">
                    <button class="like-btn" data-comment-id="${comment.id}">❤️ ${comment.like_count || 0}</button>
                    <button class="dislike-btn" data-comment-id="${comment.id}">👎 ${comment.dislike_count || 0}</button>
                    ${isAuthenticated ? `<button class="reply-btn" data-comment-id="${comment.id}">پاسخ</button>` : ''}
                    ${hasReplies ? `<button class="toggle-replies-btn" data-comment-id="${comment.id}">نمایش پاسخ‌ها</button>` : ''}
                </div>
                ${hasReplies ? `<div class="replies" id="replies-${comment.id}">${repliesHTML}</div>` : ''}
            </div>
            <hr>
        `;
    }

    // مدیریت کلیک روی دکمه‌های پاسخ
    commentsContainer.addEventListener('click', function (event) {
        const replyBtn = event.target.closest('.reply-btn');
        const toggleRepliesBtn = event.target.closest('.toggle-replies-btn');

        if (replyBtn) {
            const commentId = replyBtn.getAttribute('data-comment-id');
            openReplyForm(commentId);
        }

        if (toggleRepliesBtn) {
            const commentId = toggleRepliesBtn.getAttribute('data-comment-id');
            const repliesContainer = document.getElementById(`replies-${commentId}`);
            repliesContainer.classList.toggle('show');
            if (repliesContainer.classList.contains('show')) {
                toggleRepliesBtn.textContent = 'مخفی کردن پاسخ‌ها';
            } else {
                toggleRepliesBtn.textContent = 'نمایش پاسخ‌ها';
            }
        }
    });

    // تابع openReplyForm برای نمایش فرم پاسخ
    function openReplyForm(commentId) {
        // مخفی کردن سایر فرم‌های پاسخ (اگر وجود دارند)
        const existingForms = document.querySelectorAll('.reply-form');
        existingForms.forEach(form => form.remove());

        // ایجاد فرم پاسخ
        const replyForm = document.createElement('form');
        replyForm.classList.add('reply-form');
        replyForm.innerHTML = `
            <textarea class="reply-body" placeholder="پاسخ خود را بنویسید..."></textarea>
            <button type="submit">ارسال پاسخ</button>
        `;

        // افزودن فرم به DOM
        const commentElement = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
        commentElement.appendChild(replyForm);

        // مدیریت ارسال پاسخ
        replyForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const replyBody = replyForm.querySelector('.reply-body').value;
            if (!replyBody.trim()) {
                alert('لطفاً متن پاسخ خود را وارد کنید.');
                return;
            }
            submitReply(commentId, replyBody);
        });
    }

    // تابع submitReply برای ارسال پاسخ
    function submitReply(commentId, replyBody) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch(`/api/blog/${blogSlug}/comments/${commentId}/reply/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                body: replyBody,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                alert('پاسخ شما ثبت شد و پس از بررسی به نمایش در خواهد آمد.');
                loadComments();
            })
            .catch(error => {
                console.error('Error submitting reply:', error);
                alert('مشکلی در ارسال پاسخ شما وجود دارد. لطفاً دوباره تلاش کنید.');
            });
    }

    let allCommentsLoaded = false; // برای بررسی اینکه آیا همه کامنت‌ها بارگذاری شده‌اند یا نه

    // تابع loadComments برای بارگذاری کامنت‌ها
    function loadComments(isAuthenticated) {
        if (!nextPageUrl || isLoading || allCommentsLoaded) return;

        isLoading = true;

        fetch(nextPageUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // بررسی ساختار داده‌ها
                if (!data || !Array.isArray(data)) {
                    throw new Error('داده‌های دریافتی نامعتبر هستند.');
                }

                let commentsHTML = '';
                const uniqueComments = new Set(); // استفاده از Set به جای آرایه

                // استفاده از وضعیت لاگین ذخیره‌شده در localStorage
                const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

                data.forEach(comment => {
                    if (comment.status === 'منتشر شده') {  // فقط کامنت‌های تایید شده را نمایش دهید
                        if (!uniqueComments.has(comment.id)) {  // اگر کامنت قبلاً نمایش داده نشده است
                            uniqueComments.add(comment.id);  // اضافه کردن `id` کامنت به Set
                            commentsHTML += renderComment(comment, isAuthenticated);
                        }
                    }
                });

                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = commentsHTML;
                commentsContainer.appendChild(tempContainer);

                // اگر دیگر صفحه‌ای برای بارگذاری وجود ندارد، `allCommentsLoaded` را `true` کنید
                if (!data.next) {
                    allCommentsLoaded = true;
                } else {
                    nextPageUrl = data.next; // اگر pagination وجود داشته باشد
                }
            })
            .catch(error => {
                console.error('Error fetching comments:', error);
                alertContainer.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        مشکلی در دریافت نظرات وجود دارد. لطفاً دوباره تلاش کنید.
                    </div>
                `;
            })
            .finally(() => {
                isLoading = false;
            });
    }

    // بارگذاری کامنت‌ها پس از بررسی وضعیت احراز هویت
    checkAuthStatus();

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            loadComments();
        }
    });

    if (commentForm) {
        commentForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            if (!commentBody.value.trim()) {
                alertContainer.innerHTML = `
                    <div class="alert alert-warning" role="alert">
                        لطفاً متن نظر خود را وارد کنید.
                    </div>
                `;
                return;
            }

            fetch(`/api/blog/${blogSlug}/comments/`, {
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
                    alertContainer.innerHTML = `
                        <div class="alert alert-success" role="alert">
                            نظر شما ثبت شد و پس از بررسی به نمایش در خواهد آمد.
                        </div>
                    `;
                    commentBody.value = '';
                    commentsContainer.innerHTML = renderComment(data) + commentsContainer.innerHTML; // اضافه کردن نظر جدید به بالای لیست
                })
                .catch(error => {
                    console.error('Error posting comment:', error);
                    alertContainer.innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            مشکلی در ارسال نظر شما وجود دارد. لطفاً دوباره تلاش کنید.
                        </div>
                    `;
                });
        });
    }

    // مدیریت لایک/دیس‌لایک
    commentsContainer.addEventListener('click', function (event) {
        const likeBtn = event.target.closest('.like-btn');
        const dislikeBtn = event.target.closest('.dislike-btn');

        if (likeBtn) {
            const commentId = likeBtn.getAttribute('data-comment-id');
            likeComment(commentId);
        }

        if (dislikeBtn) {
            const commentId = dislikeBtn.getAttribute('data-comment-id');
            dislikeComment(commentId);
        }
    });

    function likeComment(commentId) {
        fetch(`/api/blog/${blogSlug}/comments/${commentId}/like/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const likeBtn = document.querySelector(`.like-btn[data-comment-id="${commentId}"]`);
                const dislikeBtn = document.querySelector(`.dislike-btn[data-comment-id="${commentId}"]`);
                likeBtn.textContent = `❤️ ${data.like_count}`;
                dislikeBtn.textContent = `👎 ${data.dislike_count}`;
            })
            .catch(error => console.error('Error liking comment:', error));
    }

    function dislikeComment(commentId) {
        fetch(`/api/blog/${blogSlug}/comments/${commentId}/dislike/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const likeBtn = document.querySelector(`.like-btn[data-comment-id="${commentId}"]`);
                const dislikeBtn = document.querySelector(`.dislike-btn[data-comment-id="${commentId}"]`);
                likeBtn.textContent = `❤️ ${data.like_count}`;
                dislikeBtn.textContent = `👎 ${data.dislike_count}`;
            })
            .catch(error => console.error('Error disliking comment:', error));
    }
});