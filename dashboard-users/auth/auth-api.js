/*
 * Gaza Market — Auth API layer
 *
 * auth.js never talks to storage or the network for auth logic. It only calls
 * window.GMAuthApi. This file has two drivers:
 *   - mock: everything runs in the browser (temporary, testing only)
 *   - live: real requests to the Laravel backend
 * To switch to the backend: set CONFIG.USE_MOCK = false and set CONFIG.BASE_URL.
 * Then the whole createMockDriver() function can be deleted.
 *
 * Every method returns a Promise that ALWAYS resolves (never rejects):
 *   { ok: true,  data: { ... } }
 *   { ok: false, code: 'ERROR_CODE', data: { attemptsLeft?, retryAfter? } }
 *
 * ---------------------------------------------------------------------------
 * BACKEND CONTRACT (JSON, POST, relative to CONFIG.BASE_URL)
 * Success body: { "data": { ... } }
 * Error body (any non-2xx): { "code": "ERROR_CODE", "attempts_left": 3, "retry_after": 60 }
 * (attempts_left and retry_after are optional; retry_after is in seconds)
 *
 * POST /login
 *   body: { whatsapp, password }
 *   200 -> { token, user: { whatsapp } }
 *   401 -> INVALID_CREDENTIALS | 422 -> INVALID_PHONE | 429 -> RATE_LIMITED
 *
 * POST /password/forgot
 *   body: { whatsapp }
 *   200 -> { expires_in, resend_in }   (seconds)
 *          Must also return 200 when the number is NOT registered (do not
 *          reveal which numbers have accounts). Only send the WhatsApp
 *          message if the number is registered.
 *   422 -> INVALID_PHONE | 429 -> RATE_LIMITED
 *
 * POST /password/verify-code
 *   body: { whatsapp, code }
 *   200 -> { reset_token, expires_in }   (reset_token: single use, signed, expiring)
 *   422 -> INVALID_CODE (+ attempts_left) | CODE_EXPIRED | TOO_MANY_ATTEMPTS | REQUEST_NOT_FOUND
 *   429 -> RATE_LIMITED
 *
 * POST /password/reset
 *   body: { whatsapp, reset_token, password, password_confirmation }
 *   200 -> {}
 *   422 -> INVALID_TOKEN | WEAK_PASSWORD | PASSWORD_MISMATCH | 429 -> RATE_LIMITED
 *
 * POST /logout
 *   header: Authorization: Bearer <token>   body: {}
 *   200 -> {}   (revokes the token on the server)
 *   Best effort: the frontend clears its local session even if this fails.
 *
 * Any request that needs a login must send the Authorization header. If the
 * server answers 401, the frontend calls GMAuth.endSession() (auth-guard.js),
 * which clears the session and returns to the login page.
 *
 * The code, its expiry and its attempt counter live ONLY on the server.
 * The password rule (min length, letters + digits) must be enforced on the
 * server too. The frontend check is only for instant feedback.
 * Auth is assumed token-based (e.g. Sanctum personal access token). If the
 * backend uses cookie sessions instead, add credentials: 'include' in post().
 * ---------------------------------------------------------------------------
 */
