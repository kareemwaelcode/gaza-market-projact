window.GMStoreTypeConfig = (function () {
  'use strict';

  var STORAGE_KEY = 'gm-store-type';
  var PLAN_STORAGE_KEY = 'gm-store-plan';
  var DEFAULT_TYPE = 'cowork';
  var DEFAULT_PLAN = 'free';
  var PLAN_IDS = ['free', 'paid'];

  var FOOD_PLAN_LIMITS = {
    free: { menuItems: 10, menuCategories: 10, ads: 5 },
    paid: { menuItems: null, menuCategories: null, ads: null }
  };

  var FOOD_LOCKED_FEATURES = {
    free: ['qrCode', 'shareWhatsapp', 'stats'],
    paid: []
  };

  var STORE_PLAN_LIMITS = {
    free: { products: 15, productCategories: 10, ads: 5, services: 10, serviceCategories: 8 },
    paid: { products: null, productCategories: null, ads: null, services: null, serviceCategories: null }
  };

  var STORE_LOCKED_FEATURES = {
    free: ['qrCode', 'shareWhatsapp', 'stats'],
    paid: []
  };

  var TYPES = {

    cowork: {
      id: 'cowork',
      label: 'مساحة عمل',
      fallbackAvatarLetter: 'م',
      sidebar: [
        { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية', sub: 'نظرة عامة على مساحتك' },
        { action: 'open-prices-edit', href: '#', icon: 'tag', label: 'الأسعار والأوقات', sub: 'أسعار الساعة/اليوم، مواعيد العمل' },
        { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة', sub: 'واي فاي، كهرباء، طباعة، مشروبات' },
        { page: 'subscribers', href: 'subscribers.html', icon: 'users', label: 'المشتركين', sub: 'إضافة، تجديد، إنهاء الاشتراك' },
        { page: 'subscription-requests', href: 'subscription-requests.html', icon: 'thumbs-up', label: 'طلبات الاشتراك', sub: 'طلبات وصلتك أونلاين للموافقة' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', sub: 'فعاليات، ورش، وظائف، عروض', badge: 2 },
        { page: 'packages', href: 'packages.html', icon: 'layers', label: 'الباقات', sub: 'اختر باقة مساحتك' },
        { page: 'profile', href: 'profile.html', icon: 'store', label: 'بروفايل المساحة', sub: 'تعديل المعلومات والصورة' },
        { page: 'reviews', href: 'reviews.html', icon: 'star', label: 'التقييمات', sub: 'آراء وتقييمات الزوار' },
        { page: 'settings', href: 'settings.html', icon: 'settings', label: 'الإعدادات', sub: 'التنبيهات، الخصوصية، وأكثر' }
      ],
      mobileNav: [
        { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية' },
        { action: 'open-prices-edit', href: '#', icon: 'tag', label: 'الأسعار والأوقات' },
        { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة' },
        { page: 'subscribers', href: 'subscribers.html', icon: 'users', label: 'المشتركين' },
        { page: 'subscription-requests', href: 'subscription-requests.html', icon: 'thumbs-up', label: 'طلبات الاشتراك' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', badge: true }
      ],
      services: [
        { id: 'wifi', label: 'WiFi' },
        { id: 'electricity', label: 'كهرباء' },
        { id: 'printing', label: 'طباعة' },
        { id: 'screens', label: 'شاشات' },
        { id: 'private_rooms', label: 'غرف خاصة' },
        { id: 'drinks', label: 'مشروبات' }
      ],
      dashboardCards: [
        { action: 'open-services-edit', href: '#', icon: 'wifi', label: 'الخدمات المتاحة', sub: 'واي فاي، كهرباء' },
        { action: 'open-prices-edit', href: '#', icon: 'tag', label: 'الأسعار والأوقات', sub: 'أسعار، مواعيد' },
        { page: 'subscription-requests', href: 'subscription-requests.html', icon: 'thumbs-up', label: 'طلبات الاشتراك', sub: 'للموافقة أونلاين' },
        { page: 'subscribers', href: 'subscribers.html', icon: 'users', label: 'المشتركين', sub: 'إضافة، تجديد' }
      ],
      pageCopy: {
        profileTitle: 'بيانات المساحة',
        entityNameLabel: 'اسم المساحة',
        adsSubtitle: 'فعاليات، ورش، وظائف، عروض تظهر في صفحة مساحتك',
        heroWelcomeText: 'مساحتك جاهزة لبدء استقبال طلباتك وخدماتك من هنا.'
      },
      packages: {
        pageSubtitle: 'اختر باقة مساحتك',
        entityNameLabel: 'اسم المساحة',
        free: {
          eyebrow: 'FREE',
          name: 'مجاني',
          desc: 'لوحة تحكم ومعلومات أساسية لمساحتك',
          price: 0,
          features: [
            { label: 'صفحة خاصة بالـ Workspace على GazaPrice', on: true },
            { label: 'لوحة تحكم لإدارة مساحتك', on: true },
            { label: 'المعلومات الأساسية (الأسعار، الأوقات، الخدمات)', on: true },
            { label: 'إدارة المشتركين', on: false },
            { label: 'استقبال طلبات الاشتراك أونلاين', on: false },
            { label: 'نظام حجز غرف الاجتماعات', on: false },
            { label: 'نشر إعلانات غير محدودة', on: false },
            { label: 'إشعارات تجديد الاشتراكات', on: false },
            { label: 'QR لتسجيل حضور الفعاليات', on: false }
          ]
        },
        paid: {
          id: 'workspace',
          eyebrow: 'WORKSPACE',
          badge: 'باقة المساحة',
          name: 'Workspace',
          desc: 'كل ما تحتاجه لإدارة مساحتك ومشتركيك',
          price: 99,
          buttonLabel: 'اشترك في باقة المساحة',
          whatsappMessage: 'السلام عليكم، قمت بتحويل مبلغ 99 ₪ لاشتراك باقة Workspace، وهذا إشعار التحويل.',
          features: [
            'صفحة خاصة بالـ Workspace على GazaPrice',
            'إدارة المشتركين (إضافة، تجديد، انتهاء الاشتراك)',
            'استقبال طلبات الاشتراك أونلاين',
            'نظام حجز غرف الاجتماعات',
            'نشر عدد غير محدود من الإعلانات (فعاليات، ورش، وظائف، عروض)',
            'لوحة تحكم: عدد المشتركين، الحجوزات، نسبة إشغال الغرف، مشاهدات الإعلانات',
            'إشعارات لتجديد الاشتراكات',
            'QR Code لتسجيل حضور الفعاليات'
          ]
        }
      }
    },

    restaurant: buildFoodTypeConfig('restaurant', 'مطعم'),
    cafe: buildFoodTypeConfig('cafe', 'كافيه'),
    'restaurant-cafe': buildFoodTypeConfig('restaurant-cafe', 'مطعم وكافيه'),

    store: buildStoreTypeConfig('store', 'متجر')

  };

  function buildFoodTypeConfig(id, label) {
    return {
      id: id,
      label: label,
      fallbackAvatarLetter: 'ن',
      sidebar: [
        { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية', sub: 'نظرة عامة على نشاطك' },
        { page: 'menu', href: 'menu.html', icon: 'utensils', label: 'المنيو', sub: 'التصنيفات، الأصناف، الأسعار' },
        { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة', sub: 'توصيل، جلسات خارجية، وأكثر' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', sub: 'فعاليات، عروض، وظائف', badge: 2 },
        { page: 'packages', href: 'packages.html', icon: 'layers', label: 'الباقات', sub: 'اختر باقة نشاطك' },
        { page: 'profile', href: 'profile.html', icon: 'store', label: 'بروفايل النشاط', sub: 'تعديل المعلومات والصورة' },
        { page: 'reviews', href: 'reviews.html', icon: 'star', label: 'التقييمات', sub: 'آراء وتقييمات الزوار' },
        { page: 'settings', href: 'settings.html', icon: 'settings', label: 'الإعدادات', sub: 'التنبيهات، الخصوصية، وأكثر' }
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
      ],
      limits: FOOD_PLAN_LIMITS,
      lockedFeatures: FOOD_LOCKED_FEATURES,
      pageCopy: {
        profileTitle: 'بيانات النشاط',
        entityNameLabel: 'اسم النشاط',
        adsSubtitle: 'فعاليات، عروض، وظائف تظهر في صفحة نشاطك',
        heroWelcomeText: 'نشاطك جاهز لبدء استقبال طلباتك وخدماتك من هنا.'
      },
      packages: {
        pageSubtitle: 'اختر باقة نشاطك',
        entityNameLabel: 'اسم النشاط',
        free: {
          eyebrow: 'FREE',
          name: 'مجاني',
          desc: 'لوحة تحكم ومعلومات أساسية لنشاطك',
          price: 0,
          features: [
            { label: 'صفحة خاصة بنشاطك على GazaPrice', on: true },
            { label: 'لوحة تحكم لإدارة نشاطك', on: true },
            { label: 'المنيو (حتى ' + FOOD_PLAN_LIMITS.free.menuItems + ' أصناف)', on: true },
            { label: 'حتى ' + FOOD_PLAN_LIMITS.free.menuCategories + ' تصنيفات للمنيو', on: true },
            { label: 'نشر حتى ' + FOOD_PLAN_LIMITS.free.ads + ' إعلانات', on: true },
            { label: 'الخدمات المتاحة الأساسية', on: true },
            { label: 'منيو غير محدود', on: false },
            { label: 'إعلانات غير محدودة', on: false },
            { label: 'شارة "مميز" وأولوية الظهور', on: false },
            { label: 'إحصائيات النشاط', on: false },
            { label: 'كود QR لصفحة النشاط', on: false },
            { label: 'المشاركة عبر واتساب', on: false },
            { label: 'طلب مباشر عبر واتساب', on: false },
            { label: 'إشعارات فورية', on: false }
          ]
        },
        paid: {
          id: 'premium',
          eyebrow: 'PREMIUM',
          badge: 'الباقة المميزة',
          name: 'المميزة',
          desc: 'كل ما يحتاجه نشاطك ليظهر بأفضل شكل ويتفاعل معاه الزباين أكتر',
          price: 99,
          buttonLabel: 'اشترك في الباقة المميزة',
          whatsappMessage: 'السلام عليكم، قمت بتحويل مبلغ 99 ₪ لاشتراك الباقة المميزة، وهذا إشعار التحويل.',
          features: [
            'صفحة خاصة بنشاطك على GazaPrice',
            'لوحة تحكم لإدارة نشاطك',
            'منيو غير محدود (تصنيفات وأصناف بلا حدود)',
            'نشر عدد غير محدود من الإعلانات (عروض، فعاليات، وظائف)',
            'شارة "مميز" وأولوية الظهور في نتائج البحث',
            'إحصائيات النشاط (مشاهدات الصفحة، مشاهدات المنيو، تفاعل الإعلانات)',
            'كود QR لصفحة النشاط',
            'مشاركة صفحة النشاط مباشرة عبر واتساب',
            'زر طلب مباشر عبر واتساب من صفحة النشاط',
            'إشعارات فورية (تنبيهات، تذكير تجديد)'
          ]
        }
      }
    };
  }

  function buildStoreTypeConfig(id, label) {
    return {
      id: id,
      label: label,
      fallbackAvatarLetter: 'م',
      sidebar: [
        { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية', sub: 'نظرة عامة على متجرك' },
        { page: 'prices', href: 'prices.html', icon: 'shopping-bag', label: 'المنتجات والأسعار', sub: 'الأصناف، الأسعار، التوفر' },
        { page: 'services', href: 'services.html', icon: 'wrench', label: 'الخدمات', sub: 'توصيل، تركيب، صيانة' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', sub: 'عروض وتخفيضات', badge: 2 },
        { page: 'packages', href: 'packages.html', icon: 'layers', label: 'الباقات', sub: 'اختر باقة متجرك' },
        { page: 'profile', href: 'profile.html', icon: 'store', label: 'بروفايل المتجر', sub: 'تعديل المعلومات والصورة' },
        { page: 'reviews', href: 'reviews.html', icon: 'star', label: 'التقييمات', sub: 'آراء وتقييمات الزوار' },
        { page: 'settings', href: 'settings.html', icon: 'settings', label: 'الإعدادات', sub: 'التنبيهات، الخصوصية، وأكثر' }
      ],
      mobileNav: [
        { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية' },
        { page: 'prices', href: 'prices.html', icon: 'shopping-bag', label: 'المنتجات' },
        { page: 'services', href: 'services.html', icon: 'wrench', label: 'الخدمات' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', badge: true }
      ],
      services: [
        { id: 'delivery', label: 'توصيل للمنازل' },
        { id: 'installation', label: 'تركيب وتوصيل فني' },
        { id: 'warranty', label: 'ضمان على المنتجات' },
        { id: 'card_payment', label: 'دفع بالبطاقة' },
        { id: 'gift_wrap', label: 'تغليف هدايا' },
        { id: 'exchange_return', label: 'استبدال واسترجاع' }
      ],
      dashboardCards: [
        { page: 'prices', href: 'prices.html', icon: 'shopping-bag', label: 'المنتجات والأسعار', sub: 'الأصناف والتوفر' },
        { page: 'services', href: 'services.html', icon: 'wrench', label: 'الخدمات', sub: 'توصيل، تركيب' },
        { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', sub: 'عروض وتخفيضات' }
      ],
      limits: STORE_PLAN_LIMITS,
      lockedFeatures: STORE_LOCKED_FEATURES,
      pageCopy: {
        profileTitle: 'بيانات المتجر',
        entityNameLabel: 'اسم المتجر',
        adsSubtitle: 'عروض وتخفيضات ومنتجات جديدة تظهر في صفحة متجرك',
        heroWelcomeText: 'متجرك جاهز لعرض منتجاتك وخدماتك من هنا.'
      },
      packages: {
        pageSubtitle: 'اختر باقة متجرك',
        entityNameLabel: 'اسم المتجر',
        free: {
          eyebrow: 'FREE',
          name: 'مجاني',
          desc: 'لوحة تحكم ومعلومات أساسية لمتجرك',
          price: 0,
          features: [
            { label: 'صفحة خاصة بمتجرك على GazaPrice', on: true },
            { label: 'لوحة تحكم لإدارة متجرك', on: true },
            { label: 'إضافة حتى ' + STORE_PLAN_LIMITS.free.products + ' منتج', on: true },
            { label: 'نشر حتى ' + STORE_PLAN_LIMITS.free.ads + ' إعلانات', on: true },
            { label: 'الخدمات المتاحة الأساسية', on: true },
            { label: 'منتجات غير محدودة', on: false },
            { label: 'إعلانات غير محدودة', on: false },
            { label: 'شارة "مميز" وأولوية الظهور', on: false },
            { label: 'إحصائيات المتجر', on: false },
            { label: 'كود QR لصفحة المتجر', on: false },
            { label: 'المشاركة عبر واتساب', on: false },
            { label: 'طلب مباشر عبر واتساب', on: false },
            { label: 'إشعارات فورية', on: false }
          ]
        },
        paid: {
          id: 'premium',
          eyebrow: 'PREMIUM',
          badge: 'الباقة المميزة',
          name: 'المميزة',
          desc: 'كل ما يحتاجه متجرك ليظهر بأفضل شكل ويتفاعل معاه الزباين أكتر',
          price: 99,
          buttonLabel: 'اشترك في الباقة المميزة',
          whatsappMessage: 'السلام عليكم، قمت بتحويل مبلغ 99 ₪ لاشتراك الباقة المميزة، وهذا إشعار التحويل.',
          features: [
            'صفحة خاصة بمتجرك على GazaPrice',
            'لوحة تحكم لإدارة متجرك',
            'منتجات غير محدودة',
            'نشر عدد غير محدود من الإعلانات (عروض، تخفيضات، منتجات جديدة)',
            'شارة "مميز" وأولوية الظهور في نتائج البحث',
            'إحصائيات المتجر (مشاهدات الصفحة، مشاهدات المنتجات، تفاعل الإعلانات)',
            'كود QR لصفحة المتجر',
            'مشاركة صفحة المتجر مباشرة عبر واتساب',
            'زر طلب مباشر عبر واتساب من صفحة المتجر',
            'إشعارات فورية (تنبيهات، تذكير تجديد)'
          ]
        }
      }
    };
  }

  function getCurrentType() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && TYPES[stored]) return stored;
    } catch (e) { }
    return DEFAULT_TYPE;
  }

  function setCurrentType(typeId) {
    try {
      if (TYPES[typeId]) window.localStorage.setItem(STORAGE_KEY, typeId);
    } catch (e) { }
  }

  function getConfig(typeId) {
    var id = typeId || getCurrentType();
    return TYPES[id] || TYPES[DEFAULT_TYPE];
  }

  function getCurrentPlan() {
    try {
      var stored = window.localStorage.getItem(PLAN_STORAGE_KEY);
      if (stored && PLAN_IDS.indexOf(stored) !== -1) return stored;
    } catch (e) { }
    return DEFAULT_PLAN;
  }

  function setCurrentPlan(planId) {
    try {
      if (PLAN_IDS.indexOf(planId) !== -1) window.localStorage.setItem(PLAN_STORAGE_KEY, planId);
    } catch (e) { }
  }

  function resolvePlan(planId) {
    return planId && PLAN_IDS.indexOf(planId) !== -1 ? planId : getCurrentPlan();
  }

  function isFeatureLocked(featureKey, typeId, planId) {
    var config = getConfig(typeId);
    var plan = resolvePlan(planId);
    var locked = (config.lockedFeatures && config.lockedFeatures[plan]) || [];
    return locked.indexOf(featureKey) !== -1;
  }

  function getLimitStatus(limitKey, usedCount, typeId, planId) {
    var config = getConfig(typeId);
    var plan = resolvePlan(planId);
    var planLimits = (config.limits && config.limits[plan]) || {};
    var limit = planLimits[limitKey];
    var unlimited = limit === undefined || limit === null;
    var used = Math.max(0, parseInt(usedCount, 10) || 0);
    return {
      plan: plan,
      limit: unlimited ? null : limit,
      used: used,
      remaining: unlimited ? null : Math.max(0, limit - used),
      unlimited: unlimited,
      canAdd: unlimited || used < limit
    };
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    PLAN_STORAGE_KEY: PLAN_STORAGE_KEY,
    DEFAULT_TYPE: DEFAULT_TYPE,
    DEFAULT_PLAN: DEFAULT_PLAN,
    TYPES: TYPES,
    getCurrentType: getCurrentType,
    setCurrentType: setCurrentType,
    getCurrentPlan: getCurrentPlan,
    setCurrentPlan: setCurrentPlan,
    getLimitStatus: getLimitStatus,
    isFeatureLocked: isFeatureLocked,
    getConfig: getConfig
  };
})();