// native
const util = require('util');

/**
 * Base message constructor
 * @param {String} message
 */
function HAccountError(message) {
  Error.call(this);

  this.message = message || 'HAccountError';
};
util.inherits(HAccountError, Error);
HAccountError.prototype.name = 'HAccountError';

/**
 * Happens when any required option is invalid
 *
 * error.option should have the option that is invalid
 * error.kind should contain details on the error type
 * 
 * @param {String} option
 * @param {String} kind
 * @param {String} message
 */
function InvalidOption(option, kind, message) {
  HAccountError.call(this, message);

  this.option = option;
  this.kind = kind;
}
util.inherits(InvalidOption, HAccountError);
InvalidOption.prototype.name = 'InvalidOption';

/**
 * Happens whenever the attempted username
 * is already in use by another account.
 * 
 * @param {String} username
 */
function UsernameTaken(username) {
  HAccountError.call(this, 'Username ' + username + ' is already taken');

  this.username = username;
}
util.inherits(UsernameTaken, HAccountError);
UsernameTaken.prototype.name = 'UsernameTaken';

/**
 * Happens whenever the attempted email
 * is already in use by another account.
 * 
 * @param {String} email
 */
function EmailTaken(email) {
  HAccountError.call(this, 'Username ' + email + ' is already taken');

  this.email = email;
}
util.inherits(EmailTaken, HAccountError);
EmailTaken.prototype.name = 'EmailTaken';

/**
 * Happens whenever the credentials provided are not valid
 */
function InvalidCredentials(detail) {
  HAccountError.call(this, 'The credentials provided are invalid');

  this.detail = detail;
}
util.inherits(InvalidCredentials, HAccountError);
InvalidCredentials.prototype.name = 'InvalidCredentials';

/**
 * Happens whenever an action requested is not authorized
 * by the server
 * @param {String} message [description]
 */
function Unauthorized(message) {
  HAccountError.call(this, message);
}
util.inherits(Unauthorized, HAccountError);
Unauthorized.prototype.name = 'Unauthorized';

/**
 * Happens whenever the token provided for auth is invalid
 */
function InvalidToken() {
  HAccountError.call(this, 'Token provided is invalid');
}
util.inherits(InvalidToken, HAccountError);
InvalidToken.prototype.name = 'InvalidToken';

/**
 * Happens whenever the user is not found
 * for the given identification (username or identifier)
 * @param {String} identifier (username or identifier)
 * @param {String} message
 */
function UserNotFound(identifier, message) {
  HAccountError.call(this, message);

  this.identifier = identifier;
}
util.inherits(UserNotFound, HAccountError);
UserNotFound.prototype.name = 'UserNotFound';

/**
 * Happens when an account has to be active
 * for an action to be performed, but the
 * account has been cancelled
 */
function AccountCancelled() {
  HAccountError.call(this);
}
util.inherits(AccountCancelled, HAccountError);
AccountCancelled.prototype.name = 'AccountCancelled';

/**
 * Client errors
 */

/**
 * Happens whenever the user is not logged in
 * @param {String} message
 */
function NotLoggedIn(message) {
  HAccountError.call(this, message);
}
util.inherits(NotLoggedIn, HAccountError);
NotLoggedIn.prototype.name = 'NotLoggedIn';

/**
 * Happens whenever the user has cancelled any action.
 * @param {String} message
 */
function UserCancelled(message) {
  HAccountError.call(this, message);
}
util.inherits(UserCancelled, HAccountError);
UserCancelled.prototype.name = 'UserCancelled';

exports.HAccountError = HAccountError;
exports.InvalidOption = InvalidOption;
exports.UsernameTaken = UsernameTaken;
exports.EmailTaken = EmailTaken;
exports.InvalidCredentials = InvalidCredentials;
exports.Unauthorized = Unauthorized;
exports.InvalidToken = InvalidToken;
exports.UserNotFound = UserNotFound;
exports.AccountCancelled = AccountCancelled;
exports.NotLoggedIn = NotLoggedIn;
exports.UserCancelled = UserCancelled;
