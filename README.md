# KODE-Official

Bu proje şu anda 0 bütçe ile GitHub Pages üzerinde geliştirilmektedir. GitHub Pages yalnızca statik dosyaları (HTML, CSS, JavaScript) çalıştırabildiği için, sunucu tabanlı (PHP, Node.js, veritabanı vb.) sistemler şu aşamada kullanılamamaktadır. Buna rağmen proje, ileride kendi domain ve gerçek bir sunucuya taşındığında hiçbir şey çöpe gitmeyecek şekilde tasarlanmıştır.

VS Code üzerinde geliştirilen yapı, frontend (arayüz) ve backend (sunucu) mantığını kesin olarak birbirinden ayırır. Şu an kullanılan geçici çözümler (localStorage veya Firebase gibi) ileride kolayca gerçek bir backend ile değiştirilebilecek şekilde konumlandırılmıştır.

## Kullanıcı Sistemi Mantığı

Web sitesine "Kaydol" ve "Giriş Yap" bölümleri eklenecektir. Kullanıcı giriş yaptığında bu butonlar gizlenecek, yerine "Hesabım" butonu gelecektir. "Hesabım" sayfasında kullanıcı:

- Profil bilgilerini (isim, açıklama, profil simgesi)
- Oturumu kapatma
- Hesabı silme

işlemlerini yapabilecektir.

Kullanıcının giriş durumu tarayıcı tarafında kontrol edilir ve buna göre arayüz dinamik olarak güncellenir. Bu mantık, ileride gerçek bir sunucuya geçildiğinde de aynen kullanılacaktır.

## Forum / Haberler Bölümü Mantığı

Forum kısmı Reddit benzeri bir yapıda planlanmıştır. Kullanıcılar:

- Konu açabilecek
- Sorunlarını paylaşabilecek
- Ürün (robot) ile ilgili deneyimlerini yazabilecek

Şu an veriler geçici olarak tarayıcı tarafında veya Firebase üzerinden tutulmaktadır. Ancak arayüz, ileride API üzerinden veri alacak şekilde tasarlanmıştır. Yani forumun HTML ve CSS yapısı değişmeden, sadece veri kaynağı değiştirilerek gerçek veritabanına geçiş yapılabilecektir.

## VS Code'da Geliştirme Prensibi

Tüm JavaScript dosyaları şu mantıkla yazılır:

- Arayüz (butonlar, sayfalar) → sadece kullanıcıyla ilgilenir
- Veri işlemleri → ayrı bir mantık katmanında toplanır
- HTML dosyaları backend'in nasıl çalıştığını bilmez

Bu sayede:

- GitHub Pages üzerinde çalışan bir sistem oluşur
- Domain ve sunucu alındığında yalnızca veri katmanı değiştirilir
- Tüm site baştan yazılmak zorunda kalmaz

## Gelecek Taşıma Planı

İleride:

- GitHub Pages kapatılacak
- Domain + hosting alınacak
- Node.js veya benzeri bir backend kurulacak
- Veritabanı bağlanacak

Bu aşamada sadece backend kısmı değiştirilecek, mevcut frontend yapısı aynen korunacaktır.

Bu proje, geçici değil; ileride gerçek ürüne dönüşecek şekilde VS Code üzerinde planlanmış ve geliştirilmektedir.