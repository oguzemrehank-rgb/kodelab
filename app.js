// ================================================
// APP.JS - Ana Sayfa ve Haber Detay İşlevleri
// ================================================

// ================================================
// ANA SAYFA - HABER GRID
// ================================================

/**
 * Tüm haberleri yükle ve göster
 */
async function loadNewsGrid() {
  const newsGrid = document.getElementById('news-grid');
  const emptyState = document.getElementById('empty-state');
  const news = await getAllNews();

  console.log('Ana sayfa yüklendi. Haberler:', news);

  // Grid'i temizle
  newsGrid.innerHTML = '';

  if (news.length === 0) {
    // Boş durum göster
    newsGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  // Boş durum gizle
  newsGrid.classList.remove('hidden');
  emptyState.classList.add('hidden');

  // Haberleri ters sırada göster (en yeni ilk)
  news.reverse().forEach(item => {
    const card = createNewsCard(item);
    newsGrid.appendChild(card);
  });
}

/**
 * Haber kartı HTML'sini oluştur
 * @param {Object} news - Haber nesnesi
 * @returns {HTMLElement} Kart HTML elementi
 */
function createNewsCard(news) {
  const card = document.createElement('div');
  card.className = 'news-card';
  
  const defaultImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23003d82%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2224%22 font-family=%22Arial%22%3EHaber Görseli%3C/text%3E%3C/svg%3E';
  
  card.innerHTML = `
    <img src="${news.image || defaultImage}" alt="${escapeHtml(news.title)}" class="news-image" onerror="this.src='${defaultImage}'">
    <div class="news-content">
      <span class="news-category">${news.category || 'Duyuru'}</span>
      <h3 class="news-title">${escapeHtml(news.title)}</h3>
      <p class="news-summary">${escapeHtml(news.summary)}</p>
      <a href="haber-detay.html?id=${news.id}" class="read-more-btn">Devamını Oku →</a>
    </div>
  `;
  return card;
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
// HABER DETAY SAYFASI
// ================================================

/**
 * Haber detayını yükle
 */
async function loadNewsDetail() {
  // URL'den ID'yi al
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get('id');

  if (!newsId) {
    showNotFound();
    return;
  }

  // Haberi bul
  const news = await getNewsById(newsId);

  if (!news) {
    showNotFound();
    return;
  }

  // Haber detaylarını göster
  displayNewsDetail(news);
}

/**
 * Haber detaylarını sayfada göster
 * @param {Object} news - Haber nesnesi
 */
function displayNewsDetail(news) {
  // Başlık
  document.getElementById('article-title').textContent = news.title;

  // Meta bilgiler
  document.getElementById('article-date').textContent = `📅 ${news.date}`;
  document.getElementById('article-category').textContent = news.category || 'Duyuru';
  document.getElementById('article-author').textContent = `✍️ ${news.author || 'Admin'}`;

  // Görsel
  const image = document.getElementById('article-image');
  if (news.image) {
    image.src = news.image;
    image.style.display = 'block';
  } else {
    image.style.display = 'none';
  }

  // İçerik
  const content = document.getElementById('article-content');
  content.innerHTML = news.content.split('\n').map(paragraph => {
    if (paragraph.trim()) {
      return `<p>${escapeHtml(paragraph)}</p>`;
    }
    return '';
  }).join('');

  // Sayfa başlığını güncelle
  document.title = `${news.title} - KODE Kodlama Eğitimi`;
}

/**
 * Haber bulunamadı mesajını göster
 */
function showNotFound() {
  const notFound = document.getElementById('not-found');
  const header = document.getElementById('article-header');
  const article = document.querySelector('article');

  notFound.classList.remove('hidden');
  header.style.display = 'none';
  document.querySelector('article > img').style.display = 'none';
  document.getElementById('article-content').innerHTML = '';
}

// ================================================
// BAŞLATMA
// ================================================

/**
 * Sayfa yüklendiğinde uygun işlevi çağır
 */
function initializeApp() {
  // Hangi sayfada olduğunu belirle
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  if (currentPage === 'index.html' || currentPage === '') {
    // Ana sayfa
    loadNewsGrid();
  } else if (currentPage === 'haber-detay.html') {
    // Haber detay sayfası
    loadNewsDetail();
  }
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', initializeApp);
