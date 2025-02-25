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


            let postsHTML = `<button class="btn-custom btn-info " onclick="createPostForm()">ایجاد پست جدید</button>


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
                        <button class="btn btn-sm btn-info" onclick="viewPost(${post.id})">مشاهده</button>
                        <button class="btn btn-sm btn-warning" onclick="editPost(${post.id})">ویرایش</button>
                        <button class="btn btn-sm btn-danger" onclick="deletePost(${post.id})">حذف</button>
                    </td>
                  </tr>`;
            });
            postsHTML += `</tbody></table>`;


            let paginationHTML = `
<div class="d-flex justify-content-between">`;
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

    if (window.innerWidth <= 600) {
        showDefaultContent();
    }
    // تعریف رویداد کلیک برای دکمه داشبورد
    document.querySelectorAll('.nav-link').forEach(function (element) {
        element.addEventListener('click', function (event) {
            event.preventDefault();
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

    if (categories.length === 0) {
        alert("لطفاً حداقل یک دسته‌بندی را انتخاب کنید.");
        return;
    }

    // اضافه کردن دسته‌بندی‌ها به FormData به صورت جداگانه
    categories.forEach(category => formData.append('category', category));

    // بررسی و لاگ کردن دسته‌بندی‌های انتخاب شده
    console.log("Selected categories:", categories);

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
        }
    });
}


function editPost(postId) {
    $.ajax({
        url: `/api/blog/${postId}/`,
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
                                    <button type="button" class="btn btn-info" onclick="savePost(${post.id})">ذخیره تغییرات</button>
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
        }
    });
}


function savePost(postId) {
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
        url: `/api/blog/${postId}/`,
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


function deletePost(postId) {
    if (confirm('آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟')) {
        $.ajax({
            url: `/api/blog/${postId}/`,
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrftoken
            },
            success: function (result) {
                console.log("پست با موفقیت حذف شد:", result);
                loadPosts(); // بازخوانی لیست پست‌ها پس از حذف
            },
            error: function (xhr, status, error) {
                console.log("Error status:", status);
                console.log("Error details:", error);
                console.log("Response text:", xhr.responseText);
            }
        });
    }
}


function viewPost(postId) {
    $.ajax({
        url: `/api/blog/${postId}/`,
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (post) {
            let viewPostHTML = `
                <button type="button" class=" btn-primary" onclick="loadPosts()">بازگشت</button>
        <div class="card">
                    <div class="card-header">
                        <h3 class="card-title text-center mt--4">عنوان پست: ${post.title}</h3>
                    </div>
            <div class="card">
                    <div class="card-header">
                        <h4 class="card-title color--black" style="color: #006b1b">متن اصلی:</h4>
                    </div>
                        <div class="card-body">
                            <p>${post.body}</p>
                        </div>
                    <div class="card-header">
                        <h4 class="card-text mt--20" style="color: #006b1b" >توضیحات کوتاه:</h4>
                    </div>
                    <div class="card-body">
                        <p>${post.short_body}</p>
                    </div>
            </div>
                    <div class="col-md-6 mt--10 mb--10 mr--5 ">
                        <button type="button" class="btn" onclick="loadPosts()">بازگشت</button>
                        <button type="button" class="btn" onclick="editPost(${post.id})">ویرایش</button>
                    </div>
        </div>
            `;
            $('#panel-content').html(viewPostHTML);

            convertToPersianNumbers();
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
            event.preventDefault();
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
        event.preventDefault();
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

































