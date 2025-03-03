// Define the Player model
export interface Player {
  id: string;
  name: string;
  balance: number;
}

// Define the Game model
export interface Game {
  id: string;
  date: string; // ISO date string
  players: GamePlayer[];
}

// Define the GamePlayer model (player in a specific game)
export interface GamePlayer {
  playerId: string;
  playerName: string;
  buyIn: number;
  cashOut: number;
  profit: number;
}

// Define the Transfer model
export interface Transfer {
  id: string;
  date: string; // ISO date string
  fromPlayerId: string;
  fromPlayerName: string;
  toPlayerId: string;
  toPlayerName: string;
  amount: number;
}

// Define the DailyHistory model
export interface DailyHistory {
  date: string; // ISO date string
  games: Game[];
} 