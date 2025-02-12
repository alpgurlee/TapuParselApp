import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Paper,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Divider,
  styled,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  DarkMode as DarkModeIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Map as MapIcon,
  Note as NoteIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 20,
  background: theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(30, 41, 59, 0.9)',
  backdropFilter: 'blur(12px)',
  boxShadow: theme.palette.mode === 'light'
    ? '0 4px 20px rgba(0, 0, 0, 0.05)'
    : '0 4px 20px rgba(0, 0, 0, 0.2)',
  border: '1px solid',
  borderColor: theme.palette.mode === 'light'
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(255, 255, 255, 0.1)',
  position: 'relative',
  overflow: 'hidden',
}));

const GradientBox = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #2CD3E1 0%, #1976d2 100%)'
    : 'linear-gradient(135deg, #1B2430 0%, #0f172a 100%)',
  opacity: theme.palette.mode === 'light' ? 0.1 : 0.5,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #2CD3E1 0%, #1976d2 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: '#fff',
  '&:hover': {
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
      : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: 8,
  backgroundColor: theme.palette.mode === 'light'
    ? 'rgba(0, 0, 0, 0.02)'
    : 'rgba(255, 255, 255, 0.05)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? 'rgba(0, 0, 0, 0.04)'
      : 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-1px)',
  },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 64,
  padding: theme.spacing(0, 3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(30, 41, 59, 0.9)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid',
  borderColor: theme.palette.mode === 'light'
    ? 'rgba(0, 0, 0, 0.1)'
    : 'rgba(255, 255, 255, 0.1)',
  zIndex: 1000,
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 600,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? 'rgba(0, 0, 0, 0.04)'
      : 'rgba(255, 255, 255, 0.08)',
  },
}));

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const { notifications, unreadCount } = useNotifications();
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();

  const [searchHistory] = useState([
    { id: 1, query: 'Ankara/Çankaya/Emek - Ada: 1234', date: '2024-02-11' },
    { id: 2, query: 'İstanbul/Kadıköy/Göztepe - Ada: 5678', date: '2024-02-10' },
  ]);

  const [notes] = useState([
    { 
      id: 1, 
      title: 'Çankaya Parseli Notu', 
      content: 'Parselin imar durumu kontrol edilecek',
      date: '2024-02-11',
      parcelId: '1234'
    },
    { 
      id: 2, 
      title: 'Kadıköy Arsası', 
      content: 'Belediye ile görüşülecek',
      date: '2024-02-10',
      parcelId: '5678'
    },
  ]);

  const activities = [
    ...searchHistory.map(item => ({ 
      ...item, 
      type: 'search' as const,
      icon: <SearchIcon color="primary" />,
    })),
    ...notifications.map(item => ({ 
      ...item, 
      type: 'notification' as const,
      icon: <NotificationsIcon color="primary" />,
    })),
    ...notes.map(item => ({ 
      ...item, 
      type: 'note' as const,
      icon: <NoteIcon color="primary" />,
      query: item.title,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleActivityClick = (activity: any) => {
    switch (activity.type) {
      case 'search':
      case 'notification':
        navigate(`/dashboard?parcelId=${activity.parcelId || ''}`);
        break;
      case 'note':
        navigate(`/dashboard?parcelId=${activity.parcelId}&note=${activity.id}`);
        break;
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pt: { xs: 8, md: 2 },
      pb: 3,
      px: { xs: 2, md: 3 },
      overflow: 'auto',
    }}>
      <GradientBox />
      <StyledHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NavButton
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Geri
          </NavButton>
          <NavButton
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Anasayfa
          </NavButton>
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            background: muiTheme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #2CD3E1 0%, #1976d2 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Profil
        </Typography>
        <Box sx={{ width: 100 }} /> {/* Sağ tarafı dengelemek için boş alan */}
      </StyledHeader>
      <Grid container spacing={3} sx={{ pt: 8 }}>
        <Grid item xs={12} md={3}>
          <StyledPaper elevation={0}>
            <Box sx={{ 
              textAlign: 'center',
              mb: 3,
              position: 'relative',
            }}>
              <Avatar
                src={user?.photoURL || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto 16px',
                  border: '4px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }}
              >
                {user?.email?.[0].toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom fontWeight="600">
                {user?.displayName || 'Kullanıcı'}
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                {user?.email}
              </Typography>
              <ActionButton
                startIcon={<EditIcon />}
                sx={{ width: '100%' }}
              >
                Profili Düzenle
              </ActionButton>
            </Box>
            <Divider sx={{ my: 3 }} />
            <List>
              <StyledListItem>
                <ListItemIcon>
                  <DarkModeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Karanlık Mod"
                  secondary="Arayüz temasını değiştir"
                />
                <Switch
                  edge="end"
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                />
              </StyledListItem>
              <StyledListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Bildirimler"
                  secondary="E-posta bildirimleri"
                />
                <Switch edge="end" defaultChecked />
              </StyledListItem>
            </List>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledPaper elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <HistoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Aktivite Geçmişi</Typography>
                </Box>
                <List>
                  {activities.slice(0, 10).map((activity, index) => (
                    <StyledListItem 
                      key={index}
                      onClick={() => handleActivityClick(activity)}
                    >
                      <ListItemIcon>
                        {activity.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.query || activity.message || activity.title}
                        secondary={new Date(activity.date).toLocaleDateString()}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          size="small"
                          label={activity.type === 'search' ? 'Arama' : 
                                activity.type === 'note' ? 'Not' : 'Bildirim'}
                          color={activity.type === 'search' ? 'primary' : 
                                activity.type === 'note' ? 'success' : 'warning'}
                          sx={{ borderRadius: 2 }}
                        />
                      </ListItemSecondaryAction>
                    </StyledListItem>
                  ))}
                </List>
              </StyledPaper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