(function () {
  'use strict';

  var CONFIG = {
    USE_MOCK: true,
    BASE_URL: '/api/auth',
    TIMEOUT_MS: 15000
  };

  var PASSWORD_MIN_LENGTH = 8;

  function ok(data) {
    return { ok: true, data: data || {} };
  }

  function fail(code, data) {
    return { ok: false, code: code, data: data || {} };
  }

  function isValidPassword(password) {
    var value = String(password || '');
    return value.length >= PASSWORD_MIN_LENGTH &&
      /[A-Za-z\u0600-\u06FF]/.test(value) &&
      /[0-9]/.test(value);
  }

  /* ========================= LIVE DRIVER (Laravel) ========================= */

  function createLiveDriver() {
    function post(path, body, token) {
      var controller = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = controller
        ? window.setTimeout(function () { controller.abort(); }, CONFIG.TIMEOUT_MS)
        : null;

      var headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      if (token) headers.Authorization = 'Bearer ' + token;

      return fetch(CONFIG.BASE_URL + path, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        signal: controller ? controller.signal : undefined
      }).then(function (response) {
        return response.json().then(
          function (payload) { return { status: response.status, payload: payload }; },
          function () { return { status: response.status, payload: {} }; }
        );
      }).catch(function () {
        return { status: 0, payload: {} };
      }).then(function (result) {
        window.clearTimeout(timer);
        return result;
      });
    }

    function toResult(res, mapData) {
      var body = res.payload || {};

      if (res.status === 0) return fail('NETWORK');

      if (res.status >= 200 && res.status < 300) {
        return ok(mapData ? mapData(body.data || {}) : {});
      }

      var code = body.code;
      if (!code) {
        code = res.status === 429 ? 'RATE_LIMITED' : 'SERVER';
      }
      return fail(code, { attemptsLeft: body.attempts_left, retryAfter: body.retry_after });
    }

    return {
      login: function (whatsapp, password) {
        return post('/login', { whatsapp: whatsapp, password: password }).then(function (res) {
          return toResult(res, function (d) {
            return {
              whatsapp: (d.user && d.user.whatsapp) || whatsapp,
              token: d.token || null
            };
          });
        });
      },

      requestResetCode: function (whatsapp) {
        return post('/password/forgot', { whatsapp: whatsapp }).then(function (res) {
          return toResult(res, function (d) {
            var now = Date.now();
            return {
              expiresAt: now + (d.expires_in || 600) * 1000,
              resendAt: now + (d.resend_in || 60) * 1000
            };
          });
        });
      },

      verifyResetCode: function (whatsapp, code) {
        return post('/password/verify-code', { whatsapp: whatsapp, code: code }).then(function (res) {
          return toResult(res, function (d) {
            return {
              token: d.reset_token,
              expiresAt: Date.now() + (d.expires_in || 900) * 1000
            };
          });
        });
      },

      resetPassword: function (whatsapp, resetToken, password, passwordConfirmation) {
        return post('/password/reset', {
          whatsapp: whatsapp,
          reset_token: resetToken,
          password: password,
          password_confirmation: passwordConfirmation
        }).then(function (res) {
          return toResult(res);
        });
      },

      logout: function (token) {
        return post('/logout', {}, token).then(function (res) {
          return toResult(res);
        });
      }
    };
  }

  /* ====================== MOCK DRIVER (temporary, testing only) ====================== */
  /* Passwords are stored in plain text and the code lives in the browser.
     This is NOT secure. It exists only until the backend is ready. */

  function createMockDriver() {
    var USERS_KEY = 'gmDashboardAuthUsers';
    var MOCK_REQUEST_KEY = 'gmMockResetRequest';
    var MOCK_TOKEN_KEY = 'gmMockResetToken';

    var DELAY_MS = 600;
    var WHATSAPP_PATTERN = /^(970|972)\d{9}$/;
    var CODE_TTL_MS = 10 * 60 * 1000;
    var RESEND_COOLDOWN_MS = 60 * 1000;
    var MAX_CODE_ATTEMPTS = 5;
    var RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

    var DEMO_USER = { whatsapp: '970591234567', password: 'Test1234' };

    function read(store, key, fallback) {
      try {
        var raw = window[store].getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        return fallback;
      }
    }

    function write(store, key, value) {
      try {
        window[store].setItem(key, JSON.stringify(value));
      } catch (err) {}
    }

    function remove(store, key) {
      try {
        window[store].removeItem(key);
      } catch (err) {}
    }

    function getUsers() {
      var list = read('localStorage', USERS_KEY, []);
      return Array.isArray(list) ? list : [];
    }

    function setUsers(list) {
      write('localStorage', USERS_KEY, list);
    }

    function seedDemoUser() {
      if (getUsers().length) return;
      setUsers([{ whatsapp: DEMO_USER.whatsapp, password: DEMO_USER.password }]);
    }

    function findUser(whatsapp) {
      var users = getUsers();
      for (var i = 0; i < users.length; i++) {
        if (users[i].whatsapp === whatsapp) return users[i];
      }
      return null;
    }

    function generateResetCode() {
      return String(Math.floor(100000 + Math.random() * 900000));
    }

    function generateResetTokenValue() {
      return 'rst_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }

    function later(fn) {
      return new Promise(function (resolve) {
        window.setTimeout(function () { resolve(fn()); }, DELAY_MS);
      });
    }

    seedDemoUser();

    return {
      login: function (whatsapp, password) {
        return later(function () {
          if (!WHATSAPP_PATTERN.test(whatsapp)) return fail('INVALID_PHONE');
          var user = findUser(whatsapp);
          if (!user || user.password !== password) return fail('INVALID_CREDENTIALS');
          return ok({ whatsapp: user.whatsapp, token: null });
        });
      },

      requestResetCode: function (whatsapp) {
        return later(function () {
          if (!WHATSAPP_PATTERN.test(whatsapp)) return fail('INVALID_PHONE');

          var now = Date.now();
          var registered = !!findUser(whatsapp);
          var state = {
            whatsapp: whatsapp,
            code: registered ? generateResetCode() : null,
            expiresAt: now + CODE_TTL_MS,
            attempts: 0
          };
          write('sessionStorage', MOCK_REQUEST_KEY, state);

          return ok({
            expiresAt: state.expiresAt,
            resendAt: now + RESEND_COOLDOWN_MS,
            testCode: state.code
          });
        });
      },

      verifyResetCode: function (whatsapp, code) {
        return later(function () {
          var state = read('sessionStorage', MOCK_REQUEST_KEY, null);

          if (!state || state.whatsapp !== whatsapp) return fail('REQUEST_NOT_FOUND');
          if (Date.now() > state.expiresAt) return fail('CODE_EXPIRED');
          if (state.attempts >= MAX_CODE_ATTEMPTS) return fail('TOO_MANY_ATTEMPTS');

          if (!state.code || String(code) !== state.code) {
            state.attempts += 1;
            write('sessionStorage', MOCK_REQUEST_KEY, state);
            return fail('INVALID_CODE', { attemptsLeft: MAX_CODE_ATTEMPTS - state.attempts });
          }

          var tokenData = {
            whatsapp: whatsapp,
            token: generateResetTokenValue(),
            expiresAt: Date.now() + RESET_TOKEN_TTL_MS
          };
          write('sessionStorage', MOCK_TOKEN_KEY, tokenData);
          remove('sessionStorage', MOCK_REQUEST_KEY);

          return ok({ token: tokenData.token, expiresAt: tokenData.expiresAt });
        });
      },

      resetPassword: function (whatsapp, resetToken, password, passwordConfirmation) {
        return later(function () {
          var stored = read('sessionStorage', MOCK_TOKEN_KEY, null);

          if (!stored || stored.token !== resetToken || stored.whatsapp !== whatsapp ||
              Date.now() > stored.expiresAt) {
            return fail('INVALID_TOKEN');
          }
          if (password !== passwordConfirmation) return fail('PASSWORD_MISMATCH');
          if (!isValidPassword(password)) return fail('WEAK_PASSWORD');

          var users = getUsers();
          var found = false;
          for (var i = 0; i < users.length; i++) {
            if (users[i].whatsapp === whatsapp) {
              users[i].password = password;
              found = true;
              break;
            }
          }
          if (!found) return fail('INVALID_TOKEN');

          setUsers(users);
          remove('sessionStorage', MOCK_TOKEN_KEY);
          return ok();
        });
      },

      logout: function () {
        return later(function () {
          return ok();
        });
      }
    };
  }

  /* ================================= Export ================================= */

  var driver = CONFIG.USE_MOCK ? createMockDriver() : createLiveDriver();

  window.GMAuthApi = {
    mode: CONFIG.USE_MOCK ? 'mock' : 'live',
    passwordMinLength: PASSWORD_MIN_LENGTH,
    isValidPassword: isValidPassword,
    login: driver.login,
    requestResetCode: driver.requestResetCode,
    verifyResetCode: driver.verifyResetCode,
    resetPassword: driver.resetPassword,
    logout: driver.logout
  };
})();