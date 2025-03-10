function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !settings.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function loadUsers(page = 1) {
    $.ajax({
        url: `/panels/api/users/?page=${page}`,
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (data) {
            console.log("Received data:", data);

            if (!data.results) {
                console.error("Error: data.results is undefined");
                return;
            }

            let usersHTML = `<table class="table table-hover table-striped mt-4">
                    <thead class="thead-dark">
                        <tr class="text-center">
                            <th scope="col">ایمیل</th>
                            <th scope="col">نام کامل</th>
                            <th scope="col">تاریخ ثبت نام</th>
                            <th scope="col">شماره تلفن</th>
                        </tr>
                    </thead>
                    <tbody>`;
            data.results.forEach(user => {
                usersHTML += `<tr class="text-center">
                    <td>${user.email}</td>
                    <td>${user.first_name} ${user.last_name}</td>
                    <td>${new Date(user.date_joined).toLocaleDateString('fa-IR')}</td>
                    <td>${user.phone_number}</td>
                    
                  </tr>`;

            });

            usersHTML += `</tbody></table>`;

            let paginationHTML = `
            <div class="d-flex justify-content-between">`;
            if (data.previous) {
                paginationHTML += `<button class="btn btn-secondary" onclick="loadUsers(${page - 1})"${!data.previous ? ' disabled' : ''}>قبلی</button>`;
            }
            if (data.next) {
                paginationHTML += `<button class="btn btn-secondary" onclick="loadUsers(${page + 1})"${!data.next ? ' disabled' : ''}>بعدی</button>`;
            }
            paginationHTML += `</div>`;


            $('#panel-content').html(usersHTML + paginationHTML);

            convertToPersianNumbers();
        },
        error: function (xhr, status, error) {
            console.log("Error status:", status);
            console.log("Error details:", error);
            console.log("Response text:", xhr.responseText);
        }

    });
}


