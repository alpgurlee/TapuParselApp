/**
 * Google Maps entegrasyonu için harita bileşeni
 * 
 * Bu bileşen şu özellikleri sağlar:
 * - Google Maps haritasını görüntüleme
 * - Parsel sınırlarını harita üzerinde gösterme
 * - Harita merkezi ve zoom seviyesini dinamik olarak ayarlama
 * - Çizim araçları ile şekil çizme
 * - Fare pozisyonunu gösterme
 * - Koordinat seçme ve kopyalama
 * - Not ekleme ve görüntüleme
 * 
 * @module components/Map
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleMap, Marker, Polygon, useLoadScript } from '@react-google-maps/api';
import {
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
  ButtonGroup,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PanTool as PanIcon,
  Place as MarkerIcon,
  Category as PolygonIcon,
  GpsFixed as GpsIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

// Statik kütüphane listesi
const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places", "drawing"];

// Harita container stil ayarları
const containerStyle = {
  width: '100%',
  height: '500px'
};

// Türkiye'nin merkezi koordinatları (varsayılan merkez)
const center = {
  lat: 39.9334,
  lng: 32.8597
};

// Harita araçları için tipler
type DrawingTool = 'pan' | 'marker' | 'polyline' | 'polygon' | 'coordinate' | 'input';

interface MapProps {
  parcelCoordinates?: number[][][];
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  centerCoordinates?: [number, number];
  onShapeComplete?: (shape: google.maps.Polygon | google.maps.Polyline | google.maps.Marker) => void;
  onCoordinateSelect?: (lat: number, lng: number) => void;
  locationInfo?: {
    il: string;
    ilce: string;
    mahalle: string;
    ada: string;
    parsel: string;
  };
}

// Not tipi
interface Note {
  id: string;
  content: string;
  position: {
    lat: number;
    lng: number;
  };
  locationInfo?: {
    il: string;
    ilce: string;
    mahalle: string;
    ada: string;
    parsel: string;
  };
  createdAt: string;
  updatedAt?: string;
}

/**
 * Harita bileşeni
 * @param {Object} props - Bileşen özellikleri
 * @param {Object} props.parcelCoordinates - Parsel sınırları
 * @param {Function} props.onMapClick - Haritaya tıklandığında çağrılacak callback
 * @param {Array} props.centerCoordinates - Haritanın merkezi koordinatları
 * @param {Function} props.onShapeComplete - Çizim tamamlandığında çağrılacak callback
 * @param {Function} props.onCoordinateSelect - Koordinat seçildiğinde çağrılacak callback
 * @param {Object} props.locationInfo - Konum bilgileri (il, ilçe, mahalle, ada, parsel)
 */
