document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded and DOM content loaded.');  // پیام آزمایشی

    const blogId = document.querySelector('#comments-container').getAttribute('data-blog-id');
    const commentsContainer = document.getElementById('comments-container');
    const commentForm = document.getElementById('comment-form');
    const commentBody = document.getElementById('comment-body');

    // بررسی اینکه آیا عناصر به درستی شناسایی شده‌اند یا نه
    console.log('blogId:', blogId);
    console.log('commentsContainer:', commentsContainer);
    console.log('commentForm:', commentForm);
    console.log('commentBody:', commentBody);

    // واکشی و نمایش کامنت‌ها
    fetch(`/api/blog/${blogId}/comments/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let commentsHTML = '';
            data.forEach(comment => {
                commentsHTML += `
                    <div class="comment">
                        <p class="comment-author">${comment.author}</p>
                        <p class="comment-body">${comment.body}</p>
                        <p class="comment-date">${new Date(comment.datetime_created).toLocaleDateString('fa-IR')}</p>
                    </div>
                    <hr>
                `;
            });
            commentsContainer.innerHTML = commentsHTML;
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
            commentsContainer.innerHTML = `<p class="text-danger">مشکلی در واکشی کامنت‌ها وجود دارد.</p>`;
        });

    // ارسال کامنت جدید
    if (commentForm) {
        commentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            fetch(`/api/blog/${blogId}/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({
                    author: "Anonymous",  // فرض کنید کاربر ناشناس است
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
                        <p class="comment-author">${data.author}</p>
                        <p class="comment-body">${data.body}</p>
                        <p class="comment-date">${new Date(data.datetime_created).toLocaleDateString('fa-IR')}</p>
                    </div>
                    <hr>
                `;
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
