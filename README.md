# Tapu Parsel Yönetim Sistemi

Bu proje, tapu ve parsel bilgilerini yönetmek için geliştirilmiş bir web uygulamasıdır. Kullanıcılar parsel bilgilerini arayabilir, harita üzerinde görüntüleyebilir ve notlar ekleyebilir.

## Özellikler

- 🔐 Kullanıcı Kimlik Doğrulama
  - JWT tabanlı kimlik doğrulama
  - Güvenli parola yönetimi
  - Oturum yönetimi

- 🗺️ Harita Entegrasyonu
  - Google Maps entegrasyonu
  - Parsel sınırlarını görüntüleme
  - Dinamik harita kontrolü

- 📝 Parsel Yönetimi
  - Parsel arama
  - Parsel detaylarını görüntüleme
  - Parsellere not ekleme

## Teknoloji Yığını

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Google Maps Geocoding API

### Frontend
- React
- TypeScript
- Material-UI
- @react-google-maps/api
- Axios

## Proje Yapısı

```
TapuParsel/
├── client/                 # Frontend uygulaması
│   ├── src/
│   │   ├── components/    # React bileşenleri
│   │   ├── contexts/      # Context API tanımları
│   │   ├── pages/         # Sayfa bileşenleri
│   │   └── types/         # TypeScript tip tanımları
│   └── package.json
│
└── server/                # Backend uygulaması
    ├── src/
    │   ├── controllers/   # API kontrolcüleri
    │   ├── middleware/    # Express middleware'leri
    │   ├── models/        # Mongoose modelleri
    │   └── routes/        # API rotaları
    └── package.json
```

## Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone [repo-url]
   ```

2. Backend bağımlılıklarını yükleyin:
   ```bash
   cd server
   npm install
   ```

3. Frontend bağımlılıklarını yükleyin:
   ```bash
   cd client
   npm install
   ```

4. Gerekli environment değişkenlerini ayarlayın:
   - `server/.env`:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/tapu_parsel_db
     JWT_SECRET=your-jwt-secret
     GOOGLE_MAPS_API_KEY=your-google-maps-api-key
     ```
   - `client/.env`:
     ```
     VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
     ```

5. MongoDB'yi başlatın:
   ```bash
   mongod
   ```

6. Backend'i başlatın:
   ```bash
   cd server
   npm run dev
   ```

7. Frontend'i başlatın:
   ```bash
   cd client
   npm run dev
   ```

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Parsel İşlemleri
- `POST /api/parcels/search` - Parsel arama
- `GET /api/parcels/:id` - Parsel detayları
- `POST /api/parcels/:id/notes` - Parsele not ekleme

## Yapılacaklar

- [ ] Tapu ve Kadastro API entegrasyonu
- [ ] Parsel sınırları için gerçek veri desteği
- [ ] Gelişmiş parsel arama filtreleri
- [ ] Parsel geçmişi takibi
- [ ] Toplu parsel işlemleri
- [ ] PDF rapor oluşturma
- [ ] Kullanıcı rolleri ve yetkilendirme
- [ ] E-posta bildirimleri

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.
