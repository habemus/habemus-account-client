// own
const aux = require('../../../auxiliary');

module.exports = function (dialog, options) {
  // elements
  var signupForm = dialog.element.querySelector('#h-account-signup');
  var signupFullName = signupForm.querySelector('[name="full-name"]');
  var signupUsername = signupForm.querySelector('[name="username"]');
  var signupEmail    = signupForm.querySelector('[name="email"]');
  var signupPassword = signupForm.querySelector('[name="password"]');
  var signupPasswordConfirm = signupForm.querySelector('[name="password-confirm"]');

  var signupSuccess = dialog.element.querySelector('#h-account-signup [data-state="signup-success"]');
  var signupErrorMessage   = dialog.element.querySelector('#h-account-signup [data-state="signup-error"]');

  var _user;

  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var fullName = signupFullName.value;
    var nameSplit = fullName.split(/\s+/);

    var givenName = nameSplit[0];
    var familyName;
    var additionalName;

    if (nameSplit.length > 1) {
      familyName = nameSplit[nameSplit.length - 1];
    }

    if (nameSplit.length > 2) {
      nameSplit.shift();
      nameSplit.pop();
      additionalName = nameSplit.join(' ');
    }

    var username = signupUsername.value;
    var email    = signupEmail.value;
    var password = signupPassword.value;
    var passwordConfirm = signupPasswordConfirm.value;

    if (password !== passwordConfirm) {
      dialog.model.set('state', 'signup-error');
      
      signupErrorMessage.innerHTML = 'Passwords do not match';

      aux.focusAndSelectAll(signupPasswordConfirm);
      return;
    }

    // set the dialog to signup-loading mode
    dialog.model.set('state', 'signup-loading');

    dialog.hAccountClient.signUp({
      ownerData: {
        givenName: givenName,
        familyName: familyName,
        additionalName: additionalName,
      },

      username: username,
      email: email,
      password: password,
    }, {
      // signup and immediately logIn after signUp
      immediatelyLogIn: true,
    })
    .then(function (user) {

      dialog.model.set('state', 'signup-success');

      // resolve the promise
      dialog.resolve(user);

    }, function (err) {

      dialog.model.set('state', 'signup-error');

      if (err.name === 'UsernameTaken') {

        signupErrorMessage.innerHTML = 'UsernameTaken';

      } else if (err.name === 'EmailTaken') {
        
        signupErrorMessage.innerHTML = 'EmailTaken';

      } else {
        signupErrorMessage.innerHTML = 'Unknown sign up error';
        console.warn(err);
      }
    });

  });
};
