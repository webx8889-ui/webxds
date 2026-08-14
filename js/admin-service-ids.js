(() => {
  let refreshTimer;

  async function showServiceIds() {
    const cards = [...document.querySelectorAll('.lead-card[data-lead-id]:not([data-service-id-shown])')];
    if (!cards.length) return;

    const token = localStorage.getItem('webx-admin-token') || '';
    if (!token) return;
    try {
      const response = await fetch('/api/admin/bootstrap', {
        credentials: 'same-origin',
        headers: { 'x-admin-token': token }
      });
      if (!response.ok) return;
      const data = await response.json();
      const ids = new Map((data.leads || []).map(lead => [lead.id, lead.serviceId]));
      const idsByEmail = new Map((data.leads || []).map(lead => [String(lead.email || '').trim().toLowerCase(), lead.serviceId]));
      cards.forEach(card => {
        card.dataset.serviceIdShown = 'true';
        const serviceId = ids.get(card.dataset.leadId);
        if (!serviceId) return;
        const meta = document.createElement('div');
        meta.className = 'lead-service-id';
        meta.textContent = `Service ID: ${serviceId}`;
        meta.style.cssText = 'margin-top:8px;font-size:11px;font-weight:700;letter-spacing:.07em;color:var(--c-accent, #fea800);';
        const details = card.querySelector('.lead-details');
        if (details) details.appendChild(meta);
      });
      document.querySelectorAll('#page-dashboard .client-email:not([data-service-id-shown])').forEach(email => {
        email.dataset.serviceIdShown = 'true';
        const serviceId = idsByEmail.get(email.textContent.trim().toLowerCase());
        if (!serviceId) return;
        const meta = document.createElement('div');
        meta.textContent = serviceId;
        meta.style.cssText = 'margin-top:3px;font-size:10px;font-weight:700;letter-spacing:.06em;color:var(--c-accent, #fea800);';
        email.appendChild(meta);
      });
    } catch (_) { }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const leadsList = document.getElementById('leadsList');
    if (!leadsList) return;
    new MutationObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(showServiceIds, 80);
    }).observe(leadsList, { childList: true, subtree: true });
    showServiceIds();
  });
})();
