const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  mainNav.classList.toggle('is-open', !isOpen);
});

mainNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalLabel = submitButton.innerHTML;
  const payload = Object.fromEntries(new FormData(contactForm).entries());

  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  formStatus.textContent = '';

  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to send your message.');
    contactForm.reset();
    formStatus.textContent = 'Thank you. Your message has been received.';
  } catch (error) {
    formStatus.textContent = error.message === 'Failed to fetch'
      ? 'We could not connect. Please call or WhatsApp us on +254 714 775 636.'
      : error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalLabel;
  }
});
