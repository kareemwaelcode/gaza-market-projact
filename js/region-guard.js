/*
  region-guard.js
  ────────────────────────────────────────────────────────────
  الوظيفة الوحيدة لهذا الملف: منع دخول أي صفحة "محمية" (تعرض
  أسعار أو محلات) قبل ما المستخدم يحدد منطقته من صفحة
  "أين تسكن؟" (index.html).

  ── طريقة الاستخدام ──
  1) ضع هذا الملف كـ <script> داخل <head> لكل صفحة محمية،
     كأول عنصر تقريباً — قبل أي CSS أو محتوى تاني إذا أمكن:

       <head>
         <script src="js/region-guard.js"></script>
         ...
       </head>

  2) لا تضعه إطلاقاً في صفحة اختيار المنطقة نفسها
     (index.html)، وإلا سيحدث تحويل حلقي لا نهائي
     (infinite redirect loop).

  3) عدّل اسم الصفحة أدناه (SELECT_REGION_PAGE) ليطابق اسم
     ملف صفحة اختيار المنطقة الفعلي عندك.
*/
(function () {
  var SELECT_REGION_PAGE = "index.html";

  try {
    var hasRegion = !!localStorage.getItem("gmSelectedArea");
    if (!hasRegion) {
      window.location.replace(SELECT_REGION_PAGE);
    }
  } catch (e) {
    // لو localStorage غير متاح لأي سبب (مثلاً وضع خاص/تصفح متخفي بمتصفحات قديمة)
    // لا نمنع تحميل الصفحة، فقط نسجل تحذيراً
    console.warn("region-guard: localStorage unavailable", e);
  }
})();