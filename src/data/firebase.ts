import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  get, 
  remove, 
  update,
  query,
  orderByChild,
  startAt,
  endAt
} from 'firebase/database';
import { Player, Game, Transfer } from './models';

// נגדיר את הטיפוס ישירות בקובץ במקום לייבא אותו
interface GamePlayerData {
  playerName: string;
  buyIn: number;
  cashOut: number;
  profit: number;
}

// Firebase configuration - replace with your own config
const firebaseConfig = {
  // כאן הכנס את פרטי הקונפיגורציה האמיתיים שלך
  apiKey: "AIzaSyB_C62gqBeFuCIEkMrUr3tdEWTCIZX7RyA",
  authDomain: "poker-967ea.firebaseapp.com",
  // השאר שדה זה ריק בכוונה
  // databaseURL: "https://poker-967ea.firebaseio.com",
  projectId: "poker-967ea",
  storageBucket: "poker-967ea.firebasestorage.app",
  messagingSenderId: "349597163789",
  appId: "1:349597163789:android:c2f23b99100e2176b81044"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


// Players API
export const playersRef = ref(database, 'PlayersList');

export const addPlayer = async (name: string): Promise<string> => {
  const newPlayerRef = push(playersRef);
  const playerId = newPlayerRef.key as string;
  
  await set(newPlayerRef, {
    id: playerId,
    name: name,
    balance: 0
  });
  
  return playerId;
};

export const getPlayers = async (): Promise<Player[]> => {
  const snapshot = await get(playersRef);
  const players: Player[] = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const player = childSnapshot.val() as Player;
      player.id = childSnapshot.key as string;
      players.push(player);
    });
  }
  
  return players;
};

export const updatePlayerBalance = async (playerId: string, newBalance: number): Promise<void> => {
  console.log("Updating player balance for playerId:", playerId, "to newBalance:", newBalance);
  const playerRef = ref(database, `PlayersList/${playerId}`);
  await update(playerRef, { balance: newBalance });
};

// Date list API
export const datesListRef = ref(database, 'dateList');

export const getDateList = async (): Promise<{ date: string, key: string }[]> => {
  const snapshot = await get(datesListRef);
  const dates: { date: string, key: string }[] = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const date = childSnapshot.child('date').val() as string;
      if (date) {
        dates.push({
          date: date,
          key: childSnapshot.key as string
        });
      }
    });
  }
  
  // Sort dates in descending order (newest first)
  return dates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addDateToList = async (date: string): Promise<string> => {
  // Extract just the date part (YYYY-MM-DD) from the date string
  const datePart = date.split('T')[0];
  
  // Create a new entry in the dateList
  const newDateRef = push(datesListRef);
  const dateId = newDateRef.key as string;
  
  await set(newDateRef, {
    date: datePart
  });
  
  return dateId;
};

// Games API
export const gamesRef = ref(database, 'Games');
export const datesRef = ref(database, 'dateList');

export const addGame = async (gameData: { date: string, players: GamePlayerData[] }): Promise<string> => {
  try {
    // יצירת מזהה חדש עבור הרשומה של התאריך
    const newDateRef = push(datesRef);
    const dateId = newDateRef.key as string;
    
    if (!dateId) {
      throw new Error('Failed to generate date ID');
    }
    
    // שמירת פרטי התאריך
    const dateData = {
      date: gameData.date
    };
    
    // שמירת התאריך
    await set(newDateRef, dateData);
    
    // יצירת התייחסות לקולקציית שחקנים תחת התאריך הזה
    const playerBalanceRef = ref(database, `dateList/${dateId}/playerBalance`);
    
    // שמירת כל שחקן עם המאזן שלו
    for (const player of gameData.players) {
      // יצירת מזהה חדש עבור כל שחקן
      const playerRef = push(playerBalanceRef);
      const playerId = playerRef.key;
      
      if (!playerId) {
        throw new Error('Failed to generate player ID');
      }
      
      // שמירת פרטי השחקן והמאזן שלו
      const playerData = {
        name: player.playerName,
        balance: player.profit // או cashOut - buyIn
      };
      
      await set(playerRef, playerData);
    }
    
    return dateId;
  } catch (error) {
    console.error("Error adding game:", error);
    throw error;
  }
};

