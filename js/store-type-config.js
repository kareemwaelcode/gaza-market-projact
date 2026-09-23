/*
 * Gaza Market — Store Type Config
 * ---------------------------------------------------------------------------
 * مصدر واحد مركزي يحدد "شكل وهيكل" لوحة التحكم (السايدبار، قائمة الموبايل،
 * تسمية النوع) حسب نوع النشاط. لوحة التحكم نفسها واحدة مشتركة لكل الأنواع —
 * هذا الملف لا يعرّف لوحات تحكم منفصلة، فقط يعرّف ما يُعرض لكل نوع.
 *
 * مصدر النوع الحالي (مؤقت لحد ما الباك إند يجهز):
 *   يُقرأ من localStorage تحت المفتاح STORAGE_KEY، بنفس فكرة الحقل "type"
 *   اللي هيرجع بعدين من الـ API بعد موافقة الأدمن على النشاط.
 *   لو مفيش قيمة محفوظة، يُستخدم DEFAULT_TYPE ('workspace') — عشان السلوك
 *   الحالي للوحة التحكم يفضل كما هو بدون أي تغيير ظاهر.
 *
 * إضافة نوع جديد لاحقاً = إضافة مفتاح جديد هنا فقط، بدون لمس أي HTML.
 * ---------------------------------------------------------------------------
 */