function loadPosts(page = 1) {
    $.ajax({
        url: `/api/blog/?page=${page}`,
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (data) {
            console.log("Received data:", data);

            if (!data.results) {
                console.error("Error: data.results is undefined");
                return;
            }

            let postsHTML = `<button class="btn-custom btn-info" onclick="createPostForm()">ایجاد پست جدید</button>

<table class="table table-hover table-striped mt-4">
                    <thead class="thead-dark text-center">
                        <tr>
                            <th scope="col">عنوان</th>
                            <th scope="col">نویسنده</th>
                            <th scope="col">تاریخ ایجاد</th>
                            <th scope="col">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>`;
            data.results.forEach(post => {
                postsHTML += `<tr class="text-center">
                    <td>${post.title}</td>
                    <td>${post.author_name}</td>
                    <td>${new Date(post.datetime_created).toLocaleDateString('fa-IR')}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewPost('${post.slug}')">مشاهده</button> <!-- استفاده از 'post.slug' با گیومه -->
                        <button class="btn btn-sm btn-warning" onclick="editPost('${post.slug}')">ویرایش</button> <!-- استفاده از 'post.slug' با گیومه -->
                        <button class="btn btn-sm btn-danger" onclick="deletePost('${post.slug}')">حذف</button> <!-- استفاده از 'post.slug' با گیومه -->
                    </td>
                  </tr>`;
            });
            postsHTML += `</tbody></table>`;

            let paginationHTML = `<div class="d-flex justify-content-between">`;
            if (data.previous) {
                paginationHTML += `<button class="btn btn-secondary" onclick="loadPosts(${page - 1})"${!data.previous ? ' disabled' : ''}>قبلی</button>`;
            }
            if (data.next) {
                paginationHTML += `<button class="btn btn-secondary" onclick="loadPosts(${page + 1})"${!data.next ? ' disabled' : ''}>بعدی</button>`;
            }
            paginationHTML += `</div>`;

            $('#panel-content').html(postsHTML + paginationHTML);

            convertToPersianNumbers();
        },
        error: function (xhr, status, error) {
            console.log("Error status:", status);
            console.log("Error details:", error);
            console.log("Response text:", xhr.responseText);
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript loaded."); // برای اطمینان از بارگذاری جاوااسکریپت

    // تعریف رویداد کلیک برای دکمه داشبورد
    document.querySelectorAll('.nav-link').forEach(function (element) {
        element.addEventListener('click', function (event) {
            // event.preventDefault(); // این خط را حذف کنید

            // کدهای دیگر
            console.log("لینک کلیک شد:", element.href);
        });
    });
});

function showDefaultContent() {
    console.log("showDefaultContent called."); // برای اطمینان از فراخوانی فانکشن
    var dashboardContent = `
        <div class="row">
            <div class="col-md-3 text-custom-center">
                <div class="card text-white bg-info mb-3">
                    <div class="card-body">
                        <h5 class="card-title large-title color--white">گزارشات</h5>
                        <p class="card-text color--white">نمایش گزارشات سایت</p>
                        <a href="#" class="btn btn-primary" onclick="loadReports()">مشاهده</a>
                    </div>
                </div>
            </div>
            <div class="col-md-3 text-custom-center">
                <div class="card text-white bg-primary mb-3">
                    <div class="card-body">
                        <h5 class="card-title color--white large-title">کاربران</h5>
                        <p class="card-text color--white">مدیریت کاربران سایت</p>
                        <a href="#" class="btn btn-info" onclick="loadUsers()">مشاهده</a>
                    </div>
                </div>
            </div>
            <div class="col-md-3 text-custom-center">
                <div class="card text-white bg-success mb-3">
                    <div class="card-body">
                        <h5 class="card-title large-title color--white">پست‌ها</h5>
                        <p class="card-text color--white">مدیریت پست‌های سایت</p>
                        <a href="#" class="btn btn-primary" onclick="loadPosts()">مشاهده</a>
                    </div>
                </div>
            </div>
            <div class="col-md-3 text-custom-center">
                <div class="card text-white bg-warning mb-3">
                    <div class="card-body">
                        <h5 class="card-title large-title color--white">تنظیمات</h5>
                        <p class="card-text color--white">تنظیمات سایت</p>
                        <a href="#" class="btn btn-primary" onclick="showDefaultContent()">مشاهده</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('panel-content').innerHTML = dashboardContent;
}


function createPostForm() {
    loadAuthors().then(function (authors) {
        loadCategories().then(function (categories) {
            let authorOptions = authors.map(author => `<option value="${author.id}">${author.full_name}</option>`).join('');
            let categoryOptions = categories.map(category => `<input type="checkbox" name="categories" value="${category.id}"> ${category.title}`).join('<br>');

            let createFormHTML = `
                <div class="card mt--20">
                    <div class="card-header">
                        <h3 class="card-title large-title">ایجاد پست جدید</h3>
                    </div>
                    <div class="card-body">
                        <div id="error-message" class="alert alert-danger mt-3" style="display: none;"></div> <!-- پیام خطا -->
                        <form id="createPostForm" enctype="multipart/form-data">
                            <div class="form-group">
                                <label for="postTitle">عنوان</label>
                                <input type="text" class="form-control" id="postTitle" name="title">
                            </div>
                            <div class="form-group">
                                <label for="postContent">محتوا</label>
                                <textarea class="form-control" id="postContent" name="body" rows="5"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="postShortBody">توضیح کوتاه (حداکثر 20 کلمه)</label>
                                <textarea class="form-control" id="postShortBody" name="short_body" rows="5"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="postAuthor">نویسنده</label>
                                <select class="form-control large-input" id="postAuthor" name="author">
                                    ${authorOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="postCategory">دسته‌بندی‌ها</label>
                                ${categoryOptions}
                            </div>
                            <div class="form-group">
                                <label for="postImage">تصویر</label>
                                <input type="file" class="form-control" id="postImage" name="image">
                            </div>
                            <button type="button" class="btn btn-primary" onclick="createPost()">ارسال پست</button>
                            <button type="button" class="btn btn-secondary" onclick="showDefaultContent()">لغو</button>
                        </form>
                    </div>
                </div>
            `;
            $('#panel-content').html(createFormHTML);

            // Initialize CKEditor
            CKEDITOR.replace('postContent', {
                extraPlugins: 'wysiwygarea',
                entities: false,
                basicEntities: false,
                allowedContent: true,
                extraAllowedContent: 'span(*)[*]{*}; div(*)[*]{*}',
                fillEmptyBlocks: false,
                autoParagraph: false
            });
            CKEDITOR.replace('postShortBody', {
                extraPlugins: 'wysiwygarea',
                entities: false,
                basicEntities: false,
                allowedContent: true,
                extraAllowedContent: 'span(*)[*]{*}; div(*)[*]{*}',
                fillEmptyBlocks: false,
                autoParagraph: false
            });
        });
    });
}


function createPost() {
    let formData = new FormData(document.getElementById('createPostForm'));

    // دریافت داده‌های CKEditor و اضافه کردن به FormData
    formData.set('body', CKEDITOR.instances.postContent.getData());
    formData.set('short_body', CKEDITOR.instances.postShortBody.getData());

    // دریافت دسته‌بندی‌های انتخاب شده و اضافه کردن به FormData
    const categories = [];
    document.querySelectorAll('input[name="categories"]:checked').forEach((checkbox) => {
        categories.push(checkbox.value);
    });


    // اضافه کردن دسته‌بندی‌ها به FormData به صورت جداگانه
    categories.forEach(category => formData.append('category', category));

    // بررسی و لاگ کردن دسته‌بندی‌های انتخاب شده
    console.log("Selected categories:", categories);

    // بررسی عنوان پست قبل از ارسال
    const postTitle = formData.get('title');

    $.ajax({
        url: `/api/blog/?title=${postTitle}`,
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrftoken
        },
        success: function (response) {
            if (response.results.length > 0) {
                showErrorMessage("عنوان این پست از قبل وجود دارد.");  // نمایش پیام خطا
            } else {
                // ارسال درخواست AJAX با استفاده از FormData
                $.ajax({
                    url: '/api/blog/',
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': csrftoken
                    },
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        console.log("پست با موفقیت ایجاد شد:", response);
                        loadPosts();  // بازخوانی لیست پست‌ها پس از ایجاد پست جدید
                    },
                    error: function (xhr, status, error) {
                        console.log("Error status:", status);
                        console.log("Error details:", error);
                        console.log("Response text:", xhr.responseText);
                        showErrorMessage("خطا در ایجاد پست.");
                    }
                });
            }
        },
        error: function (xhr, status, error) {
            console.log("Error checking title:", status, error);
            showErrorMessage("خطا در بررسی عنوان.");
        }
    });
}

function showErrorMessage(message) {
    // نمایش پیام خطا در بالای پنل ادمین
    const errorMessageDiv = document.getElementById('error-message');
    if (!errorMessageDiv) {
        const newErrorMessageDiv = document.createElement('div');
        newErrorMessageDiv.id = 'error-message';
        newErrorMessageDiv.className = 'alert alert-danger';
        newErrorMessageDiv.style.display = 'none';
        document.getElementById('panel-content').prepend(newErrorMessageDiv);
    }
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-message').style.display = 'block';
}


function showErrorMessage(message) {
    // نمایش پیام خطا در بالای پنل ادمین
    const errorMessageDiv = document.getElementById('error-message');
    if (!errorMessageDiv) {
        const newErrorMessageDiv = document.createElement('div');
        newErrorMessageDiv.id = 'error-message';
        newErrorMessageDiv.className = 'alert alert-danger';
        newErrorMessageDiv.style.display = 'none';
        document.getElementById('panel-content').prepend(newErrorMessageDiv);
    }
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-message').style.display = 'block';
}


function editPost(postSlug) {
    $.ajax({
        url: `/api/blog/${postSlug}/`,
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (post) {
            console.log("Post data:", post); // بررسی داده‌های پست

            loadAuthors().then(function (authors) {
                loadCategories().then(function (categories) {
                    console.log("Categories data:", categories); // بررسی داده‌های دسته‌بندی

                    if (!post.category_display) {
                        post.category_display = []; // اطمینان از وجود `category_display` حتی اگر خالی باشد
                    }

                    // دسته‌بندی‌های انتخاب شده
                    let selectedCategories = post.category_display.map(cat => cat.id);
                    console.log("Selected categories IDs:", selectedCategories); // لاگ کردن شناسه‌های دسته‌بندی‌های انتخاب شده

                    let selectedCategoriesHTML = selectedCategories.map(categoryId => {
                        let category = categories.find(cat => cat.id === categoryId);
                        return category ? `<input type="checkbox" name="category" value="${category.id}" checked> ${category.title}` : '';
                    }).join('<br>');

                    // دسته‌بندی‌های موجود
                    let allCategories = categories.filter(category => !selectedCategories.includes(category.id)).map(category => `<input type="checkbox" name="category" value="${category.id}"> ${category.title}`).join('<br>');

                    console.log("Selected categories HTML:", selectedCategoriesHTML); // بررسی HTML تولید شده برای دسته‌بندی‌های انتخاب شده
                    console.log("All categories HTML:", allCategories); // بررسی HTML تولید شده برای تمام دسته‌بندی‌ها

                    let authorOptions = authors.map(author => `<option value="${author.id}">${author.full_name}</option>`).join('');

                    let editFormHTML = `
                        <div class="card mt--20">
                            <div class="card-header">
                                <h5 class="card-title large-title">ویرایش پست</h5>
                            </div>
                            <div class="card-body">
                                <form id="editPostForm" enctype="multipart/form-data">
                                    <div class="form-group">
                                        <label for="postTitle">عنوان</label>
                                        <input type="text" class="form-control" id="postTitle" name="title" value="${post.title}">
                                    </div>
                                    <div class="form-group">
                                        <label for="postContent">محتوا</label>
                                        <textarea class="form-control" id="postContent" name="body" rows="5">${post.body}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="postShortBody">توضیح کوتاه (حداکثر 20 کلمه)</label>
                                        <textarea class="form-control" id="postShortBody" name="short_body" rows="5">${post.short_body}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="postAuthor">نویسنده</label>
                                        <select class="form-control large-input" id="postAuthor" name="author">
                                            ${authorOptions}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="postCategory">دسته‌بندی‌ها</label>
                                        ${selectedCategoriesHTML}<br>
                                        ${allCategories}
                                    </div>
                                    <div class="form-group">
                                        <label for="postImage">تصویر کنونی:</label><br>
                                        ${post.image ? `<img src="${post.image}" alt="Current Image" class="img-thumbnail" style="max-width: 200px;">` : '<p>تصویری وجود ندارد</p>'}
                                        <label for="postImage">بارگذاری تصویر جدید:</label>
                                        <input type="file" class="form-control" id="postImage" name="image">
                                    </div>
                                    <button type="button" class="btn btn-info" onclick="savePost('${post.slug}')">ذخیره تغییرات</button> <!-- استفاده از 'post.slug' با گیومه -->
                                    <button type="button" class="btn btn-primary" onclick="loadPosts()">بازگشت</button>
                                </form>
                            </div>
                        </div>
                    `;
                    $('#panel-content').html(editFormHTML);

                    // تبدیل اعداد به فارسی (اختیاری)
                    convertToPersianNumbers();

                    // Initialize CKEditor and set content from server
                    CKEDITOR.replace('postContent', {
                        extraPlugins: 'wysiwygarea',
                        entities: false,
                        basicEntities: false,
                        allowedContent: true,
                        extraAllowedContent: 'span(*)[*]{*}; div(*)[*]{*}',
                        fillEmptyBlocks: false,
                        autoParagraph: false
                    });
                    CKEDITOR.instances.postContent.setData(post.body);  // Set the content from the server
                    CKEDITOR.replace('postShortBody', {
                        extraPlugins: 'wysiwygarea',
                        entities: false,
                        basicEntities: false,
                        allowedContent: true,
                        extraAllowedContent: 'span(*)[*]{*}; div(*)[*]{*}',
                        fillEmptyBlocks: false,
                        autoParagraph: false
                    });
                    CKEDITOR.instances.postShortBody.setData(post.short_body);  // Set the content from the server
                });
            });
        },
        error: function (xhr, status, error) {
            console.log("Error status:", status);
            console.log("Error details:", error);
            console.log("Response text:", xhr.responseText);
            alert("خطا در دریافت اطلاعات پست. لطفاً دوباره تلاش کنید.");
        }
    });
}



function savePost(postSlug) {
    let formData = new FormData(document.getElementById('editPostForm'));

    // دریافت داده‌های CKEditor و اضافه کردن به FormData
    formData.set('body', CKEDITOR.instances.postContent.getData());
    formData.set('short_body', CKEDITOR.instances.postShortBody.getData());

    // دریافت دسته‌بندی‌های انتخاب شده و اضافه کردن به FormData
    const categories = [];
    document.querySelectorAll('input[name="category"]:checked').forEach((checkbox) => {
        categories.push(parseInt(checkbox.value)); // اطمینان از ارسال به صورت کلید اصلی (عدد)
    });

    // اضافه کردن دسته‌بندی‌ها به FormData به صورت جداگانه
    categories.forEach(category => formData.append('category', category));

    // بررسی و لاگ کردن دسته‌بندی‌های انتخاب شده
    console.log("Selected categories:", categories);

    // ارسال درخواست AJAX با استفاده از FormData
    $.ajax({
        url: `/api/blog/${postSlug}/`,
        method: 'PUT',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrftoken
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            console.log("پست با موفقیت ویرایش شد:", response);
            loadPosts();  // بازخوانی لیست پست‌ها پس از ویرایش پست
        },
        error: function (xhr, status, error) {
            console.log("Error status:", status);
            console.log("Error details:", error);
            console.log("Response text:", xhr.responseText);
        }
    });
}


async function deletePost(postSlug) {
    try {
        // دریافت اطلاعات پست از API
        const response = await fetch(`/api/blog/${postSlug}/`);
        const post = await response.json();

        // نمایش پاسخ API در کنسول
        console.log('API Response:', post);

        // بررسی وجود کامنت‌ها یا دسته‌بندی‌ها
        const hasComments = post.comments && post.comments.length > 0;
        const hasCategories = post.category && post.category.length > 0;

        if (hasComments || hasCategories) {
            // اگر کامنت یا دسته‌بندی وجود دارد، پیام نمایش داده شود
            const message = `
                <div class="alert alert-warning">
                    <strong>توجه!</strong>
                    این پست دارای ${hasComments ? 'نظرات' : ''} ${hasComments && hasCategories ? 'و' : ''} ${hasCategories ? 'دسته‌بندی‌ها' : ''} است.
                    لطفاً ابتدا از طریق بخش "مشاهده پست"، نظرات و دسته‌بندی‌ها را حذف کنید.
                </div>
            `;
            document.getElementById('panel-content').innerHTML = message;
        } else {
            // اگر هیچ کامنت یا دسته‌بندی وجود ندارد، مستقیماً حذف شود
            if (confirm('آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟')) {
                const deleteResponse = await fetch(`/api/blog/${postSlug}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrftoken, // اضافه کردن توکن CSRF
                    },
                });

                if (deleteResponse.ok) {
                    alert('پست با موفقیت حذف شد!');
                    window.location.reload();  // رفرش صفحه پس از حذف
                } else {
                    alert('خطا در حذف پست!');
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('خطا در دریافت اطلاعات پست!');
    }
}



