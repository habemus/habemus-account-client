// native
const fs = require('fs');
const util = require('util');

// third-party
const dialogPolyfill = require('dialog-polyfill');
const DataObj = require('data-obj');
const Bluebird = require('bluebird');

// internal
const HAccountClient = require('../../');
const dialogTemplate = fs.readFileSync(__dirname + '/template.html', 'utf8');
const dialogStyles   = fs.readFileSync(__dirname + '/styles.css', 'utf8');
// according to brfs docs, require.resolve() may be used as well
// https://www.npmjs.com/package/brfs#methods
const dialogPolyfillStyles = fs.readFileSync(require.resolve('dialog-polyfill/dialog-polyfill.css'), 'utf8')
const domSetup = require('./dom-setup');
const domSetupLanguage = require('./dom-setup/language');
const errors = require('../../../errors');

// constants
const ACTIVE_CLASS = 'active';

const STATE_LOGIN = 'login';
const STATE_SIGNUP = 'signup';
const STATE_SIGNUP_SUCCESS = 'signup-success';
const STATE_PASSWORD_RESET = 'password-reset';
const STATE_EMAIL_VERIFICATION = 'email-verification';

const LANGUAGES = {
  'pt-BR': require('../languages/pt-BR.json'),
  'en-US': require('../languages/en-US.json'),
};

/**
 * Auxiliary function that inserts a CSSString into the document
 * @param  {String} CSSString
 */
function _insertCSS(CSSString) {
  var style = document.createElement('style');
  style.innerHTML = CSSString;

  document.querySelector('head').appendChild(style);
}
/**
 * Global bootstrap: insert styles
 */
_insertCSS(dialogStyles);
_insertCSS(dialogPolyfillStyles);

/**
 * Parses an html string and returns the corresponding DOM Element
 * @param  {String} string
 * @return {DOMElement}
 */
function _domElementFromString(string) {

  // a very hacky way of doing this
  var wrapper = document.createElement('div');

  wrapper.innerHTML = string;

  return wrapper.firstChild;
}

function _toArray(obj) {
  return Array.prototype.slice.call(obj, 0);
}

/**
 * Auth Dialog constructor
 * @param {Object} options
 */
function HAccountDialog(options) {

  // instantiate account client if none is passed as option
  this.hAccountClient = options.hAccountClient || new HAccountClient(options);

  /**
   * Translation function
   */
  this.t = options.t || function translate(language, key) {

    if (arguments.length < 2) {
      throw new Error('language and key are required');
    }

    return LANGUAGES[language][key];
  };

  /**
   * Data store for the modal model
   * @type {DataObj}
   */
  this.model = new DataObj({
    // default language is en-US
    language: options.language || 'en-US',
  });

  /**
   * Instantiate a DOM Element for the dialog
   * @type {DOMElement}
   */
  var element = _domElementFromString(dialogTemplate);
  this.element = element;

  /**
   * Execute the setup of the dom elements
   */
  domSetup(this, options);

  // dialog-wide state
  this.model.on('change:state', function (data) {
    var currentState = data.newValue;

    // toggle elements 'active' class
    _toArray(element.querySelectorAll('[data-state]')).forEach(function (el) {
      var elStates = el.getAttribute('data-state') || '';
      elStates = elStates.split(/\s+/g);

      var isActive = elStates.indexOf(currentState) !== -1;

      el.classList.toggle(ACTIVE_CLASS, isActive);

      // check for data-show-after elements and set their respective timeouts
      var showAfterEls = _toArray(el.querySelectorAll('[data-show-after]')).forEach(function (showAfterEl) {
        var delay = parseInt(showAfterEl.getAttribute('data-show-after'), 10);
        showAfterEl.setAttribute('hidden', true);
        setTimeout(function () {
          showAfterEl.removeAttribute('hidden');
        }, delay);
      });
    });

  }.bind(this));

  // whether to enable cancel
  this.model.on('change:noCancel', function (data) {

    var cancelEls = _toArray(this.element.querySelectorAll('[data-action="cancel"]'));

    if (data.newValue) {
      // noCancel enabled
      cancelEls.forEach(function (el) {
        el.setAttribute('hidden', true);
      });

    } else {
      // noCancel disabled
      cancelEls.forEach(function (el) {
        el.removeAttribute('hidden');
      });
    }
  }.bind(this));

  // language
  this.model.on('change:language', function (data) {
    domSetupLanguage(this, options);
  }.bind(this));

  // capture esc key cancel
  this.element.addEventListener('cancel', function (e) {

    if (this.model.get('noCancel')) {
      e.preventDefault();
    } else {
      this.reject(new errors.UserCancelled('escKey'));
    }

  }.bind(this));

  dialogPolyfill.registerDialog(this.element);

  /**
   * Optionally attach to an element
   */
  if (options.containerElement) {
    this.attach(options.containerElement);
  }
}

/**
 * Attaches the dialog element to the DOM within a given
 * containerElement
 * @param  {DOM Element} containerElement
 */
HAccountDialog.prototype.attach = function (containerElement) {
  this.containerElement = containerElement;

  containerElement.appendChild(this.element);
};

/**
 * Shows the modal on the login ui
 * @return {Bluebird}
 */
