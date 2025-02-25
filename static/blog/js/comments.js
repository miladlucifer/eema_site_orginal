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
    const alertContainer = document.getElementById('alert-container');  // محل نمایش پیام بوت استرپ
    let nextPageUrl = `/api/blog/${blogSlug}/comments/`;

    // بررسی اینکه آیا عناصر به درستی شناسایی شده‌اند یا نه
    console.log('blogSlug:', blogSlug);
    console.log('commentsContainer:', commentsContainer);
    console.log('commentForm:', commentForm);
    console.log('commentBody:', commentBody);

    // واکشی و نمایش کامنت‌ها
    function loadComments() {
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
    loadComments();

    // بارگذاری تدریجی کامنت‌ها هنگام اسکرول کردن
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            loadComments();
        }
    });

    // ارسال کامنت جدید
    if (commentForm) {
        commentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

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
                // نمایش پیام بوت استرپ
                alertContainer.innerHTML = `
                    <div class="alert alert-success" role="alert">
                        نظر شما ثبت شد و پس از بررسی به نمایش در خواهد آمد.
                    </div>
                `;
                // پاک کردن محتوای فیلد کامنت
                commentBody.value = '';
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
});
