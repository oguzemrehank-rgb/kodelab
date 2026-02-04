// ================================================
// STORAGE.JS - Firebase Firestore İşlemleri
// ================================================

const COLLECTION_NAME = 'news';

/**
 * Tüm haberleri Firebase'den al
 * @returns {Promise<Array>} Haberlerin dizisi
 */
async function getAllNews() {
  try {
    const db = window.db;
    if (!db) {
      console.error('Firebase initialize edilmedi');
      return [];
    }

    const { collection, getDocs, query, orderBy } = window.firebaseModules;
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const news = [];
    querySnapshot.forEach((doc) => {
      news.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('Firebase\'den haberler yüklendi:', news);
    return news;
  } catch (error) {
    console.error('Haberler yüklenirken hata:', error);
    return [];
  }
}

/**
 * ID'ye göre haber al
 * @param {string} id - Haber ID'si
 * @returns {Promise<Object|null>} Haber nesnesi veya null
 */
async function getNewsById(id) {
  try {
    const db = window.db;
    if (!db) {
      console.error('Firebase initialize edilmedi');
      return null;
    }

    const { doc, getDoc } = window.firebaseModules;
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const news = {
        id: docSnap.id,
        ...docSnap.data()
      };
      console.log('Haber yüklendi:', news);
      return news;
    } else {
      console.log('Haber bulunamadı');
      return null;
    }
  } catch (error) {
    console.error('Haber yüklenirken hata:', error);
    return null;
  }
}

/**
 * Yeni haber ekle
 * @param {Object} newsItem - Haber nesnesi
 * @returns {Promise<Object>} Eklenen haber
 */
async function addNews(newsItem) {
  try {
    const db = window.db;
    if (!db) {
      throw new Error('Firebase initialize edilmedi');
    }

    const { collection, addDoc } = window.firebaseModules;
    
    const newsData = {
      ...newsItem,
      created_at: new Date().toISOString(),
      timestamp: new Date()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newsData);

    const newNews = {
      id: docRef.id,
      ...newsData
    };

    console.log('Haber Firebase\'ye eklendi:', newNews);
    return newNews;
  } catch (error) {
    console.error('Haber eklenirken hata:', error);
    throw error;
  }
}

/**
 * Haber güncelle
 * @param {string} id - Haber ID'si
 * @param {Object} updatedData - Güncellenecek veriler
 * @returns {Promise<Object>} Sonuç
 */
async function updateNews(id, updatedData) {
  try {
    const db = window.db;
    if (!db) {
      throw new Error('Firebase initialize edilmedi');
    }

    const { doc, updateDoc } = window.firebaseModules;
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updatedData);

    const updatedNews = {
      id: id,
      ...updatedData
    };

    console.log('Haber Firebase\'de güncellendi:', updatedNews);
    return updatedNews;
  } catch (error) {
    console.error('Haber güncellenirken hata:', error);
    throw error;
  }
}

/**
 * Haber sil
 * @param {string} id - Haber ID'si
 * @returns {Promise<boolean>} Başarılı olup olmadığı
 */
async function deleteNews(id) {
  try {
    const db = window.db;
    if (!db) {
      throw new Error('Firebase initialize edilmedi');
    }

    const { doc, deleteDoc } = window.firebaseModules;
    await deleteDoc(doc(db, COLLECTION_NAME, id));

    console.log('Haber Firebase\'den silindi');
    return true;
  } catch (error) {
    console.error('Haber silinirken hata:', error);
    throw error;
  }
}

/**
 * Toplam haber sayısı al
 * @returns {Promise<number>} Haber sayısı
 */
async function getTotalNewsCount() {
  const news = await getAllNews();
  return news.length;
}

// ================================================
// ADMIN OTURUMU
// ================================================

const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_PASSWORD = 'Fatih90987.?';

/**
 * Admin şifresi kontrol et
 * @param {string} password - Girilen şifre
 * @returns {boolean} Şifrenin doğru olup olmadığı
 */
function validateAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}

/**
 * Admin oturumunu başlat
 */
function setAdminSession() {
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
}

/**
 * Admin oturumunu kontrol et
 * @returns {boolean} Oturumun açık olup olmadığı
 */
function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

/**
 * Admin oturumunu kapat
 */
function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

// ================================================
// FORUM İŞLEMLERİ
// ================================================

const FORUM_COLLECTION_NAME = 'posts';

/**
 * Tüm forum gönderilerini Firebase'den al
 * @returns {Promise<Array>} Gönderilerin dizisi
 */
async function getAllPosts() {
  try {
    const db = window.db;
    if (!db) {
      console.error('Firebase initialize edilmedi');
      return [];
    }

    const { collection, getDocs, query, orderBy } = window.firebaseModules;
    const q = query(collection(db, FORUM_COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('Firebase\'den gönderiler yüklendi:', posts);
    return posts;
  } catch (error) {
    console.error('Gönderiler yüklenirken hata:', error);
    return [];
  }
}

/**
 * Yeni gönderi ekle
 * @param {Object} postData - Gönderi verisi {title, content, author}
 * @returns {Promise<string|null>} Eklenen gönderinin ID'si veya null
 */
async function addPost(postData) {
  try {
    const db = window.db;
    if (!db) {
      console.error('Firebase initialize edilmedi');
      return null;
    }

    const { collection, addDoc } = window.firebaseModules;
    const docRef = await addDoc(collection(db, FORUM_COLLECTION_NAME), {
      ...postData,
      date: new Date().toISOString(),
      votes: 0
    });

    console.log('Gönderi eklendi:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Gönderi eklenirken hata:', error);
    return null;
  }
}

/**
 * Gönderiyi oyla
 * @param {string} postId - Gönderi ID'si
 * @param {number} vote - Oy değeri (1 veya -1)
 * @returns {Promise<boolean>} Başarılı mı
 */
async function votePost(postId, vote) {
  try {
    const db = window.db;
    if (!db) {
      console.error('Firebase initialize edilmedi');
      return false;
    }

    const { doc, updateDoc, increment } = window.firebaseModules;
    await updateDoc(doc(db, FORUM_COLLECTION_NAME, postId), {
      votes: increment(vote)
    });

    console.log('Gönderi oylandı:', postId);
    return true;
  } catch (error) {
    console.error('Gönderi oylanırken hata:', error);
    return false;
  }
}

// ================================================
// İNİTİYALİZASYON
// ================================================

console.log('Storage Firebase Firestore yüklendi');

