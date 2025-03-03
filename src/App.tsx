import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes as RouterRoutes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import PokerTheme from './themes/PokerTheme';
import Routes from './routes/Routes';
import { CircularProgress, Box } from '@mui/material';

// Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const AddUserScreen = lazy(() => import('./screens/AddUserScreen'));
const PlayerBalanceScreen = lazy(() => import('./screens/PlayerBalanceScreen'));
const StartGameScreen = lazy(() => import('./screens/StartGameScreen'));
const HistoryByDayScreen = lazy(() => import('./screens/HistoryByDayScreen'));

// Loading component
const LoadingScreen = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <CircularProgress size={60} />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={PokerTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <RouterRoutes>
            <Route path={Routes.HOME} element={<HomeScreen />} />
            <Route path={Routes.ADD_USER} element={<AddUserScreen />} />
            <Route path={Routes.PLAYER_BALANCE} element={<PlayerBalanceScreen />} />
            <Route path={Routes.START_GAME} element={<StartGameScreen />} />
            <Route path={Routes.HISTORY_BY_DAY} element={<HistoryByDayScreen />} />
            <Route path="*" element={<Navigate to={Routes.HOME} replace />} />
          </RouterRoutes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
