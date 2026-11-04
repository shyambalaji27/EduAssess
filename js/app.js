/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Core Application Framework & UI Utilities
 * Exposes window.OES_App
 */

(function () {
  'use strict';

  // --- Theme Controller ---
  function initTheme() {
    const settings = window.OES_Storage ? window.OES_Storage.getSettings() : { theme: 'light' };
    const savedTheme = settings.theme || 'light';
    applyTheme(savedTheme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn, #theme-toggle');
    themeToggleBtns.forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark');
    }
    updateThemeToggleIcons(theme);
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    if (window.OES_Storage) {
      window.OES_Storage.saveSettings({ theme: newTheme });
    }
  }

  function updateThemeToggleIcons(theme) {
    const btns = document.querySelectorAll('.theme-toggle-btn, #theme-toggle');
    btns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }

  // --- Toast Notification System ---
  function ensureToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = 'info', duration = 3500) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span style="flex:1;">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // --- Generic Confirmation Modal ---
  function confirmModal({ title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', confirmClass = 'btn-danger', onConfirm }) {
    let overlay = document.getElementById('oes-confirm-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'oes-confirm-modal';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-content" style="max-width: 440px;">
          <div class="modal-header">
            <h3 id="oes-modal-title">${title}</h3>
            <button class="btn-close" id="oes-modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p id="oes-modal-msg" style="color: var(--text-muted); font-size: 1rem;">${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="oes-modal-cancel">Cancel</button>
            <button class="btn ${confirmClass}" id="oes-modal-confirm">${confirmText}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      document.getElementById('oes-modal-title').textContent = title;
      document.getElementById('oes-modal-msg').textContent = message;
      const confirmBtn = document.getElementById('oes-modal-confirm');
      confirmBtn.textContent = confirmText;
      confirmBtn.className = `btn ${confirmClass}`;
    }

    const closeModal = () => {
      overlay.classList.remove('active');
    };

    document.getElementById('oes-modal-close').onclick = closeModal;
    document.getElementById('oes-modal-cancel').onclick = closeModal;

    const confirmBtn = document.getElementById('oes-modal-confirm');
    confirmBtn.onclick = () => {
      closeModal();
      if (typeof onConfirm === 'function') onConfirm();
    };

    overlay.classList.add('active');
  }

  // --- Mobile Sidebar Navigation ---
  function initMobileNav() {
    const mobileBtn = document.querySelector('.mobile-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    if (!mobileBtn || !sidebar) return;

    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }

  // --- Header Profile Filler ---
  function renderHeaderUser() {
    if (!window.OES_Auth) return;
    const user = window.OES_Auth.getCurrentUser();
    if (!user) return;

    const userNames = document.querySelectorAll('.header-user-name, .user-name');
    const userAvatars = document.querySelectorAll('.user-avatar');
    const userRoles = document.querySelectorAll('.user-role-label');

    userNames.forEach(el => el.textContent = user.name || user.username);
    userRoles.forEach(el => el.textContent = user.role.toUpperCase() + (user.department ? ` • ${user.department}` : ''));
    userAvatars.forEach(el => {
      el.textContent = (user.name || user.username).charAt(0).toUpperCase();
    });
  }

  // Run on DOM loaded
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    renderHeaderUser();
  });

  window.OES_App = {
    initTheme,
    toggleTheme,
    showToast,
    confirmModal,
    initMobileNav,
    renderHeaderUser
  };

})();