export const getGamesByDate = async (dateOrKey: string): Promise<Game[]> => {
  // First, check if we're getting games by a dateList key
  const dateListRef = ref(database, `dateList/${dateOrKey}`);
  const dateSnapshot = await get(dateListRef);
  
  let dateString = dateOrKey;
  
  // If a valid date key was provided, get the date string from it
  if (dateSnapshot.exists()) {
    const date = dateSnapshot.child('date').val() as string;
    if (date) {
      dateString = date;
    }
  }
  
  // Use orderByChild and startAt/endAt for more efficient querying
  // This filters the games on the server side before data is sent to client
  const startDate = `${dateString}T00:00:00.000Z`;
  const endDate = `${dateString}T23:59:59.999Z`;
  
  const gamesQuery = query(
    gamesRef,
    orderByChild('date'),
    startAt(startDate),
    endAt(endDate)
  );
  
  const snapshot = await get(gamesQuery);
  const games: Game[] = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const game = childSnapshot.val() as Game;
      games.push(game);
    });
  }
  
  return games;
};

export const getAllGameDates = async (limit: number = 10, startDate?: string): Promise<string[]> => {
  let gamesQuery;
  
  if (startDate) {
    // Query games with dates before the startDate (for pagination)
    gamesQuery = query(
      gamesRef,
      orderByChild('date'),
      endAt(startDate)
    );
  } else {
    // Query all games
    gamesQuery = query(gamesRef, orderByChild('date'));
  }
  
  const snapshot = await get(gamesQuery);
  const dates = new Set<string>();
  
  if (snapshot.exists()) {
    // Convert to array to handle pagination properly
    const games: Game[] = [];
    snapshot.forEach((childSnapshot) => {
      games.push(childSnapshot.val() as Game);
    });
    
    // Sort in reverse order (most recent first)
    games.sort((a, b) => b.date.localeCompare(a.date));
    
    // Extract unique dates
    for (const game of games) {
      const datePart = game.date.split('T')[0];
      dates.add(datePart);
      
      // Exit early if we've reached the limit
      if (limit > 0 && dates.size >= limit) {
        break;
      }
    }
  }
  
  // Convert Set to Array and sort in descending order (newest first)
  return Array.from(dates).sort().reverse();
};

// Transfers API
export const transfersRef = ref(database, 'Transfers');

export const addTransfer = async (transfer: Omit<Transfer, 'id'>): Promise<string> => {
  const newTransferRef = push(transfersRef);
  const transferId = newTransferRef.key as string;
  
  await set(newTransferRef, {
    ...transfer,
    id: transferId
  });
  
  return transferId;
};

export const getTransfers = async (): Promise<Transfer[]> => {
  const snapshot = await get(transfersRef);
  const transfers: Transfer[] = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const transfer = childSnapshot.val() as Transfer;
      transfers.push(transfer);
    });
  }
  
  return transfers;
};

// Player balance by date API
export const getPlayerBalanceByDate = async (dateKey: string): Promise<Player[]> => {
  if (!dateKey) {
    throw new Error("Please select a date");
  }
  
  const balanceRef = ref(database, `dateList/${dateKey}/playerBalance`);
  const snapshot = await get(balanceRef);
  const players: Player[] = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((playerSnapshot) => {
      const name = playerSnapshot.child('name').val() as string;
      const balance = playerSnapshot.child('balance').val() as number;
      const id = playerSnapshot.key as string;
      
      if (name && balance !== undefined) {
        players.push({
          id,
          name,
          balance
        });
      }
    });
  }
  
  // Sort players by balance in descending order
  return players.sort((a, b) => b.balance - a.balance);
};

/**
 * Updates the balances of all players after a game is finished
 * @param gameData - The data about the game including players and their profits
 * @returns Promise that resolves when all player balances have been updated
 */
export const updatePlayersBalancesAfterGame = async (gameData: { players: GamePlayerData[] }): Promise<void> => {
  try {
    // Get all players from the database
    const allPlayers = await getPlayers();
    
    // Create a mapping for quick lookup of player data by name
    const gamePlayerMap = new Map<string, GamePlayerData>();
    gameData.players.forEach(player => {
      gamePlayerMap.set(player.playerName, player);
    });
    
    // Process each player
    const updatePromises = allPlayers.map(player => {
      // Check if this player participated in the game
      const gamePlayerData = gamePlayerMap.get(player.name);
      
      if (gamePlayerData) {
        // Calculate new balance
        const newBalance = player.balance + gamePlayerData.profit;
        
        // Update the player's balance in the database
        return updatePlayerBalance(player.id, newBalance);
      }
      
      // Player didn't participate, no update needed
      return Promise.resolve();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
  } catch (error) {
    console.error("Error updating player balances after game:", error);
    throw error;
  }
}; 