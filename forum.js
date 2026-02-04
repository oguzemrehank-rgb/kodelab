// ================================================
// FORUM.JS - Forum İşlemleri
// ================================================

document.addEventListener('DOMContentLoaded', function() {
  loadPosts();
  setupEventListeners();
});

/**
 * Event listener'ları ayarla
 */
function setupEventListeners() {
  // Yeni gönderi butonu
  const newPostBtn = document.getElementById('new-post-btn');
  if (newPostBtn) {
    newPostBtn.addEventListener('click', openNewPostModal);
  }

  // Modal kapatma
  const closeBtn = document.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeNewPostModal);
  }

  // Modal dışına tıklama
  const modal = document.getElementById('new-post-modal');
  if (modal) {
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeNewPostModal();
      }
    });
  }

  // Form submit
  const form = document.getElementById('new-post-form');
  if (form) {
    form.addEventListener('submit', handleNewPost);
  }
}

/**
 * Tüm gönderileri yükle ve göster
 */
async function loadPosts() {
  const postsGrid = document.getElementById('posts-grid');
  const emptyState = document.getElementById('empty-state');

  if (!postsGrid) return;

  try {
    const posts = await getAllPosts();

    if (posts.length === 0) {
      postsGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    postsGrid.innerHTML = '';

    posts.forEach(post => {
      const postElement = createPostElement(post);
      postsGrid.appendChild(postElement);
    });
  } catch (error) {
    console.error('Gönderiler yüklenirken hata:', error);
    postsGrid.innerHTML = '<p>Gönderiler yüklenirken bir hata oluştu.</p>';
  }
}

/**
 * Gönderi elementi oluştur
 * @param {Object} post - Gönderi verisi
 * @returns {HTMLElement} Gönderi elementi
 */
function createPostElement(post) {
  const postDiv = document.createElement('div');
  postDiv.className = 'post-card';
  postDiv.innerHTML = `
    <div class="post-header">
      <h3 class="post-title">${escapeHtml(post.title)}</h3>
      <div class="post-meta">
        <span class="post-author">${escapeHtml(post.author || 'Anonim')}</span>
        <span class="post-date">${formatDate(post.date)}</span>
      </div>
    </div>
    <div class="post-content">
      <p>${escapeHtml(post.content)}</p>
    </div>
    <div class="post-actions">
      <button class="vote-btn upvote" data-post-id="${post.id}" data-vote="1">👍 ${post.votes || 0}</button>
      <button class="vote-btn downvote" data-post-id="${post.id}" data-vote="-1">👎</button>
    </div>
  `;

  // Oy verme event listener'ları
  const upvoteBtn = postDiv.querySelector('.upvote');
  const downvoteBtn = postDiv.querySelector('.downvote');

  upvoteBtn.addEventListener('click', handleVote);
  downvoteBtn.addEventListener('click', handleVote);

  return postDiv;
}

/**
 * Oy verme işlemi
 * @param {Event} event - Click event
 */
async function handleVote(event) {
  const button = event.target;
  const postId = button.dataset.postId;
  const vote = parseInt(button.dataset.vote);

  try {
    const success = await votePost(postId, vote);
    if (success) {
      // Gönderileri yeniden yükle
      loadPosts();
    }
  } catch (error) {
    console.error('Oy verirken hata:', error);
    alert('Oy verirken bir hata oluştu.');
  }
}

/**
 * Yeni gönderi modalını aç
 */
function openNewPostModal() {
  const modal = document.getElementById('new-post-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

/**
 * Yeni gönderi modalını kapat
 */
function closeNewPostModal() {
  const modal = document.getElementById('new-post-modal');
  if (modal) {
    modal.classList.add('hidden');
    // Form'u temizle
    const form = document.getElementById('new-post-form');
    if (form) {
      form.reset();
    }
  }
}

/**
 * Yeni gönderi formunu işle
 * @param {Event} event - Submit event
 */
async function handleNewPost(event) {
  event.preventDefault();

  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert('Lütfen başlık ve içerik girin.');
    return;
  }

  try {
    const postData = {
      title: title,
      content: content,
      author: 'Anonim' // İleride kullanıcı sistemi entegre edildiğinde değiştirilecek
    };

    const postId = await addPost(postData);
    if (postId) {
      closeNewPostModal();
      loadPosts();
      alert('Gönderi başarıyla eklendi!');
    } else {
      alert('Gönderi eklenirken bir hata oluştu.');
    }
  } catch (error) {
    console.error('Gönderi eklenirken hata:', error);
    alert('Gönderi eklenirken bir hata oluştu.');
  }
}

/**
 * HTML escape fonksiyonu
 * @param {string} text - Kaçış yapılacak metin
 * @returns {string} Kaçış yapılmış metin
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Tarihi formatla
 * @param {string} dateString - ISO tarih stringi
 * @returns {string} Formatlanmış tarih
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

console.log('Forum JavaScript yüklendi');