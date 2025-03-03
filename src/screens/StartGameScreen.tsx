import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Routes from '../routes/Routes';
import { getPlayers, addGame, updatePlayersBalancesAfterGame } from '../data/firebase';
import { Player, GamePlayer } from '../data/models';

// הגדרת ממשק לשורת משחק
interface GameRow {
  id: string;
  playerName: string;
  buyIn: number;
  cashOut: number;
}

// הגדרת ממשק לפרופס של קומפוננטת שורת משחק
interface GameRowComponentProps {
  row: GameRow;
  players: Player[];
  onPlayerSelect: (rowId: string, e: React.ChangeEvent<HTMLSelectElement>) => void;
  onUpdateBuyIn: (rowId: string, value: string) => void;
  onUpdateCashOut: (rowId: string, value: string) => void;
  getProfit: (row: GameRow) => number;
}

const GameRowComponent = memo<GameRowComponentProps>(({ 
  row, 
  players, 
  onPlayerSelect, 
  onUpdateBuyIn, 
  onUpdateCashOut,
  getProfit 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'grid', 
        gridTemplateColumns: '40% 30% 30%', 
        gap: { xs: '5px', sm: '10px' }, 
        mb: { xs: '5px', sm: '10px' } 
      }}
    >
      <Box>
        <select 
          value={row.playerName} 
          onChange={(e) => onPlayerSelect(row.id, e)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            borderRadius: '28px', 
            border: '1px solid #e0e0e0',
            fontSize: '14px'
          }}
        >
          <option value="">Select player</option>
          {players.map((player: Player) => (
            <option key={player.id} value={player.name}>
              {player.name}
            </option>
          ))}
        </select>
      </Box>
      <Box>
        <input
          type="number"
          value={row.buyIn || ''}
          onChange={(e) => {
            if (e.target.value !== undefined) {
              onUpdateBuyIn(row.id, e.target.value);
            }
          }}
          style={{ 
            width: '80%', 
            padding: '8px', 
            borderRadius: '28px', 
            border: '1px solid #e0e0e0',
            textAlign: 'center',
            fontSize: '14px'
          }}
        />
      </Box>
      <Box>
        <input
          type="number"
          value={row.cashOut || ''}
          onChange={(e) => {
            if (e.target.value !== undefined) {
              onUpdateCashOut(row.id, e.target.value);
            }
          }}
          style={{ 
            width: '80%', 
            padding: '8px', 
            borderRadius: '28px', 
            border: '1px solid #e0e0e0',
            backgroundColor: getProfit(row) > 0 ? '#e8eaf6' : 'white',
            textAlign: 'center',
            fontSize: '14px'
          }}
        />
      </Box>
    </Box>
  );
});

