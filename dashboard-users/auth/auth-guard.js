/*
 * Gaza Market — Dashboard session guard
 *
 * Put this file in the same folder as login.html and load it as the FIRST
 * script in <head> of every protected page (dashboard.html and its siblings):
 *
 *   <script src="auth/auth-guard.js"></script>
 *   (optional, only if the page should call the server on logout)
 *   <script src="auth/auth-api.js"></script>   <- must come BEFORE the guard
 *
 * What it does:
 *   - No valid session -> hides the page and redirects to login.html
 *   - Any element with data-action="logout" ends the session
 *   - Logging out in one tab logs out the other open tabs
 *   - Pressing Back after logout does not show the cached dashboard
 *
 * NOTE: this is a user-experience guard only. Real protection is the backend
 * rejecting requests without a valid token (401). When any API call returns
 * 401, call GMAuth.endSession().
 *
 * Public API (window.GMAuth):
 *   GMAuth.getSession()  -> { whatsapp, token, loggedInAt } or null
 *   GMAuth.logout()      -> revoke token on the server (best effort), clear session, go to login
 *   GMAuth.endSession()  -> clear session and go to login immediately (use on 401)
 */
(function () {
  'use strict';

  var SESSION_STORAGE_KEY = 'gmDashboardSession';
  var LOGOUT_MAX_WAIT_MS = 1500;

  var scriptEl = document.currentScript;
  var LOGIN_PAGE_URL = scriptEl && scriptEl.src
    ? new URL('login.html', scriptEl.src).href
    : 'auth/login.html';

  var loggingOut = false;

  function readSession() {
    try {
      var raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      var session = raw ? JSON.parse(raw) : null;
      return session && typeof session.whatsapp === 'string' && session.whatsapp ? session : null;
    } catch (err) {
      return null;
    }
  }

  function clearSession() {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {}
  }

  function redirectToLogin() {
    document.documentElement.style.display = 'none';
    window.location.replace(LOGIN_PAGE_URL);
  }

  function endSession() {
    clearSession();
    redirectToLogin();
  }

  function logout() {
    if (loggingOut) return;
    loggingOut = true;

    var session = readSession();
    clearSession();

    if (!window.GMAuthApi || typeof window.GMAuthApi.logout !== 'function') {
      redirectToLogin();
      return;
    }

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      redirectToLogin();
    }

    window.setTimeout(finish, LOGOUT_MAX_WAIT_MS);
    window.GMAuthApi.logout(session ? session.token : null).then(finish, finish);
  }

  window.GMAuth = {
    getSession: readSession,
    logout: logout,
    endSession: endSession
  };

  if (!readSession()) {
    /* Clear a broken session too, otherwise login.html would send us back here. */
    endSession();
    return;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-action="logout"]');
    if (!btn) return;
    e.preventDefault();
    logout();
  });

  window.addEventListener('pageshow', function (e) {
    if (e.persisted && !readSession()) redirectToLogin();
  });

  window.addEventListener('storage', function (e) {
    if (e.key === SESSION_STORAGE_KEY && !e.newValue) redirectToLogin();
  });
})();