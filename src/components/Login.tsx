import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Stack,
  Snackbar,
  Alert,
  Link
} from '@mui/material';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin?: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAlertSeverity('error');
        setAlertMessage(error.message);
        setAlertOpen(true);
      } else {
        setAlertSeverity('success');
        setAlertMessage('¡Inicio de sesión exitoso!');
        setAlertOpen(true);
        if (onLogin) onLogin();
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setAlertSeverity('error');
      setAlertMessage('Error al iniciar sesión');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAlertSeverity('error');
        setAlertMessage(error.message);
        setAlertOpen(true);
      } else {
        setAlertSeverity('success');
        setAlertMessage('¡Registro exitoso! Verifica tu correo electrónico para confirmar tu cuenta.');
        setAlertOpen(true);
        setIsSignUp(false);
      }
    } catch (error) {
      console.error('Error al registrarse:', error);
      setAlertSeverity('error');
      setAlertMessage('Error al registrarse');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Typography component="h1" variant="h5">
          {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
        </Typography>
        <Box component="form" onSubmit={isSignUp ? handleSignUp : handleSignIn} sx={{ mt: 3, width: '100%' }}>
          <Stack spacing={2}>
            <TextField
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => setIsSignUp(!isSignUp)}
                type="button"
              >
                {isSignUp ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
              </Link>
            </Box>
          </Stack>
        </Box>
      </Paper>
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={() => setAlertOpen(false)}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity} 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