const StartGameScreen: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameRows, setGameRows] = useState<GameRow[]>([
    { id: '1', playerName: '', buyIn: 0, cashOut: 0 },
    { id: '2', playerName: '', buyIn: 0, cashOut: 0 },
    { id: '3', playerName: '', buyIn: 0, cashOut: 0 },
    { id: '4', playerName: '', buyIn: 0, cashOut: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gameResults, setGameResults] = useState<GamePlayer[]>([]);
  const [transfers, setTransfers] = useState<{from: string, to: string, amount: number}[]>([]);

  // Load players on component mount
  useEffect(() => {
    loadPlayers();
  }, []);

  // Debug players after loading
  useEffect(() => {
    console.log("Players state updated:", players);
  }, [players]);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const playersList = await getPlayers();
      console.log("Loaded players:", playersList);
      setPlayers(playersList);
    } catch (error) {
      console.error('Error loading players:', error);
      showSnackbar('Failed to load players', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    if (gameRows.length >= 9) {
      showSnackbar('Maximum 9 players allowed', 'error');
      return { success: false, message: 'Maximum 9 players allowed' };
    }
    
    setGameRows([
      ...gameRows,
      { id: Date.now().toString(), playerName: '', buyIn: 0, cashOut: 0 }
    ]);
    return { success: true, message: '' };
  };

  const removeRow = (id: string) => {
    if (gameRows.length <= 4) {
      showSnackbar('Minimum 4 players required', 'error');
      return { success: false, message: 'Minimum 4 players required' };
    }
    
    setGameRows(gameRows.filter(row => row.id !== id));
    return { success: true, message: '' };
  };

  const handlePlayerSelect = (rowId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerName = e.target.value;
    console.log("Selected player name:", playerName, "for row:", rowId);
    
    if (!playerName) return;
    
    const updatedRows = gameRows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          playerName: playerName
        };
      }
      return row;
    });
    
    console.log("Setting new rows:", updatedRows);
    setGameRows(updatedRows);
  };

  const handleUpdateBuyIn = (rowId: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value);
    if (isNaN(numericValue)) return;
    
    setGameRows(gameRows.map(row => 
      row.id === rowId ? { ...row, buyIn: numericValue } : row
    ));
  };

  const handleUpdateCashOut = (rowId: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value);
    if (isNaN(numericValue)) return;
    
    setGameRows(gameRows.map(row => 
      row.id === rowId ? { ...row, cashOut: numericValue } : row
    ));
  };

  const calculateTransfers = (players: GamePlayer[]): {from: string, to: string, amount: number}[] => {
    const transfers: {from: string, to: string, amount: number}[] = [];
    const losers = players.filter(p => p.profit < 0).sort((a, b) => a.profit - b.profit);
    const winners = players.filter(p => p.profit > 0).sort((a, b) => b.profit - a.profit);
    
    let loserIndex = 0;
    let winnerIndex = 0;
    
    while (loserIndex < losers.length && winnerIndex < winners.length) {
      const loser = losers[loserIndex];
      const winner = winners[winnerIndex];
      
      const transferAmount = Math.min(Math.abs(loser.profit), winner.profit);
      
      if (transferAmount > 0) {
        transfers.push({
          from: loser.playerName,
          to: winner.playerName,
          amount: transferAmount
        });
      }
      
      loser.profit += transferAmount;
      winner.profit -= transferAmount;
      
      if (Math.abs(loser.profit) < 0.01) loserIndex++;
      if (Math.abs(winner.profit) < 0.01) winnerIndex++;
    }
    
    return transfers;
  };

  const handleFinishGame = () => {
    if (gameRows.length === 0) {
      showSnackbar('Please add at least one player', 'error');
      return;
    }

    // Validate rows
    const gamePlayers: GamePlayer[] = [];

    for (const row of gameRows) {
      if (!row.playerName) {
        showSnackbar('All rows must have a player selected', 'error');
        return;
      }

      // Find the player's ID from the players list
      const playerInfo = players.find(p => p.name === row.playerName);
      const playerId = playerInfo ? playerInfo.id : '';

      const gamePlayer: GamePlayer = {
        playerId: playerId,
        playerName: row.playerName,
        buyIn: row.buyIn,
        cashOut: row.cashOut,
        profit: row.cashOut - row.buyIn
      };
      
      gamePlayers.push(gamePlayer);
    }

    // Calculate total profit/loss to ensure game balance
    const totalProfit = gamePlayers.reduce((sum, player) => sum + player.profit, 0);
    if (Math.abs(totalProfit) > 0.01) { // Allow for small floating point errors
      showSnackbar('Game is not balanced. Total profit/loss should be zero.', 'error');
      return;
    }

    // Create a deep copy of gamePlayers for transfers calculation
    const gamePlayersForTransfers = gamePlayers.map(player => ({...player}));
    
    setGameResults(gamePlayers);
    setTransfers(calculateTransfers(gamePlayersForTransfers));
    setDialogOpen(true);
  };

  const confirmFinishGame = async () => {
    setLoading(true);
    try {
      // המרת שורות המשחק לשחקני משחק
      const selectedPlayers = gameRows.map(row => ({
        playerName: row.playerName,
        buyIn: row.buyIn,
        cashOut: row.cashOut,
        profit: row.cashOut - row.buyIn
      }));

      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      const gameData = {
        date: dateString,
        players: selectedPlayers
      };
      
      await addGame(gameData);
      await updatePlayersBalancesAfterGame(gameData);
      
      showSnackbar('Game finished successfully', 'success');
      setDialogOpen(false);
      
      // איפוס הטופס
      setGameRows([
        { id: '1', playerName: '', buyIn: 0, cashOut: 0 },
        { id: '2', playerName: '', buyIn: 0, cashOut: 0 },
        { id: '3', playerName: '', buyIn: 0, cashOut: 0 },
        { id: '4', playerName: '', buyIn: 0, cashOut: 0 }
      ]);
    } catch (error) {
      console.error('Error finishing game:', error);
      showSnackbar('Failed to finish game', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Helper to determine if a row has profit
  const getProfit = (row: GameRow) => row.cashOut - row.buyIn;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate(Routes.HOME)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            New Game
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: { xs: 2, sm: 4 } }}>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: '40% 30% 30%', 
              gap: { xs: '5px', sm: '10px' }, 
              mb: { xs: '5px', sm: '10px' },
              fontWeight: 'bold',
              fontSize: { xs: '14px', sm: '16px' }
            }}
          >
            <Box>Name</Box>
            <Box sx={{ textAlign: 'center' }}>Buy</Box>
            <Box sx={{ textAlign: 'center' }}>Return</Box>
          </Box>
          
          {gameRows.map((row) => (
            <GameRowComponent 
              key={row.id}
              row={row}
              players={players}
              onPlayerSelect={handlePlayerSelect}
              onUpdateBuyIn={handleUpdateBuyIn}
              onUpdateCashOut={handleUpdateCashOut}
              getProfit={getProfit}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 1, sm: 2 }, gap: { xs: 1, sm: 2 } }}>
          <IconButton 
            sx={{ 
              bgcolor: '#424242', 
              color: 'white', 
              '&:hover': { bgcolor: '#616161' },
              width: { xs: '40px', sm: '48px' },
              height: { xs: '40px', sm: '48px' }
            }}
            onClick={() => {
              const result = addRow();
              if (!result.success) {
                showSnackbar(result.message, 'error');
              }
            }}
            disabled={gameRows.length >= 9}
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton 
            sx={{ 
              bgcolor: '#424242', 
              color: 'white', 
              '&:hover': { bgcolor: '#616161' },
              width: { xs: '40px', sm: '48px' },
              height: { xs: '40px', sm: '48px' }
            }}
            onClick={() => {
              if (gameRows.length > 0) {
                const lastRow = gameRows[gameRows.length - 1];
                const result = removeRow(lastRow.id);
                if (!result.success) {
                  showSnackbar(result.message, 'error');
                }
              }
            }}
            disabled={gameRows.length <= 4}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3 } }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleFinishGame}
            disabled={loading}
            sx={{ 
              bgcolor: '#424242', 
              color: 'white', 
              borderRadius: '4px',
              textTransform: 'none',
              py: { xs: 1, sm: 1.5 },
              width: '100%',
              maxWidth: { xs: '180px', sm: '200px' },
              fontSize: { xs: '14px', sm: '16px' },
              '&:hover': { bgcolor: '#616161' }
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Finish Game'}
          </Button>
        </Box>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 16, sm: 24 } }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '95%', sm: '80%' },
            maxWidth: { xs: '95%', sm: '500px' },
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '18px', sm: '20px' } }}>Game Results</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '16px', sm: '18px' } }}>Final Balances:</Typography>
            {gameResults.map((player) => (
              <Typography 
                key={player.playerName} 
                color={player.profit > 0 ? "success.main" : player.profit < 0 ? "error.main" : "text.primary"}
                sx={{ mb: 1, fontWeight: 500, fontSize: { xs: '14px', sm: '16px' } }}
              >
                {player.playerName}: {player.profit > 0 ? '+' : ''}{player.profit} 
                ({player.buyIn} → {player.cashOut})
              </Typography>
            ))}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '16px', sm: '18px' } }}>Required Transfers:</Typography>
            {transfers.map((transfer, index) => (
              <Typography key={index} sx={{ mb: 1, fontWeight: 500, fontSize: { xs: '14px', sm: '16px' } }}>
                {transfer.from} → {transfer.to}: ₪{transfer.amount}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmFinishGame} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StartGameScreen; 