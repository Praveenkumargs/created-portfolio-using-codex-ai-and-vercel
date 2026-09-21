const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  const values = Object.fromEntries(new FormData(form));
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  button.disabled = true;
  button.querySelector('span').textContent = 'Sending…';
  status.textContent = '';
  try {
    const appsScriptEndpoint = window.PORTFOLIO_CONTACT_ENDPOINT;
    if (appsScriptEndpoint) {
      // Apps Script web apps do not expose custom CORS headers. URL-encoded data
      // keeps this a simple request, and no-cors lets the browser send it safely.
      await fetch(appsScriptEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(values),
      });
    } else {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
    }
    form.reset();
    status.className = 'form-status success';
    status.textContent = 'Thanks — your message has been received. I’ll get back to you soon.';
  } catch (error) {
    status.className = 'form-status error';
    status.textContent = error.message || 'Unable to send your message. Please try again.';
  } finally {
    button.disabled = false;
    button.querySelector('span').textContent = 'Send message';
  }
});
