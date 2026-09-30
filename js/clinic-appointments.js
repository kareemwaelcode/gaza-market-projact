/*
 * Gaza Market — Clinic appointments page (dashboard-users/appointments.html)
 *
 * Self-contained: reads the plan limit from GMStoreTypeConfig and stores data in
 * localStorage (temporary, until the Laravel backend exists).
 * Public API for the store's public page later:
 *   window.gmSubmitClinicAppointment({ name, whatsapp, countryCode, datetime, reason, note })
 */
(function () {
  'use strict';

  var APPOINTMENTS_KEY = 'gmDashboardAppointments';
  var CREATED_KEY = 'gmDashboardAppointmentsCreated';
  var HOURS_KEY = 'gmDashboardClinicHours';
  var GAZA_TZ = 'Asia/Gaza';

  var DAYS = [
    { key: 'sat', label: 'السبت' },
    { key: 'sun', label: 'الأحد' },
    { key: 'mon', label: 'الاثنين' },
    { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' },
    { key: 'thu', label: 'الخميس' },
    { key: 'fri', label: 'الجمعة' }
  ];

  function getConfigApi() { return window.GMStoreTypeConfig || null; }

  function scopeKey(base) {
    var scope = 'default';
    var api = getConfigApi();
    if (api) {
      var cfg = api.getConfig();
      if (cfg && cfg.id) {
        scope = cfg.id;
        if (cfg.id === 'store') scope += ':' + (api.getStoreSubcategoryId() || 'general');
      }
    }
    return base + ':' + scope;
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(scopeKey(key));
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(scopeKey(key), JSON.stringify(value)); } catch (e) { }
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function toast(message) {
    var el = document.createElement('div');
    el.className = 'gm-toast';
    el.textContent = message;
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1f2937;color:#fff;padding:10px 18px;border-radius:10px;z-index:9999;font-weight:700;';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  /* ---------- data ---------- */

  function getAppointments() {
    var list = readJson(APPOINTMENTS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function setAppointments(list) { writeJson(APPOINTMENTS_KEY, list); }

  function getCreatedCount() {
    var stored = parseInt(readJson(CREATED_KEY, 0), 10) || 0;
    return Math.max(stored, getAppointments().length);
  }

  function getLimitStatus() {
    var api = getConfigApi();
    if (!api) return { unlimited: true, canAdd: true, used: 0, limit: null };
    return api.getLimitStatus('appointments', getCreatedCount());
  }

  function generateId() {
    return 'apt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function setStatus(id, status) {
    var list = getAppointments();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { list[i].status = status; break; }
    }
    setAppointments(list);
  }

  function removeAppointment(id) {
    setAppointments(getAppointments().filter(function (a) { return a.id !== id; }));
  }

  window.gmSubmitClinicAppointment = function (data) {
    data = data || {};
    var name = (data.name || '').toString().trim();
    var whatsapp = (data.whatsapp || '').toString().replace(/\D/g, '');
    if (!name) throw new Error('gmSubmitClinicAppointment: name is required');
    if (!whatsapp) throw new Error('gmSubmitClinicAppointment: whatsapp is required');
    if (!getLimitStatus().canAdd) {
      var limitError = new Error('gmSubmitClinicAppointment: appointment limit reached for the current plan');
      limitError.code = 'LIMIT_REACHED';
      throw limitError;
    }
    var appointment = {
      id: generateId(),
      name: name,
      countryCode: (data.countryCode || '970').toString().trim(),
      whatsapp: whatsapp,
      datetime: (data.datetime || '').toString().trim(),
      reason: (data.reason || '').toString().trim().slice(0, 100),
      note: (data.note || '').toString().trim().slice(0, 300),
      status: 'pending',
      createdAt: Date.now()
    };
    var list = getAppointments();
    var created = getCreatedCount();
    list.unshift(appointment);
    setAppointments(list);
    writeJson(CREATED_KEY, created + 1);
    if (typeof window.renderClinicAppointmentsPage === 'function') window.renderClinicAppointmentsPage();
    return appointment;
  };

  /* ---------- appointments list ---------- */

  function formatDateTime(value) {
    try {
      var d = new Date(value);
      if (isNaN(d.getTime())) return escapeHtml(String(value));
      return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: GAZA_TZ }).format(d);
    } catch (e) { return escapeHtml(String(value)); }
  }

  function statusBadge(status) {
    if (status === 'confirmed') return '<span class="badge green"><span>\u25cf</span> مؤكد</span>';
    if (status === 'cancelled') return '<span class="badge gray"><span>\u25cf</span> ملغي</span>';
    return '<span class="badge amber"><span>\u25cf</span> قيد الانتظار</span>';
  }

  function updateNavBadge(count) {
    document.querySelectorAll('.nav-item[data-page="appointments"] .nav-item-badge, .mobile-nav-item[data-page="appointments"] .mobile-nav-badge').forEach(function (el) { el.remove(); });
    if (!count) return;
    var navItem = document.querySelector('.nav-item[data-page="appointments"]');
    if (navItem) {
      var badge = document.createElement('span');
      badge.className = 'nav-item-badge';
      badge.textContent = String(count);
      navItem.appendChild(badge);
    }
    var mobileItem = document.querySelector('.mobile-nav-item[data-page="appointments"]');
    if (mobileItem) {
      var dot = document.createElement('span');
      dot.className = 'mobile-nav-badge';
      mobileItem.appendChild(dot);
    }
  }

  function actionButtons(a, isCard) {
    var id = escapeHtml(a.id);
    var del = '<button type="button" class="icon-btn" data-apt-action="delete" data-id="' + id + '" aria-label="حذف" title="حذف"><i data-lucide="trash-2" class="icon"></i></button>';
    if (a.status === 'pending') {
      return '<button type="button" class="btn btn-primary btn-sm" data-apt-action="confirm" data-id="' + id + '">تأكيد</button>' +
        '<button type="button" class="btn btn-danger btn-sm" data-apt-action="cancel" data-id="' + id + '">رفض</button>';
    }
    if (a.status === 'confirmed') {
      return '<button type="button" class="btn btn-danger btn-sm" data-apt-action="cancel" data-id="' + id + '">إلغاء الموعد</button>';
    }
    return isCard ? '<button type="button" class="btn btn-sm btn-ghost" data-apt-action="delete" data-id="' + id + '">حذف</button>' : del;
  }

  function renderList() {
    var tbody = document.getElementById('apt-table-body');
    if (!tbody) return;
    var cardsWrap = document.getElementById('apt-cards-wrap');
    var dataWrap = document.getElementById('apt-data-wrap');
    var emptyState = document.getElementById('apt-empty-state');
    var searchEmpty = document.getElementById('apt-search-empty');
    var searchInput = document.getElementById('apt-search-input');
    var searchClear = document.getElementById('apt-search-clear');

    var list = getAppointments();
    var pending = list.filter(function (a) { return a.status === 'pending'; }).length;
    var confirmed = list.filter(function (a) { return a.status === 'confirmed'; }).length;

    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchClear) searchClear.style.display = query ? '' : 'none';
    var visible = query ? list.filter(function (a) { return (a.name || '').toLowerCase().indexOf(query) !== -1; }) : list;

    var rows = '';
    var cards = '';
    visible.forEach(function (a) {
      var whatsapp = '+' + (a.countryCode || '970') + a.whatsapp;
      var when = a.datetime ? formatDateTime(a.datetime) : '\u2014';
      var reason = a.reason ? escapeHtml(a.reason) : 'بدون تحديد';
      var badge = statusBadge(a.status);
      rows +=
        '<tr>' +
          '<td><div class="flex gap-12"><div class="avatar">' + escapeHtml((a.name || '').trim().charAt(0) || '؟') + '</div>' +
          '<div><div style="font-weight:700;">' + escapeHtml(a.name) + '</div></div></div></td>' +
          '<td><div class="flex gap-8"><i data-lucide="message-circle" class="icon" style="color:var(--db-text-tertiary);"></i><span class="mono">' + escapeHtml(whatsapp) + '</span></div></td>' +
          '<td class="mono" style="direction:ltr;text-align:right;">' + when + '</td>' +
          '<td>' + reason + '</td>' +
          '<td>' + badge + '</td>' +
          '<td><div class="flex gap-8">' + actionButtons(a, false) + '</div></td>' +
        '</tr>';
      cards +=
        '<div class="sub-card" data-id="' + escapeHtml(a.id) + '">' +
          '<div class="sub-card-top">' + badge + '<div class="sub-card-name">' + escapeHtml(a.name) + '</div></div>' +
          '<div class="sub-card-row mono"><i data-lucide="message-circle" class="icon"></i><span>' + escapeHtml(whatsapp) + '</span></div>' +
          '<div class="sub-card-row">' + when + ' \u00b7 ' + reason + '</div>' +
          (a.note ? '<div class="sub-card-note">' + escapeHtml(a.note) + '</div>' : '') +
          '<div class="sub-card-actions" style="grid-template-columns:repeat(' + (a.status === 'pending' ? 2 : 1) + ',1fr);">' + actionButtons(a, true) + '</div>' +
        '</div>';
    });

    tbody.innerHTML = rows;
    if (cardsWrap) cardsWrap.innerHTML = cards;

    var setText = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = String(v); };
    setText('apt-stat-pending', pending);
    setText('apt-stat-confirmed', confirmed);
    setText('apt-stat-total', list.length);
    updateNavBadge(pending);

    var usageEl = document.getElementById('apt-usage-counter');
    if (usageEl) {
      var usage = getLimitStatus();
      if (usage.unlimited) usageEl.style.display = 'none';
      else {
        usageEl.textContent = usage.used + ' من ' + usage.limit + ' حجوزات مواعيد' + (usage.canAdd ? '' : ' — وصلت للحد الأقصى');
        usageEl.style.display = '';
      }
    }

    var hasAny = list.length > 0;
    if (dataWrap) dataWrap.style.display = hasAny ? '' : 'none';
    if (emptyState) emptyState.style.display = hasAny ? 'none' : '';
    if (searchEmpty) searchEmpty.style.display = (hasAny && !visible.length) ? '' : 'none';
    var tableCard = document.getElementById('apt-table-card');
    if (tableCard) tableCard.style.display = (hasAny && !visible.length) ? 'none' : '';
    refreshIcons();
  }

  window.renderClinicAppointmentsPage = renderList;

  /* ---------- clinic hours ---------- */

  function defaultHours() {
    return {
      slot: 30,
      days: DAYS.map(function (d) { return { key: d.key, open: d.key !== 'fri', from: '09:00', to: '17:00' }; })
    };
  }

  function getHours() {
    var stored = readJson(HOURS_KEY, null);
    var base = defaultHours();
    if (!stored || !Array.isArray(stored.days)) return base;
    base.slot = [15, 20, 30, 45, 60].indexOf(parseInt(stored.slot, 10)) !== -1 ? parseInt(stored.slot, 10) : 30;
    base.days.forEach(function (d) {
      stored.days.forEach(function (s) {
        if (s && s.key === d.key) { d.open = !!s.open; d.from = s.from || d.from; d.to = s.to || d.to; }
      });
    });
    return base;
  }

  function renderHours() {
    var wrap = document.getElementById('apt-hours-rows');
    if (!wrap) return;
    var hours = getHours();
    var html = '';
    DAYS.forEach(function (d, i) {
      var day = hours.days[i];
      html +=
        '<div class="flex gap-12" style="align-items:center;padding:8px 0;flex-wrap:wrap;" data-day="' + d.key + '">' +
          '<label style="min-width:110px;font-weight:700;display:flex;align-items:center;gap:8px;">' +
            '<input type="checkbox" data-hours-open' + (day.open ? ' checked' : '') + '> ' + d.label +
          '</label>' +
          '<input type="time" class="input" data-hours-from value="' + escapeHtml(day.from) + '"' + (day.open ? '' : ' disabled') + ' style="max-width:130px;direction:ltr;">' +
          '<span>—</span>' +
          '<input type="time" class="input" data-hours-to value="' + escapeHtml(day.to) + '"' + (day.open ? '' : ' disabled') + ' style="max-width:130px;direction:ltr;">' +
          (day.open ? '' : '<span class="sub" style="color:var(--db-text-tertiary);">مغلق</span>') +
        '</div>';
    });
    wrap.innerHTML = html;
    var slot = document.getElementById('apt-slot-select');
    if (slot) slot.value = String(hours.slot);
  }

  function saveHours() {
    var wrap = document.getElementById('apt-hours-rows');
    if (!wrap) return;
    var days = [];
    var error = '';
    wrap.querySelectorAll('[data-day]').forEach(function (row) {
      var open = row.querySelector('[data-hours-open]').checked;
      var from = row.querySelector('[data-hours-from]').value;
      var to = row.querySelector('[data-hours-to]').value;
      if (open && (!from || !to || from >= to)) error = 'وقت البداية لازم يكون قبل وقت النهاية';
      days.push({ key: row.getAttribute('data-day'), open: open, from: from, to: to });
    });
    if (error) { toast(error); return; }
    var slotEl = document.getElementById('apt-slot-select');
    writeJson(HOURS_KEY, { slot: slotEl ? parseInt(slotEl.value, 10) : 30, days: days });
    renderHours();
    toast('تم حفظ دوام العيادة');
  }

  /* ---------- events ---------- */

  function init() {
    if (document.body.getAttribute('data-page') !== 'appointments') return;
    renderList();
    renderHours();

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-apt-action]');
      if (btn) {
        var id = btn.getAttribute('data-id');
        var action = btn.getAttribute('data-apt-action');
        if (action === 'confirm') { setStatus(id, 'confirmed'); toast('تم تأكيد الموعد'); }
        else if (action === 'cancel') { if (!window.confirm('متأكد بدك تلغي هذا الموعد؟')) return; setStatus(id, 'cancelled'); toast('تم إلغاء الموعد'); }
        else if (action === 'delete') { if (!window.confirm('متأكد بدك تحذف هذا الموعد؟')) return; removeAppointment(id); toast('تم حذف الموعد'); }
        renderList();
        return;
      }
      if (e.target.closest && e.target.closest('#apt-hours-save')) { saveHours(); return; }
      if (e.target.closest && e.target.closest('#apt-search-clear')) {
        var input = document.getElementById('apt-search-input');
        if (input) { input.value = ''; renderList(); }
      }
    });

    var search = document.getElementById('apt-search-input');
    if (search) search.addEventListener('input', renderList);

    var hoursWrap = document.getElementById('apt-hours-rows');
    if (hoursWrap) {
      hoursWrap.addEventListener('change', function (e) {
        if (!e.target.matches('[data-hours-open]')) return;
        var row = e.target.closest('[data-day]');
        row.querySelectorAll('[data-hours-from],[data-hours-to]').forEach(function (inp) { inp.disabled = !e.target.checked; });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();