window.GMStoreTypeConfig = (function () {
  'use strict';

  var STORAGE_KEY = 'gm-store-type';
  // ملاحظة: الـ id لكل نوع لازم يطابق تماماً قيمة data-value في كروت
  // اختيار النوع بصفحة add-store.html (وهي نفسها اللي هترجع من الباك إند
  // بعدين كـ "type"): cowork, restaurant, cafe, restaurant-cafe, store.
  var DEFAULT_TYPE = 'cowork';

  /*
   * كل عنصر sidebar/mobileNav:
   *   page:   قيمة data-page (للروابط اللي بتودّي لصفحة كاملة) — أو null
   *   action: قيمة data-action (للروابط اللي بتفتح لوحة جانبية زي "تعديل الأسعار") — أو null
   *   href:   رابط الصفحة، أو "#" لو action
   *   icon:   اسم أيقونة Lucide
   *   label:  العنوان الرئيسي
   *   sub:    السطر الفرعي (للسايدبار فقط)
   *   badge:  رقم/إشارة صغيرة اختيارية (مثلاً عدد الإعلانات الجديدة)
   */
  var TYPES = {

    // مساحة عمل — مطابق تماماً لما كان موجود فعلياً في sidebar.html و mobile-nav.html
    cowork: {
      id: 'cowork',
      label: 'مساحة عمل',
      sidebar: [
        { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية', sub: 'نظرة عامة على مساحتك' },
        { action: 'open-prices-edit', href: '#', icon: 'tag', label: 'الأسعار والأوقات', sub: 'أسعار الساعة/اليوم، مواعيد العمل' },
        { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة', sub: 'واي فاي، كهرباء، طباعة، مشروبات' },
        { page: 'subscribers', href: 'subscribers.html', icon: 'users', label: 'المشتركين', sub: 'إضافة، تجديد، إنهاء الاشتراك' },
        { page: 'subscription-requests', href: 'subscription-requests.html', icon: 'thumbs-up', label: 'طلبات الاشتراك', sub: 'طلبات وصلتك أونلاين للموافقة' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', sub: 'فعاليات، ورش، وظائف، عروض', badge: 2 },
        { page: 'packages', href: 'packages.html', icon: 'layers', label: 'الباقات', sub: 'اختر باقة مساحتك' },
        { page: 'profile', href: 'profile.html', icon: 'store', label: 'بروفايل المساحة', sub: 'تعديل المعلومات والصورة' }
      ],
      mobileNav: [
        { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية' },
        { action: 'open-prices-edit', href: '#', icon: 'tag', label: 'الأسعار والأوقات' },
        { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة' },
        { page: 'subscribers', href: 'subscribers.html', icon: 'users', label: 'المشتركين' },
        { page: 'subscription-requests', href: 'subscription-requests.html', icon: 'thumbs-up', label: 'طلبات الاشتراك' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', badge: true }
      ],
      // خدمات "الخدمات المتاحة" — نفس الست خدمات اللي كانت ثابتة أصلاً بالكود
      services: [
        { id: 'wifi', label: 'WiFi' },
        { id: 'electricity', label: 'كهرباء' },
        { id: 'printing', label: 'طباعة' },
        { id: 'screens', label: 'شاشات' },
        { id: 'private_rooms', label: 'غرف خاصة' },
        { id: 'drinks', label: 'مشروبات' }
      ],
      // كروت "الرئيسية" السريعة (quick-grid) في dashboard.html
      dashboardCards: [
        { action: 'open-services-edit', href: '#', icon: 'wifi', label: 'الخدمات المتاحة', sub: 'واي فاي، كهرباء' },
        { action: 'open-prices-edit', href: '#', icon: 'tag', label: 'الأسعار والأوقات', sub: 'أسعار، مواعيد' },
        { page: 'subscription-requests', href: 'subscription-requests.html', icon: 'thumbs-up', label: 'طلبات الاشتراك', sub: 'للموافقة أونلاين' },
        { page: 'subscribers', href: 'subscribers.html', icon: 'users', label: 'المشتركين', sub: 'إضافة، تجديد' }
      ]
    },

    /*
     * مطعم / كافيه / مطعم وكافيه — نفس هيكل لوحة التحكم بالظبط لكل الثلاثة
     * (المصفوفات معرّفة مرة واحدة وبتتشارك بين التلاتة، بدل تكرار).
     * الفرق الوحيد بينهم هو التسمية (label) وتسمية المنيو حسب النوع.
     * تم الاتفاق عليها مع صاحب المشروع:
     *  - "الأسعار والأوقات" تتحول لـ "المنيو" (صفحة كاملة menu.html)
     *  - "المشتركين" و"طلبات الاشتراك" بتتشال خالص (مالهاش معنى لمطعم/كافيه)
     *  - "الخدمات المتاحة" تفضل، بس بخدمات مختلفة تناسب مطعم/كافيه
     */
    restaurant: buildFoodTypeConfig('restaurant', 'مطعم'),
    cafe: buildFoodTypeConfig('cafe', 'كافيه'),
    'restaurant-cafe': buildFoodTypeConfig('restaurant-cafe', 'مطعم وكافيه')

    /*
     * أنواع تانية (store وفروعه...) هتتضاف هنا بنفس الشكل، بس بعد ما نتفق
     * مع بعض على الصفحات والحقول بتاعة كل نوع — السكيل بتاع المشروع بيمنع
     * تخمين الصفحات دي، لازم تتحدد بالنقاش الأول.
     */
  };

  // دالة مساعدة تبني نفس هيكل لوحة التحكم لأي نوع "أكل" (مطعم/كافيه/الاتنين)
  function buildFoodTypeConfig(id, label) {
    return {
      id: id,
      label: label,
      sidebar: [
        { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية', sub: 'نظرة عامة على نشاطك' },
        { page: 'menu', href: 'menu.html', icon: 'utensils', label: 'المنيو', sub: 'التصنيفات، الأصناف، الأسعار' },
        { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة', sub: 'توصيل، جلسات خارجية، وأكثر' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', sub: 'فعاليات، عروض، وظائف', badge: 2 },
        { page: 'packages', href: 'packages.html', icon: 'layers', label: 'الباقات', sub: 'اختر باقة نشاطك' },
        { page: 'profile', href: 'profile.html', icon: 'store', label: 'بروفايل النشاط', sub: 'تعديل المعلومات والصورة' }
      ],
      mobileNav: [
        { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية' },
        { page: 'menu', href: 'menu.html', icon: 'utensils', label: 'المنيو' },
        { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', badge: true }
      ],
      services: [
        { id: 'delivery', label: 'توصيل مجاني' },
        { id: 'smoking_area', label: 'منطقة تدخين' },
        { id: 'outdoor_seating', label: 'جلسات خارجية' },
        { id: 'parking', label: 'مواقف سيارات' },
        { id: 'card_payment', label: 'دفع بالبطاقة' }
      ],
      dashboardCards: [
        { page: 'menu', href: 'menu.html', icon: 'utensils', label: 'المنيو', sub: 'التصنيفات والأسعار' },
        { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة', sub: 'توصيل، جلسات خارجية' }
      ]
    };
  }

  function getCurrentType() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && TYPES[stored]) return stored;
    } catch (e) { /* localStorage غير متاح */ }
    return DEFAULT_TYPE;
  }

  function setCurrentType(typeId) {
    try {
      if (TYPES[typeId]) window.localStorage.setItem(STORAGE_KEY, typeId);
    } catch (e) { /* localStorage غير متاح */ }
  }

  function getConfig(typeId) {
    var id = typeId || getCurrentType();
    return TYPES[id] || TYPES[DEFAULT_TYPE];
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_TYPE: DEFAULT_TYPE,
    TYPES: TYPES,
    getCurrentType: getCurrentType,
    setCurrentType: setCurrentType,
    getConfig: getConfig
  };
})();