function deleteComment(postSlug, commentId) {
    if (confirm('آیا مطمئن هستید که می‌خواهید این کامنت را حذف کنید؟')) {
        $.ajax({
            url: `/api/blog/${postSlug}/admin-comments/${commentId}/`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')  // برای Django CSRF Token
            },
            success: function (response) {
                console.log("کامنت با موفقیت حذف شد:", response);

                // حذف کامنت از صفحه بدون بارگذاری مجدد کل لیست
                $(`#comment-${commentId}`).remove();  // حذف کامنت با استفاده از ID

                // نمایش پیام موفقیت
                showAlert('کامنت با موفقیت حذف شد.', 'success');
            },
            error: function (xhr, status, error) {
                console.log("Error status:", status);
                console.log("Error details:", error);
                console.log("Response text:", xhr.responseText);

                // نمایش پیام خطا
                showAlert('خطا در حذف کامنت.', 'danger');
            }
        });
    }
}

function removeCategoryFromPost(postSlug, categoryId) {
    if (confirm('آیا مطمئن هستید که می‌خواهید این دسته‌بندی را از پست حذف کنید؟')) {
        fetch(`/api/blog/${postSlug}/categories/${categoryId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (response.ok) {
                alert('دسته‌بندی با موفقیت حذف شد.');
                loadPostCategoriesAndComments(postSlug);  // بازخوانی لیست دسته‌بندی‌ها پس از حذف
            } else {
                alert('مشکلی در حذف دسته‌بندی به وجود آمد.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('خطا در ارتباط با سرور.');
        });
    }
}

async function loadPostCategoriesAndComments(postSlug) {
    try {
        // دریافت دسته‌بندی‌ها و نظرات به صورت موازی
        const [categories, comments] = await Promise.all([
            fetchData(`/api/blog/${postSlug}/categories/`, 'دسته‌بندی‌ها'),
            fetchData(`/api/blog/${postSlug}/admin-comments/`, 'نظرات')
        ]);

        // ایجاد HTML برای دسته‌بندی‌ها و نظرات
        const categoriesHTML = generateCategoriesHTML(categories, postSlug);
        const commentsHTML = generateCommentsHTML(comments, postSlug);

        // ترکیب و نمایش نتایج
        const combinedHTML = `
            <div class="post-details-panel">
                <h6 class="panel-title"> جزئیات پست: </h6>
                ${categoriesHTML}
                ${commentsHTML}
                <button class="btn btn-secondary" style="width: 100%;" onclick="loadPosts()">بازگشت</button>
            </div>
        `;

        document.getElementById('panel-content').innerHTML = combinedHTML;
    } catch (error) {
        console.error('Error:', error);
        alert('خطا در دریافت اطلاعات.');
    }
}

// تابع کمکی برای دریافت داده‌ها
async function fetchData(url, resourceName) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`خطا در دریافت ${resourceName}.`);
    }
    return response.json();
}

// تابع کمکی برای ایجاد HTML دسته‌بندی‌ها
function generateCategoriesHTML(categories, postSlug) {
    if (categories.length === 0) {
        return '<div class="section"><h4>دسته‌بندی‌ها:</h4><p class="no-data">هیچ دسته‌بندی‌ای وجود ندارد.</p></div>';
    }

    const categoriesList = categories.map(category => `
        <li class="category-item">
            <span class="category-title">${category.title}</span>
            <button class="btn-remove" onclick="removeCategoryFromPost('${postSlug}', ${category.id})">حذف دسته‌بندی</button>
        </li>
    `).join('');

    return `
        <div class="section">
            <h4>دسته‌بندی‌ها:</h4>
            <ul class="category-list">${categoriesList}</ul>
        </div>
    `;
}

// تابع کمکی برای ایجاد HTML نظرات
function generateCommentsHTML(comments, postSlug) {
    if (comments.length === 0) {
        return '<div class="section"><h4>نظرات:</h4><p class="no-data">هیچ نظری وجود ندارد.</p></div>';
    }

    const commentsList = comments.map(comment => `
        <li id="comment-${comment.id}" class="comment-item">  <!-- اضافه کردن id برای هر کامنت -->
            <p class="comment-body">${comment.body}</p>
            <p class="comment-status">وضعیت: ${comment.status}</p>  <!-- نمایش وضعیت کامنت -->
            <button class="btn-remove" onclick="deleteComment('${postSlug}', ${comment.id})">حذف نظر</button>
        </li>
    `).join('');

    return `
        <div class="section">
            <h4>نظرات:</h4>
            <ul class="comment-list">${commentsList}</ul>
        </div>
    `;
}
function closeConfirmationPanel() {
    document.getElementById('panel-content').innerHTML = '';
}

// تابع برای دریافت توکن CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // بررسی می‌کند که این کوکی، همان کوکی مورد نظر ما است.
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function viewPost(postSlug) {
    $.ajax({
        url: `/api/blog/${postSlug}/`,
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (post) {
            let viewPostHTML = `
                <div class="card shadow-lg">
                    <div class="card-header bg-primary text-white">
                        <h3 class="card-title text-center mb-0">${post.title}</h3>
                    </div>
                    <div class="card-body">
                        <div class="mb-4">
                            <h4 class="card-subtitle text-right text-muted mb-3">توضیحات اصلی (محتوا):</h4>
                            <div class="card-text p-3 bg-light rounded">
                                <p class="mb-0">${post.body}</p>
                            </div>
                        </div>
                        <div class="mb-4">
                            <h4 class="card-subtitle text-right text-muted mb-3">توضیحات کوتاه (جهت نمایش):</h4>
                            <div class="card-text p-3 bg-light rounded">
                                <p class="mb-0">${post.short_body}</p>
                            </div>
                        </div>
                        <div class="mb-4">
                            <h4 class="card-subtitle text-right text-muted mb-3">نویسنده این پست:</h4>
                            <div class="card-text p-3 bg-light rounded">
                                <p class="mb-0">${post.author_name}</p>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-light">
                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-success" onclick="loadPosts()">
                                <i class="fas fa-arrow-left"></i> بازگشت
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editPost('${post.slug}')">ویرایش</button> <!-- استفاده از 'post.slug' با گیومه -->
                            <button type="button" class="btn btn-info pl-3 pr-3" onclick="loadPostCategoriesAndComments('${post.slug}')">
                                <i class="fas fa-tags"></i>  مشاهده دسته‌بندی‌ها و نظرات این پست
                            </button>
                        </div>
                    </div>
                </div>
            `;
            $('#panel-content').html(viewPostHTML);
        },
        error: function (xhr, status, error) {
            console.log("Error status:", status);
            console.log("Error details:", error);
            console.log("Response text:", xhr.responseText);
        }
    });
}

function loadAuthors() {
    return $.ajax({
        url: '/panels/api/authors/',  // آدرس API برای گرفتن لیست نویسندگان
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript loaded."); // برای اطمینان از بارگذاری جاوااسکریپت

    // تعریف رویداد کلیک برای دکمه داشبورد
    document.querySelectorAll('.nav-link').forEach(function (element) {
        element.addEventListener('click', function (event) {
            // event.preventDefault();
        });
    });
});


function loadReports() {
    console.log("loadReports called."); // برای اطمینان از فراخوانی فانکشن
    // کد بارگذاری گزارشات را اینجا قرار دهید
    var reportsContent = `<div>
                             <h2>گزارشات سایت</h2>
                             <p>این بخش شامل گزارشات سایت است.</p>
                          </div>`;
    document.getElementById('panel-content').innerHTML = reportsContent;
}


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


$(document).ready(function () {
    // دریافت اطلاعات کاربر ادمین از سرور و نمایش آن‌ها
    $.ajax({
        url: '/panels/api/get_admin_info/',
        type: 'GET',
        success: function (data) {
            $('#Id').text(data.id);
            $('#first_name').text(data.first_name);
            $('#username').text(data.username);
            $('#last_name').text(data.last_name);
            $('#phone_number').text(data.phone_number);
            $('#email').text(data.email);
            $('#date_joined').text(data.date_joined);


            // پر کردن فیلدهای فرم ویرایش با اطلاعات کاربر
            $('#edit-username').val(data.username);
            $('#edit-first_name').val(data.first_name);
            $('#edit-last_name').val(data.last_name);
            $('#edit-phone_number').val(data.phone_number);
            $('#edit-email').val(data.email);

            convertToPersianNumbers();

            $('#edit-username, #edit-first_name, #edit-last_name, #edit-phone_number, #edit-email').on('input', function () {
                convertInputNumbersToPersian(this);
            });
        }
    });

    // نمایش فرم ویرایش اطلاعات
    $('#edit-profile-btn').click(function () {
        $('#edit-profile-form').toggle();
    });

    // ارسال اطلاعات فرم ویرایش از طریق AJAX
    $('#profile-form').submit(function (event) {
        // event.preventDefault();
        $.ajax({
            url: '/panels/api/edit_admin_profile/',
            type: 'POST',
            data: {
                username: $('#edit-username').val(),
                first_name: $('#edit-first_name').val(),
                last_name: $('#edit-last_name').val(),
                phone_number: $('#edit-phone_number').val(),
                email: $('#edit-email').val(),
                current_password: $('#current-password').val(),  // اضافه کردن فیلد پسورد فعلی
                new_password: $('#edit-password').val(),  // اضافه کردن فیلد پسورد جدید
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            },
            success: function (response) {
                if (response.success) {
                    $('#error-messages').html('<div class="alert alert-success"> اطلاعات با موفقیت ذخیره شد،در حال انتقال به صفحه ورود....</div>');
                    setTimeout(function () {
                        location.reload();  // بارگذاری مجدد صفحه برای نمایش اطلاعات به روز شده
                    }, 3000);  // بارگذاری مجدد صفحه پس از 2 ثانیه
                } else {
                    // نمایش خطاها با استفاده از هشدارهای بوت‌استرپ
                    let errors = response.errors;
                    let errorMessages = [];
                    for (let field in errors) {
                        if (errors.hasOwnProperty(field)) {
                            errorMessages.push(`<div class="alert alert-danger">${errors[field].join(' ')}</div>`);
                        }
                    }
                    $('#error-messages').html(errorMessages.join(''));


                }
            }
        });
    });
});

function limitWords(text, maxWords) {
    let words = text.split(/\s+/);
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
}

function loadCategories() {
    return $.ajax({
        url: '/api/categories/',
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (data) {
            console.log("Categories fetched successfully:", data); // بررسی داده‌های دسته‌بندی
            return data;
        },
        error: function (xhr, status, error) {
            console.error("Error fetching categories:", status, error);
        }
    });
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.getElementById('panel-content').prepend(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000); // حذف پیام پس از 3 ثانیه
}