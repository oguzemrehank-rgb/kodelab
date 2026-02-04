// ================================================
// ADMIN.JS - Admin Paneli İşlevleri
// ================================================

// ================================================
// ADMIN GİRİŞ SAYFASı
// ================================================

/**
 * Admin giriş formunu işle
 */
function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Eğer zaten giriş yaptıysa, admin paneline yönlendir
  if (isAdminLoggedIn()) {
    window.location.href = 'admin-panel.html';
  }
}

/**
 * Giriş işlemini işle
 * @param {Event} e - Form submit event'i
 */
function handleLogin(e) {
  e.preventDefault();

  const password = document.getElementById('password').value;
  const alertContainer = document.getElementById('alert-container');

  // Şifreyi kontrol et
  if (validateAdminPassword(password)) {
    // Oturumu başlat
    setAdminSession();
    
    // Başarı mesajı göster
    showAlert(alertContainer, 'Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
    
    // Admin paneline yönlendir
    setTimeout(() => {
      window.location.href = 'admin-panel.html';
    }, 1000);
  } else {
    // Hata mesajı göster
    showAlert(alertContainer, 'Hatalı şifre. Lütfen tekrar deneyin.', 'danger');
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
  }
}

// ================================================
// ADMIN PANELI
// ================================================

/**
 * Admin panelini başlat
 */
function initAdminPanel() {
  // Oturumu kontrol et
  if (!isAdminLoggedIn()) {
    window.location.href = 'admin-login.html';
    return;
  }

  // Çıkış butonunu ayarla
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Haber ekleme formunu ayarla
  const addNewsForm = document.getElementById('add-news-form');
  if (addNewsForm) {
    addNewsForm.addEventListener('submit', handleAddNews);
  }

  // Haber düzenleme formunu ayarla
  const editNewsForm = document.getElementById('edit-news-form');
  if (editNewsForm) {
    editNewsForm.addEventListener('submit', handleEditNews);
  }

  // Haberleri yükle
  loadNewsList();
}

/**
 * Çıkış işlemini gerçekleştir
 * @param {Event} e - Event
 */
function handleLogout(e) {
  e.preventDefault();
  
  clearAdminSession();
  window.location.href = 'admin-login.html';
}

// ================================================
// HABER EKLEME
// ================================================

/**
 * Haber ekleme formunu işle
 * @param {Event} e - Form submit event'i
 */
async function handleAddNews(e) {
  e.preventDefault();

  const alertContainer = document.getElementById('alert-container');

  try {
    // Form verilerini topla
    const formData = new FormData(e.target);
    const newsData = {
      title: formData.get('title'),
      summary: formData.get('summary'),
      content: formData.get('content'),
      category: formData.get('category'),
      image: formData.get('image'),
      date: formData.get('date'),
      author: formData.get('author')
    };

    // Validasyon
    if (!newsData.title.trim()) {
      showAlert(alertContainer, 'Haber başlığı boş olamaz!', 'warning');
      return;
    }

    if (!newsData.summary.trim()) {
      showAlert(alertContainer, 'Haber açıklaması boş olamaz!', 'warning');
      return;
    }

    if (!newsData.content.trim()) {
      showAlert(alertContainer, 'Haber içeriği boş olamaz!', 'warning');
      return;
    }

    // Haber ekle
    const newNews = await addNews(newsData);

    // Başarı mesajı göster
    showAlert(alertContainer, `"${newNews.title}" başarıyla eklendi!`, 'success');

    // Storage'ı doğrula
    console.log('Haber eklendi:', newNews);
    const allNews = await getAllNews();
    console.log('Mevcut haberler:', allNews);

    // Formu sıfırla
    e.target.reset();

    // Haberleri yeniden yükle
    setTimeout(() => {
      loadNewsList();
    }, 500);
  } catch (error) {
    showAlert(alertContainer, 'Haber eklenirken hata oluştu: ' + error.message, 'danger');
  }
}

// ================================================
// HABERLERİ LİSTELEME
// ================================================

/**
 * Mevcut haberleri yükle ve göster
 */
async function loadNewsList() {
  const newsListContainer = document.getElementById('news-list-container');
  const emptyState = document.getElementById('empty-news-state');
  const news = await getAllNews();

  newsListContainer.innerHTML = '';

  if (news.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  // Tabel oluştur
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Başlık</th>
        <th>Kategori</th>
        <th>Tarih</th>
        <th>İşlemler</th>
      </tr>
    </thead>
    <tbody id="news-tbody">
    </tbody>
  `;

  const tbody = table.querySelector('tbody');

  // Haberleri ters sırada göster (en yeni ilk)
  news.reverse().forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(item.title)}</td>
      <td><span class="news-category">${item.category || 'Duyuru'}</span></td>
      <td>${item.date}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-warning" onclick="openEditModal(${item.id})">✏️ Düzenle</button>
          <button class="btn btn-sm btn-danger" onclick="handleDeleteNews(${item.id})">🗑️ Sil</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  newsListContainer.appendChild(table);
}

// ================================================
// HABER DÜZENLEME
// ================================================

/**
 * Haber düzenleme modalını aç
 * @param {number} newsId - Haber ID'si
 */
async function openEditModal(newsId) {
  const news = await getNewsById(newsId);

  if (!news) {
    showAlert(document.getElementById('alert-container'), 'Haber bulunamadı!', 'danger');
    return;
  }

  // Modal alanlarını doldur
  document.getElementById('edit-news-id').value = news.id;
  document.getElementById('edit-title').value = news.title;
  document.getElementById('edit-summary').value = news.summary;
  document.getElementById('edit-content').value = news.content;
  document.getElementById('edit-category').value = news.category || 'Duyuru';
  document.getElementById('edit-image').value = news.image || '';
  document.getElementById('edit-date').value = news.date;
  document.getElementById('edit-author').value = news.author || 'Admin';

  // Modalı göster
  document.getElementById('edit-modal').classList.add('active');
}

/**
 * Haber düzenleme modalını kapat
 */
function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
}

/**
 * Haber düzenleme formunu işle
 * @param {Event} e - Form submit event'i
 */
async function handleEditNews(e) {
  e.preventDefault();

  const alertContainer = document.getElementById('alert-container');
  const newsId = document.getElementById('edit-news-id').value;

  try {
    // Form verilerini topla
    const formData = new FormData(e.target);
    const updatedData = {
      title: formData.get('title'),
      summary: formData.get('summary'),
      content: formData.get('content'),
      category: formData.get('category'),
      image: formData.get('image'),
      date: formData.get('date'),
      author: formData.get('author')
    };

    // Validasyon
    if (!updatedData.title.trim()) {
      showAlert(alertContainer, 'Haber başlığı boş olamaz!', 'warning');
      return;
    }

    // Haber güncelle
    await updateNews(newsId, updatedData);

    showAlert(alertContainer, `"${updatedData.title}" başarıyla güncellendi!`, 'success');
    closeEditModal();

    // Haberleri yeniden yükle
    setTimeout(() => {
      loadNewsList();
    }, 500);
  } catch (error) {
    showAlert(alertContainer, 'Haber güncellenirken hata oluştu: ' + error.message, 'danger');
  }
}

// ================================================
// HABER SİLME
// ================================================

/**
 * Haber silme işlemini gerçekleştir
 * @param {number} newsId - Haber ID'si
 */
async function handleDeleteNews(newsId) {
  const alertContainer = document.getElementById('alert-container');

  if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) {
    return;
  }

  try {
    await deleteNews(newsId);
    showAlert(alertContainer, 'Haber başarıyla silindi!', 'success');

    // Haberleri yeniden yükle
    setTimeout(() => {
      loadNewsList();
    }, 500);
  } catch (error) {
    showAlert(alertContainer, 'Haber silinirken hata oluştu: ' + error.message, 'danger');
  }
}

// ================================================
// YARDIMCI İŞLEVLER
// ================================================

/**
 * Uyarı mesajı göster
 * @param {HTMLElement} container - Mesaj konteynırı
 * @param {string} message - Mesaj metni
 * @param {string} type - Mesaj türü (success, danger, warning, info)
 */
function showAlert(container, message, type) {
  // Eski mesajları temizle
  container.innerHTML = '';

  // Yeni mesaj oluştur
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  container.appendChild(alert);

  // 5 saniye sonra mesajı kaldır
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

/**
 * XSS saldırılarını önlemek için HTML karakterlerini escape et
 * @param {string} text - Metin
 * @returns {string} Escape edilmiş metin
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ================================================
// BAŞLATMA
// ================================================

/**
 * Sayfa yüklendiğinde uygun işlevi çağır
 */
function initializeAdminApp() {
  const currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'admin-login.html') {
    initLoginPage();
  } else if (currentPage === 'admin-panel.html') {
    initAdminPanel();
  }
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', initializeAdminApp);

// Modal'ı kapatmak için dış tıklama
document.addEventListener('click', (e) => {
  const modal = document.getElementById('edit-modal');
  if (e.target === modal) {
    closeEditModal();
  }
});
