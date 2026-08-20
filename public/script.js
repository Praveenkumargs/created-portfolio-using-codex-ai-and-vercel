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
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    form.reset();
    status.className = 'form-status success';
    status.textContent = result.message;
  } catch (error) {
    status.className = 'form-status error';
    status.textContent = error.message || 'Unable to send your message. Please try again.';
  } finally {
    button.disabled = false;
    button.querySelector('span').textContent = 'Send message';
  }
});
