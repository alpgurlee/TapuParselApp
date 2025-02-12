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
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Rocket as RocketIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .required('Kullanıcı adı gerekli'),
  email: yup
    .string()
    .email('Geçerli bir email adresi girin')
    .required('Email gerekli'),
  password: yup
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre gerekli'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı gerekli'),
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const isMobile = useMediaQuery('(max-width:900px)');

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const { confirmPassword, ...registerData } = values;
      const success = await register(registerData);
      if (success) {
        navigate('/dashboard');
      }
    },
  });

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

      {/* Sağ Taraf - Kayıt Formu */}
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
                Hesap Oluştur
              </Typography>
              <Typography variant="body2" color="grey.400">
                veya{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#2CD3E1',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  giriş yap
                </Link>
              </Typography>
            </Box>

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Kullanıcı Adı"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
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
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'error.main'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'grey.400' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="email"
                name="email"
                label="E-posta"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
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
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'error.main'
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
                fullWidth
                id="password"
                name="password"
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
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
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'error.main'
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

              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Şifre Tekrarı"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'error.main'
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: 'grey.400' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

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
                Hesap Oluştur
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
