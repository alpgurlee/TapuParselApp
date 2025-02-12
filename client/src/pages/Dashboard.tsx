import React, { useState, useEffect, SelectChangeEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import Map from '../components/Map';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Parsel arama formu için interface
interface ParcelSearchForm {
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsel: string;
}

// Parsel verisi için interface
interface ParcelData {
  _id: string;
  geometry: {
    coordinates: number[][][];
  };
  center: [number, number];
  notes: Array<{
    _id: string;
    content: string;
    createdAt: string;
  }>;
}

interface Location {
  sehir_id: string;
  sehir_adi: string;
  ilce_id?: string;
  ilce_adi?: string;
  mahalle_id?: string;
  mahalle_adi?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState<ParcelSearchForm>({
    il: '',
    ilce: '',
    mahalle: '',
    ada: '',
    parsel: '',
  });

  // State tanımlamaları
  const [parcelData, setParcelData] = useState<ParcelData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(!isMobile);
  const [newNote, setNewNote] = useState<string>('');
  const [noteDialogOpen, setNoteDialogOpen] = useState<boolean>(false);

  // Lokasyon state'leri
  const [sehirler, setSehirler] = useState<Location[]>([]);
  const [ilceler, setIlceler] = useState<Location[]>([]);
  const [mahalleler, setMahalleler] = useState<Location[]>([]);

  // Seçili değerler
  const [selectedSehir, setSelectedSehir] = useState<string>('');
  const [selectedIlce, setSelectedIlce] = useState<string>('');
  const [selectedMahalle, setSelectedMahalle] = useState<string>('');

  // Kullanıcı çizimleri
  const [userDrawings, setUserDrawings] = useState<Array<any>>([]);

  // Form değişikliklerini handle et
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Drawer'ı aç/kapat
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Şehirleri yükle
  useEffect(() => {
    const fetchSehirler = async () => {
      try {
        const response = await axios.get('/api/locations/sehirler');
        if (response.data.success) {
          setSehirler(response.data.data);
        }
      } catch (error) {
        console.error('Şehirler yükleme hatası:', error);
      }
    };

    fetchSehirler();
  }, []);

  // Seçili şehre göre ilçeleri yükle
  useEffect(() => {
    const fetchIlceler = async () => {
      if (!selectedSehir) {
        setIlceler([]);
        return;
      }

      try {
        const response = await axios.get(`/api/locations/ilceler/${selectedSehir}`);
        if (response.data.success) {
          setIlceler(response.data.data);
        }
      } catch (error) {
        console.error('İlçeler yükleme hatası:', error);
      }
    };

    fetchIlceler();
  }, [selectedSehir]);

  // Seçili ilçeye göre mahalleleri yükle
  useEffect(() => {
    const fetchMahalleler = async () => {
      if (!selectedIlce) {
        setMahalleler([]);
        return;
      }

      try {
        const response = await axios.get(`/api/locations/mahalleler/${selectedIlce}`);
        if (response.data.success) {
          setMahalleler(response.data.data);
        }
      } catch (error) {
        console.error('Mahalleler yükleme hatası:', error);
      }
    };

    fetchMahalleler();
  }, [selectedIlce]);

  // Parsel arama
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/parcels/search', formData);
      
      if (response.data.success) {
        setParcelData(response.data.data);
        setDrawerOpen(true); // Parsel detaylarını göster
      } else {
        setError('Parsel bulunamadı');
      }
    } catch (error) {
      console.error('Parsel arama hatası:', error);
      setError('Parsel arama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Şehir seçimi değiştiğinde
  const handleSehirChange = (event: SelectChangeEvent<string>) => {
    const sehirId = event.target.value;
    setSelectedSehir(sehirId);
    setSelectedIlce(''); // İlçe seçimini sıfırla
    setSelectedMahalle(''); // Mahalle seçimini sıfırla
    setFormData(prev => ({
      ...prev,
      il: sehirler.find(s => s.sehir_id === sehirId)?.sehir_adi || '',
      ilce: '',
      mahalle: ''
    }));
  };

  // İlçe seçimi değiştiğinde
  const handleIlceChange = (event: SelectChangeEvent<string>) => {
    const ilceId = event.target.value;
    setSelectedIlce(ilceId);
    setSelectedMahalle(''); // Mahalle seçimini sıfırla
    setFormData(prev => ({
      ...prev,
      ilce: ilceler.find(i => i.ilce_id === ilceId)?.ilce_adi || '',
      mahalle: ''
    }));
  };

  // Mahalle seçimi değiştiğinde
  const handleMahalleChange = (event: SelectChangeEvent<string>) => {
    const mahalleId = event.target.value;
    setSelectedMahalle(mahalleId);
    const seciliMahalle = mahalleler.find(m => m.mahalle_id === mahalleId);
    setFormData(prev => ({
      ...prev,
      mahalle: seciliMahalle?.mahalle_adi || ''
    }));
  };

  // Haritada çizim tamamlandığında
  const handleShapeComplete = (shape: google.maps.Polygon | google.maps.Polyline | google.maps.Marker) => {
    setUserDrawings(prev => [...prev, shape]);
  };

  // Not ekleme
  const handleAddNote = async () => {
    if (!newNote.trim() || !parcelData?._id) return;

    try {
      const response = await axios.post(`/api/parcels/${parcelData._id}/notes`, {
        note: newNote,
      });

      if (response.data.success) {
        setParcelData(response.data.data);
        setNewNote('');
        setNoteDialogOpen(false);
      }
    } catch (error) {
      console.error('Not ekleme hatası:', error);
      setError('Not eklenirken bir hata oluştu');
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        bgcolor: '#f5f5f5'
      }}
    >
      {/* Mobil menü butonu */}
      {isMobile && (
        <IconButton
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            bgcolor: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sol Panel - Arama Formu */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            border: 'none',
            bgcolor: 'white',
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Parsel Ara
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>İl</InputLabel>
            <Select
              value={selectedSehir}
              label="İl"
              onChange={handleSehirChange}
            >
              {sehirler.map((sehir) => (
                <MenuItem key={sehir.sehir_id} value={sehir.sehir_id}>
                  {sehir.sehir_adi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>İlçe</InputLabel>
            <Select
              value={selectedIlce}
              label="İlçe"
              onChange={handleIlceChange}
              disabled={!selectedSehir}
            >
              {ilceler.map((ilce) => (
                <MenuItem key={ilce.ilce_id} value={ilce.ilce_id}>
                  {ilce.ilce_adi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Mahalle</InputLabel>
            <Select
              value={selectedMahalle}
              label="Mahalle"
              onChange={handleMahalleChange}
              disabled={!selectedIlce}
            >
              {mahalleler.map((mahalle) => (
                <MenuItem key={mahalle.mahalle_id} value={mahalle.mahalle_id}>
                  {mahalle.mahalle_adi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Ada"
            name="ada"
            value={formData.ada}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Parsel"
            name="parsel"
            value={formData.parsel}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'ARA'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Notlar Listesi */}
          {parcelData?.notes && parcelData.notes.length > 0 && (
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Notlar
              </Typography>
              <List>
                {parcelData.notes.map((note) => (
                  <ListItem
                    key={note._id}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={note.content}
                      secondary={new Date(note.createdAt).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Sağ Panel - Harita */}
      <Box
        sx={{
          flex: 1,
          height: '100%',
          position: 'relative',
        }}
      >
        <Map
          parcelCoordinates={parcelData?.geometry?.coordinates}
          centerCoordinates={parcelData?.center}
          onShapeComplete={handleShapeComplete}
          locationInfo={{
            il: formData.il,
            ilce: formData.ilce,
            mahalle: formData.mahalle,
            ada: formData.ada,
            parsel: formData.parsel
          }}
        />
      </Box>

      {/* Not Ekleme Dialog'u */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)}>
        <DialogTitle>Not Ekle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Not"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleAddNote}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
