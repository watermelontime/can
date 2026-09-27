// Reusable footer loader
// Usage: Place <div id="site-footer"></div> before </body> and include this script (type=module).

function insertFooter(containerId = 'site-footer', footerPath = '/can/footer.html') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('[Footer] Container #' + containerId + ' not found');
    return;
  }
  fetch(footerPath, { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(html => {
      container.innerHTML = html;
      // Set dynamic year
      const yearEl = container.querySelector('#footer-year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    })
    .catch(err => {
      console.error('[Footer] Failed to load footer:', err);
    });
}

// Auto insert on DOM ready
document.addEventListener('DOMContentLoaded', () => insertFooter());

export { insertFooter };