(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'gaza-market-dashboard-theme';
  var PROFILE_STORAGE_KEY = 'gmDashboardProfile';
  var OPEN_STORAGE_KEY = 'gmDashboardOpenStatus';
  var PRICES_HOURS_STORAGE_KEY = 'gmDashboardPricesHours';
  var SERVICES_STORAGE_KEY = 'gmDashboardServices';
  var SUBSCRIBERS_STORAGE_KEY = 'gmDashboardSubscribers';
  var SUBSCRIPTION_REQUESTS_STORAGE_KEY = 'gmDashboardSubscriptionRequests';
  var ADS_STORAGE_KEY = 'gmDashboardAds';

  var PUBLIC_BASE_URL = 'https://gazaprice.com';

  var SERVICE_IDS = ['wifi', 'electricity', 'printing', 'screens', 'private_rooms', 'drinks'];

  var CURRENT_SCRIPT_URL = document.currentScript ? document.currentScript.src : null;
  var PARTIALS_BASE_URL = CURRENT_SCRIPT_URL
    ? new URL('../dashboard-users/partials/', CURRENT_SCRIPT_URL).href
    : null;

  var DASHBOARD_USERS_BASE_URL = CURRENT_SCRIPT_URL
    ? new URL('../dashboard-users/', CURRENT_SCRIPT_URL).href
    : null;
  var PROFILE_PAGE_URL = DASHBOARD_USERS_BASE_URL
    ? new URL('profile.html', DASHBOARD_USERS_BASE_URL).href
    : 'profile.html';

  async function loadPartial(selector, filename) {
    var host = document.querySelector(selector);
    if (!host) return;
    if (!PARTIALS_BASE_URL) {
      host.innerHTML =
        '<div style="padding:14px;font-size:12.5px;color:#d93025;">' +
        'تعذّر تحديد مسار الجزء (' + filename + '). تأكد أن usere-dashboard.js محمّل عبر وسم &lt;script src="..."&gt; عادي.' +
        '</div>';
      return;
    }
    var url = new URL(filename, PARTIALS_BASE_URL).href;
    try {
      var res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      host.innerHTML = await res.text();
    } catch (err) {
      host.innerHTML =
        '<div style="padding:14px;font-size:12.5px;color:#d93025;">' +
        'تعذّر تحميل الجزء (' + url + '). تأكد من تشغيل الموقع عبر خادم ويب وليس مباشرة من الملفات.' +
        '</div>';
      console.error('Failed to load partial:', url, err);
    }
  }

  function ensureMobileNavHost() {
    var host = document.getElementById('mobile-nav-slot');
    if (!host) {
      host = document.createElement('div');
      host.id = 'mobile-nav-slot';
      document.body.appendChild(host);
    }
    return host;
  }

  /*
   * بناء عناصر السايدبار وقائمة الموبايل ديناميكياً حسب نوع النشاط الحالي
   * (GMStoreTypeConfig). لو الملف مش محمّل لأي سبب، بيسيب الـ HTML الثابت
   * الموجود أصلاً في الـ partial زي ما هو (سلوك احتياطي آمن).
   */
  function getStoreTypeConfig() {
    if (window.GMStoreTypeConfig && typeof window.GMStoreTypeConfig.getConfig === 'function') {
      return window.GMStoreTypeConfig.getConfig();
    }
    return null;
  }

  function navItemAttrs(item) {
    var attrs = '';
    if (item.page) attrs += ' data-page="' + item.page + '"';
    if (item.action) attrs += ' data-action="' + item.action + '"';
    return attrs;
  }

  function renderSidebarNav() {
    var config = getStoreTypeConfig();
    if (!config) return;
    var nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    var html = config.sidebar.map(function (item) {
      var badge = item.badge ? '<span class="nav-item-badge">' + item.badge + '</span>' : '';
      return (
        '<a href="' + (item.href || '#') + '" class="nav-item"' + navItemAttrs(item) + '>' +
          '<span class="nav-item-icon"><i data-lucide="' + item.icon + '" class="icon"></i></span>' +
          '<span class="nav-item-text">' +
            '<span class="nav-item-label">' + item.label + '</span>' +
            '<span class="label-sub">' + item.sub + '</span>' +
          '</span>' +
          badge +
          '<i data-lucide="chevron-left" class="icon nav-item-chevron"></i>' +
        '</a>'
      );
    }).join('');

    nav.innerHTML = html;
  }

  function renderMobileNav() {
    var config = getStoreTypeConfig();
    if (!config) return;
    var nav = document.getElementById('mobile-bottom-nav');
    if (!nav) return;

    var moreBtn = nav.querySelector('[data-action="open-mobile-more"]');
    var moreBtnHTML = moreBtn ? moreBtn.outerHTML : '';

    var itemsHTML = config.mobileNav.map(function (item) {
      var badge = item.badge ? '<span class="mobile-nav-badge"></span>' : '';
      return (
        '<a href="' + (item.href || '#') + '" class="mobile-nav-item"' + navItemAttrs(item) + '>' +
          '<i data-lucide="' + item.icon + '" class="icon"></i>' +
          '<span>' + item.label + '</span>' +
          badge +
        '</a>'
      );
    }).join('');

    nav.innerHTML = itemsHTML + moreBtnHTML;
  }

  function applyStoreTypeLabel() {
    var config = getStoreTypeConfig();
    if (!config) return;
    document.querySelectorAll('[data-store-type-label]').forEach(function (el) {
      el.textContent = config.label;
    });
  }

  function markActiveNavItem() {
    var page = document.body.getAttribute('data-page');
    if (!page) return;
    document.querySelectorAll('.nav-item[data-page]').forEach(function (el) {
      if (el.getAttribute('data-page') === page) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    document.querySelectorAll('.mobile-nav-item[data-page]').forEach(function (el) {
      if (el.getAttribute('data-page') === page) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  function wireDrawer() {
    var panel = document.querySelector('.side-panel');
    var scrim = document.querySelector('.scrim');
    var openBtn = document.querySelector('[data-action="open-sidebar"]');
    var closeBtn = document.querySelector('[data-action="close-sidebar"]');
    if (!panel) return;

    function open() {
      panel.classList.add('open');
      if (scrim) scrim.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      panel.classList.remove('open');
      if (scrim) scrim.classList.remove('visible');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (scrim) scrim.addEventListener('click', close);

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function closeSidebarDrawerIfNeeded() {
    var panel = document.querySelector('.side-panel');
    if (!panel || !panel.classList.contains('open')) return;
    var scrim = document.querySelector('.scrim');
    panel.classList.remove('open');
    if (scrim) scrim.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function wireMobileMoreSheet() {
    document.addEventListener('click', function (e) {
      var openTrigger = e.target.closest && e.target.closest('[data-action="open-mobile-more"]');
      if (openTrigger) {
        e.preventDefault();
        openMobileMoreSheet();
        return;
      }
      var closeTrigger = e.target.closest && e.target.closest('[data-action="close-mobile-more"]');
      if (closeTrigger) {
        closeMobileMoreSheet();
        return;
      }
      var scrim = document.getElementById('mobile-more-scrim');
      if (scrim && e.target === scrim) {
        closeMobileMoreSheet();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileMoreSheet();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) closeMobileMoreSheet();
    });
  }

  function openMobileMoreSheet() {
    var sheet = document.getElementById('mobile-more-sheet');
    var scrim = document.getElementById('mobile-more-scrim');
    if (!sheet) return;
    sheet.classList.add('open');
    if (scrim) scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMoreSheet() {
    var sheet = document.getElementById('mobile-more-sheet');
    var scrim = document.getElementById('mobile-more-scrim');
    if (!sheet || !sheet.classList.contains('open')) return;
    sheet.classList.remove('open');
    if (scrim) scrim.classList.remove('open');
    document.body.style.overflow = '';
  }

  function wireSwitches() {
    document.querySelectorAll('.switch:not([data-action="toggle-open"])').forEach(function (el) {
      el.addEventListener('click', function () {
        el.classList.toggle('on');
      });
      el.setAttribute('role', 'switch');
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    });
  }

  function applyTheme(theme) {
    var isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    var toggleBtn = document.querySelector('[data-action="toggle-theme"]');
    if (toggleBtn) {
      var icon = toggleBtn.querySelector('[data-lucide]');
      if (icon) {
        var newIconName = isDark ? 'sun' : 'moon';
        icon.setAttribute('data-lucide', newIconName);
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      }
      toggleBtn.setAttribute('aria-label', isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي');
    }
  }

  function wireThemeToggle() {
    var stored = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch (err) {}
    var initialTheme = stored === 'dark' ? 'dark' : 'light';
    applyTheme(initialTheme);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-action="toggle-theme"]');
      if (!btn) return;
      var isDark = document.body.classList.contains('dark-mode');
      var nextTheme = isDark ? 'light' : 'dark';
      applyTheme(nextTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch (err) {}
    });
  }

  function wireTopnavAccountLink() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-action="go-to-profile"]');
      if (!btn) return;
      window.location.href = PROFILE_PAGE_URL;
    });
  }

  function bootIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  var CURRENT_PLAN_NAME = 'مجانية';

  var GAZA_TZ = 'Asia/Gaza';
  var GAZA_LAT = 31.5;
  var GAZA_LNG = 34.45;

  var PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  var PRAYER_LABELS = {
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };

  function degToRad(d) { return (d * Math.PI) / 180; }
  function radToDeg(r) { return (r * 180) / Math.PI; }

  function fixAngle(angle) {
    angle = angle - 360 * Math.floor(angle / 360);
    return angle < 0 ? angle + 360 : angle;
  }

  function fixHour(hour) {
    hour = hour - 24 * Math.floor(hour / 24);
    return hour < 0 ? hour + 24 : hour;
  }

  function julianDate(year, month, day) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    var A = Math.floor(year / 100);
    var B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  }

  function sunPosition(jd) {
    var D = jd - 2451545.0;
    var g = fixAngle(357.529 + 0.98560028 * D);
    var q = fixAngle(280.459 + 0.98564736 * D);
    var L = fixAngle(q + 1.915 * Math.sin(degToRad(g)) + 0.02 * Math.sin(degToRad(2 * g)));
    var e = 23.439 - 0.00000036 * D;

    var RA = radToDeg(Math.atan2(Math.cos(degToRad(e)) * Math.sin(degToRad(L)), Math.cos(degToRad(L)))) / 15;
    RA = fixHour(RA);

    var eqt = q / 15 - RA;
    var decl = radToDeg(Math.asin(Math.sin(degToRad(e)) * Math.sin(degToRad(L))));

    return { declination: decl, equation: eqt };
  }

  function hourAngle(angleDeg, lat, decl) {
    var latR = degToRad(lat);
    var declR = degToRad(decl);
    var cosH =
      (-Math.sin(degToRad(angleDeg)) - Math.sin(latR) * Math.sin(declR)) /
      (Math.cos(latR) * Math.cos(declR));
    cosH = Math.max(-1, Math.min(1, cosH));
    return radToDeg(Math.acos(cosH)) / 15;
  }

  function asrHourAngle(shadowFactor, lat, decl) {
    var latR = degToRad(lat);
    var declR = degToRad(decl);
    var angleDeg = -radToDeg(Math.atan(1 / (shadowFactor + Math.tan(Math.abs(latR - declR)))));
    return hourAngle(angleDeg, lat, decl);
  }

  function getPrayerTimesForDay(year, month, day, lat, lng, tzOffsetHours) {
    var jd = julianDate(year, month, day) - lng / (15 * 24);
    var sun = sunPosition(jd);
    var decl = sun.declination;
    var eqt = sun.equation;

    var dhuhr = fixHour(12 - eqt + tzOffsetHours - lng / 15);

    var fajrAngle = 18;
    var ishaAngle = 17;

    return {
      fajr: fixHour(dhuhr - hourAngle(fajrAngle, lat, decl)),
      sunrise: fixHour(dhuhr - hourAngle(0.833, lat, decl)),
      dhuhr: dhuhr,
      asr: fixHour(dhuhr + asrHourAngle(1, lat, decl)),
      maghrib: fixHour(dhuhr + hourAngle(0.833, lat, decl)),
      isha: fixHour(dhuhr + hourAngle(ishaAngle, lat, decl))
    };
  }

  function getUtcOffsetHours(date, timeZone) {
    var dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    var parts = dtf.formatToParts(date).reduce(function (acc, p) {
      acc[p.type] = p.value;
      return acc;
    }, {});
    var hour = parts.hour === '24' ? 0 : Number(parts.hour);
    var asUtcMs = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      hour,
      Number(parts.minute),
      Number(parts.second)
    );
    var rawOffset = (asUtcMs - date.getTime()) / 3600000;
    return Math.round(rawOffset * 60) / 60;
  }

  function getDateParts(date, timeZone) {
    var dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    var parts = dtf.formatToParts(date).reduce(function (acc, p) {
      acc[p.type] = p.value;
      return acc;
    }, {});
    return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
  }

  function gazaDecimalHourToUtcMs(year, month, day, decimalHour, tzOffsetHours) {
    return Date.UTC(year, month - 1, day, 0, 0, 0) + (decimalHour - tzOffsetHours) * 3600000;
  }

  function formatRemaining(ms) {
    var totalMinutes = Math.max(0, Math.round(ms / 60000));
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    if (hours <= 0) return 'بعد ' + minutes + ' دقيقة';
    if (minutes <= 0) return 'بعد ' + hours + ' ساعة';
    return 'بعد ' + hours + ' ساعة و' + minutes + ' دقيقة';
  }

  function findNextPrayer(now) {
    var offset = getUtcOffsetHours(now, GAZA_TZ);
    var todayParts = getDateParts(now, GAZA_TZ);
    var todayTimes = getPrayerTimesForDay(todayParts.year, todayParts.month, todayParts.day, GAZA_LAT, GAZA_LNG, offset);

    for (var i = 0; i < PRAYER_ORDER.length; i++) {
      var key = PRAYER_ORDER[i];
      var ms = gazaDecimalHourToUtcMs(todayParts.year, todayParts.month, todayParts.day, todayTimes[key], offset);
      if (ms > now.getTime()) {
        return { key: key, name: PRAYER_LABELS[key], ms: ms };
      }
    }

    var tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
    var tOffset = getUtcOffsetHours(tomorrow, GAZA_TZ);
    var tParts = getDateParts(tomorrow, GAZA_TZ);
    var tTimes = getPrayerTimesForDay(tParts.year, tParts.month, tParts.day, GAZA_LAT, GAZA_LNG, tOffset);
    var fajrMs = gazaDecimalHourToUtcMs(tParts.year, tParts.month, tParts.day, tTimes.fajr, tOffset);
    return { key: 'fajr', name: PRAYER_LABELS.fajr, ms: fajrMs };
  }

  function updateAzanPill() {
    var textEl = document.getElementById('hero-azan-text');
    if (!textEl) return;
    try {
      var now = new Date();
      var next = findNextPrayer(now);
      textEl.textContent = 'أذان ' + next.name + ' ' + formatRemaining(next.ms - now.getTime());
    } catch (err) {
      textEl.textContent = 'تعذّر حساب موعد الأذان';
      console.error('Azan countdown error:', err);
    }
  }

  function updateHeroDateLine() {
    var el = document.getElementById('hero-date-line');
    if (!el) return;
    try {
      var now = new Date();

      var weekday = new Intl.DateTimeFormat('ar-u-nu-latn', { weekday: 'long', timeZone: GAZA_TZ }).format(now);
      var gDay = new Intl.DateTimeFormat('ar-u-nu-latn', { day: 'numeric', timeZone: GAZA_TZ }).format(now);
      var gMonth = new Intl.DateTimeFormat('ar-u-nu-latn', { month: 'long', timeZone: GAZA_TZ }).format(now);

      var hijriParts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: GAZA_TZ
      })
        .formatToParts(now)
        .reduce(function (acc, p) {
          acc[p.type] = p.value;
          return acc;
        }, {});

      el.textContent =
        weekday + '، ' + gDay + ' ' + gMonth + ' · ' + hijriParts.day + ' ' + hijriParts.month + ' ' + hijriParts.year;
    } catch (err) {
      console.error('Hero date line error:', err);
    }
  }

  function updateHeroPlanChip() {
    var el = document.getElementById('hero-plan-chip');
    if (el) el.textContent = 'باقة ' + CURRENT_PLAN_NAME;
  }

  function initHeroDynamicInfo() {
    updateHeroDateLine();
    updateHeroPlanChip();
    updateAzanPill();
    setInterval(function () {
      updateHeroDateLine();
      updateAzanPill();
    }, 60 * 1000);
  }

  function getStoredProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function setStoredProfile(profile) {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {}
  }

  // رابط المساحة العام. الأولوية لما يرجعه الباك (publicUrl ثم slug).
  // الفرع الأخير (الاسم) حل مؤقت قبل وجود الباك، ويُحذف عند ربط الـ API.
  function getPublicUrl(profile) {
    profile = profile || {};
    if (profile.publicUrl) return String(profile.publicUrl);
    if (profile.slug) return PUBLIC_BASE_URL + '/' + encodeURIComponent(profile.slug);
    var slugSource = (profile.name || 'مساحتي').trim();
    return PUBLIC_BASE_URL + '/' + encodeURIComponent(slugSource);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      var ok = false;
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        ok = document.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      document.body.removeChild(area);
      if (ok) {
        resolve();
      } else {
        reject();
      }
    });
  }

  function getStoredOpenStatus() {
    try {
      var v = localStorage.getItem(OPEN_STORAGE_KEY);
      if (v === null) return true;
      return v === 'true';
    } catch (err) {
      return true;
    }
  }

  function setStoredOpenStatus(isOpen) {
    try {
      localStorage.setItem(OPEN_STORAGE_KEY, isOpen ? 'true' : 'false');
    } catch (err) {}
  }

  function getStoredPricesHours() {
    try {
      var raw = localStorage.getItem(PRICES_HOURS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function setStoredPricesHours(data) {
    try {
      localStorage.setItem(PRICES_HOURS_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {}
  }

  function getStoredServices() {
    try {
      var raw = localStorage.getItem(SERVICES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function setStoredServices(data) {
    try {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {}
  }

  function getStoredSubscribers() {
    try {
      var raw = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function setStoredSubscribers(list) {
    try {
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {}
  }

  function generateSubscriberId() {
    return 'sub_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getStoredSubscriptionRequests() {
    try {
      var raw = localStorage.getItem(SUBSCRIPTION_REQUESTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function setStoredSubscriptionRequests(list) {
    try {
      localStorage.setItem(SUBSCRIPTION_REQUESTS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {}
  }

  function generateRequestId() {
    return 'req_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function findSubscriptionRequestById(id) {
    var list = getStoredSubscriptionRequests();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function gmSubmitSubscriptionRequest(data) {
    data = data || {};
    var name = (data.name || '').toString().trim();
    var whatsapp = (data.whatsapp || '').toString().trim();
    if (!name) throw new Error('gmSubmitSubscriptionRequest: name is required');
    if (!whatsapp) throw new Error('gmSubmitSubscriptionRequest: whatsapp is required');

    var request = {
      id: generateRequestId(),
      name: name,
      countryCode: (data.countryCode || '970').toString().trim(),
      whatsapp: whatsapp,
      duration: ['day', 'week', 'month'].indexOf(data.duration) !== -1 ? data.duration : 'month',
      note: (data.note || '').toString().trim(),
      createdAt: Date.now()
    };

    var list = getStoredSubscriptionRequests();
    list.unshift(request);
    setStoredSubscriptionRequests(list);

    if (typeof window.renderSubscriptionRequestsPage === 'function') {
      window.renderSubscriptionRequestsPage();
    }

    return request;
  }

  window.gmSubmitSubscriptionRequest = gmSubmitSubscriptionRequest;

  function formatRequestDateTime(timestamp) {
    try {
      return new Intl.DateTimeFormat('ar', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: GAZA_TZ
      }).format(new Date(timestamp));
    } catch (err) {
      return new Date(timestamp).toLocaleString();
    }
  }

  function renderSubscriptionRequestsPage() {
    var tbody = document.getElementById('req-table-body');
    var cardsWrap = document.getElementById('req-cards-wrap');
    var dataWrap = document.getElementById('req-data-wrap');
    var emptyState = document.getElementById('req-empty-state');
    if (!tbody) return;

    var list = getStoredSubscriptionRequests();

    var rowsHtml = '';
    var cardsHtml = '';

    list.forEach(function (req) {
      var whatsappDisplay = '+' + (req.countryCode || '970') + req.whatsapp;
      var avatarLetter = escapeHtml((req.name || '').trim().charAt(0) || '؟');
      var durationLabel = DURATION_LABELS[req.duration] || req.duration;
      var dateLabel = formatRequestDateTime(req.createdAt);

      rowsHtml +=
        '<tr>' +
          '<td><div class="flex gap-12">' +
              '<div class="avatar">' + avatarLetter + '</div>' +
              '<div>' +
                '<div style="font-weight:700;display:flex;align-items:center;gap:6px;">' +
                  escapeHtml(req.name) +
                  '<span class="badge amber">جديد</span>' +
                '</div>' +
                '<div class="sub" style="font-size:12px;color:var(--db-text-tertiary);">' +
                  (req.note ? escapeHtml(req.note) : 'لا يوجد') +
                '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td><div class="flex gap-8">' +
              '<i data-lucide="message-circle" class="icon" style="color:var(--db-text-tertiary);"></i>' +
              '<span class="mono">' + escapeHtml(whatsappDisplay) + '</span>' +
            '</div></td>' +
          '<td>' + durationLabel + '</td>' +
          '<td class="mono" style="direction:ltr;text-align:right;">' + dateLabel + '</td>' +
          '<td>' +
            '<div class="flex gap-8">' +
              '<button type="button" class="btn btn-primary btn-sm" data-action="approve-request" data-id="' + req.id + '">موافقة</button>' +
              '<button type="button" class="btn btn-danger btn-sm" data-action="reject-request" data-id="' + req.id + '">رفض</button>' +
            '</div>' +
          '</td>' +
        '</tr>';

      cardsHtml +=
        '<div class="sub-card" data-id="' + req.id + '">' +
          '<div class="sub-card-top">' +
            '<span class="badge amber">جديد</span>' +
            '<div class="sub-card-name">' + escapeHtml(req.name) + '</div>' +
          '</div>' +
          '<div class="sub-card-row mono">' +
            '<i data-lucide="message-circle" class="icon"></i>' +
            '<span>' + escapeHtml(whatsappDisplay) + '</span>' +
          '</div>' +
          '<div class="sub-card-row">' + durationLabel + ' \u00b7 ' + dateLabel + '</div>' +
          (req.note ? '<div class="sub-card-note">' + escapeHtml(req.note) + '</div>' : '') +
          '<div class="sub-card-actions" style="grid-template-columns:repeat(2,1fr);">' +
            '<button type="button" class="btn btn-primary btn-sm" data-action="approve-request" data-id="' + req.id + '">' +
              '<i data-lucide="check" class="icon"></i> موافقة' +
            '</button>' +
            '<button type="button" class="btn btn-danger btn-sm" data-action="reject-request" data-id="' + req.id + '">' +
              '<i data-lucide="x" class="icon"></i> رفض' +
            '</button>' +
          '</div>' +
        '</div>';
    });

    tbody.innerHTML = rowsHtml;
    if (cardsWrap) cardsWrap.innerHTML = cardsHtml;

    if (dataWrap && emptyState) {
      var hasRequests = list.length > 0;
      dataWrap.style.display = hasRequests ? '' : 'none';
      emptyState.style.display = hasRequests ? 'none' : '';
    }

    updateSubscriptionRequestsNavBadge(list.length);

    bootIcons();
  }

  window.renderSubscriptionRequestsPage = renderSubscriptionRequestsPage;

  function updateSubscriptionRequestsNavBadge(count) {
    document.querySelectorAll('.nav-item[data-page="subscription-requests"] .nav-item-badge, .mobile-nav-item[data-page="subscription-requests"] .mobile-nav-badge').forEach(function (el) {
      el.remove();
    });
    if (!count) return;

    var navItem = document.querySelector('.nav-item[data-page="subscription-requests"]');
    if (navItem) {
      var badge = document.createElement('span');
      badge.className = 'nav-item-badge';
      badge.textContent = String(count);
      navItem.appendChild(badge);
    }

    var mobileNavItem = document.querySelector('.mobile-nav-item[data-page="subscription-requests"]');
    if (mobileNavItem) {
      var dot = document.createElement('span');
      dot.className = 'mobile-nav-badge';
      mobileNavItem.appendChild(dot);
    }
  }

  function initSubscriptionRequestActions() {
    document.addEventListener('click', function (e) {
      var approveBtn = e.target.closest && e.target.closest('[data-action="approve-request"]');
      if (approveBtn) {
        var idToApprove = approveBtn.getAttribute('data-id');
        var reqToApprove = findSubscriptionRequestById(idToApprove);
        if (!reqToApprove) return;

        openConfirmModal({
          icon: 'thumbs-up',
          danger: false,
          title: 'الموافقة على الطلب؟',
          message: 'رح يتم إضافة «<strong>' + escapeHtml(reqToApprove.name) + '</strong>» كمشترك نشط.',
          confirmLabel: 'موافقة وإضافة',
          cancelLabel: 'إلغاء',
          onConfirm: function () {
            var subscribers = getStoredSubscribers();
            subscribers.push({
              id: generateSubscriberId(),
              name: reqToApprove.name,
              countryCode: reqToApprove.countryCode || '970',
              whatsapp: reqToApprove.whatsapp,
              duration: reqToApprove.duration || 'month',
              amount: 0,
              startDate: getTodayISODate(),
              note: reqToApprove.note || '',
              stopped: false
            });
            setStoredSubscribers(subscribers);

            var remainingRequests = getStoredSubscriptionRequests().filter(function (r) {
              return r.id !== idToApprove;
            });
            setStoredSubscriptionRequests(remainingRequests);

            renderSubscriptionRequestsPage();
            if (typeof window.renderSubscribersPage === 'function') {
              window.renderSubscribersPage();
            }

            showToast('تمت الموافقة وإضافة المشترك', { icon: 'user-check' });
          }
        });
        return;
      }

      var rejectBtn = e.target.closest && e.target.closest('[data-action="reject-request"]');
      if (rejectBtn) {
        var idToReject = rejectBtn.getAttribute('data-id');
        var reqToReject = findSubscriptionRequestById(idToReject);
        var nameHtml = reqToReject ? '<strong>' + escapeHtml(reqToReject.name) + '</strong>' : 'هذا الطلب';

        openConfirmModal({
          icon: 'x',
          danger: true,
          title: 'رفض الطلب؟',
          message: 'رح يتم حذف طلب «' + nameHtml + '» نهائياً.',
          confirmLabel: 'رفض وحذف',
          cancelLabel: 'تراجع',
          onConfirm: function () {
            var remaining = getStoredSubscriptionRequests().filter(function (r) {
              return r.id !== idToReject;
            });
            setStoredSubscriptionRequests(remaining);
            renderSubscriptionRequestsPage();
            showToast('تم رفض الطلب', { icon: 'x', danger: true });
          }
        });
        return;
      }
    });
  }

  function setContactRow(rowId, iconName, value, hrefBuilder) {
    var row = document.getElementById(rowId);
    if (!row) return;
    row.innerHTML = '';

    if (value) {
      var a = document.createElement('a');
      a.className = 'mono';
      a.textContent = value;
      var href = hrefBuilder ? hrefBuilder(value) : null;
      if (href) {
        a.href = href;
        if (href.indexOf('http') === 0) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
      }
      row.appendChild(a);
    } else {
      var span = document.createElement('span');
      span.className = 'mono text-muted';
      span.textContent = '—';
      row.appendChild(span);
    }

    var icon = document.createElement('i');
    icon.setAttribute('data-lucide', iconName);
    icon.className = 'icon contact-icon';
    row.appendChild(icon);
  }

  function applyProfileToUI(profile) {
    if (!profile) return;

    var heroName = document.getElementById('hero-user-name');
    if (heroName && profile.name) heroName.textContent = profile.name;

    var profileName = document.getElementById('profile-name-text');
    if (profileName && profile.name) profileName.textContent = profile.name;

    var profileSub = document.getElementById('profile-sub-text');
    if (profileSub && profile.regionLabel) {
      var topbarTypeConfig = getStoreTypeConfig();
      var topbarTypeLabel = topbarTypeConfig ? topbarTypeConfig.label : 'مساحة عمل';
      profileSub.textContent = profile.regionLabel + ' · ' + topbarTypeLabel;
    }

    var avatarLetter = document.getElementById('profile-avatar-letter');
    if (avatarLetter) {
      if (profile.image) {
        avatarLetter.style.backgroundImage = 'url(' + profile.image + ')';
        avatarLetter.style.backgroundSize = 'cover';
        avatarLetter.style.backgroundPosition = 'center';
        avatarLetter.textContent = '';
      } else {
        avatarLetter.style.backgroundImage = '';
        avatarLetter.style.backgroundSize = '';
        avatarLetter.style.backgroundPosition = '';
        if (profile.name) avatarLetter.textContent = profile.name.trim().charAt(0);
      }
    }

    var topnavUsername = document.getElementById('udTopnavUsername');
    if (topnavUsername && profile.name) topnavUsername.textContent = profile.name;

    var topnavAvatar = document.querySelector('.ud-topnav-avatar');
    if (topnavAvatar) {
      if (profile.image) {
        topnavAvatar.style.backgroundImage = 'url(' + profile.image + ')';
        topnavAvatar.style.backgroundSize = 'cover';
        topnavAvatar.style.backgroundPosition = 'center';
        topnavAvatar.textContent = '';
      } else {
        topnavAvatar.style.backgroundImage = '';
        topnavAvatar.style.backgroundSize = '';
        topnavAvatar.style.backgroundPosition = '';
        if (profile.name) topnavAvatar.textContent = profile.name.trim().charAt(0);
      }
    }

    var emptyBox = document.getElementById('location-empty');
    var filledBox = document.getElementById('location-filled');
    var hasLocation = typeof profile.lat === 'number' && typeof profile.lng === 'number';
    if (emptyBox && filledBox) {
      emptyBox.style.display = hasLocation ? 'none' : '';
      filledBox.style.display = hasLocation ? '' : 'none';
    }

    var ppAvatar = document.getElementById('profile-page-avatar');
    if (ppAvatar) {
      if (profile.image) {
        ppAvatar.style.backgroundImage = 'url(' + profile.image + ')';
        ppAvatar.textContent = '';
      } else {
        ppAvatar.style.backgroundImage = '';
        ppAvatar.textContent = (profile.name || 'م').trim().charAt(0) || 'م';
      }
    }

    var ppName = document.getElementById('profile-page-name');
    if (ppName) ppName.textContent = profile.name || 'مساحتي';

    var ppSub = document.getElementById('profile-page-sub');
    if (ppSub) {
      var profilePageTypeConfig = getStoreTypeConfig();
      var profilePageTypeLabel = profilePageTypeConfig ? profilePageTypeConfig.label : 'مساحة عمل';
      ppSub.textContent = (profile.regionLabel || 'لم تحدد المنطقة بعد') + ' · ' + profilePageTypeLabel;
    }

    var ppAddress = document.getElementById('profile-address-value');
    if (ppAddress) ppAddress.textContent = profile.address || '—';

    setContactRow('profile-phone-row', 'phone', profile.phone, function (v) {
      return 'tel:' + v.replace(/\s+/g, '');
    });
    setContactRow('profile-whatsapp-row', 'message-circle', profile.whatsapp, function (v) {
      return 'https://wa.me/' + v.replace(/[^0-9]/g, '');
    });

    var mapLink = document.getElementById('profile-map-link');
    var mapEmptyText = document.getElementById('profile-map-empty-text');
    if (mapLink && mapEmptyText) {
      if (hasLocation) {
        mapLink.href = 'https://www.google.com/maps?q=' + profile.lat + ',' + profile.lng;
        mapLink.style.display = '';
        mapEmptyText.style.display = 'none';
      } else {
        mapLink.style.display = 'none';
        mapEmptyText.style.display = '';
      }
    }

    var publicLinkEl = document.getElementById('profile-public-link');
    if (publicLinkEl) publicLinkEl.textContent = getPublicUrl(profile);

    bootIcons();
  }

  function applyOpenStatusToUI(isOpen) {
    document.querySelectorAll('[data-action="toggle-open"]').forEach(function (el) {
      el.classList.toggle('on', isOpen);
    });

    var pill = document.getElementById('hero-status-pill');
    var pillText = document.getElementById('hero-status-text');
    if (pill && pillText) {
      pill.classList.toggle('closed', !isOpen);
      pillText.textContent = isOpen ? 'مفتوح' : 'مغلق حالياً';
    }

    var profilePill = document.getElementById('profile-status-pill');
    var profilePillText = document.getElementById('profile-status-text');
    if (profilePill && profilePillText) {
      profilePill.classList.toggle('closed', !isOpen);
      profilePillText.textContent = isOpen ? 'مفتوح' : 'مغلق حالياً';
    }

    document.querySelectorAll('.js-open-status-title').forEach(function (el) {
      el.textContent = isOpen ? 'مساحة مفتوحة' : 'مساحة مغلقة';
    });
    document.querySelectorAll('.js-open-status-sub').forEach(function (el) {
      el.textContent = isOpen ? 'الزبائن يستطيعون الطلب الآن' : 'غير متاح لاستقبال الطلبات حالياً';
    });
  }

  function initOpenStatusToggle() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('[data-action="toggle-open"]');
      if (!el) return;
      var next = !getStoredOpenStatus();
      setStoredOpenStatus(next);
      applyOpenStatusToUI(next);
    });
  }

  function initProfilePageExtras() {
    var copyBtn = document.getElementById('profile-copy-link-btn');
    var linkEl = document.getElementById('profile-public-link');
    if (!copyBtn) return;

    var originalHTML = copyBtn.innerHTML;
    var resetTimer = null;

    function showCopied() {
      showToast('تم نسخ الرابط', { icon: 'check', duration: 2000 });
      copyBtn.innerHTML = '<i data-lucide="check" class="icon"></i> تم النسخ';
      bootIcons();
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(function () {
        copyBtn.innerHTML = originalHTML;
        bootIcons();
      }, 1500);
    }

    copyBtn.addEventListener('click', function () {
      var linkText = linkEl ? linkEl.textContent : '';
      if (!linkText) return;

      copyText(linkText).then(showCopied, function () {
        showToast('تعذّر نسخ الرابط', { icon: 'x', danger: true });
      });
    });
  }

  function initCopyLinkButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-action="copy-public-link"]');
      if (!btn) return;

      var profile = getStoredProfile();
      if (!profile) {
        showToast('احفظ بيانات مساحتك أولاً', { icon: 'info', danger: true });
        return;
      }

      copyText(getPublicUrl(profile)).then(function () {
        showToast('تم نسخ الرابط', { icon: 'check', duration: 2000 });
      }, function () {
        showToast('تعذّر نسخ الرابط', { icon: 'x', danger: true });
      });
    });
  }

  function initProfileEditPanel() {
    var panel = document.getElementById('pep-panel');
    var scrim = document.getElementById('pep-scrim');
    if (!panel) return;

    var nameInput = document.getElementById('pep-name');
    var regionSelect = document.getElementById('pep-region');
    var addressInput = document.getElementById('pep-address');
    var phoneInput = document.getElementById('pep-phone');
    var whatsappInput = document.getElementById('pep-whatsapp');
    var avatarPreview = document.getElementById('pep-avatar-preview');
    var imageInput = document.getElementById('pep-image-input');
    var uploadTriggerBtn = document.getElementById('pep-upload-btn');
    var mapBox = document.getElementById('pep-map');
    var mapPin = document.getElementById('pep-map-pin');
    var coordsStatus = document.getElementById('pep-coords-status');
    var coordsValue = document.getElementById('pep-coords-value');
    var useLocationBtn = document.getElementById('pep-use-my-location');
    var saveBtn = document.getElementById('pep-save-btn');

    var pendingImageDataUrl = null;
    var pendingLat = null;
    var pendingLng = null;

    function updatePinDisplay() {
      if (pendingLat === null || pendingLng === null) {
        mapPin.style.display = 'none';
        coordsStatus.textContent = 'أو انقر على الخريطة لتحديد الموقع';
        coordsStatus.classList.remove('pep-set');
        coordsValue.textContent = '';
        return;
      }
      coordsStatus.textContent = 'تم';
      coordsStatus.classList.add('pep-set');
      coordsValue.textContent = pendingLat.toFixed(5) + ', ' + pendingLng.toFixed(5);
    }

    function setPinFromRelative(relX, relY) {
      var lngRange = 0.06;
      var latRange = 0.05;
      pendingLng = GAZA_LNG - lngRange / 2 + relX * lngRange;
      pendingLat = GAZA_LAT + latRange / 2 - relY * latRange;
      mapPin.style.left = (relX * 100) + '%';
      mapPin.style.top = (relY * 100) + '%';
      mapPin.style.display = 'block';
      updatePinDisplay();
    }

    function open() {
      var profile = getStoredProfile() || {};
      if (nameInput) nameInput.value = profile.name || '';
      if (regionSelect) regionSelect.value = profile.region || '';
      if (addressInput) addressInput.value = profile.address || '';
      if (phoneInput) phoneInput.value = profile.phone || '';
      if (whatsappInput) whatsappInput.value = profile.whatsapp || '';

      pendingImageDataUrl = profile.image || null;
      pendingLat = typeof profile.lat === 'number' ? profile.lat : null;
      pendingLng = typeof profile.lng === 'number' ? profile.lng : null;

      if (pendingImageDataUrl) {
        avatarPreview.style.backgroundImage = 'url(' + pendingImageDataUrl + ')';
        avatarPreview.textContent = '';
      } else {
        avatarPreview.style.backgroundImage = '';
        avatarPreview.textContent = (profile.name || 'م').trim().charAt(0);
      }

      updatePinDisplay();

      panel.classList.add('open');
      if (scrim) scrim.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      panel.classList.remove('open');
      if (scrim) scrim.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var openTrigger = e.target.closest && e.target.closest('[data-action="open-profile-edit"]');
      if (openTrigger) {
        closeMobileMoreSheet();
        open();
        return;
      }
      var closeTrigger = e.target.closest && e.target.closest('[data-action="close-profile-edit"]');
      if (closeTrigger) {
        close();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) close();
    });

    if (mapBox) {
      mapBox.addEventListener('click', function (e) {
        var rect = mapBox.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width;
        var relY = (e.clientY - rect.top) / rect.height;
        relX = Math.max(0, Math.min(1, relX));
        relY = Math.max(0, Math.min(1, relY));
        setPinFromRelative(relX, relY);
      });
    }

    if (useLocationBtn) {
      useLocationBtn.addEventListener('click', function () {
        if (!navigator.geolocation) return;
        coordsStatus.textContent = 'جارِ تحديد موقعك…';
        navigator.geolocation.getCurrentPosition(function (pos) {
          pendingLat = pos.coords.latitude;
          pendingLng = pos.coords.longitude;
          mapPin.style.left = '50%';
          mapPin.style.top = '50%';
          mapPin.style.display = 'block';
          updatePinDisplay();
        }, function () {
          coordsStatus.textContent = 'تعذّر تحديد موقعك';
          coordsStatus.classList.remove('pep-set');
        });
      });
    }

    if (imageInput) {
      imageInput.addEventListener('change', function () {
        var file = imageInput.files && imageInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          pendingImageDataUrl = reader.result;
          avatarPreview.style.backgroundImage = 'url(' + pendingImageDataUrl + ')';
          avatarPreview.textContent = '';
        };
        reader.readAsDataURL(file);
      });
    }

    if (uploadTriggerBtn && imageInput) {
      uploadTriggerBtn.addEventListener('click', function () {
        imageInput.click();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var regionLabel = '';
        if (regionSelect && regionSelect.selectedIndex >= 0) {
          var opt = regionSelect.options[regionSelect.selectedIndex];
          if (opt && opt.value) regionLabel = opt.textContent;
        }
        var profile = Object.assign({}, getStoredProfile() || {}, {
          name: nameInput ? nameInput.value.trim() : '',
          region: regionSelect ? regionSelect.value : '',
          regionLabel: regionLabel,
          address: addressInput ? addressInput.value.trim() : '',
          phone: phoneInput ? phoneInput.value.trim() : '',
          whatsapp: whatsappInput ? whatsappInput.value.trim() : '',
          image: pendingImageDataUrl,
          lat: pendingLat,
          lng: pendingLng
        });
        setStoredProfile(profile);
        applyProfileToUI(profile);
        close();
      });
    }
  }

  function initPricesHoursEditPanel() {
    var panel = document.getElementById('phe-panel');
    var scrim = document.getElementById('phe-scrim');
    if (!panel) return;

    var priceHourInput = document.getElementById('phe-price-hour');
    var priceHalfDayInput = document.getElementById('phe-price-half-day');
    var priceFullDayInput = document.getElementById('phe-price-full-day');
    var priceWeekInput = document.getElementById('phe-price-week');
    var priceMonthInput = document.getElementById('phe-price-month');
    var openTimeInput = document.getElementById('phe-open-time');
    var closeTimeInput = document.getElementById('phe-close-time');
    var seatsTotalInput = document.getElementById('phe-seats-total');
    var seatsAvailableInput = document.getElementById('phe-seats-available');
    var saveBtn = document.getElementById('phe-save-btn');

    function open() {
      closeSidebarDrawerIfNeeded();
      closeMobileMoreSheet();

      var data = getStoredPricesHours() || {};
      if (priceHourInput) priceHourInput.value = data.priceHour != null ? data.priceHour : '';
      if (priceHalfDayInput) priceHalfDayInput.value = data.priceHalfDay != null ? data.priceHalfDay : '';
      if (priceFullDayInput) priceFullDayInput.value = data.priceFullDay != null ? data.priceFullDay : '';
      if (priceWeekInput) priceWeekInput.value = data.priceWeek != null ? data.priceWeek : '';
      if (priceMonthInput) priceMonthInput.value = data.priceMonth != null ? data.priceMonth : '';
      if (openTimeInput) openTimeInput.value = data.openTime || '';
      if (closeTimeInput) closeTimeInput.value = data.closeTime || '';
      if (seatsTotalInput) seatsTotalInput.value = data.seatsTotal != null ? data.seatsTotal : '';
      if (seatsAvailableInput) seatsAvailableInput.value = data.seatsAvailable != null ? data.seatsAvailable : '';

      panel.classList.add('open');
      if (scrim) scrim.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      panel.classList.remove('open');
      if (scrim) scrim.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var openTrigger = e.target.closest && e.target.closest('[data-action="open-prices-edit"]');
      if (openTrigger) {
        e.preventDefault();
        open();
        return;
      }
      var closeTrigger = e.target.closest && e.target.closest('[data-action="close-prices-edit"]');
      if (closeTrigger) {
        close();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) close();
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var data = {
          priceHour: priceHourInput && priceHourInput.value !== '' ? Number(priceHourInput.value) : null,
          priceHalfDay: priceHalfDayInput && priceHalfDayInput.value !== '' ? Number(priceHalfDayInput.value) : null,
          priceFullDay: priceFullDayInput && priceFullDayInput.value !== '' ? Number(priceFullDayInput.value) : null,
          priceWeek: priceWeekInput && priceWeekInput.value !== '' ? Number(priceWeekInput.value) : null,
          priceMonth: priceMonthInput && priceMonthInput.value !== '' ? Number(priceMonthInput.value) : null,
          openTime: openTimeInput ? openTimeInput.value : '',
          closeTime: closeTimeInput ? closeTimeInput.value : '',
          seatsTotal: seatsTotalInput && seatsTotalInput.value !== '' ? Number(seatsTotalInput.value) : null,
          seatsAvailable: seatsAvailableInput && seatsAvailableInput.value !== '' ? Number(seatsAvailableInput.value) : null
        };
        setStoredPricesHours(data);
        close();
      });
    }
  }

  function initServicesEditPanel() {
    var panel = document.getElementById('sve-panel');
    var scrim = document.getElementById('sve-scrim');
    if (!panel) return;

    var saveBtn = document.getElementById('sve-save-btn');

    function open() {
      closeSidebarDrawerIfNeeded();
      closeMobileMoreSheet();

      var data = getStoredServices() || {};
      SERVICE_IDS.forEach(function (id) {
        var switchEl = document.getElementById('sve-switch-' + id);
        var detailsInput = document.getElementById('sve-details-' + id);
        var entry = data[id] || {};
        if (switchEl) switchEl.classList.toggle('on', !!entry.enabled);
        if (detailsInput) detailsInput.value = entry.details || '';
      });

      panel.classList.add('open');
      if (scrim) scrim.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      panel.classList.remove('open');
      if (scrim) scrim.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var openTrigger = e.target.closest && e.target.closest('[data-action="open-services-edit"]');
      if (openTrigger) {
        e.preventDefault();
        open();
        return;
      }
      var closeTrigger = e.target.closest && e.target.closest('[data-action="close-services-edit"]');
      if (closeTrigger) {
        close();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) close();
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var data = {};
        SERVICE_IDS.forEach(function (id) {
          var switchEl = document.getElementById('sve-switch-' + id);
          var detailsInput = document.getElementById('sve-details-' + id);
          data[id] = {
            enabled: !!(switchEl && switchEl.classList.contains('on')),
            details: detailsInput ? detailsInput.value.trim() : ''
          };
        });
        setStoredServices(data);
        close();
      });
    }
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function getTodayISODate() {
    var now = new Date();
    return now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
  }

  function parseISODate(iso) {
    var parts = iso.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function addDaysToDate(date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function addMonthsToDate(date, months) {
    var d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  var DURATION_LABELS = { day: 'يومي', week: 'أسبوعي', month: 'شهري' };

  function computeSubscriberExpiryDate(subscriber) {
    var start = parseISODate(subscriber.startDate);
    if (subscriber.duration === 'day') return addDaysToDate(start, 1);
    if (subscriber.duration === 'week') return addDaysToDate(start, 7);
    return addMonthsToDate(start, 1);
  }

  function isSubscriberExpired(subscriber) {
    var expiry = computeSubscriberExpiryDate(subscriber);
    var today = parseISODate(getTodayISODate());
    return expiry.getTime() < today.getTime();
  }

  function formatDisplayDate(date) {
    try {
      return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric', timeZone: GAZA_TZ }).format(date);
    } catch (err) {
      return date.toLocaleDateString();
    }
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function ensureToastContainer() {
    var el = document.getElementById('gm-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gm-toast-container';
      el.className = 'gm-toast-container';
      document.body.appendChild(el);
    }
    return el;
  }

  function showToast(message, options) {
    options = options || {};
    var container = ensureToastContainer();
    var toast = document.createElement('div');
    toast.className = 'gm-toast' + (options.danger ? ' gm-toast--danger' : '');
    toast.innerHTML =
      '<i data-lucide="' + (options.icon || 'check-circle') + '" class="icon"></i>' +
      '<span>' + escapeHtml(message) + '</span>';
    container.appendChild(toast);
    bootIcons();

    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, options.duration || 2600);
  }

  function ensureConfirmModalRoot() {
    var root = document.getElementById('gm-confirm-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'gm-confirm-root';
      document.body.appendChild(root);
    }
    return root;
  }

  function openConfirmModal(opts) {
    opts = opts || {};
    var root = ensureConfirmModalRoot();
    var isDanger = opts.danger !== false;

    root.innerHTML =
      '<div class="gm-confirm-overlay" id="gm-confirm-overlay">' +
        '<div class="gm-confirm-modal" role="alertdialog" aria-modal="true">' +
          '<div class="gm-confirm-icon' + (isDanger ? ' danger' : '') + '">' +
            '<i data-lucide="' + (opts.icon || 'trash-2') + '" class="icon"></i>' +
          '</div>' +
          '<div class="gm-confirm-title">' + escapeHtml(opts.title || '') + '</div>' +
          (opts.message ? '<div class="gm-confirm-message">' + opts.message + '</div>' : '') +
          '<div class="gm-confirm-actions">' +
            '<button type="button" class="btn ' + (isDanger ? 'btn-danger' : 'btn-primary') + '" id="gm-confirm-ok">' +
              escapeHtml(opts.confirmLabel || 'تأكيد') +
            '</button>' +
            '<button type="button" class="btn btn-ghost" id="gm-confirm-cancel">' +
              escapeHtml(opts.cancelLabel || 'إلغاء') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    bootIcons();

    var overlay = document.getElementById('gm-confirm-overlay');
    var previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeydown(e) {
      if (e.key === 'Escape') close();
    }

    function close() {
      root.innerHTML = '';
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeydown);
    }

    document.addEventListener('keydown', onKeydown);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.getElementById('gm-confirm-cancel').addEventListener('click', close);
    document.getElementById('gm-confirm-ok').addEventListener('click', function () {
      close();
      if (typeof opts.onConfirm === 'function') opts.onConfirm();
    });

    requestAnimationFrame(function () {
      overlay.classList.add('open');
    });
  }

  // تأكيد تسجيل الخروج.
  // auth-guard.js يسجّل الخروج مباشرة عند النقر على [data-action="logout"].
  // لذلك نلتقط النقرة في مرحلة الـ capture ونوقفها قبل وصولها لمستمع الحارس،
  // ثم ننفذ GMAuth.logout() فقط بعد ضغط المستخدم على «تسجيل الخروج».
  // إذا لم يكن الحارس محمّلاً لا نتدخل ونترك السلوك الافتراضي كما هو.
  function initLogoutAction() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-action="logout"]');
      if (!btn) return;
      if (!window.GMAuth || typeof window.GMAuth.logout !== 'function') return;

      e.preventDefault();
      e.stopPropagation();

      closeSidebarDrawerIfNeeded();
      closeMobileMoreSheet();

      openConfirmModal({
        icon: 'log-out',
        danger: true,
        title: 'تسجيل الخروج؟',
        message: 'هل أنت متأكد أنك تريد تسجيل الخروج من لوحة التحكم؟',
        confirmLabel: 'تسجيل الخروج',
        cancelLabel: 'إلغاء',
        onConfirm: function () {
          window.GMAuth.logout();
        }
      });
    }, true);
  }

  function findSubscriberById(id) {
    var list = getStoredSubscribers();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function buildSubscriberStatusBadge(sub, expired) {
    if (sub.stopped) return '<span class="badge gray"><span>\u25cf</span> متوقف</span>';
    if (expired) return '<span class="badge red"><span>\u25cf</span> منتهي</span>';
    return '<span class="badge green"><span>\u25cf</span> نشط</span>';
  }

  function renderSubscribersPage() {
    var tbody = document.getElementById('sub-table-body');
    var cardsWrap = document.getElementById('sub-cards-wrap');
    var dataWrap = document.getElementById('sub-data-wrap');
    var emptyState = document.getElementById('sub-empty-state');
    var statExpiredEl = document.getElementById('sub-stat-expired');
    var statActiveEl = document.getElementById('sub-stat-active');
    var statTotalEl = document.getElementById('sub-stat-total');
    if (!tbody) return;

    var list = getStoredSubscribers();
    var expiredCount = 0;
    var activeCount = 0;

    var rowsHtml = '';
    var cardsHtml = '';

    list.forEach(function (sub) {
      var startDate = parseISODate(sub.startDate);
      var expiryDate = computeSubscriberExpiryDate(sub);
      var expired = isSubscriberExpired(sub);

      if (sub.stopped) {
      } else if (expired) {
        expiredCount++;
      } else {
        activeCount++;
      }

      var statusBadge = buildSubscriberStatusBadge(sub, expired);
      var whatsappDisplay = '+' + (sub.countryCode || '970') + sub.whatsapp;
      var avatarLetter = escapeHtml((sub.name || '').trim().charAt(0) || '؟');
      var todayForDiff = parseISODate(getTodayISODate());
      var diffDays = Math.round((expiryDate.getTime() - todayForDiff.getTime()) / 86400000);
      var remainingLine = diffDays >= 0
        ? 'متبقي ' + diffDays + ' يوم'
        : 'منتهي منذ ' + Math.abs(diffDays) + ' يوم';
      var durationLabel = DURATION_LABELS[sub.duration] || sub.duration;

      rowsHtml +=
        '<tr>' +
          '<td><div class="flex gap-12">' +
              '<div class="avatar">' + avatarLetter + '</div>' +
              '<div>' +
                '<div style="font-weight:700;">' + escapeHtml(sub.name) + '</div>' +
                (sub.note ? '<div class="sub" style="font-size:12px;color:var(--db-text-tertiary);">' + escapeHtml(sub.note) + '</div>' : '') +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td><div class="flex gap-8">' +
              '<i data-lucide="message-circle" class="icon" style="color:var(--db-text-tertiary);"></i>' +
              '<span class="mono">' + escapeHtml(whatsappDisplay) + '</span>' +
            '</div></td>' +
          '<td>' + durationLabel + '</td>' +
          '<td>' +
              '<div>' + formatDisplayDate(expiryDate) + '</div>' +
              '<div class="sub" style="font-size:12px;color:var(--db-text-tertiary);">' + remainingLine + '</div>' +
            '</td>' +
          '<td>' + statusBadge + '</td>' +
          '<td>' +
            '<div class="flex gap-8">' +
              '<button type="button" class="icon-btn" data-action="delete-subscriber" data-id="' + sub.id + '" aria-label="حذف" title="حذف"><i data-lucide="trash-2" class="icon"></i></button>' +
              '<button type="button" class="icon-btn" data-action="stop-subscriber" data-id="' + sub.id + '" aria-label="إيقاف" title="إيقاف"><i data-lucide="ban" class="icon"></i></button>' +
              '<button type="button" class="icon-btn" data-action="renew-subscriber" data-id="' + sub.id + '" aria-label="تجديد" title="تجديد"><i data-lucide="refresh-cw" class="icon"></i></button>' +
              '<button type="button" class="icon-btn" data-action="edit-subscriber" data-id="' + sub.id + '" aria-label="تعديل" title="تعديل"><i data-lucide="pencil" class="icon"></i></button>' +
            '</div>' +
          '</td>' +
        '</tr>';

      cardsHtml +=
        '<div class="sub-card" data-id="' + sub.id + '">' +
          '<div class="sub-card-top">' +
            statusBadge +
            '<div class="sub-card-name">' + escapeHtml(sub.name) + '</div>' +
          '</div>' +
          '<div class="sub-card-row mono">' +
            '<i data-lucide="message-circle" class="icon"></i>' +
            '<span>' + escapeHtml(whatsappDisplay) + '</span>' +
          '</div>' +
          '<div class="sub-card-row">' +
            durationLabel + ' \u00b7 ' + formatDisplayDate(startDate) + ' \u2190 ' + formatDisplayDate(expiryDate) +
          '</div>' +
          (sub.note ? '<div class="sub-card-note">' + escapeHtml(sub.note) + '</div>' : '') +
          '<div class="sub-card-actions">' +
            '<button type="button" class="btn btn-sm btn-danger" data-action="delete-subscriber" data-id="' + sub.id + '">' +
              '<i data-lucide="trash-2" class="icon"></i> حذف' +
            '</button>' +
            '<button type="button" class="btn btn-sm btn-ghost" data-action="stop-subscriber" data-id="' + sub.id + '">' +
              '<i data-lucide="ban" class="icon"></i> إلغاء' +
            '</button>' +
            '<button type="button" class="btn btn-sm btn-ghost" data-action="edit-subscriber" data-id="' + sub.id + '">' +
              '<i data-lucide="pencil" class="icon"></i> تعديل' +
            '</button>' +
          '</div>' +
          '<button type="button" class="btn btn-primary sub-card-renew" data-action="renew-subscriber" data-id="' + sub.id + '">' +
            '<i data-lucide="refresh-cw" class="icon"></i> تجديد' +
          '</button>' +
        '</div>';
    });

    tbody.innerHTML = rowsHtml;
    if (cardsWrap) cardsWrap.innerHTML = cardsHtml;

    if (statExpiredEl) statExpiredEl.textContent = String(expiredCount);
    if (statActiveEl) statActiveEl.textContent = String(activeCount);
    if (statTotalEl) statTotalEl.textContent = String(list.length);

    if (dataWrap && emptyState) {
      var hasSubscribers = list.length > 0;
      dataWrap.style.display = hasSubscribers ? '' : 'none';
      emptyState.style.display = hasSubscribers ? 'none' : '';
    }

    bootIcons();
  }

  window.renderSubscribersPage = renderSubscribersPage;

  function initSubscriberAddPanel() {
    var panel = document.getElementById('sap-panel');
    var scrim = document.getElementById('sap-scrim');
    if (!panel) return;

    var titleEl = document.getElementById('sap-title');
    var subtitleEl = document.getElementById('sap-subtitle');
    var nameInput = document.getElementById('sap-name');
    var whatsappInput = document.getElementById('sap-whatsapp');
    var countryCodeSelect = document.getElementById('sap-country-code');
    var durationGroup = document.getElementById('sap-duration-group');
    var amountInput = document.getElementById('sap-amount');
    var startDateInput = document.getElementById('sap-start-date');
    var noteInput = document.getElementById('sap-note');
    var saveBtn = document.getElementById('sap-save-btn');
    var saveBtnLabel = saveBtn ? saveBtn.innerHTML : '';

    var selectedDuration = 'month';
    var editingId = null;

    function setDuration(value) {
      selectedDuration = value;
      if (!durationGroup) return;
      durationGroup.querySelectorAll('.seg-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-value') === value);
      });
    }

    function resetForm() {
      if (nameInput) nameInput.value = '';
      if (whatsappInput) whatsappInput.value = '';
      if (countryCodeSelect) countryCodeSelect.value = '970';
      if (amountInput) amountInput.value = '';
      if (noteInput) noteInput.value = '';
      if (startDateInput) startDateInput.value = getTodayISODate();
      setDuration('month');
    }

    function fillFormFromSubscriber(sub) {
      if (nameInput) nameInput.value = sub.name || '';
      if (whatsappInput) whatsappInput.value = sub.whatsapp || '';
      if (countryCodeSelect) countryCodeSelect.value = sub.countryCode || '970';
      if (amountInput) amountInput.value = sub.amount != null ? sub.amount : '';
      if (noteInput) noteInput.value = sub.note || '';
      if (startDateInput) startDateInput.value = sub.startDate || getTodayISODate();
      setDuration(sub.duration || 'month');
    }

    function open(subscriberToEdit) {
      closeSidebarDrawerIfNeeded();
      closeMobileMoreSheet();

      editingId = subscriberToEdit ? subscriberToEdit.id : null;

      if (subscriberToEdit) {
        fillFormFromSubscriber(subscriberToEdit);
        if (titleEl) titleEl.textContent = 'تعديل مشترك';
        if (subtitleEl) subtitleEl.textContent = 'تحديث بيانات اشتراك ' + (subscriberToEdit.name || '');
        if (saveBtn) saveBtn.innerHTML = '<i data-lucide="check" class="icon"></i> حفظ التعديلات';
      } else {
        resetForm();
        if (titleEl) titleEl.textContent = 'إضافة مشترك';
        if (subtitleEl) subtitleEl.textContent = 'أدخل بيانات المشترك الجديد';
        if (saveBtn) saveBtn.innerHTML = saveBtnLabel;
      }

      panel.classList.add('open');
      if (scrim) scrim.classList.add('open');
      document.body.style.overflow = 'hidden';
      bootIcons();
      if (nameInput) nameInput.focus();
    }

    function close() {
      panel.classList.remove('open');
      if (scrim) scrim.classList.remove('open');
      document.body.style.overflow = '';
      editingId = null;
    }

    document.addEventListener('click', function (e) {
      var openTrigger = e.target.closest && e.target.closest('[data-action="open-subscriber-add"]');
      if (openTrigger) {
        e.preventDefault();
        open(null);
        return;
      }
      var editTrigger = e.target.closest && e.target.closest('[data-action="edit-subscriber"]');
      if (editTrigger) {
        e.preventDefault();
        var subToEdit = findSubscriberById(editTrigger.getAttribute('data-id'));
        if (subToEdit) open(subToEdit);
        return;
      }
      var closeTrigger = e.target.closest && e.target.closest('[data-action="close-subscriber-add"]');
      if (closeTrigger) {
        close();
        return;
      }
      var segBtn = e.target.closest && e.target.closest('#sap-duration-group .seg-btn');
      if (segBtn) setDuration(segBtn.getAttribute('data-value'));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) close();
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var name = nameInput ? nameInput.value.trim() : '';
        var whatsapp = whatsappInput ? whatsappInput.value.trim() : '';

        if (!name) { if (nameInput) nameInput.focus(); return; }
        if (!whatsapp) { if (whatsappInput) whatsappInput.focus(); return; }

        var list = getStoredSubscribers();

        if (editingId) {
          var idx = -1;
          for (var i = 0; i < list.length; i++) {
            if (list[i].id === editingId) { idx = i; break; }
          }
          if (idx !== -1) {
            list[idx].name = name;
            list[idx].countryCode = countryCodeSelect ? countryCodeSelect.value : '970';
            list[idx].whatsapp = whatsapp;
            list[idx].duration = selectedDuration;
            list[idx].amount = amountInput && amountInput.value !== '' ? Number(amountInput.value) : 0;
            list[idx].startDate = startDateInput && startDateInput.value ? startDateInput.value : getTodayISODate();
            list[idx].note = noteInput ? noteInput.value.trim() : '';
          }
        } else {
          var subscriber = {
            id: generateSubscriberId(),
            name: name,
            countryCode: countryCodeSelect ? countryCodeSelect.value : '970',
            whatsapp: whatsapp,
            duration: selectedDuration,
            amount: amountInput && amountInput.value !== '' ? Number(amountInput.value) : 0,
            startDate: startDateInput && startDateInput.value ? startDateInput.value : getTodayISODate(),
            note: noteInput ? noteInput.value.trim() : '',
            stopped: false
          };
          list.push(subscriber);
        }

        setStoredSubscribers(list);

        close();

        if (typeof window.renderSubscribersPage === 'function') {
          window.renderSubscribersPage();
        }
      });
    }
  }

  function initSubscriberActions() {
    document.addEventListener('click', function (e) {
      var deleteBtn = e.target.closest && e.target.closest('[data-action="delete-subscriber"]');
      if (deleteBtn) {
        var idToDelete = deleteBtn.getAttribute('data-id');
        var subToDelete = findSubscriberById(idToDelete);
        var nameHtml = subToDelete ? '<strong>' + escapeHtml(subToDelete.name) + '</strong>' : 'هذا المشترك';

        openConfirmModal({
          icon: 'trash-2',
          danger: true,
          title: 'حذف المشترك؟',
          message: 'سيتم حذف «' + nameHtml + '» نهائياً',
          confirmLabel: 'حذف',
          cancelLabel: 'إلغاء',
          onConfirm: function () {
            var listAfterDelete = getStoredSubscribers().filter(function (s) {
              return s.id !== idToDelete;
            });
            setStoredSubscribers(listAfterDelete);
            renderSubscribersPage();
          }
        });
        return;
      }

      var stopBtn = e.target.closest && e.target.closest('[data-action="stop-subscriber"]');
      if (stopBtn) {
        var idToStop = stopBtn.getAttribute('data-id');
        var listForStop = getStoredSubscribers();
        var nowStopped = false;
        for (var i = 0; i < listForStop.length; i++) {
          if (listForStop[i].id === idToStop) {
            listForStop[i].stopped = !listForStop[i].stopped;
            nowStopped = listForStop[i].stopped;
            break;
          }
        }
        setStoredSubscribers(listForStop);
        renderSubscribersPage();
        showToast(nowStopped ? 'تم إلغاء الاشتراك' : 'تم إعادة تفعيل الاشتراك', {
          icon: nowStopped ? 'ban' : 'check-circle',
          danger: nowStopped
        });
        return;
      }

      var renewBtn = e.target.closest && e.target.closest('[data-action="renew-subscriber"]');
      if (renewBtn) {
        var idToRenew = renewBtn.getAttribute('data-id');
        var listForRenew = getStoredSubscribers();
        for (var j = 0; j < listForRenew.length; j++) {
          if (listForRenew[j].id === idToRenew) {
            listForRenew[j].startDate = getTodayISODate();
            listForRenew[j].stopped = false;
            break;
          }
        }
        setStoredSubscribers(listForRenew);
        renderSubscribersPage();
        showToast('تم تجديد الاشتراك', { icon: 'refresh-cw' });
        return;
      }
    });
  }

  var AD_TYPE_LABELS = { activity: 'فعالية', workshop: 'ورشة', job: 'وظيفة', offer: 'عرض' };

  function getStoredAds() {
    try {
      var raw = localStorage.getItem(ADS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function setStoredAds(list) {
    try {
      localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {}
  }

  function generateAdId() {
    return 'ad_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function findAdById(id) {
    var list = getStoredAds();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function formatAdDate(iso) {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric', timeZone: GAZA_TZ }).format(parseISODate(iso));
    } catch (err) {
      return iso;
    }
  }

  function buildAdStatusBadge(ad) {
    return ad.hidden
      ? '<span class="badge gray"><span>\u25cf</span> مخفي</span>'
      : '<span class="badge green"><span>\u25cf</span> ظاهر</span>';
  }

  function renderAdsPage() {
    var tbody = document.getElementById('ads-table-body');
    var dataWrap = document.getElementById('ads-data-wrap');
    var emptyState = document.getElementById('ads-empty-state');
    if (!tbody) return;

    var list = getStoredAds();
    var rowsHtml = '';

    list.forEach(function (ad) {
      var typeLabel = AD_TYPE_LABELS[ad.type] || ad.type;

      rowsHtml +=
        '<tr>' +
          '<td>' +
            '<div style="font-weight:700;">' + escapeHtml(ad.title) + '</div>' +
            (ad.details ? '<div class="sub" style="font-size:12px;color:var(--db-text-tertiary);">' + escapeHtml(ad.details) + '</div>' : '') +
            (ad.link ? '<div><a href="' + escapeHtml(ad.link) + '" target="_blank" rel="noopener" class="mono" style="font-size:12px;">' + escapeHtml(ad.link) + '</a></div>' : '') +
          '</td>' +
          '<td>' + escapeHtml(typeLabel) + '</td>' +
          '<td class="mono">' + formatAdDate(ad.date) + '</td>' +
          '<td>' + buildAdStatusBadge(ad) + '</td>' +
          '<td>' +
            '<div class="flex gap-8">' +
              '<button type="button" class="btn btn-danger btn-sm" data-action="delete-ad" data-id="' + ad.id + '">حذف</button>' +
              '<button type="button" class="btn btn-ghost btn-sm" data-action="toggle-ad-visibility" data-id="' + ad.id + '">' + (ad.hidden ? 'إظهار' : 'إخفاء') + '</button>' +
              '<button type="button" class="btn btn-ghost btn-sm" data-action="edit-ad" data-id="' + ad.id + '">تعديل</button>' +
            '</div>' +
          '</td>' +
        '</tr>';
    });

    tbody.innerHTML = rowsHtml;

    if (dataWrap && emptyState) {
      var hasAds = list.length > 0;
      dataWrap.style.display = hasAds ? '' : 'none';
      emptyState.style.display = hasAds ? 'none' : '';
    }

    bootIcons();
  }

  window.renderAdsPage = renderAdsPage;

  function initAdAddPanel() {
    var panel = document.getElementById('ade-panel');
    var scrim = document.getElementById('ade-scrim');
    if (!panel) return;

    var titleEl = document.getElementById('ade-title');
    var typeGroup = document.getElementById('ade-type-group');
    var titleInput = document.getElementById('ade-ad-title');
    var detailsInput = document.getElementById('ade-details');
    var dateInput = document.getElementById('ade-date');
    var linkInput = document.getElementById('ade-link');
    var saveBtn = document.getElementById('ade-save-btn');

    var selectedType = 'activity';
    var editingId = null;

    function setType(value) {
      selectedType = value;
      if (!typeGroup) return;
      typeGroup.querySelectorAll('.seg-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-value') === value);
      });
    }

    function resetForm() {
      if (titleInput) titleInput.value = '';
      if (detailsInput) detailsInput.value = '';
      if (dateInput) dateInput.value = '';
      if (linkInput) linkInput.value = '';
      setType('activity');
    }

    function fillFormFromAd(ad) {
      if (titleInput) titleInput.value = ad.title || '';
      if (detailsInput) detailsInput.value = ad.details || '';
      if (dateInput) dateInput.value = ad.date || '';
      if (linkInput) linkInput.value = ad.link || '';
      setType(ad.type || 'activity');
    }

    function open(adToEdit) {
      closeSidebarDrawerIfNeeded();
      closeMobileMoreSheet();

      editingId = adToEdit ? adToEdit.id : null;

      if (adToEdit) {
        fillFormFromAd(adToEdit);
        if (titleEl) titleEl.textContent = 'تعديل إعلان';
      } else {
        resetForm();
        if (titleEl) titleEl.textContent = 'إعلان جديد';
      }

      panel.classList.add('open');
      if (scrim) scrim.classList.add('open');
      document.body.style.overflow = 'hidden';
      bootIcons();
      if (titleInput) titleInput.focus();
    }

    function close() {
      panel.classList.remove('open');
      if (scrim) scrim.classList.remove('open');
      document.body.style.overflow = '';
      editingId = null;
    }

    document.addEventListener('click', function (e) {
      var openTrigger = e.target.closest && e.target.closest('[data-action="open-ad-add"]');
      if (openTrigger) {
        e.preventDefault();
        open(null);
        return;
      }
      var editTrigger = e.target.closest && e.target.closest('[data-action="edit-ad"]');
      if (editTrigger) {
        e.preventDefault();
        var adToEdit = findAdById(editTrigger.getAttribute('data-id'));
        if (adToEdit) open(adToEdit);
        return;
      }
      var closeTrigger = e.target.closest && e.target.closest('[data-action="close-ad-add"]');
      if (closeTrigger) {
        close();
        return;
      }
      var segBtn = e.target.closest && e.target.closest('#ade-type-group .seg-btn');
      if (segBtn) setType(segBtn.getAttribute('data-value'));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) close();
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var title = titleInput ? titleInput.value.trim() : '';
        if (!title) { if (titleInput) titleInput.focus(); return; }

        var list = getStoredAds();

        if (editingId) {
          var idx = -1;
          for (var i = 0; i < list.length; i++) {
            if (list[i].id === editingId) { idx = i; break; }
          }
          if (idx !== -1) {
            list[idx].type = selectedType;
            list[idx].title = title;
            list[idx].details = detailsInput ? detailsInput.value.trim() : '';
            list[idx].date = dateInput ? dateInput.value : '';
            list[idx].link = linkInput ? linkInput.value.trim() : '';
          }
        } else {
          list.unshift({
            id: generateAdId(),
            type: selectedType,
            title: title,
            details: detailsInput ? detailsInput.value.trim() : '',
            date: dateInput ? dateInput.value : '',
            link: linkInput ? linkInput.value.trim() : '',
            hidden: false,
            createdAt: Date.now()
          });
        }

        setStoredAds(list);
        close();
        renderAdsPage();
      });
    }
  }

  function initAdActions() {
    document.addEventListener('click', function (e) {
      var deleteBtn = e.target.closest && e.target.closest('[data-action="delete-ad"]');
      if (deleteBtn) {
        var idToDelete = deleteBtn.getAttribute('data-id');
        var adToDelete = findAdById(idToDelete);
        var nameHtml = adToDelete ? '<strong>' + escapeHtml(adToDelete.title) + '</strong>' : 'هذا الإعلان';

        openConfirmModal({
          icon: 'trash-2',
          danger: true,
          title: 'حذف الإعلان؟',
          message: 'سيتم حذف «' + nameHtml + '» نهائياً',
          confirmLabel: 'حذف',
          cancelLabel: 'إلغاء',
          onConfirm: function () {
            var listAfterDelete = getStoredAds().filter(function (a) {
              return a.id !== idToDelete;
            });
            setStoredAds(listAfterDelete);
            renderAdsPage();
            showToast('تم حذف الإعلان', { icon: 'trash-2', danger: true });
          }
        });
        return;
      }

      var toggleBtn = e.target.closest && e.target.closest('[data-action="toggle-ad-visibility"]');
      if (toggleBtn) {
        var idToToggle = toggleBtn.getAttribute('data-id');
        var listForToggle = getStoredAds();
        var nowHidden = false;
        for (var i = 0; i < listForToggle.length; i++) {
          if (listForToggle[i].id === idToToggle) {
            listForToggle[i].hidden = !listForToggle[i].hidden;
            nowHidden = listForToggle[i].hidden;
            break;
          }
        }
        setStoredAds(listForToggle);
        renderAdsPage();
        showToast(nowHidden ? 'تم إخفاء الإعلان' : 'تم إظهار الإعلان', {
          icon: nowHidden ? 'eye-off' : 'eye',
          danger: nowHidden
        });
        return;
      }
    });
  }

  function initPackagesPage() {
    var pay = document.getElementById('pkg-pay');
    if (!pay) return;

    var card = document.querySelector('.pkg-card--featured');
    var status = document.getElementById('pkg-status');
    var copyTimer = null;
    var scrollTimer = null;

    function prefersReducedMotion() {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function setSwapped(btn, on) {
      var items = btn.querySelectorAll('.pkg-swap-item');
      btn.classList.toggle('is-swapped', on);
      if (items.length === 2) {
        items[0].setAttribute('aria-hidden', on ? 'true' : 'false');
        items[1].setAttribute('aria-hidden', on ? 'false' : 'true');
      }
    }

    function getWorkspaceName() {
      var profile = getStoredProfile();
      return profile && profile.name ? String(profile.name).trim() : '';
    }

    function buildWhatsappLink(link) {
      var phone = link.getAttribute('data-whatsapp');
      var message = link.getAttribute('data-message') || '';
      var workspaceName = getWorkspaceName();
      if (workspaceName) message += '\nاسم المساحة: ' + workspaceName;
      link.setAttribute('href', 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message));
    }

    function buildWhatsappLinks() {
      document.querySelectorAll('[data-whatsapp]').forEach(buildWhatsappLink);
    }

    function selectPackage(btn) {
      setSwapped(btn, true);
      btn.setAttribute('aria-expanded', 'true');
      if (card) card.classList.add('is-active');
      pay.classList.add('is-open');
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(function () {
        pay.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'nearest'
        });
      }, 380);
    }

    function deselectPackage(btn) {
      window.clearTimeout(scrollTimer);
      setSwapped(btn, false);
      btn.setAttribute('aria-expanded', 'false');
      if (card) card.classList.remove('is-active');
      pay.classList.remove('is-open');
    }

    function copyNumber(btn) {
      var source = document.querySelector('[data-bank-number]');
      if (!source) return;
      copyText(source.textContent.trim()).then(function () {
        setSwapped(btn, true);
        if (status) status.textContent = 'تم نسخ الرقم';
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(function () {
          setSwapped(btn, false);
          if (status) status.textContent = '';
        }, 1800);
      }).catch(function () {
        if (status) status.textContent = 'تعذر نسخ الرقم';
      });
    }

    document.addEventListener('click', function (e) {
      var waLink = e.target.closest && e.target.closest('[data-whatsapp]');
      if (waLink) buildWhatsappLink(waLink);

      var selectBtn = e.target.closest && e.target.closest('[data-action="select-package"]');
      if (selectBtn) {
        if (selectBtn.getAttribute('aria-expanded') === 'true') {
          deselectPackage(selectBtn);
        } else {
          selectPackage(selectBtn);
        }
        return;
      }
      var copyBtn = e.target.closest && e.target.closest('[data-action="copy-bank-number"]');
      if (copyBtn) {
        copyNumber(copyBtn);
      }
    });

    buildWhatsappLinks();
  }

  async function init() {
    initHeroDynamicInfo();
    ensureMobileNavHost();
    await Promise.all([
      loadPartial('#topnav-slot', 'topnav.html'),
      loadPartial('#sidebar-slot', 'sidebar.html'),
      loadPartial('#topbar-slot', 'topbar.html'),
      loadPartial('#profile-edit-slot', 'profile-edit-panel.html'),
      loadPartial('#prices-edit-slot', 'prices-hours-edit-panel.html'),
      loadPartial('#services-edit-slot', 'services-edit-panel.html'),
      loadPartial('#subscriber-add-slot', 'subscriber-add-panel.html'),
      loadPartial('#ad-edit-slot', 'ad-edit-panel.html'),
      loadPartial('#mobile-nav-slot', 'mobile-nav.html')
    ]);
    renderSidebarNav();
    renderMobileNav();
    applyStoreTypeLabel();
    markActiveNavItem();
    wireDrawer();
    wireSwitches();
    wireThemeToggle();
    wireTopnavAccountLink();
    wireMobileMoreSheet();
    initLogoutAction();
    applyProfileToUI(getStoredProfile());
    applyOpenStatusToUI(getStoredOpenStatus());
    renderSubscribersPage();
    renderSubscriptionRequestsPage();
    renderAdsPage();
    initProfileEditPanel();
    initPricesHoursEditPanel();
    initServicesEditPanel();
    initSubscriberAddPanel();
    initSubscriberActions();
    initSubscriptionRequestActions();
    initAdAddPanel();
    initAdActions();
    initOpenStatusToggle();
    initProfilePageExtras();
    initCopyLinkButtons();
    initPackagesPage();
    bootIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();