import { io } from "socket.io-client";
import { useStore } from "../store/useStore";
import { EventStatus } from "../types";

const socket = io(import.meta.env.VITE_WS_URL || "ws://localhost:8000");

socket.on(
  "odds_update",
  (data: { eventId: string; odds: { teamA: number; teamB: number } }) => {
    useStore.getState().updateEventOdds(data.eventId, data.odds);
  }
);

socket.on(
  "match_update",
  (data: {
    eventId: string;
    status: EventStatus;
    score?: { teamA: number; teamB: number };
  }) => {
    useStore
      .getState()
      .updateEventStatus(data.eventId, data.status, data.score);
  }
);

export const websocketService = {
  socket,
  disconnect: () => socket.disconnect(),
  connect: () => socket.connect(),
};