HAccountDialog.prototype.logIn = function (options) {

  options = options || {};

  this.model.set({
    state: STATE_LOGIN,
    action: 'logIn',
    noCancel: false,
  });

  if (options.language) {
    // the language at which the user is accessing the account interface
    this.model.set('language', options.language);
  }

  if (!this.element.hasAttribute('open')) {
    this.element.showModal();
  }

  return new Bluebird(function (resolve, reject) {
    this._logInResolve = resolve;
    this._logInReject  = reject;
  }.bind(this));
};

/**
 * Shows the dialog on the signup ui
 * @return {Bluebird}
 */
HAccountDialog.prototype.signUp = function (options) {

  options = options || {};

  this.model.set({
    state: STATE_SIGNUP,
    action: 'signUp',
    noCancel: false,
  });

  if (options.language) {
    // the language at which the user is accessing the account interface
    this.model.set('language', options.language);
  }

  if (!this.element.hasAttribute('open')) {
    this.element.showModal();
  }

  return new Bluebird(function (resolve, reject) {
    this._signUpResolve = resolve;
    this._signUpReject  = reject;
  }.bind(this));
};

HAccountDialog.prototype.verifyEmail = function (options) {

  options = options || {};

  this.model.set({
    state: STATE_EMAIL_VERIFICATION,
    action: 'verifyEmail',
    noCancel: true,
  });

  if (options.language) {
    // the language at which the user is accessing the account interface
    this.model.set('language', options.language);
  }

  if (!this.element.hasAttribute('open')) {
    this.element.showModal();
  }

  return new Bluebird(function (resolve, reject) {
    this._verifyEmailResolve = resolve;
    this._verifyEmailReject  = reject;
  }.bind(this));
};

HAccountDialog.prototype.clear = function () {

  _toArray(this.element.querySelectorAll('input')).forEach(function (el) {
    el.value = '';
  });

  this.model.set({
    state: undefined,
    action: undefined,
    noCancel: false,
  });

  delete this._logInResolve;
  delete this._logInReject;
  delete this._signUpResolve;
  delete this._signUpReject;
};

HAccountDialog.prototype.resolve = function (result) {
  var action = this.model.get('action');

  switch (action) {
    case 'logIn':
      this._logInResolve(result);
      break;
    case 'signUp':
      this._signUpResolve(result);
      break;
    case 'verifyEmail':
      this._verifyEmailResolve(result);
      break;
    default:
      console.warn('unsupported action', action);
      break;
  }
};

HAccountDialog.prototype.reject = function (error) {
  var action = this.model.get('action');

  switch (action) {
    case 'logIn':
      this._logInReject(error);
      break;
    case 'signUp':
      this._signUpReject(error);
      break;
    case 'verifyEmail':
      this._verifyEmailReject(error);
      break;
    default:
      console.warn('unsupported action', action);
      break;
  }
};

/**
 * Closes the dialog
 */
HAccountDialog.prototype.close = function () {
  this.clear();
  this.element.close();
};

/**
 * Ensures there is a logged in user and returns it.
 * If the user is not logged in, pops the login dialog.
 * Otherwise, simply returns the current user.
 *
 * @param {Object} options
 *        - ensureEmailVerified: Boolean (false)
 *
 * @return {AccountData}
 */
HAccountDialog.prototype.ensureAccount = function (options) {

  options = options || {};

  var self = this;

  return self.hAccountClient.getCurrentAccount()
    .then(function (user) {
      return user;
    })
    .catch(function (err) {
      if (err.name === 'NotLoggedIn') {
        // user not logged in

        return self.logIn(options)
          .then(function () {
            // the method MUST return the current user
            return self.hAccountClient.getCurrentAccount();
          })

      } else if (err.name === 'AccountNotFound') {
        // user logged in, but for some reason the
        // account does not exist anymore

        return self.signUp(options)
          .then(function () {
            // the method MUST return the current user
            return self.hAccountClient.getCurrentAccount();
          });

      } else {
        // unknown error
        console.warn('unknown error', err);
        self.logOut();
        return self.logIn(options);
        // TODO it might be better to let consuming system
        // to handle the error, but for now be defensive: never let
        // the user go to a path with no feedback
        // normally reject original error
        // return Bluebird.reject(err);
      }
    })
    .then(function (account) {

      if (options.ensureEmailVerified) {

        var statusValue = account.status.value;

        switch (statusValue) {
          case 'new':
          case 'verifying':
            return self.verifyEmail(options);
            break;
          case 'verified':
            return account;
            break;
          case 'cancelled':
            return Bluebird.reject(new errors.AccountCancelled());
            break;
          default:
            // by default assume the account is at cancelled status
            console.warn('unsupported account.status.value', account.status.value);
            break;
        }

      } else {
        return account;
      }
    });

};

// AuthClient proxy methods
const AUTH_PROXY_METHODS = [
  'getAuthToken',
  'getCurrentAccount',
  'logOut',
  'on',
  'emit',
  'removeEventListener',
];

AUTH_PROXY_METHODS.forEach(function (method) {
  HAccountDialog.prototype[method] = function () {
    var args = Array.prototype.slice.call(arguments, 0);

    return this.hAccountClient[method].apply(this.hAccountClient, args);
  };
});

module.exports = HAccountDialog;
