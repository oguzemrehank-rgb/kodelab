// ================================================
// COOKIE-POLICY.JS - Çerez Politikası (Basitleştirilmiş)
// ================================================

const COOKIE_ACCEPTED_KEY = 'cookies_accepted';

function initCookiePolicy() {
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');

  // Eğer daha önce kabul edilmişse banner'ı gizle
  if (localStorage.getItem(COOKIE_ACCEPTED_KEY)) {
    if (cookieBanner) cookieBanner.style.display = 'none';
    return;
  }

  // Kabul butonu
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(COOKIE_ACCEPTED_KEY, 'true');
      if (cookieBanner) cookieBanner.style.display = 'none';
    });
  }

  // Banner'ı göster
  if (cookieBanner) cookieBanner.style.display = 'block';
}

// Çerez kabulünü sıfırlamak için kullanılabilir (geliştirme/test amaçlı)
function resetCookieConsent() {
  localStorage.removeItem(COOKIE_ACCEPTED_KEY);
  location.reload();
}

document.addEventListener('DOMContentLoaded', initCookiePolicy);
