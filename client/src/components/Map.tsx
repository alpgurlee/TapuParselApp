/**
 * Google Maps entegrasyonu için harita bileşeni
 * 
 * Bu bileşen şu özellikleri sağlar:
 * - Google Maps haritasını görüntüleme
 * - Parsel sınırlarını harita üzerinde gösterme
 * - Harita merkezi ve zoom seviyesini dinamik olarak ayarlama
 * 
 * @module components/Map
 */

import React, { useState } from 'react';
import { GoogleMap, useLoadScript, Polygon } from '@react-google-maps/api';

// Harita container stil ayarları
const containerStyle = {
  width: '100%',
  height: '500px'
};

// Türkiye'nin merkezi koordinatları (varsayılan merkez)
const center = {
  lat: 39.9334, // Ankara'nın enlem koordinatı
  lng: 32.8597  // Ankara'nın boylam koordinatı
};

/**
 * Harita bileşeni için prop tipleri
 * 
 * @property parcelCoordinates - Parsel sınırlarının koordinat dizisi
 * @property onMapClick - Haritaya tıklama olayı için callback fonksiyonu
 * @property centerCoordinates - Haritanın merkez koordinatları [longitude, latitude]
 */
interface MapProps {
  parcelCoordinates?: number[][][];
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  centerCoordinates?: [number, number];
}

/**
 * Harita bileşeni
 * 
 * @param props - MapProps tipinde bileşen parametreleri
 * @returns React bileşeni
 */
const Map: React.FC<MapProps> = ({ parcelCoordinates, onMapClick, centerCoordinates }) => {
  // Google Maps harita nesnesini tutmak için state
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  // Google Maps API'sini yükle
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  /**
   * Harita yüklendiğinde çağrılacak callback
   * 
   * @param map - Google Maps harita nesnesi
   */
  const onLoad = (map: google.maps.Map) => {
    setMapInstance(map);
  };

  // Merkez koordinatları değiştiğinde haritayı güncelle
  React.useEffect(() => {
    if (mapInstance && centerCoordinates) {
      // Haritayı yeni koordinatlara taşı
      mapInstance.panTo({ lat: centerCoordinates[1], lng: centerCoordinates[0] });
      // Yakınlaştırma seviyesini ayarla (15 = sokak seviyesi)
      mapInstance.setZoom(15);
    }
  }, [centerCoordinates, mapInstance]);

  // Hata durumunu kontrol et
  if (loadError) {
    console.error('Maps yükleme hatası:', loadError);
    return <div>Harita yüklenirken hata oluştu</div>;
  }

  // Yükleme durumunu kontrol et
  if (!isLoaded) {
    return <div>Harita yükleniyor...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={6}
      onClick={onMapClick}
      onLoad={onLoad}
      options={{
        mapTypeControl: true,    // Harita tipi kontrolünü göster
        streetViewControl: true, // Sokak görünümü kontrolünü göster
        fullscreenControl: true, // Tam ekran kontrolünü göster
      }}
    >
      {/* Parsel sınırlarını çiz */}
      {parcelCoordinates && (
        <Polygon
          paths={parcelCoordinates.map(ring =>
            ring.map(([lng, lat]) => ({ lat, lng }))
          )}
          options={{
            fillColor: '#FF0000',     // Parsel içi rengi
            fillOpacity: 0.35,        // Parsel içi şeffaflığı
            strokeColor: '#FF0000',   // Parsel sınır rengi
            strokeOpacity: 1,         // Parsel sınır şeffaflığı
            strokeWeight: 2,          // Parsel sınır kalınlığı
          }}
        />
      )}
    </GoogleMap>
  );
};

// Gereksiz yeniden render'ları önlemek için React.memo kullan
export default React.memo(Map);
