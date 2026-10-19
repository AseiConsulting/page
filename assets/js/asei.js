/* ASEI Consulting · comportamiento compartido de las páginas */
(function () {
  'use strict';
  var WA_NUMBER = '525539748069';

  // Año en el pie
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Navbar: sombra al hacer scroll y botón "volver arriba"
  var nav = document.querySelector('.site-nav');
  var top = document.querySelector('.fab-top');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 8);
    if (top) top.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Cerrar el menú móvil al elegir una sección
  var collapseEl = document.querySelector('.site-nav .navbar-collapse');
  if (collapseEl && window.bootstrap) {
    var bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });
    collapseEl.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () { if (collapseEl.classList.contains('show')) bsCollapse.hide(); });
    });
  }

  // Aparición suave de secciones
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Botones que preseleccionan una opción del formulario (producto o plan)
  document.querySelectorAll('[data-select]').forEach(function (el) {
    el.addEventListener('click', function () {
      var parts = el.getAttribute('data-select').split('=');
      var field = document.getElementById(parts[0]);
      if (field) field.value = parts[1];
    });
  });

  // Formularios de contacto: WhatsApp y, si se indica, correo
  document.querySelectorAll('form[data-contact]').forEach(function (form) {
    var status = form.querySelector('.form-status');

    function message() {
      var lines = [form.getAttribute('data-intro') || 'Hola, los contacto desde su sitio web.'];
      form.querySelectorAll('[data-label]').forEach(function (f) {
        var v = (f.value || '').trim();
        if (f.tagName === 'TEXTAREA') { if (v) lines.push('', f.getAttribute('data-label') + ':', v); }
        else lines.push(f.getAttribute('data-label') + ': ' + (v || 'No indicado'));
      });
      return lines.join('\n');
    }

    function valid(onlyRequiredFor) {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var need = !onlyRequiredFor || !f.hasAttribute('data-mail-only');
        if (!need) { f.classList.remove('is-invalid'); return; }
        var good = f.checkValidity();
        f.classList.toggle('is-invalid', !good);
        if (!good && ok) { f.focus(); ok = false; }
      });
      return ok;
    }

    form.querySelectorAll('.form-control, .form-select').forEach(function (f) {
      f.addEventListener('input', function () { if (f.classList.contains('is-invalid') && f.checkValidity()) f.classList.remove('is-invalid'); });
    });

    var waBtn = form.querySelector('[data-send="whatsapp"]');
    function sendWhatsApp() {
      if (!valid(true)) return;
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message()), '_blank', 'noopener');
      if (status) status.textContent = 'Abrimos WhatsApp con tu mensaje. Solo presiona Enviar.';
    }
    if (waBtn) waBtn.addEventListener('click', sendWhatsApp);

    // Sin correo configurado, el botón principal envía por WhatsApp
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var mail = form.getAttribute('data-mail');
      if (!mail) { sendWhatsApp(); return; }
      if (!valid(false)) return;
      var subject = form.getAttribute('data-subject') || 'Contacto desde el sitio web';
      var product = form.querySelector('[name="producto"]');
      if (product && product.value) subject += ' - ' + product.value;
      if (status) status.textContent = 'Se abrirá tu aplicación de correo. Revisa el mensaje y presiona Enviar.';
      window.location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message());
    });
  });
})();
