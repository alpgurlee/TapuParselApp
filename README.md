# Tapu Parsel Projesi

Bu proje, kullanıcıların il, ilçe, mahalle, ada ve parsel bilgilerini kullanarak harita üzerinde arama yapabilmelerini ve notlar ekleyebilmelerini sağlar.

## Özellikler

- Kullanıcı kimlik doğrulama sistemi
- Google Maps entegrasyonu
- Parsel sorgulama ve görüntüleme
- Not ekleme ve düzenleme
- KML dosyası desteği

## Teknolojiler

- Frontend: React.js + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: MongoDB
- Harita: Google Maps API
- Authentication: JWT

## Kurulum

1. Repo'yu klonlayın
2. `npm install` komutunu hem client hem server klasörlerinde çalıştırın
3. Gerekli environment değişkenlerini ayarlayın
4. `npm start` ile uygulamayı başlatın

## Branch Stratejisi

- `main`: Production branch
- `development`: Ana geliştirme branch'i
- `feature/*`: Yeni özellikler için
- `bugfix/*`: Hata düzeltmeleri için

## Katkıda Bulunma

1. `development` branch'inden yeni bir feature branch'i oluşturun
2. Değişikliklerinizi yapın ve commit'leyin
3. Pull request oluşturun
