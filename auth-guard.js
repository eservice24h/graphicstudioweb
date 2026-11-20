(function () {
  const PUBLIC_PAGES = ['index.html', 'contact.html', 'auth.html', 'admin-login.html', ''];

  function getCurrentPageName() {
    const path = window.location.pathname || '';
    const lastPart = path.split('/').pop() || 'index.html';
    return lastPart.split('?')[0].split('#')[0].toLowerCase();
  }

  function getActiveUser() {
    try {
      return JSON.parse(localStorage.getItem('graphicStudioActiveUser') || 'null');
    } catch (e) {
      return null;
    }
  }

  function isUserLoggedIn() {
    const user = getActiveUser();
    return Boolean(user && user.mobile);
  }

  function enforcePageAccess() {
    const currentPage = getCurrentPageName();
    const isPublic = PUBLIC_PAGES.includes(currentPage);

    if (!isPublic && !isUserLoggedIn()) {
      window.location.replace('auth.html');
    }
  }

  function syncMenuUI() {
    const loggedIn = isUserLoggedIn();

    const profileLink = document.getElementById('profileMenuLink');
    const authLink = document.getElementById('authMenuLink');
    const contactLink = document.getElementById('contactMenuLink');
    const adminLink = document.getElementById('adminMenuLink');
    const logoutBtn = document.getElementById('logoutMenuBtn') || document.getElementById('logoutBtn') || document.getElementById('logoutBtnHeader');

    if (loggedIn) {
      if (profileLink) profileLink.style.display = 'block';
      if (contactLink) contactLink.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'block';

      if (authLink) authLink.style.display = 'none';
      if (adminLink) adminLink.style.display = 'none';
    } else {
      if (authLink) authLink.style.display = 'block';
      if (contactLink) contactLink.style.display = 'block';
      if (adminLink) adminLink.style.display = 'block';

      if (profileLink) profileLink.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  function guardLinksAndServices() {
    document.addEventListener('click', (e) => {
      if (isUserLoggedIn()) return;

      const anchor = e.target.closest('a[href]');
      if (anchor) {
        const href = (anchor.getAttribute('href') || '').trim();
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        const targetPage = href.split('/').pop().split('?')[0].split('#')[0].toLowerCase();
        if (!PUBLIC_PAGES.includes(targetPage)) {
          e.preventDefault();
          window.location.href = 'auth.html';
          return;
        }
      }

      const gatedEl = e.target.closest('[data-requires-login="true"]');
      if (gatedEl) {
        e.preventDefault();
        window.location.href = 'auth.html';
      }
    });
  }

  function bindLogout() {
    const logoutBtn = document.getElementById('logoutMenuBtn') || document.getElementById('logoutBtn') || document.getElementById('logoutBtnHeader');
    if (logoutBtn && !logoutBtn.dataset.guardBound) {
      logoutBtn.dataset.guardBound = 'true';
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('graphicStudioActiveUser');
        syncMenuUI();
        window.location.href = 'index.html';
      });
    }
  }

  enforcePageAccess();

  document.addEventListener('DOMContentLoaded', () => {
    syncMenuUI();
    bindLogout();
    guardLinksAndServices();
  });

  window.addEventListener('pageshow', () => {
    enforcePageAccess();
    syncMenuUI();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'graphicStudioActiveUser') {
      enforcePageAccess();
      syncMenuUI();
    }
  });

  window.GraphicStudioAuthGuard = {
    isUserLoggedIn,
    getActiveUser,
    syncMenuUI
  };
})();
