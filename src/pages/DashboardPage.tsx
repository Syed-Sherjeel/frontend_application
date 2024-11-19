import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../constants';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const analysisOptions = [
  "Initial Analysis",
  "Deep Dive Analysis",
  "Latest News",
  "Recent Announcements",
  "Persona",
  "WorkForce Analysis",
  "Industry Analysis",
  "Competitor Analysis",
  "Discovery Questionnaire",
  "Meeting Strategy",
  "Prospecting Strategy",
  "Similar Companies"
];

export default function DashboardPage() {
  const { companyName, companyDescription } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    companyWebsite: companyName || '',
    companyDescription: companyDescription || '',
    competitorWebsite: '',
    prospectUrl: '',
    prospectJobTitle: '',
  });
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ text: string; isUser: boolean }>>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalysisChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedAnalyses(event.target.value as string[]);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-market`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedAnalyses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed');
      }

      setResults(data.analyses);
      setTabValue(1); // Switch to results tab
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;

    const newMessage = { text: chatMessage, isUser: true };
    setChatHistory([...chatHistory, newMessage]);
    setChatMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatMessage,
          context: results,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Chat failed');
      }

      setChatHistory(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { text: 'Sorry, I encountered an error.', isUser: false }]);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
        <Tab label="Analysis" />
        <Tab label="Results" disabled={Object.keys(results).length === 0} />
        <Tab label="Chat" disabled={Object.keys(results).length === 0} />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Website"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Competitor Website"
                      name="competitorWebsite"
                      value={formData.competitorWebsite}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Description"
                      name="companyDescription"
                      value={formData.companyDescription}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Prospect URL"
                      name="prospectUrl"
                      value={formData.prospectUrl}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Prospect Job Title"
                      name="prospectJobTitle"
                      value={formData.prospectJobTitle}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Analyses</InputLabel>
                      <Select
                        multiple
                        value={selectedAnalyses}
                        onChange={handleAnalysisChange}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                      >
                        {analysisOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <LoadingButton
                      fullWidth
                      variant="contained"
                      onClick={handleAnalyze}
                      loading={loading}
                    >
                      Analyze
                    </LoadingButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {Object.entries(results).map(([analysis, result]) => (
            <Grid item xs={12} key={analysis}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {analysis}
                  </Typography>
                  <Typography variant="body1" whiteSpace="pre-wrap">
                    {result}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '60vh' }}>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {chatHistory.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Card
                      sx={{
                        maxWidth: '70%',
                        bgcolor: message.isUser ? 'primary.main' : 'grey.100',
                      }}
                    >
                      <CardContent>
                        <Typography
                          color={message.isUser ? 'white' : 'text.primary'}
                        >
                          {message.text}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                />
                <Button variant="contained" onClick={handleChat}>
                  Send
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}