# 🗺️ Tapu Parsel Uygulaması

Modern web teknolojileri kullanılarak geliştirilmiş, tapu ve parsel bilgilerini harita üzerinde görüntüleme ve yönetme uygulaması.

## 🌟 Özellikler

### 1. Harita İşlemleri
- **Çizim Araçları**
  - 🖐️ Pan Tool: Haritada gezinme
  - 📍 Marker Tool: Tek nokta işaretleme
  - 🔷 Polygon Tool: Çokgen çizimi
  - 🎯 Coordinate Tool: Koordinat alma
  - [ ] Coordinate Input: JSON formatında koordinat girişi

### 2. Not Sistemi
- Her marker ve polygon için not ekleme
- Notları düzenleme ve silme
- Konum bilgisi (il, ilçe, mahalle, ada, parsel) ile notları ilişkilendirme
- 🚩 Kırmızı bayrak ikonları ile notları haritada gösterme
- Not seçildiğinde ilgili parselin sınırlarını gösterme
- Polygon ve marker'lar için özelleştirilmiş görünüm

### 3. Kullanıcı Yönetimi
- Kullanıcı kaydı ve girişi
- JWT tabanlı oturum yönetimi
- Kullanıcıya özel not ve işaretlemeler
- Güvenli parola şifreleme (bcrypt)

## 🛠️ Teknolojiler

### Frontend
- React 18
- TypeScript 5
- Material-UI v5
- Google Maps API
- Vite
- React Router v6

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication
- Mongoose ODM
- bcryptjs

## 📦 Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/yourusername/TapuParsel.git
```

2. Frontend bağımlılıklarını yükleyin:
```bash
cd client
npm install
```

3. Backend bağımlılıklarını yükleyin:
```bash
cd server
npm install
```

4. Gerekli çevre değişkenlerini ayarlayın:
   - client/.env:
     - VITE_GOOGLE_MAPS_API_KEY
     - VITE_API_URL
   - server/.env:
     - MONGODB_URI
     - JWT_SECRET
     - PORT

5. Uygulamayı başlatın:
   - Frontend:
   ```bash
   cd client
   npm run dev
   ```
   - Backend:
   ```bash
   cd server
   npm run dev
   ```

## 📝 Kullanım

1. **Harita İşlemleri**
   - Sol araç çubuğundan istediğiniz aracı seçin
   - Harita üzerinde tıklayarak işlem yapın
   - Koordinatları kopyalamak için sol alttaki kopyala butonunu kullanın

2. **Not İşlemleri**
   - Marker veya polygon'a tıklayarak not ekleyin
   - Notları düzenlemek veya silmek için not detaylarını açın
   - Konum bilgilerini otomatik olarak not ile ilişkilendirin

3. **Koordinat Girişi**
   - Sol araç çubuğundan koordinat girişi aracını seçin
   - JSON formatında koordinatları girin
   - "Çiz" butonuna tıklayarak polygon oluşturun

## 🆕 Son Güncellemeler

### v0.2.0 (12 Şubat 2025)
1. **Harita İyileştirmeleri**
   - Not konumları için kırmızı bayrak ikonları eklendi
   - Not seçildiğinde parsel sınırları otomatik gösteriliyor
   - Harita performansı iyileştirildi (useMemo kullanımı)

2. **Kullanıcı Deneyimi**
   - Not ekleme ve görüntüleme arayüzü geliştirildi
   - Parsel sınırları görselleştirildi
   - Harita kontrolleri iyileştirildi

3. **Teknik İyileştirmeler**
   - TypeScript tip tanımlamaları güncellendi
   - Bellek kullanımı optimize edildi
   - Sonsuz döngü hataları giderildi

## 🔄 Güncelleme Geçmişi

### v1.0.0 (11 Şubat 2024)
- İlk sürüm yayınlandı
- Temel harita işlevleri eklendi
- Not sistemi entegre edildi
- Kullanıcı yönetimi eklendi

## 👥 Katkıda Bulunanlar
- [Katkıda bulunanların isimleri]

## 📄 Lisans
Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun
