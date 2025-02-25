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
            node.nodeValue = node.nodeValue.replace(/[0-9]/g, function(w) {
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

// فراخوانی تابع برای تبدیل اعداد به فارسی پس از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', convertToPersianNumbers);
