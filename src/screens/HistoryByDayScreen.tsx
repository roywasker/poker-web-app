import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Paper,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Routes from '../routes/Routes';
import { getDateList, getPlayerBalanceByDate } from '../data/firebase';
import { Player } from '../data/models';

interface DateItem {
  date: string;
  key: string;
}

const HistoryByDayScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<DateItem | null>(null);
  const [dateList, setDateList] = useState<DateItem[]>([]);
  const [playerBalances, setPlayerBalances] = useState<Player[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingBalances, setLoadingBalances] = useState(false);

  useEffect(() => {
    // Load date list when component mounts
    fetchDateList();
  }, []);

  const fetchDateList = async () => {
    setLoadingDates(true);
    try {
      const dates = await getDateList();
      setDateList(dates);
      
      // Set default selected date to the most recent one if available
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (error) {
      console.error('Error loading dates:', error);
    } finally {
      setLoadingDates(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadPlayerBalances();
    }
  }, [selectedDate]);

  const loadPlayerBalances = async () => {
    if (!selectedDate) return;
    
    setLoadingBalances(true);
    try {
      const balances = await getPlayerBalanceByDate(selectedDate.key);
      setPlayerBalances(balances);
    } catch (error) {
      console.error('Error loading player balances:', error);
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleDateChange = (event: SelectChangeEvent) => {
    const selectedKey = event.target.value;
    const selected = dateList.find(d => d.key === selectedKey) || null;
    setSelectedDate(selected);
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'lightgray' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate(Routes.HOME)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            History By Day
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Date
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {loadingDates ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth variant="outlined">
              <InputLabel id="date-select-label">Date</InputLabel>
              <Select
                labelId="date-select-label"
                id="date-select"
                value={selectedDate?.key || ''}
                onChange={handleDateChange}
                label="Date"
                disabled={dateList.length === 0}
              >
                {dateList.length === 0 ? (
                  <MenuItem value="">No dates available</MenuItem>
                ) : (
                  dateList.map((dateItem) => (
                    <MenuItem key={dateItem.key} value={dateItem.key}>
                      {formatDisplayDate(dateItem.date)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
        </Paper>

        {selectedDate && (
          <Box sx={{ width: '100%' }}>
            {loadingBalances ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : playerBalances.length === 0 ? (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="body1" align="center">
                  No player balance data found for this date
                </Typography>
              </Paper>
            ) : (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Player Balances on {selectedDate ? formatDisplayDate(selectedDate.date) : ''}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {playerBalances.map((player) => (
                    <Grid item xs={12} sm={6} md={4} key={player.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {player.name}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Balance:
                            </Typography>
                            <Chip
                              icon={<AccountBalanceWalletIcon />}
                              label={player.balance}
                              color={player.balance > 0 ? 'success' : player.balance < 0 ? 'error' : 'default'}
                              variant="outlined"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HistoryByDayScreen; 