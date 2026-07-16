export {};

type ContactPostHog = {
  capture: (eventName: string, properties?: Record<string, number | string>) => void;
};

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

const posthogCapture = (eventName: string) => {
  (window as Window & { posthog?: ContactPostHog }).posthog?.capture(eventName);
};

function initContactForm() {
  const modal = document.querySelector<HTMLDialogElement>('#contact-modal');
  const openBtn = document.querySelector<HTMLButtonElement>('#open-contact-modal');
  const form = document.querySelector<HTMLFormElement>('#contact-form');
  if (!modal || !openBtn || !form) return;

  const statusEl = form.querySelector<HTMLElement>('.mail-status');
  const sendBtn = form.querySelector<HTMLButtonElement>('.mail-send');
  const closeBtn = form.querySelector<HTMLButtonElement>('.mail-modal-close');
  const nameInput = form.querySelector<HTMLInputElement>('#contact-name');
  if (!statusEl || !sendBtn) return;

  const setStatus = (state: 'sending' | 'success' | 'error' | '', text: string) => {
    statusEl.dataset.state = state;
    statusEl.textContent = text;
  };

  openBtn.addEventListener('click', () => {
    setStatus('', '');
    // Re-center in case a previous drag moved it
    modal.style.left = '';
    modal.style.top = '';
    modal.style.margin = '';
    modal.showModal();
    nameInput?.focus();
    posthogCapture('contact_modal_opened');
  });

  closeBtn?.addEventListener('click', () => modal.close());

  // Drag the composer around by its title bar
  const bar = form.querySelector<HTMLElement>('.mail-composer-bar');
  if (bar) {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    bar.addEventListener('pointerdown', (event) => {
      if ((event.target as HTMLElement).closest('button')) return;
      const rect = modal.getBoundingClientRect();
      dragging = true;
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      modal.classList.add('mail-modal--dragging');
      bar.setPointerCapture(event.pointerId);
    });

    bar.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const rect = modal.getBoundingClientRect();
      const maxLeft = window.innerWidth - rect.width - 8;
      const maxTop = window.innerHeight - rect.height - 8;
      modal.style.margin = '0';
      modal.style.left = `${Math.min(Math.max(event.clientX - offsetX, 8), maxLeft)}px`;
      modal.style.top = `${Math.min(Math.max(event.clientY - offsetY, 8), maxTop)}px`;
    });

    const endDrag = () => {
      dragging = false;
      modal.classList.remove('mail-modal--dragging');
    };
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', endDrag);
  }

  // Click on the backdrop (the dialog element itself) closes the modal
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    sendBtn.disabled = true;
    setStatus('sending', 'sending message…');

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      const result = (await response.json()) as { success?: boolean };
      if (!response.ok || !result.success) throw new Error('delivery failed');

      form.reset();
      setStatus('success', "sent — exit 0. i'll get back to you soon.");
      posthogCapture('contact_form_submitted');
    } catch {
      setStatus('error', 'exit 1 — delivery failed. email me: ralphmungcal09@gmail.com');
    } finally {
      sendBtn.disabled = false;
    }
  });
}

initContactForm();
