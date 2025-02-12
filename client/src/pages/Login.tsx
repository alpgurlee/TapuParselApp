import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  useMediaQuery
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Rocket as RocketIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await login({ email, password });
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err) {
      setError('Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        overflow: 'hidden'
      }}
    >
      {/* Sol Taraf - İllüstrasyon Alanı */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#2CD3E1',
          p: 4,
          position: 'relative'
        }}
      >
        <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
          <RocketIcon sx={{ fontSize: 100, color: 'white', mb: 2 }} />
          <Typography variant="h4" color="white" gutterBottom>
            Tapu Parsel Yönetim Sistemi
          </Typography>
          <Typography variant="body1" color="white">
            Parsel bilgilerinizi yönetin ve takip edin
          </Typography>
        </Box>
        
        {/* Animasyonlu Yıldızlar */}
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              animation: 'twinkle 1.5s infinite',
              animationDelay: `${Math.random() * 2}s`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              '@keyframes twinkle': {
                '0%': { opacity: 0 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0 }
              }
            }}
          />
        ))}
      </Box>

      {/* Sağ Taraf - Login Formu */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#1B2430',
          p: 4
        }}
      >
        <Container maxWidth="xs">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h5" color="white" gutterBottom>
                Giriş Yap
              </Typography>
              <Typography variant="body2" color="grey.400">
                veya{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  sx={{
                    color: '#2CD3E1',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  hesap oluştur
                </Link>
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                required
                fullWidth
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2CD3E1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2CD3E1',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'grey.400',
                    '&.Mui-focused': {
                      color: '#2CD3E1'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'grey.400' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                required
                fullWidth
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2CD3E1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2CD3E1',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'grey.400',
                    '&.Mui-focused': {
                      color: '#2CD3E1'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'grey.400' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'grey.400' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderRadius: 2,
                  bgcolor: '#2CD3E1',
                  '&:hover': {
                    bgcolor: '#25B5C1',
                  },
                }}
              >
                Giriş Yap
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
