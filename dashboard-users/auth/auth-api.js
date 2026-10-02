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
            resendAt: now + RESEND_COOLDOWN_MS
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