const Map: React.FC<MapProps> = ({ 
  parcelCoordinates, 
  onMapClick, 
  centerCoordinates,
  onShapeComplete,
  onCoordinateSelect,
  locationInfo
}) => {
  // State tanımlamaları
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mousePosition, setMousePosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('pan');
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState<{ lat: number; lng: number } | null>(null);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [coordinateInput, setCoordinateInput] = useState('');
  const [customPolygons, setCustomPolygons] = useState<google.maps.Polygon[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteMarkers, setNoteMarkers] = useState<google.maps.Marker[]>([]);
  const [clickedPosition, setClickedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'polygon' | 'marker' | null>(null);
  const [tempPolygonPoints, setTempPolygonPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [greenPolygons, setGreenPolygons] = useState<{ lat: number; lng: number }[][]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedParcelPolygon, setSelectedParcelPolygon] = useState<google.maps.Polygon | null>(null);

  // Harita yüklenme durumu
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // Google Maps yüklendikten sonra çalışacak kodlar
  const flagIcon = useMemo(() => isLoaded ? {
    url: 'https://maps.google.com/mapfiles/kml/pal4/icon49.png',
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 32)
  } : null, [isLoaded]);

  // Not marker'ını oluştur
  const createNoteMarker = useCallback((note: Note) => {
    if (!mapInstance || !isLoaded || !flagIcon) return null;

    const marker = new google.maps.Marker({
      position: { lat: note.position.lat, lng: note.position.lng },
      map: mapInstance,
      icon: flagIcon,
      title: note.content
    });

    // Marker'a tıklandığında
    marker.addListener('click', () => {
      setSelectedNote(note);
      setShowNoteDialog(true);

      // Eğer not bir parsele aitse, o parselin sınırlarını göster
      if (note.locationInfo && parcelCoordinates?.length > 0) {
        // Önceki polygon'u temizle
        if (selectedParcelPolygon) {
          selectedParcelPolygon.setMap(null);
        }

        // Yeni polygon'u oluştur
        const polygon = new google.maps.Polygon({
          paths: parcelCoordinates[0],
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: mapInstance
        });

        setSelectedParcelPolygon(polygon);
      }
    });

    return marker;
  }, [mapInstance, parcelCoordinates, isLoaded, flagIcon, setSelectedNote, setShowNoteDialog, selectedParcelPolygon]);

  // Not marker'larını güncelle
  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    // Önceki marker'ları temizle
    noteMarkers.forEach(marker => marker.setMap(null));
    
    // Yeni marker'ları oluştur
    const newMarkers = notes
      .map(note => createNoteMarker(note))
      .filter((marker): marker is google.maps.Marker => marker !== null);
    
    setNoteMarkers(newMarkers);
  }, [mapInstance, notes, createNoteMarker, isLoaded]);

  // Not dialog'u kapandığında polygon'u temizle
  useEffect(() => {
    if (!showNoteDialog && selectedParcelPolygon) {
      selectedParcelPolygon.setMap(null);
      setSelectedParcelPolygon(null);
    }
  }, [showNoteDialog]);

  // Mouse pozisyonunu güncelle
  const onMouseMove = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMousePosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  }, []);

  // Haritaya tıklandığında
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (selectedTool === 'coordinate' && e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedCoordinate({ lat, lng });
      if (onCoordinateSelect) {
        onCoordinateSelect(lat, lng);
      }
    } else if (drawingMode === 'polygon' && e.latLng) {
      const clickedLatLng = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setTempPolygonPoints(prev => [...prev, clickedLatLng]);
    } else if (drawingMode === 'marker' && e.latLng) {
      // Marker modunda tıklandığında not ekleme dialog'ını aç
      setClickedPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
      setShowNoteDialog(true);
    } else if (onMapClick) {
      onMapClick(e);
    }
  };

  // Koordinatları kopyala
  const handleCopyCoordinates = () => {
    if (selectedCoordinate) {
      const text = `${selectedCoordinate.lat}, ${selectedCoordinate.lng}`;
      navigator.clipboard.writeText(text);
      setShowCopyMessage(true);
    }
  };

  // Harita yüklendiğinde çağrılacak callback
  const onLoad = (map: google.maps.Map) => {
    setMapInstance(map);

    // DrawingManager'ı oluştur
    const manager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.MARKER,
          google.maps.drawing.OverlayType.POLYLINE,
          google.maps.drawing.OverlayType.POLYGON,
        ],
      },
    });

    manager.setMap(map);
    setDrawingManager(manager);

    // Çizim tamamlandığında callback'i çağır
    if (onShapeComplete) {
      google.maps.event.addListener(manager, 'overlaycomplete', (e) => {
        onShapeComplete(e.overlay);
      });
    }
  };

  // Araç değiştiğinde
  const handleToolChange = (event: React.MouseEvent<HTMLElement>, newTool: DrawingTool) => {
    setSelectedTool(newTool);
    
    if (!drawingManager) return;

    switch (newTool) {
      case 'pan':
        drawingManager.setDrawingMode(null);
        break;
      case 'marker':
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
        break;
      case 'polyline':
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
        break;
      case 'polygon':
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
        break;
      case 'coordinate':
        drawingManager.setDrawingMode(null);
        break;
      case 'input':
        drawingManager.setDrawingMode(null);
        break;
    }
  };

  // Polygon çizimini tamamla
  const handlePolygonComplete = () => {
    if (tempPolygonPoints.length >= 3) {
      // Polygon'u yeşil polygonlara ekle
      setGreenPolygons(prev => [...prev, tempPolygonPoints]);
      
      // Not ekleme dialog'ını aç
      if (tempPolygonPoints.length > 0) {
        // Polygon'un merkez noktasını hesapla
        const center = tempPolygonPoints.reduce(
          (acc, curr) => ({
            lat: acc.lat + curr.lat / tempPolygonPoints.length,
            lng: acc.lng + curr.lng / tempPolygonPoints.length
          }),
          { lat: 0, lng: 0 }
        );
        setClickedPosition(center);
        setShowNoteDialog(true);
      }
    }
    setTempPolygonPoints([]);
    setDrawingMode(null);
  };

  // Koordinat dizisini işle
  const processCoordinateInput = () => {
    try {
      // Girdiyi parse et
      const coordinates = JSON.parse(coordinateInput);
      
      // Koordinatları doğru formata çevir
      const paths = coordinates.map((coord: number[]) => ({
        lat: coord[1],
        lng: coord[0]
      }));

      // Yeni polygon oluştur
      const polygonOptions = {
        paths,
        strokeColor: '#00FF00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00FF00',
        fillOpacity: 0.35,
        map: mapInstance
      };

      const newPolygon = new google.maps.Polygon(polygonOptions);
      setCustomPolygons(prev => [...prev, newPolygon]);
      
      // Dialog'u kapat
      setShowInputDialog(false);
      setCoordinateInput('');

      // Polygon'un sınırlarına zoom yap
      const bounds = new google.maps.LatLngBounds();
      paths.forEach((path: google.maps.LatLngLiteral) => {
        bounds.extend(path);
      });
      mapInstance?.fitBounds(bounds);
    } catch (error) {
      console.error('Koordinat parse hatası:', error);
      alert('Koordinat formatı hatalı. Lütfen geçerli bir koordinat dizisi girin.');
    }
  };

  // Notları yükle
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes');
        const data = await response.json();
        if (data.success) {
          setNotes(data.data);
          // Mevcut notlar için marker'ları oluştur
          data.data.forEach((note: Note) => {
            const marker = new google.maps.Marker({
              position: note.position,
              map: mapInstance,
              icon: {
                path: google.maps.SymbolPath.FLAG,
                fillColor: '#FF0000',
                fillOpacity: 1,
                strokeWeight: 1,
                scale: 10
              },
              title: note.content
            });

            marker.addListener('click', () => {
              setSelectedNote(note);
            });

            setNoteMarkers(prev => [...prev, marker]);
          });
        }
      } catch (error) {
        console.error('Notlar yüklenirken hata:', error);
      }
    };

    if (mapInstance && isLoaded) {
      fetchNotes();
    }
  }, [mapInstance, isLoaded]);

  // Not ekle veya güncelle
  const handleSaveNote = async () => {
    if (clickedPosition && noteInput.trim()) {
      try {
        const noteData = {
          content: noteInput,
          position: clickedPosition,
          locationInfo,
        };

        let response;
        if (isEditing && selectedNote) {
          // Not güncelle
          response = await fetch(`/api/notes/${selectedNote._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
          });
        } else {
          // Yeni not ekle
          response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
          });
        }

        const data = await response.json();
        if (data.success) {
          if (isEditing) {
            // Mevcut notu güncelle
            setNotes(prev => prev.map(n => n._id === selectedNote?._id ? data.data : n));
            // Marker'ı güncelle
            const marker = noteMarkers.find(m => m.getTitle() === selectedNote?.content);
            if (marker) {
              marker.setTitle(noteInput);
            }
          } else {
            // Yeni not ekle
            setNotes(prev => [...prev, data.data]);
            // Yeni marker ekle
            const marker = new google.maps.Marker({
              position: clickedPosition,
              map: mapInstance,
              icon: {
                path: google.maps.SymbolPath.FLAG,
                fillColor: '#FF0000',
                fillOpacity: 1,
                strokeWeight: 1,
                scale: 10
              },
              title: noteInput
            });

            marker.addListener('click', () => {
              setSelectedNote(data.data);
            });

            setNoteMarkers(prev => [...prev, marker]);
          }

          setNoteInput('');
          setShowNoteDialog(false);
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Not kaydedilirken hata:', error);
        alert('Not kaydedilirken bir hata oluştu');
      }
    }
  };

  // Not sil
  const handleDeleteNote = async () => {
    if (selectedNote) {
      try {
        const response = await fetch(`/api/notes/${selectedNote._id}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
          // Notu listeden kaldır
          setNotes(prev => prev.filter(n => n._id !== selectedNote._id));
          
          // Marker'ı kaldır
          const marker = noteMarkers.find(m => m.getTitle() === selectedNote.content);
          if (marker) {
            marker.setMap(null);
            setNoteMarkers(prev => prev.filter(m => m !== marker));
          }

          setSelectedNote(null);
        }
      } catch (error) {
        console.error('Not silinirken hata:', error);
        alert('Not silinirken bir hata oluştu');
      }
    }
  };

  // Notu düzenlemeye başla
  const handleEditNote = () => {
    if (selectedNote) {
      setNoteInput(selectedNote.content);
      setClickedPosition(selectedNote.position);
      setIsEditing(true);
      setShowNoteDialog(true);
      setSelectedNote(null);
    }
  };

  // Component unmount olduğunda polygonları temizle
  useEffect(() => {
    return () => {
      customPolygons.forEach(polygon => polygon.setMap(null));
    };
  }, [customPolygons]);

  // Component unmount olduğunda markerları temizle
  useEffect(() => {
    return () => {
      noteMarkers.forEach(marker => marker.setMap(null));
    };
  }, [noteMarkers]);

  // Merkez koordinatları değiştiğinde haritayı güncelle
  useEffect(() => {
    if (mapInstance && centerCoordinates) {
      mapInstance.panTo({ lat: centerCoordinates[1], lng: centerCoordinates[0] });
      mapInstance.setZoom(15);
    }
  }, [centerCoordinates, mapInstance]);

  // Not eklemek için dialog'ı aç
  const handlePolygonClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setClickedPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
      setShowNoteDialog(true);
    }
  };

  if (loadError) {
    console.error('Maps yükleme hatası:', loadError);
    return <div>Harita yüklenirken hata oluştu</div>;
  }

  if (!isLoaded) {
    return <div>Harita yükleniyor...</div>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Harita Araç Çubuğu */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          zIndex: 1, 
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <ToggleButtonGroup
          orientation="vertical"
          value={drawingMode}
          exclusive
          onChange={(e, value) => setDrawingMode(value)}
        >
          <ToggleButton value={null} aria-label="pan">
            <Tooltip title="Pan Tool" placement="right">
              <PanIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="marker" aria-label="marker">
            <Tooltip title="Marker Ekle" placement="right">
              <MarkerIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="polygon" aria-label="polygon">
            <Tooltip title="Polygon Çiz" placement="right">
              <PolygonIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="coordinate" aria-label="coordinate">
            <Tooltip title="Koordinat Al" placement="right">
              <GpsIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="input" aria-label="input" onClick={() => setShowInputDialog(true)}>
            <Tooltip title="Koordinat Girişi" placement="right">
              <span style={{ fontSize: '24px' }}>[ ]</span>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Koordinat Göstergesi */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          bottom: 10, 
          left: 10, 
          zIndex: 1, 
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Typography variant="body2">
          {mousePosition ? `${mousePosition.lat.toFixed(6)}, ${mousePosition.lng.toFixed(6)}` : ''}
        </Typography>
        {mousePosition && (
          <Tooltip title="Koordinatları Kopyala">
            <IconButton 
              size="small" 
              onClick={() => {
                navigator.clipboard.writeText(`${mousePosition.lat.toFixed(6)}, ${mousePosition.lng.toFixed(6)}`);
                setSnackbarMessage('Koordinatlar kopyalandı!');
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Paper>

      {/* Polygon Tamamlama Butonu */}
      {drawingMode === 'polygon' && tempPolygonPoints.length >= 3 && (
        <Paper sx={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1, p: 1 }}>
          <ButtonGroup variant="contained" size="small">
            <Button onClick={handlePolygonComplete} color="success">
              Polygon'u Tamamla
            </Button>
            <Button onClick={() => {
              setDrawingMode(null);
              setTempPolygonPoints([]);
            }} color="error">
              İptal
            </Button>
          </ButtonGroup>
        </Paper>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={6}
        onClick={handleMapClick}
        onLoad={onLoad}
        onMouseMove={onMouseMove}
        options={{
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeId: google.maps.MapTypeId.HYBRID
        }}
      >
        {/* Çizim modu aktifken geçici polygon */}
        {drawingMode === 'polygon' && tempPolygonPoints.length > 0 && (
          <Polygon
            paths={tempPolygonPoints}
            options={{
              fillColor: '#0000ff',
              fillOpacity: 0.35,
              strokeColor: '#0000ff',
              strokeWeight: 2
            }}
          />
        )}

        {/* Çizim noktaları */}
        {drawingMode === 'polygon' && tempPolygonPoints.map((point, index) => (
          <Marker
            key={index}
            position={point}
            icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        ))}

        {/* Kırmızı polygon */}
        {parcelCoordinates && (
          <Polygon
            paths={parcelCoordinates.map(ring =>
              ring.map(([lng, lat]) => ({ lat, lng }))
            )}
            options={{
              fillColor: '#ff0000',
              fillOpacity: 0.35,
              strokeColor: '#ff0000',
              strokeWeight: 2
            }}
            onClick={handlePolygonClick}
          />
        )}

        {/* Yeşil polygonlar */}
        {greenPolygons.map((poly, index) => (
          <Polygon
            key={index}
            paths={poly}
            options={{
              fillColor: '#00ff00',
              fillOpacity: 0.35,
              strokeColor: '#00ff00',
              strokeWeight: 2
            }}
            onClick={handlePolygonClick}
          />
        ))}

        {/* Not marker'ları */}
        {notes.map((note) => (
          <Marker
            key={note._id}
            position={note.position}
            onClick={() => setSelectedNote(note)}
            icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
          />
        ))}
      </GoogleMap>

      {/* Not Ekleme/Düzenleme Dialog'u */}
      <Dialog open={showNoteDialog} onClose={() => {
        setShowNoteDialog(false);
        setIsEditing(false);
        setNoteInput('');
      }}>
        <DialogTitle>{isEditing ? 'Notu Düzenle' : 'Not Ekle'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing ? 'Notu düzenleyin:' : 'Bu konuma eklemek istediğiniz notu yazın:'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Not"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
          />
          {locationInfo && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Konum Bilgileri:</Typography>
              <Typography variant="body2">İl: {locationInfo.il}</Typography>
              <Typography variant="body2">İlçe: {locationInfo.ilce}</Typography>
              <Typography variant="body2">Mahalle: {locationInfo.mahalle}</Typography>
              <Typography variant="body2">Ada: {locationInfo.ada}</Typography>
              <Typography variant="body2">Parsel: {locationInfo.parsel}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowNoteDialog(false);
            setIsEditing(false);
            setNoteInput('');
          }}>İptal</Button>
          <Button onClick={handleSaveNote}>{isEditing ? 'Güncelle' : 'Ekle'}</Button>
        </DialogActions>
      </Dialog>

      {/* Not Görüntüleme Dialog'u */}
      <Dialog 
        open={!!selectedNote} 
        onClose={() => setSelectedNote(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Not Detayları</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {selectedNote?.content}
          </Typography>
          {selectedNote?.locationInfo && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Konum Bilgileri:</Typography>
              <Typography variant="body2">İl: {selectedNote.locationInfo.il}</Typography>
              <Typography variant="body2">İlçe: {selectedNote.locationInfo.ilce}</Typography>
              <Typography variant="body2">Mahalle: {selectedNote.locationInfo.mahalle}</Typography>
              <Typography variant="body2">Ada: {selectedNote.locationInfo.ada}</Typography>
              <Typography variant="body2">Parsel: {selectedNote.locationInfo.parsel}</Typography>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Eklenme Tarihi: {new Date(selectedNote?.createdAt || '').toLocaleString('tr-TR')}
          </Typography>
          {selectedNote?.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Güncellenme Tarihi: {new Date(selectedNote.updatedAt).toLocaleString('tr-TR')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteNote} color="error">Sil</Button>
          <Button onClick={handleEditNote} color="primary">Düzenle</Button>
          <Button onClick={() => setSelectedNote(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Koordinat Giriş Dialog'u */}
      <Dialog open={showInputDialog} onClose={() => setShowInputDialog(false)}>
        <DialogTitle>Koordinat Dizisi Girin</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Koordinat dizisini [[lng1,lat1],[lng2,lat2],...] formatında girin.
            Örnek: [[32.8597,39.9334],[32.8598,39.9335],[32.8599,39.9334]]
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Koordinat Dizisi"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={coordinateInput}
            onChange={(e) => setCoordinateInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInputDialog(false)}>İptal</Button>
          <Button onClick={processCoordinateInput}>Çiz</Button>
        </DialogActions>
      </Dialog>

      {/* Bildirim Snackbar'ı */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default React.memo(Map);
