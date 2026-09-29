window.GMStoreTypeConfig = (function () {
  'use strict';

  var STORAGE_KEY = 'gm-store-type';
  var PLAN_STORAGE_KEY = 'gm-store-plan';
  var DEFAULT_TYPE = 'cowork';
  var DEFAULT_PLAN = 'free';
  var PLAN_IDS = ['free', 'paid'];

  var FOOD_PLAN_LIMITS = {
    free: { menuItems: 10, menuCategories: 5, ads: 3, tables: 5, reservations: 5 },
    paid: { menuItems: null, menuCategories: null, ads: null, tables: null, reservations: null }
  };

  var FOOD_LOCKED_FEATURES = {
    free: ['qrCode', 'shareWhatsapp', 'cardPayment'],
    paid: []
  };

  var STORE_LOCKED_FEATURES = {
    free: ['qrCode', 'shareWhatsapp', 'cardPayment', 'whatsappOrder'],
    paid: []
  };

  var SUBCATEGORY_ID_KEY = 'gm-store-subcategory-id';
  var SUBCATEGORY_LABEL_KEY = 'gm-store-subcategory';

  var STORE_BASE_FREE_LIMITS = { products: 10, productCategories: 8, ads: 3 };

  var STORE_VARIANTS = {
    general: { key: 'general', freeLimits: {}, hasDiscounts: false, hasAppointments: false, hasProducts: true, hiddenServices: [] },
    grocery: {
      key: 'grocery',
      freeLimits: { products: 15, productCategories: 5 },
      hasDiscounts: false,
      hasAppointments: false,
      hasProducts: true,
      hiddenServices: [],
      serviceIds: ['cash_payment', 'card_payment', 'warranty', 'exchange_return'],
      adTypes: ['offer', 'job'],
      adOptions: { offerPrices: true, linkOnlyForJob: true, limitNotice: true, expiryNotice: true }
    },
    clothing: {
      key: 'clothing',
      freeLimits: { discountedProducts: 5 },
      hasDiscounts: true,
      hasAppointments: false,
      hasProducts: true,
      hasWhatsappOrder: true,
      hiddenServices: ['gift_wrap'],
      serviceIds: ['cash_payment', 'warranty', 'exchange_return', 'size_exchange', 'alteration', 'whatsapp_order', 'card_payment'],
      adTypes: ['offer', 'job'],
      adOptions: { offerPrices: true, linkOnlyForJob: true, limitNotice: true, expiryNotice: true }
    },
    pharmacy: {
      key: 'pharmacy',
      freeLimits: { products: 15, productCategories: 5 },
      hasDiscounts: false,
      hasAppointments: false,
      hasProducts: true,
      hiddenServices: [],
      serviceIds: ['night_duty', 'prescription_order', 'health_check', 'injections', 'cash_payment', 'card_payment'],
      servicesNavSub: 'مناوبة ليلية، وصفات طبية، قياس ضغط وسكر',
      productFields: ['prescription'],
      suggestedCategories: ['أدوية بدون وصفة', 'مسكنات وبرد', 'فيتامينات ومكملات', 'عناية بالبشرة', 'عناية بالشعر', 'أم وطفل', 'إسعافات أولية'],
      adTypes: ['offer', 'job'],
      adOptions: { offerPrices: true, linkOnlyForJob: true, limitNotice: true, expiryNotice: true }
    },
    medical: {
      key: 'medical',
      freeLimits: {},
      hasDiscounts: false,
      hasAppointments: false,
      hasProducts: true,
      hiddenServices: [],
      serviceIds: ['installation', 'device_rental', 'device_maintenance', 'warranty', 'exchange_return', 'cash_payment', 'card_payment'],
      servicesNavSub: 'تركيب، تأجير أجهزة، صيانة، ضمان',
      productFields: ['saleType'],
      suggestedCategories: ['أجهزة قياس', 'كراسي متحركة ومشايات', 'عكازات وجبائر', 'مستهلكات طبية', 'فرشات وأسرّة طبية', 'أجهزة تنفس وأكسجين'],
      adTypes: ['offer', 'job'],
      adOptions: { offerPrices: true, linkOnlyForJob: true, limitNotice: true, expiryNotice: true }
    },
    optics: {
      key: 'optics',
      freeLimits: {},
      hasDiscounts: false,
      hasAppointments: false,
      hasProducts: true,
      hiddenServices: [],
      serviceIds: ['eye_exam', 'lens_fitting', 'glasses_repair', 'warranty', 'exchange_return', 'cash_payment', 'card_payment'],
      servicesNavSub: 'فحص نظر، تركيب عدسات، صيانة نظارات',
      productFields: ['brand'],
      suggestedCategories: ['نظارات طبية', 'نظارات شمسية', 'عدسات طبية', 'عدسات لاصقة', 'سوائل ومنظفات', 'إكسسوارات'],
      adTypes: ['offer', 'job'],
      adOptions: { offerPrices: true, linkOnlyForJob: true, limitNotice: true, expiryNotice: true }
    },
    clinic: {
      key: 'clinic',
      freeLimits: { appointments: 5 },
      hasDiscounts: false,
      hasAppointments: true,
      hasProducts: false,
      hiddenServices: [],
      serviceIds: ['consultation', 'lab_tests', 'xray', 'vaccinations', 'cash_payment', 'card_payment'],
      servicesNavSub: 'كشفية، تحاليل، أشعة، تطعيمات',
      heroWelcomeText: 'عيادتك جاهزة لاستقبال المواعيد وعرض خدماتك من هنا.',
      adTypes: ['offer', 'job'],
      adOptions: { offerPrices: true, linkOnlyForJob: true, limitNotice: true, expiryNotice: true }
    }
  };

  var STORE_SUBCATEGORY_VARIANT = {
    'General Grocery': 'grocery',
    'Supermarket': 'grocery',
    'Vegetables & Fruits': 'grocery',
    'Meat': 'grocery',
    'Fish': 'grocery',
    'Bakery': 'grocery',
    'Sweets & Pastries': 'grocery',
    'Spices & Herbs': 'grocery',
    'Pharmacy': 'pharmacy',
    'Clinic & Medicine': 'clinic',
    'Medical Supplies': 'medical',
    'Optics': 'optics',
    "Men's Clothing": 'clothing',
    "Women's Clothing": 'clothing',
    "Kids' Clothing": 'clothing',
    'Shoes': 'clothing',
    'Accessories': 'clothing',
    'Tailoring': 'clothing'
  };

  var STORE_SUBCATEGORY_AR_TO_ID = {
    'بقالة عامة': 'General Grocery',
    'سوبرماركت': 'Supermarket',
    'خضار وفواكه': 'Vegetables & Fruits',
    'لحوم': 'Meat',
    'أسماك': 'Fish',
    'مخبز': 'Bakery',
    'حلويات ومعجنات': 'Sweets & Pastries',
    'بهارات وأعشاب': 'Spices & Herbs',
    'صيدلية': 'Pharmacy',
    'عيادة وطب': 'Clinic & Medicine',
    'مستلزمات طبية': 'Medical Supplies',
    'بصريات': 'Optics',
    'ملابس رجالية': "Men's Clothing",
    'ملابس نسائية': "Women's Clothing",
    'ملابس أطفال': "Kids' Clothing",
    'أحذية': 'Shoes',
    'إكسسوارات': 'Accessories',
    'خياطة': 'Tailoring'
  };

  var CLOTHING_ONLY_SERVICE_IDS = ['size_exchange', 'alteration', 'whatsapp_order'];
  var HEALTH_ONLY_SERVICE_IDS = ['delivery', 'night_duty', 'prescription_order', 'device_rental', 'eye_exam', 'lens_fitting', 'health_check', 'injections', 'device_maintenance', 'glasses_repair', 'consultation', 'lab_tests', 'xray', 'vaccinations'];

  var storeConfigCache = {};

  function buildStoreLimits(variant) {
    var free = {};
    Object.keys(STORE_BASE_FREE_LIMITS).forEach(function (key) {
      if (variant.hasProducts === false && (key === 'products' || key === 'productCategories')) return;
      free[key] = STORE_BASE_FREE_LIMITS[key];
    });
    Object.keys(variant.freeLimits).forEach(function (key) { free[key] = variant.freeLimits[key]; });
    var paid = {};
    Object.keys(free).forEach(function (key) { paid[key] = null; });
    return { free: free, paid: paid };
  }

  function omitTableLimits(limits) {
    var result = {};
    Object.keys(limits).forEach(function (plan) {
      result[plan] = {};
      Object.keys(limits[plan]).forEach(function (key) {
        if (key !== 'tables' && key !== 'reservations') result[plan][key] = limits[plan][key];
      });
    });
    return result;
  }

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

    restaurant: buildFoodTypeConfig('restaurant', 'مطعم', {
      hasTableBooking: false,
      adTypes: ['offer', 'job'],
      adOptions: { linkOnlyForJob: true },
      adsSubtitle: 'عروض ووظائف تظهر في صفحة نشاطك',
      adsNavSub: 'عروض ووظائف',
      adsPaidLabel: 'نشر عدد غير محدود من الإعلانات (عروض ووظائف)'
    }),
    cafe: buildFoodTypeConfig('cafe', 'كافيه', { hasTableBooking: true }),
    'restaurant-cafe': buildFoodTypeConfig('restaurant-cafe', 'مطعم وكافيه', { hasTableBooking: true }),

    store: buildStoreTypeConfig('store', 'متجر', STORE_VARIANTS.general)

  };

  function buildFoodTypeConfig(id, label, opts) {
    opts = opts || {};
    var hasTableBooking = !!opts.hasTableBooking;

    var sidebar = [
      { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية', sub: 'نظرة عامة على نشاطك' },
      { page: 'menu', href: 'menu.html', icon: 'utensils', label: 'المنيو', sub: 'التصنيفات، الأصناف، الأسعار' },
      { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة', sub: 'المكيف، جلسات خارجية، وأكثر' }
    ];

    var mobileNav = [
      { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية' },
      { page: 'menu', href: 'menu.html', icon: 'utensils', label: 'المنيو' },
      { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة' }
    ];

    var dashboardCards = [
      { page: 'menu', href: 'menu.html', icon: 'utensils', label: 'المنيو', sub: 'التصنيفات والأسعار' },
      { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة', sub: 'المكيف، جلسات خارجية' }
    ];

    if (hasTableBooking) {
      sidebar.push(
        { page: 'tables', href: 'tables.html', icon: 'armchair', label: 'الطاولات', sub: 'عدد الطاولات وحالتها' },
        { page: 'reservations', href: 'reservations.html', icon: 'calendar-check', label: 'الحجوزات', sub: 'طلبات حجز الطاولات الواصلة' }
      );
      mobileNav.push(
        { page: 'tables', href: 'tables.html', icon: 'armchair', label: 'الطاولات' },
        { page: 'reservations', href: 'reservations.html', icon: 'calendar-check', label: 'الحجوزات' }
      );
      dashboardCards.push(
        { page: 'reservations', href: 'reservations.html', icon: 'calendar-check', label: 'الحجوزات', sub: 'طلبات وصلتك أونلاين' },
        { page: 'tables', href: 'tables.html', icon: 'armchair', label: 'الطاولات', sub: 'إدارة عدد وحالة الطاولات' }
      );
    }

    sidebar.push(
      { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', sub: opts.adsNavSub || 'فعاليات، عروض، وظائف', badge: 2 },
      { page: 'packages', href: 'packages.html', icon: 'layers', label: 'الباقات', sub: 'اختر باقة نشاطك' },
      { page: 'profile', href: 'profile.html', icon: 'store', label: 'بروفايل النشاط', sub: 'تعديل المعلومات والصورة' }
    );
    mobileNav.push(
      { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', badge: true }
    );

    var freeFeatures = [
      { label: 'صفحة خاصة بنشاطك على GazaMarket', on: true },
      { label: 'لوحة تحكم لإدارة نشاطك', on: true },
      { label: 'المنيو (حتى ' + FOOD_PLAN_LIMITS.free.menuItems + ' أصناف)', on: true },
      { label: 'حتى ' + FOOD_PLAN_LIMITS.free.menuCategories + ' تصنيفات للمنيو', on: true },
      { label: 'نشر حتى ' + FOOD_PLAN_LIMITS.free.ads + ' إعلانات', on: true },
      { label: 'الخدمات المتاحة الأساسية', on: true },
      { label: 'إشعارات لوحة التحكم', on: true }
    ];
    if (hasTableBooking) {
      freeFeatures.push(
        { label: 'إضافة حتى ' + FOOD_PLAN_LIMITS.free.tables + ' طاولات', on: true },
        { label: 'استقبال حتى ' + FOOD_PLAN_LIMITS.free.reservations + ' حجوزات', on: true }
      );
    }
    freeFeatures.push(
      { label: 'منيو غير محدود', on: false },
      { label: 'إعلانات غير محدودة', on: false }
    );
    if (hasTableBooking) {
      freeFeatures.push(
        { label: 'طاولات غير محدودة', on: false },
        { label: 'حجوزات غير محدودة', on: false }
      );
    }
    freeFeatures.push(
      { label: 'شارة "مميز" وأولوية الظهور', on: false },
      { label: 'إحصائيات النشاط', on: false },
      { label: 'كود QR لصفحة النشاط', on: false },
      { label: 'المشاركة عبر واتساب', on: false },
      { label: 'إظهار الدفع بالبطاقة للزوار', on: false },
      { label: 'إشعارات فورية', on: false }
    );

    var paidFeatures = [
      'صفحة خاصة بنشاطك على GazaPrice',
      'لوحة تحكم لإدارة نشاطك',
      'منيو غير محدود (تصنيفات وأصناف بلا حدود)',
      opts.adsPaidLabel || 'نشر عدد غير محدود من الإعلانات (عروض، فعاليات، وظائف)'
    ];
    if (hasTableBooking) {
      paidFeatures.push(
        'طاولات غير محدودة',
        'استقبال حجوزات غير محدودة أونلاين'
      );
    }
    paidFeatures.push(
      'شارة "مميز" وأولوية الظهور في نتائج البحث',
      'إحصائيات النشاط (مشاهدات الصفحة، مشاهدات المنيو، تفاعل الإعلانات)',
      'كود QR لصفحة النشاط',
      'مشاركة صفحة النشاط مباشرة عبر واتساب',
      'إظهار الدفع بالبطاقة للزوار في صفحة النشاط',
      'إشعارات فورية (تنبيهات، تذكير تجديد)'
    );

    return {
      id: id,
      label: label,
      fallbackAvatarLetter: 'ن',
      hasTableBooking: hasTableBooking,
      sidebar: sidebar,
      mobileNav: mobileNav,
      services: [
        { id: 'ac', label: 'المكيف', icon: 'air-vent' },
        { id: 'family_section', label: 'قسم خاص للعائلات', icon: 'users' },
        { id: 'outdoor_seating', label: 'جلسات خارجية', icon: 'armchair' },
        { id: 'payment_methods', label: 'نقبل الدفع كاش وتطبيق', icon: 'banknote-arrow-up' },
        { id: 'payment_methods-tow', label: 'نقبل الدفع عبر البطاقة', icon: 'credit-card-check' },
        { id: 'parking', label: 'موقف سيارات', icon: 'car' }
      ],
      dashboardCards: dashboardCards,
      limits: hasTableBooking ? FOOD_PLAN_LIMITS : omitTableLimits(FOOD_PLAN_LIMITS),
      lockedFeatures: FOOD_LOCKED_FEATURES,
      adTypes: opts.adTypes || ['activity', 'offer'],
      adOptions: opts.adOptions || {},
      pageCopy: {
        profileTitle: 'بيانات النشاط',
        entityNameLabel: 'اسم النشاط',
        adsSubtitle: opts.adsSubtitle || 'عروض وفعاليات تظهر في صفحة نشاطك',
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
          features: freeFeatures
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
          features: paidFeatures
        }
      }
    };
  }

  function buildStoreTypeConfig(id, label, variant) {
    var limits = buildStoreLimits(variant);
    var free = limits.free;

    var serviceCatalog = [
      { id: 'installation', label: 'تركيب فني', icon: 'wrench' },
      { id: 'cash_payment', label: 'نقبل الدفع كاش وتطبيق', icon: 'banknote-arrow-up' },
      { id: 'card_payment', label: 'دفع بالبطاقة', icon: 'credit-card' },
      { id: 'warranty', label: 'ضمان على المنتجات', icon: 'shield-check' },
      { id: 'gift_wrap', label: 'تغليف هدايا', icon: 'gift' },
      { id: 'exchange_return', label: 'استبدال واسترجاع', icon: 'repeat' },
      { id: 'size_exchange', label: 'تبديل المقاسات', icon: 'ruler' },
      { id: 'alteration', label: 'تعديل المقاس / الخياطة', icon: 'scissors' },
      { id: 'whatsapp_order', label: 'الطلب عبر واتساب', icon: 'message-circle' },
      { id: 'delivery', label: 'خدمة توصيل', icon: 'truck' },
      { id: 'night_duty', label: 'مناوبة ليلية', icon: 'moon' },
      { id: 'prescription_order', label: 'استقبال الوصفات الطبية', icon: 'file-text' },
      { id: 'device_rental', label: 'تأجير أجهزة طبية', icon: 'calendar-clock' },
      { id: 'eye_exam', label: 'فحص نظر', icon: 'eye' },
      { id: 'lens_fitting', label: 'تركيب عدسات', icon: 'glasses' },
      { id: 'health_check', label: 'قياس ضغط وسكر', icon: 'heart-pulse' },
      { id: 'injections', label: 'حقن وتضميد', icon: 'syringe' },
      { id: 'device_maintenance', label: 'صيانة أجهزة طبية', icon: 'settings' },
      { id: 'glasses_repair', label: 'صيانة وتعديل النظارات', icon: 'hammer' },
      { id: 'consultation', label: 'كشفية', icon: 'stethoscope' },
      { id: 'lab_tests', label: 'تحاليل مخبرية', icon: 'flask-conical' },
      { id: 'xray', label: 'أشعة', icon: 'scan' },
      { id: 'vaccinations', label: 'تطعيمات', icon: 'shield-plus' }
    ];

    var services;
    if (Array.isArray(variant.serviceIds)) {
      services = variant.serviceIds.map(function (serviceId) {
        return serviceCatalog.filter(function (service) { return service.id === serviceId; })[0];
      }).filter(Boolean);
    } else {
      services = serviceCatalog.filter(function (service) {
        return service.id !== 'cash_payment' &&
          CLOTHING_ONLY_SERVICE_IDS.indexOf(service.id) === -1 &&
          HEALTH_ONLY_SERVICE_IDS.indexOf(service.id) === -1 &&
          variant.hiddenServices.indexOf(service.id) === -1;
      });
    }

    var hasOfferJobAds = Array.isArray(variant.adTypes);
    var freeAdsLabel = 'نشر حتى ' + free.ads + ' إعلانات' + (hasOfferJobAds ? ' (عروض ووظائف)' : '');
    var paidAdsLabel = hasOfferJobAds
      ? 'نشر عدد غير محدود من الإعلانات (عروض، وظائف)'
      : 'نشر عدد غير محدود من الإعلانات (عروض، تخفيضات، منتجات جديدة)';

    var hasProducts = variant.hasProducts !== false;

    var freeFeatures = [
      { label: 'صفحة خاصة بمتجرك على GazaPrice', on: true },
      { label: 'لوحة تحكم لإدارة متجرك', on: true }
    ];
    if (hasProducts) {
      freeFeatures.push(
        { label: 'إضافة حتى ' + free.products + ' منتج', on: true },
        { label: 'حتى ' + free.productCategories + ' تصنيفات للمنتجات', on: true }
      );
    }
    freeFeatures.push(
      { label: 'الخدمات المتاحة', on: true },
      { label: freeAdsLabel, on: true }
    );
    if (variant.hasDiscounts) {
      freeFeatures.push({ label: 'تفعيل الخصم لحتى ' + free.discountedProducts + ' منتجات', on: true });
    }
    if (variant.hasAppointments) {
      freeFeatures.push({ label: 'استقبال حتى ' + free.appointments + ' حجوزات مواعيد', on: true });
    }
    if (variant.hasWhatsappOrder) {
      freeFeatures.push({ label: 'الطلب عبر واتساب', on: false });
    }
    freeFeatures.push(
      { label: 'إشعارات لوحة التحكم', on: true }
    );
    if (hasProducts) {
      freeFeatures.push({ label: 'منتجات وتصنيفات غير محدودة', on: false });
    }
    freeFeatures.push({ label: 'إعلانات غير محدودة', on: false });
    if (variant.hasDiscounts) {
      freeFeatures.push({ label: 'خصم غير محدود على المنتجات', on: false });
    }
    if (variant.hasAppointments) {
      freeFeatures.push({ label: 'حجوزات مواعيد غير محدودة', on: false });
    }
    freeFeatures.push(
      { label: 'شارة "مميز" وأولوية الظهور', on: false },
      { label: 'إحصائيات المتجر', on: false },
      { label: 'كود QR لصفحة المتجر', on: false },
      { label: 'المشاركة عبر واتساب', on: false },
      { label: 'إظهار الدفع بالبطاقة للزوار', on: false },
      { label: 'إشعارات فورية', on: false }
    );

    var servicesNavSub = variant.servicesNavSub || 'تركيب، ضمان، استبدال';
    var adsNavSub = hasOfferJobAds ? 'عروض ووظائف' : 'عروض وتخفيضات';
    var adsSubtitle = hasOfferJobAds
      ? 'عروض ووظائف تظهر في صفحة متجرك'
      : 'عروض وتخفيضات ومنتجات جديدة تظهر في صفحة متجرك';

    var paidFeatures = [
      'صفحة خاصة بمتجرك على GazaPrice',
      'لوحة تحكم لإدارة متجرك'
    ];
    if (hasProducts) {
      paidFeatures.push('منتجات وتصنيفات غير محدودة');
    }
    paidFeatures.push(paidAdsLabel);
    if (variant.hasDiscounts) {
      paidFeatures.push('تفعيل الخصم على عدد غير محدود من المنتجات');
    }
    if (variant.hasAppointments) {
      paidFeatures.push('استقبال حجوزات مواعيد غير محدودة أونلاين');
    }
    if (variant.hasWhatsappOrder) {
      paidFeatures.push('استقبال طلبات الزباين عبر واتساب');
    }
    paidFeatures.push(
      'شارة "مميز" وأولوية الظهور في نتائج البحث',
      'إحصائيات المتجر (مشاهدات الصفحة، مشاهدات المنتجات، تفاعل الإعلانات)',
      'كود QR لصفحة المتجر',
      'مشاركة صفحة المتجر مباشرة عبر واتساب',
      'إظهار الدفع بالبطاقة للزوار في صفحة المتجر',
      'إشعارات فورية (تنبيهات، تذكير تجديد)'
    );

    var sidebar = [
      { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية', sub: 'نظرة عامة على متجرك' }
    ];
    var mobileNav = [
      { page: 'dashboard', href: 'dashboard.html', icon: 'layout-grid', label: 'الرئيسية' }
    ];
    var dashboardCards = [];

    if (hasProducts) {
      sidebar.push({ page: 'prices', href: 'prices.html', icon: 'shopping-bag', label: 'المنتجات والأسعار', sub: 'الأصناف، الأسعار، التوفر' });
      mobileNav.push({ page: 'prices', href: 'prices.html', icon: 'shopping-bag', label: 'المنتجات' });
      dashboardCards.push({ page: 'prices', href: 'prices.html', icon: 'shopping-bag', label: 'المنتجات والأسعار', sub: 'الأصناف والتوفر' });
    }

    sidebar.push(
      { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة', sub: servicesNavSub },
      { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', sub: adsNavSub, badge: 2 },
      { page: 'packages', href: 'packages.html', icon: 'layers', label: 'الباقات', sub: 'اختر باقة متجرك' },
      { page: 'profile', href: 'profile.html', icon: 'store', label: 'بروفايل المتجر', sub: 'تعديل المعلومات والصورة' }
    );
    mobileNav.push(
      { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة' },
      { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', badge: true }
    );
    dashboardCards.push(
      { action: 'open-services-edit', href: '#', icon: 'wrench', label: 'الخدمات المتاحة', sub: servicesNavSub },
      { page: 'ads', href: 'ads.html', icon: 'megaphone', label: 'الإعلانات', sub: adsNavSub }
    );

    return {
      id: id,
      label: label,
      variant: variant.key,
      hasDiscounts: variant.hasDiscounts,
      hasAppointments: variant.hasAppointments,
      hasProducts: hasProducts,
      productFields: variant.productFields || [],
      suggestedCategories: variant.suggestedCategories || [],
      fallbackAvatarLetter: 'م',
      sidebar: sidebar,
      mobileNav: mobileNav,
      services: services,
      dashboardCards: dashboardCards,
      limits: limits,
      lockedFeatures: STORE_LOCKED_FEATURES,
      adTypes: variant.adTypes,
      adOptions: variant.adOptions,
      pageCopy: {
        profileTitle: 'بيانات المتجر',
        entityNameLabel: 'اسم المتجر',
        adsSubtitle: adsSubtitle,
        heroWelcomeText: variant.heroWelcomeText || 'متجرك جاهز لعرض منتجاتك وخدماتك من هنا.'
      },
      packages: {
        pageSubtitle: 'اختر باقة متجرك',
        entityNameLabel: 'اسم المتجر',
        free: {
          eyebrow: 'FREE',
          name: 'مجاني',
          desc: 'لوحة تحكم ومعلومات أساسية لمتجرك',
          price: 0,
          features: freeFeatures
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
          features: paidFeatures
        }
      }
    };
  }

  function getStoreSubcategoryId() {
    try {
      var storedId = window.localStorage.getItem(SUBCATEGORY_ID_KEY);
      if (storedId && STORE_SUBCATEGORY_VARIANT[storedId]) return storedId;
      var storedLabel = window.localStorage.getItem(SUBCATEGORY_LABEL_KEY);
      if (storedLabel) {
        if (STORE_SUBCATEGORY_VARIANT[storedLabel]) return storedLabel;
        if (STORE_SUBCATEGORY_AR_TO_ID[storedLabel]) return STORE_SUBCATEGORY_AR_TO_ID[storedLabel];
      }
    } catch (e) { }
    return null;
  }

  function getStoreVariantKey() {
    var subcategoryId = getStoreSubcategoryId();
    return (subcategoryId && STORE_SUBCATEGORY_VARIANT[subcategoryId]) || 'general';
  }

  function getStoreConfig() {
    var key = getStoreVariantKey();
    if (!storeConfigCache[key]) {
      storeConfigCache[key] = buildStoreTypeConfig('store', 'متجر', STORE_VARIANTS[key] || STORE_VARIANTS.general);
    }
    return storeConfigCache[key];
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
    if (id === 'store') return getStoreConfig();
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
    SUBCATEGORY_ID_KEY: SUBCATEGORY_ID_KEY,
    DEFAULT_TYPE: DEFAULT_TYPE,
    DEFAULT_PLAN: DEFAULT_PLAN,
    TYPES: TYPES,
    getCurrentType: getCurrentType,
    getStoreSubcategoryId: getStoreSubcategoryId,
    setCurrentType: setCurrentType,
    getCurrentPlan: getCurrentPlan,
    setCurrentPlan: setCurrentPlan,
    getLimitStatus: getLimitStatus,
    isFeatureLocked: isFeatureLocked,
    getConfig: getConfig
  };
})();