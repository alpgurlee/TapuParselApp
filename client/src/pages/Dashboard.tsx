import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
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
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>('');
  const [noteDialogOpen, setNoteDialogOpen] = useState<boolean>(false);

  // Form değişikliklerini handle et
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

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
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Sol Panel - Parsel Arama */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Parsel Ara
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="İl"
                name="il"
                value={formData.il}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="İlçe"
                name="ilce"
                value={formData.ilce}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Mahalle"
                name="mahalle"
                value={formData.mahalle}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Ada"
                name="ada"
                value={formData.ada}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Parsel"
                name="parsel"
                value={formData.parsel}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Ara'}
              </Button>
            </form>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Sağ Panel - Harita */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Map
              parcelCoordinates={parcelData?.geometry.coordinates}
              centerCoordinates={parcelData?.center}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Parsel Detayları Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '400px' } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Parsel Detayları</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Parsel Bilgileri */}
          <Typography variant="subtitle1" gutterBottom>
            {formData.il} / {formData.ilce}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {formData.mahalle} Mah. Ada: {formData.ada} Parsel: {formData.parsel}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Notlar Listesi */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">Notlar</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setNoteDialogOpen(true)}
              size="small"
            >
              Not Ekle
            </Button>
          </Box>

          <List>
            {parcelData?.notes.map((note) => (
              <ListItem key={note._id} divider>
                <ListItemText
                  primary={note.content}
                  secondary={new Date(note.createdAt).toLocaleDateString('tr-TR')}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Not Ekleme Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)}>
        <DialogTitle>Yeni Not</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Not"
            fullWidth
            multiline
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleAddNote} startIcon={<SaveIcon />}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
