import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton,
  Stack,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Routes from '../routes/Routes';

// Import poker image
import pokerImage from '../assets/poker-main.jpg';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  // Handle back button - in web we'll just show a confirmation dialog
  const handleBackButton = () => {
    if (window.confirm('האם אתה בטוח שברצונך לצאת מהאפליקציה?')) {
      // In a web app, we can't really "exit", but we could redirect to another site
      window.location.href = 'about:blank';
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
            onClick={handleBackButton}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            width: '100%', 
            height: 200, 
            mb: 4,
            backgroundImage: `url(${pokerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '0 0 35px 35px'
          }} 
        />

        <Stack spacing={4} alignItems="center">
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(Routes.START_GAME)}
            sx={{ minWidth: 180, minHeight: 60 }}
          >
            Start Game
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(Routes.ADD_USER)}
            sx={{ minWidth: 180, minHeight: 60 }}
          >
            Add New Player
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(Routes.PLAYER_BALANCE)}
            sx={{ minWidth: 180, minHeight: 60 }}
          >
            Player Balance
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(Routes.HISTORY_BY_DAY)}
            sx={{ minWidth: 180, minHeight: 60 }}
          >
            History By Day
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default HomeScreen; 