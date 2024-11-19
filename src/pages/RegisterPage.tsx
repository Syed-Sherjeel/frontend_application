import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Bot } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../constants';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    username: '',
    companyUrl: '',
    companyDescription: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          companyurl: formData.companyUrl,
          companydescription: formData.companyDescription,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      setAuth({
        token: `Bearer ${data.access_token}`,
        userId: data.user_id,
        conversationId: crypto.randomUUID(),
        companyName: data.company_website,
        companyDescription: data.company_description,
      });

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        p: 4,
        maxWidth: 500,
        mx: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Bot size={40} />
        <Typography variant="h4" component="h1">
          Wingman AI
        </Typography>
      </Box>

      <Card sx={{ width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Register
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              helperText="At least 3 characters"
            />
            <TextField
              fullWidth
              label="Company URL"
              name="companyUrl"
              value={formData.companyUrl}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="https://example.com"
            />
            <TextField
              fullWidth
              label="Company Description"
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              margin="normal"
              required
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="At least 8 characters, including uppercase, lowercase, and number"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
            />
            <LoadingButton
              fullWidth
              type="submit"
              variant="contained"
              loading={loading}
              sx={{ mt: 2 }}
            >
              Register
            </LoadingButton>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}