module.exports = function (dialog, options) {

  var language = dialog.model.get('language') || 'en-US';

  var translatableElements = Array.prototype.slice.call(
    dialog.element.querySelectorAll('[data-translate]'),
    0
  );

  translatableElements.forEach(function (element) {
    var translationKey = element.getAttribute('data-translate');

    element.innerHTML = dialog.t(language, translationKey);
  });

  // place terms of service url
  var termsAnchor = dialog.element.querySelector('#terms > a');
  termsAnchor.setAttribute('href', dialog.t(language, 'termsOfServiceURL'));
};
