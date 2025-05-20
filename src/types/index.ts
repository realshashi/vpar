export type EventStatus = "upcoming" | "live" | "completed" | "cancelled";

export interface SportEvent {
  id: string;
  name: string;
  teamA: string;
  teamB: string;
  startTime: Date;
  endTime?: Date;
  status: EventStatus;
  odds: {
    teamA: number;
    teamB: number;
  };
  tokenAddresses: {
    teamA: string;
    teamB: string;
  };
  description: string;
  category: "sports" | "esports" | "other";
}

export interface Bet {
  id: string;
  eventId: string;
  amount: number;
  selectedTeam: "teamA" | "teamB";
  odds: number;
  timestamp: Date;
  status: "pending" | "won" | "lost";
}
