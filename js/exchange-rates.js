'use strict';

/* ============================================================
   Gaza Market – Exchange Rates Module
   ------------------------------------------------------------
   هاد الملف حالياً بيشتغل على بيانات وهمية (Mock State) شكلها
   نفس شكل البيانات يلي المفروض توصل من الباك اند فيما بعد.

   لما تجهز الباك اند (لارافيل):
   1) اعمل Command يسحب الأسعار من API خارجي مرة باليوم ويخزنها
      بقاعدة البيانات.
   2) اعمل Route زي: Route::get('/api/exchange-rates', ...)
      يرجع array شكله:
        [
          { "currency_code": "USD", "rate_to_ils": 2.99, "updated_at": "..." },
          { "currency_code": "JOD", "rate_to_ils": 4.22, "updated_at": "..." },
          { "currency_code": "EUR", "rate_to_ils": 3.41, "updated_at": "..." }
        ]
   3) بدّل جسم دالة gmFetchExchangeRates() تحت بطلب fetch حقيقي
      لهاد الـ Route. باقي الكود ما رح يحتاج أي تعديل.
   ============================================================ */

// ---------- بيانات وهمية (Mock State) — احذفها/بدّلها لما يجهز الباك اند ----------
const GM_MOCK_RATES = [
  { currency_code: 'USD', rate_to_ils: 2.99, updated_at: null },
  { currency_code: 'JOD', rate_to_ils: 4.22, updated_at: null },
  { currency_code: 'EUR', rate_to_ils: 3.41, updated_at: null },
];

/**
 * دالة جلب أسعار الصرف.
 * حالياً بترجع الـ Mock Data فوق (async عشان تحاكي شكل الـ fetch الحقيقي).
 * هاي الدالة الوحيدة يلي لازم تتبدل لما يجهز الباك اند، مثلاً:
 *
 *   async function gmFetchExchangeRates() {
 *     const res = await fetch('/api/exchange-rates');
 *     if (!res.ok) throw new Error('Failed to load exchange rates');
 *     return await res.json();
 *   }
 */
async function gmFetchExchangeRates() {
  return Promise.resolve(GM_MOCK_RATES);
}

// ---------- Rendering ----------
function gmRenderExchangeRates(rates) {
  (rates || []).forEach(rate => {
    const el = document.querySelector(`[data-currency="${rate.currency_code}"]`);
    if (!el) return;

    const value = Number(rate.rate_to_ils);
    el.textContent = Number.isFinite(value) ? `₪ ${value.toFixed(2)}` : '—';
  });
}

// ---------- تهيئة ----------
async function initExchangeRates() {
  try {
    const rates = await gmFetchExchangeRates();
    gmRenderExchangeRates(rates);
  } catch (err) {
    console.error('gmFetchExchangeRates failed:', err);
    // بضل الأرقام الافتراضية يلي بالـ HTML ظاهرة، ما منمسحها، أفضل من ما نعرض فراغ
  }
}

// إتاحتها بره الملف بحال حبيت تستدعيها يدوياً (مثلاً زر "تحديث")
window.initExchangeRates = initExchangeRates;

document.addEventListener('DOMContentLoaded', () => {
  initExchangeRates();
});