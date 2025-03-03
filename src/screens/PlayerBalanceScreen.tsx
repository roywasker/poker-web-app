import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
  Paper,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Routes from '../routes/Routes';
import { getPlayers } from '../data/firebase';
import { Player } from '../data/models';

const PlayerBalanceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  // Load players on component mount
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const playersList = await getPlayers();
      // Sort players by balance (descending)
      playersList.sort((a, b) => b.balance - a.balance);
      setPlayers(playersList);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
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
            Player Balance
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Players Balance
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {players.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No players found" />
                </ListItem>
              ) : (
                players.map((player) => (
                  <ListItem
                    key={player.id}
                    secondaryAction={
                      <Chip
                        icon={player.balance >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={`${player.balance} ₪`}
                        color={player.balance >= 0 ? 'success' : 'error'}
                        variant="outlined"
                      />
                    }
                  >
                    <ListItemText
                      primary={player.name}
                    />
                  </ListItem>
                ))
              )}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default PlayerBalanceScreen; 