// Reusable menu loader
// Usage: Place <div id="site-menu"></div> before </body> and include this script (type=module).

function insertMenu(containerId = 'site-menu', menuPath = '/menu.html') {
  const container = document.getElementById(containerId);
  if (!container) return;
  fetch(menuPath, { cache: 'no-cache' })
    .then(r => r.text())
    .then(html => {
      container.innerHTML = html;
      const toggle = container.querySelector('.menu-toggle');
      const menu = container.querySelector('.menu-list');
      if (toggle && menu) {
        toggle.addEventListener('click', () => {
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', !expanded);
          menu.classList.toggle('open');
        });
      }
    });
}
document.addEventListener('DOMContentLoaded', () => insertMenu());
export { insertMenu };
