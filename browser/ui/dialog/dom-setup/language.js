module.exports = function (dialog, options) {

  var translatableElements = Array.prototype.slice.call(
    dialog.element.querySelectorAll('[data-translate]'),
    0
  );

  translatableElements.forEach(function (element) {
    var translationKey = element.getAttribute('data-translate');

    element.innerHTML = dialog.t(dialog.model.get('language'), translationKey);
  });

  // place terms of service url
  var termsAnchor = dialog.element.querySelector('#terms > a');
  termsAnchor.setAttribute('href', dialog.t(dialog.model.get('language'), 'termsOfServiceURL'));
};
